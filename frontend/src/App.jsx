import React, { useState, useEffect } from 'react';
import { 
  Search, Trash2, Package, Tag, AlertCircle, RefreshCw, 
  Copy, Check, Download, BarChart3, TrendingUp, Clock,
  Server, HardDrive, Layers, Archive, Filter, ArrowUpDown, ChevronLeft, X
} from 'lucide-react';

function App() {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [error, setError] = useState(null);
  const [copiedCommand, setCopiedCommand] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, tags, size, date
  const [filterBy, setFilterBy] = useState('all'); // all, active, large

  const API_URL = '';
  
  // Registry URL for pull commands (automatically detects hostname)
  const REGISTRY_URL = window.location.hostname === 'localhost' 
    ? 'localhost:5000' 
    : `${window.location.hostname}:5000`;
  
  // Log registry URL for debugging
  console.log('Registry URL:', REGISTRY_URL);

  // Helper functions
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCommand(type);
      setTimeout(() => setCopiedCommand(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/repositories`);
      if (!response.ok) throw new Error('Failed to fetch repositories');
      const data = await response.json();
      setRepositories(data.repositories || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (repository, tag) => {
    if (!window.confirm(`Delete ${repository}:${tag}?\n\nNote: You'll need to run garbage collection to free disk space.`)) return;

    try {
      const manifestResponse = await fetch(`${API_URL}/api/v2/${repository}/manifests/${tag}`);
      if (!manifestResponse.ok) throw new Error('Failed to get manifest');
      const manifestData = await manifestResponse.json();
      const digest = manifestData.digest;

      if (!digest) {
        alert('Could not get image digest');
        return;
      }

      const deleteResponse = await fetch(`${API_URL}/api/v2/${repository}/manifests/${digest}`, {
        method: 'DELETE',
      });

      if (deleteResponse.ok) {
        alert('Image deleted successfully!\n\nRun: docker exec docker-registry bin/registry garbage-collect /etc/docker/registry/config.yml');
        fetchRepositories();
      } else {
        throw new Error('Failed to delete image');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Calculate statistics
  const totalTags = repositories.reduce((acc, repo) => acc + repo.tag_count, 0);
  const totalSize = repositories.reduce((acc, repo) => 
    acc + (repo.tags?.reduce((sum, tag) => sum + (tag.size || 0), 0) || 0), 0
  );
  
  const topRepositories = [...repositories]
    .sort((a, b) => b.tag_count - a.tag_count)
    .slice(0, 5);

  const recentlyUpdated = [...repositories]
    .filter(repo => repo.tags && repo.tags.length > 0)
    .map(repo => ({
      ...repo,
      latestUpdate: repo.tags.reduce((latest, tag) => {
        const tagDate = new Date(tag.created || 0);
        return tagDate > latest ? tagDate : latest;
      }, new Date(0))
    }))
    .sort((a, b) => b.latestUpdate - a.latestUpdate)
    .slice(0, 5);

  // Sorting and filtering
  const getSortedAndFilteredRepos = () => {
    let filtered = repositories.filter(repo =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply filters
    if (filterBy === 'active') {
      filtered = filtered.filter(repo => repo.tag_count > 0);
    } else if (filterBy === 'large') {
      filtered = filtered.filter(repo => {
        const totalSize = repo.tags?.reduce((sum, tag) => sum + (tag.size || 0), 0) || 0;
        return totalSize > 100 * 1024 * 1024; // > 100MB
      });
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'tags':
          return b.tag_count - a.tag_count;
        case 'size':
          const sizeA = a.tags?.reduce((sum, tag) => sum + (tag.size || 0), 0) || 0;
          const sizeB = b.tags?.reduce((sum, tag) => sum + (tag.size || 0), 0) || 0;
          return sizeB - sizeA;
        case 'date':
          const dateA = a.tags?.[0]?.created ? new Date(a.tags[0].created) : new Date(0);
          const dateB = b.tags?.[0]?.created ? new Date(b.tags[0].created) : new Date(0);
          return dateB - dateA;
        default: // name
          return a.name.localeCompare(b.name);
      }
    });
  };

  const filteredRepos = getSortedAndFilteredRepos();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      {/* Sidebar */}
      <div className="w-80 bg-slate-900/50 border-r border-slate-700/50 backdrop-blur-sm flex-shrink-0 overflow-y-auto">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Registry UI</h1>
              <p className="text-xs text-slate-400">Docker Image Manager</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-3 mb-8">
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Repositories</span>
                <Package className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{repositories.length}</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Total Images</span>
                <Layers className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">{totalTags}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Total Size</span>
                <HardDrive className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">{formatBytes(totalSize)}</p>
            </div>
          </div>

          {/* Top Repositories */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Top Repositories</h3>
            </div>
            <div className="space-y-2">
              {topRepositories.map((repo, index) => (
                <button
                  key={repo.name}
                  onClick={() => setSelectedRepo(selectedRepo === repo.name ? null : repo.name)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedRepo === repo.name 
                      ? 'bg-blue-500/20 border border-blue-500/30' 
                      : 'bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white truncate flex-1">
                      {repo.name.length > 20 ? repo.name.substring(0, 20) + '...' : repo.name}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">#{index + 1}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Tag className="w-3 h-3" />
                    <span>{repo.tag_count} tags</span>
                  </div>
                </button>
              ))}
              {topRepositories.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No repositories yet</p>
              )}
            </div>
          </div>

          {/* Recently Updated */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Recently Updated</h3>
            </div>
            <div className="space-y-2">
              {recentlyUpdated.map((repo) => (
                <button
                  key={repo.name}
                  onClick={() => setSelectedRepo(selectedRepo === repo.name ? null : repo.name)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedRepo === repo.name 
                      ? 'bg-blue-500/20 border border-blue-500/30' 
                      : 'bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="text-sm font-medium text-white truncate mb-1">
                    {repo.name.length > 20 ? repo.name.substring(0, 20) + '...' : repo.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {formatDate(repo.latestUpdate)}
                  </div>
                </button>
              ))}
              {recentlyUpdated.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No recent updates</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900/50 border-b border-slate-700/50 backdrop-blur-sm">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Container Images</h2>
                <p className="text-sm text-slate-400">Manage and monitor your Docker registry</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-300">Registry Online</span>
                </div>
                <button
                  onClick={fetchRepositories}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="px-8 py-4 bg-slate-900/30 border-b border-slate-700/50">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  title="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Name</option>
                <option value="tags">Tag Count</option>
                <option value="size">Size</option>
                <option value="date">Last Updated</option>
              </select>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="active">Active (with tags)</option>
                <option value="large">Large (&gt;100MB)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-6">
            {/* Back/Reset button when search or filter is active */}
            {(searchTerm || filterBy !== 'all' || sortBy !== 'name') && filteredRepos.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterBy('all');
                    setSortBy('name');
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to All Repositories</span>
                </button>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-400 font-semibold">Error</h3>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                  <p className="text-slate-400">Loading repositories...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Repositories List */}
                {filteredRepos.length === 0 ? (
                  <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-12 text-center">
                    <Archive className="w-20 h-20 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-400 mb-2">
                      {searchTerm ? 'No repositories found' : 'No repositories yet'}
                    </h3>
                    <p className="text-slate-500 mb-6">
                      {searchTerm ? 'Try adjusting your search or filters' : 'Push your first image to get started'}
                    </p>
                    {!searchTerm && (
                      <div className="max-w-2xl mx-auto">
                        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 text-left">
                          <p className="text-slate-300 text-sm mb-3 font-semibold">Quick Start Commands:</p>
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-400">1. Tag your image</span>
                                <button
                                  onClick={() => copyToClipboard(`docker tag myimage:latest ${REGISTRY_URL}/myimage:latest`, 'tag')}
                                  className="p-1 hover:bg-slate-800 rounded transition-colors"
                                >
                                  {copiedCommand === 'tag' ? (
                                    <Check className="w-3 h-3 text-green-400" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-slate-400" />
                                  )}
                                </button>
                              </div>
                              <code className="block text-xs text-green-400 bg-slate-950/50 p-2 rounded">
                                docker tag myimage:latest {REGISTRY_URL}/myimage:latest
                              </code>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-400">2. Push to registry</span>
                                <button
                                  onClick={() => copyToClipboard(`docker push ${REGISTRY_URL}/myimage:latest`, 'push')}
                                  className="p-1 hover:bg-slate-800 rounded transition-colors"
                                >
                                  {copiedCommand === 'push' ? (
                                    <Check className="w-3 h-3 text-green-400" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-slate-400" />
                                  )}
                                </button>
                              </div>
                              <code className="block text-xs text-green-400 bg-slate-950/50 p-2 rounded">
                                docker push {REGISTRY_URL}/myimage:latest
                              </code>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredRepos.map((repo) => {
                      const repoTotalSize = repo.tags?.reduce((sum, tag) => sum + (tag.size || 0), 0) || 0;
                      
                      return (
                        <div
                          key={repo.name}
                          className="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden hover:border-slate-600/50 transition-all"
                        >
                          <div
                            className="p-5 cursor-pointer"
                            onClick={() => setSelectedRepo(selectedRepo === repo.name ? null : repo.name)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/30">
                                  <Package className="w-6 h-6 text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg font-semibold text-white mb-1 truncate">{repo.name}</h3>
                                  <div className="flex items-center gap-4 text-sm text-slate-400">
                                    <div className="flex items-center gap-1">
                                      <Tag className="w-4 h-4" />
                                      <span>{repo.tag_count} tag{repo.tag_count !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <HardDrive className="w-4 h-4" />
                                      <span>{formatBytes(repoTotalSize)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  repo.tag_count > 0 
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                                }`}>
                                  {repo.tag_count > 0 ? 'Active' : 'Empty'}
                                </span>
                                <svg
                                  className={`w-5 h-5 text-slate-400 transition-transform ${
                                    selectedRepo === repo.name ? 'rotate-180' : ''
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Tags List */}
                          {selectedRepo === repo.name && (
                            <div className="border-t border-slate-700/50 bg-slate-900/40">
                              {/* Back Button */}
                              <div className="px-6 py-3 border-b border-slate-700/30 bg-slate-800/30">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRepo(null);
                                  }}
                                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-white bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50 rounded-md transition-all"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                  <span>Back to Repositories</span>
                                </button>
                              </div>
                              {repo.tags && repo.tags.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full">
                                    <thead className="bg-slate-800/50">
                                      <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                          Tag
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                          Platform
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                          Size
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                          Pushed
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                          Pull Command
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                          Actions
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                      {repo.tags.map((tagInfo) => {
                                        const tag = typeof tagInfo === 'string' ? tagInfo : tagInfo.name;
                                        const size = tagInfo.size || 0;
                                        const os = tagInfo.os || 'unknown';
                                        const arch = tagInfo.architecture || 'unknown';
                                        const created = tagInfo.created;
                                        const pullCommand = `docker pull ${REGISTRY_URL}/${repo.name}:${tag}`;
                                        
                                        return (
                                          <tr key={tag} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                              <div className="flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                                                <span className="font-mono text-sm text-white font-medium">{tag}</span>
                                              </div>
                                            </td>
                                            <td className="px-6 py-4">
                                              <div className="flex items-center gap-1 text-sm">
                                                <span className="text-slate-300 capitalize">{os}</span>
                                                <span className="text-slate-500">/</span>
                                                <span className="text-slate-300">{arch}</span>
                                              </div>
                                            </td>
                                            <td className="px-6 py-4">
                                              <span className="text-sm font-medium text-slate-200">{formatBytes(size)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                              <div className="text-sm">
                                                {created ? (
                                                  <>
                                                    <div className="text-slate-200 font-medium">{formatDate(created)}</div>
                                                    <div className="text-xs text-slate-500">{formatTime(created)}</div>
                                                  </>
                                                ) : (
                                                  <span className="text-slate-500">N/A</span>
                                                )}
                                              </div>
                                            </td>
                                            <td className="px-6 py-4">
                                              <div className="flex items-center gap-2">
                                                <code className="text-xs text-slate-400 bg-slate-900/50 px-2 py-1 rounded font-mono">
                                                  docker pull {REGISTRY_URL}/{repo.name}:{tag}
                                                </code>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    copyToClipboard(pullCommand, `pull-${repo.name}-${tag}`);
                                                  }}
                                                  className="flex items-center gap-1 px-2 py-1 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded transition-colors group flex-shrink-0"
                                                  title="Copy pull command"
                                                >
                                                  {copiedCommand === `pull-${repo.name}-${tag}` ? (
                                                    <>
                                                      <Check className="w-3.5 h-3.5 text-green-400" />
                                                      <span className="text-xs text-green-400">Copied!</span>
                                                    </>
                                                  ) : (
                                                    <>
                                                      <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-300" />
                                                      <span className="text-xs text-slate-400 group-hover:text-slate-300">Copy</span>
                                                    </>
                                                  )}
                                                </button>
                                              </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  deleteImage(repo.name, tag);
                                                }}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600/20 hover:bg-red-600 border border-red-600/30 hover:border-red-600 text-red-400 hover:text-white text-sm rounded-md transition-all"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Delete
                                              </button>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="p-8 text-center">
                                  <Tag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                  <p className="text-slate-500 text-sm">No tags available for this repository</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
