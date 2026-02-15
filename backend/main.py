from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from typing import List, Dict, Optional
from datetime import datetime
from collections import defaultdict

app = FastAPI(
    title="Docker Registry UI API",
    description="Advanced API for Docker Registry management with rich analytics",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REGISTRY_URL = os.getenv("REGISTRY_URL", "http://registry:5000")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Docker Registry UI API",
        "status": "running",
        "version": "2.0.0",
        "registry_url": REGISTRY_URL
    }


@app.get("/api/health")
async def health_check():
    """Check registry health"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{REGISTRY_URL}/v2/")
            return {
                "status": "healthy" if response.status_code == 200 else "unhealthy",
                "registry_url": REGISTRY_URL,
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }


@app.get("/api/v2/_catalog")
async def get_catalog():
    """Get list of all repositories"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{REGISTRY_URL}/v2/_catalog")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v2/{repository:path}/tags/list")
async def get_tags(repository: str):
    """Get all tags for a repository"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{REGISTRY_URL}/v2/{repository}/tags/list")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=404, detail=f"Repository not found: {repository}")


@app.get("/api/v2/{repository:path}/manifests/{tag}")
async def get_manifest(repository: str, tag: str):
    """Get manifest for a specific tag"""
    async with httpx.AsyncClient() as client:
        try:
            headers = {
                "Accept": "application/vnd.docker.distribution.manifest.v2+json"
            }
            response = await client.get(
                f"{REGISTRY_URL}/v2/{repository}/manifests/{tag}",
                headers=headers
            )
            response.raise_for_status()
            
            digest = response.headers.get("Docker-Content-Digest", "")
            manifest_data = response.json()
            
            return {
                "manifest": manifest_data,
                "digest": digest,
                "size": len(response.content),
                "content_type": response.headers.get("Content-Type", "")
            }
        except httpx.HTTPError as e:
            raise HTTPException(status_code=404, detail=f"Tag not found: {tag}")


@app.delete("/api/v2/{repository:path}/manifests/{digest}")
async def delete_image(repository: str, digest: str):
    """Delete an image by digest"""
    async with httpx.AsyncClient() as client:
        try:
            headers = {
                "Accept": "application/vnd.docker.distribution.manifest.v2+json"
            }
            response = await client.delete(
                f"{REGISTRY_URL}/v2/{repository}/manifests/{digest}",
                headers=headers
            )
            
            if response.status_code == 202:
                return {
                    "message": "Image deleted successfully",
                    "repository": repository,
                    "digest": digest,
                    "note": "Run garbage collection to free disk space"
                }
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to delete image: {response.text}"
                )
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/repositories")
async def get_repositories_with_details():
    """Get all repositories with their tag counts, sizes, and metadata"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # Get catalog
            catalog_response = await client.get(f"{REGISTRY_URL}/v2/_catalog")
            catalog_response.raise_for_status()
            repositories = catalog_response.json().get("repositories", [])
            
            repo_details = []
            total_size = 0
            total_tags = 0
            
            for repo in repositories:
                try:
                    # Get tags for each repo
                    tags_response = await client.get(f"{REGISTRY_URL}/v2/{repo}/tags/list")
                    tags_response.raise_for_status()
                    tags = tags_response.json().get("tags", [])
                    
                    # Get detailed info for each tag
                    tag_details = []
                    repo_size = 0
                    
                    for tag in (tags or []):
                        try:
                            tag_info = await get_tag_details(client, repo, tag)
                            tag_details.append(tag_info)
                            repo_size += tag_info.get("size", 0)
                            total_tags += 1
                        except Exception as e:
                            # If we can't get details for a tag, include basic info
                            tag_details.append({
                                "name": tag,
                                "size": 0,
                                "digest": "",
                                "created": None,
                                "os": "unknown",
                                "architecture": "unknown",
                                "error": str(e)
                            })
                    
                    total_size += repo_size
                    
                    repo_details.append({
                        "name": repo,
                        "tags": tag_details,
                        "tag_count": len(tags) if tags else 0,
                        "total_size": repo_size,
                        "last_updated": max(
                            (tag.get("created") for tag in tag_details if tag.get("created")),
                            default=None
                        )
                    })
                except Exception as e:
                    # If we can't get tags, still include the repo
                    repo_details.append({
                        "name": repo,
                        "tags": [],
                        "tag_count": 0,
                        "total_size": 0,
                        "error": str(e)
                    })
            
            return {
                "repositories": repo_details,
                "total_repositories": len(repositories),
                "total_tags": total_tags,
                "total_size": total_size,
                "timestamp": datetime.utcnow().isoformat()
            }
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/statistics")
async def get_statistics():
    """Get registry statistics and analytics"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # Get catalog
            catalog_response = await client.get(f"{REGISTRY_URL}/v2/_catalog")
            catalog_response.raise_for_status()
            repositories = catalog_response.json().get("repositories", [])
            
            stats = {
                "total_repositories": len(repositories),
                "total_tags": 0,
                "total_size": 0,
                "repositories_by_size": {},
                "tags_by_architecture": defaultdict(int),
                "tags_by_os": defaultdict(int),
                "largest_repositories": [],
                "most_tagged_repositories": []
            }
            
            repo_stats = []
            
            for repo in repositories:
                try:
                    tags_response = await client.get(f"{REGISTRY_URL}/v2/{repo}/tags/list")
                    tags_response.raise_for_status()
                    tags = tags_response.json().get("tags", [])
                    
                    repo_size = 0
                    tag_count = len(tags) if tags else 0
                    
                    for tag in (tags or []):
                        try:
                            tag_info = await get_tag_details(client, repo, tag)
                            repo_size += tag_info.get("size", 0)
                            stats["tags_by_architecture"][tag_info.get("architecture", "unknown")] += 1
                            stats["tags_by_os"][tag_info.get("os", "unknown")] += 1
                        except:
                            pass
                    
                    stats["total_tags"] += tag_count
                    stats["total_size"] += repo_size
                    
                    repo_stats.append({
                        "name": repo,
                        "size": repo_size,
                        "tags": tag_count
                    })
                except:
                    pass
            
            # Sort and get top repositories
            stats["largest_repositories"] = sorted(
                repo_stats, key=lambda x: x["size"], reverse=True
            )[:10]
            
            stats["most_tagged_repositories"] = sorted(
                repo_stats, key=lambda x: x["tags"], reverse=True
            )[:10]
            
            # Convert defaultdict to dict
            stats["tags_by_architecture"] = dict(stats["tags_by_architecture"])
            stats["tags_by_os"] = dict(stats["tags_by_os"])
            
            return stats
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=str(e))


async def get_tag_details(client: httpx.AsyncClient, repository: str, tag: str):
    """Get detailed information about a specific tag"""
    # Get manifest
    headers = {
        "Accept": "application/vnd.docker.distribution.manifest.v2+json"
    }
    manifest_response = await client.get(
        f"{REGISTRY_URL}/v2/{repository}/manifests/{tag}",
        headers=headers
    )
    manifest_response.raise_for_status()
    
    manifest = manifest_response.json()
    digest = manifest_response.headers.get("Docker-Content-Digest", "")
    
    # Calculate total size
    config_size = manifest.get("config", {}).get("size", 0)
    layers_size = sum(layer.get("size", 0) for layer in manifest.get("layers", []))
    total_size = config_size + layers_size
    
    # Get config blob for OS/architecture info
    os_info = "unknown"
    architecture = "unknown"
    created = None
    author = None
    
    try:
        config_digest = manifest.get("config", {}).get("digest", "")
        if config_digest:
            config_response = await client.get(
                f"{REGISTRY_URL}/v2/{repository}/blobs/{config_digest}"
            )
            if config_response.status_code == 200:
                config_data = config_response.json()
                os_info = config_data.get("os", "unknown")
                architecture = config_data.get("architecture", "unknown")
                created = config_data.get("created")
                author = config_data.get("author")
    except:
        pass
    
    return {
        "name": tag,
        "digest": digest,
        "size": total_size,
        "os": os_info,
        "architecture": architecture,
        "created": created,
        "author": author,
        "layers": len(manifest.get("layers", []))
    }


@app.get("/api/repository/{repository:path}")
async def get_repository_details(repository: str):
    """Get detailed information about a specific repository"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            tags_response = await client.get(f"{REGISTRY_URL}/v2/{repository}/tags/list")
            tags_response.raise_for_status()
            tags = tags_response.json().get("tags", [])
            
            tag_details = []
            total_size = 0
            
            for tag in (tags or []):
                try:
                    tag_info = await get_tag_details(client, repository, tag)
                    tag_details.append(tag_info)
                    total_size += tag_info.get("size", 0)
                except Exception as e:
                    tag_details.append({
                        "name": tag,
                        "error": str(e)
                    })
            
            return {
                "name": repository,
                "tags": tag_details,
                "tag_count": len(tags) if tags else 0,
                "total_size": total_size,
                "timestamp": datetime.utcnow().isoformat()
            }
        except httpx.HTTPError as e:
            raise HTTPException(status_code=404, detail=f"Repository not found: {repository}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
