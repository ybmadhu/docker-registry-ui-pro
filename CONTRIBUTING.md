# Contributing to Docker Registry UI

First off, thank you for considering contributing to Docker Registry UI! 🎉

It's people like you that make Docker Registry UI such a great tool. We welcome contributions from everyone, whether you're fixing a typo in the documentation or implementing a major feature.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Testing](#testing)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [maintainers@example.com](mailto:maintainers@example.com).

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a branch** for your changes
4. **Make your changes** with clear commit messages
5. **Push to your fork** and submit a pull request

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and expected**
- **Include screenshots if relevant**
- **Note your environment** (OS, Docker version, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List some examples** of how it would be used
- **Include mockups or sketches** if applicable

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:

- `good first issue` - Good for newcomers
- `help wanted` - Issues where we need help
- `documentation` - Documentation improvements
- `bug` - Bug fixes needed

### Pull Requests

- Fill in the required template
- Follow the style guidelines
- Include appropriate test coverage
- Update documentation as needed
- End all files with a newline

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Docker and Docker Compose
- Git

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Development dependencies

# Run tests
pytest

# Start development server
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run dev
```

### Full Stack Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Pull Request Process

1. **Update the README.md** with details of changes if needed
2. **Update documentation** for any new features
3. **Add tests** for new functionality
4. **Ensure all tests pass** before submitting
5. **Update the CHANGELOG.md** following Keep a Changelog format
6. **Request review** from maintainers

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-reviewed the code
- [ ] Commented code in hard-to-understand areas
- [ ] Made corresponding changes to documentation
- [ ] Changes generate no new warnings
- [ ] Added tests that prove the fix/feature works
- [ ] New and existing tests pass locally
- [ ] Dependent changes have been merged

## Style Guidelines

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- Consider starting with an emoji:
  - 🎨 `:art:` - Improving structure/format
  - ⚡ `:zap:` - Improving performance
  - 🐛 `:bug:` - Fixing a bug
  - ✨ `:sparkles:` - New feature
  - 📝 `:memo:` - Documentation
  - 🚀 `:rocket:` - Deployment
  - ✅ `:white_check_mark:` - Tests

### Python Style Guide

- Follow [PEP 8](https://pep8.org/)
- Use type hints where appropriate
- Write docstrings for functions and classes
- Maximum line length: 100 characters

```python
def get_repository_tags(repository: str) -> List[str]:
    """
    Get all tags for a specific repository.
    
    Args:
        repository: The name of the repository
        
    Returns:
        List of tag names
        
    Raises:
        HTTPException: If repository is not found
    """
    pass
```

### JavaScript/React Style Guide

- Use ES6+ features
- Use functional components with hooks
- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use meaningful variable names
- Add comments for complex logic

```javascript
// Good
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
};

// Bad
const fb = (b) => {
  if (!b) return '0 Bytes';
  return b / 1024 + 'KB';
};
```

### CSS/Tailwind Style Guide

- Use Tailwind utility classes when possible
- Keep custom CSS minimal
- Group related utilities together
- Use responsive modifiers consistently

```jsx
// Good
<div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg hover:bg-slate-700">

// Bad
<div className="flex p-4 items-center bg-slate-800 hover:bg-slate-700 rounded-lg justify-between">
```

## Testing

### Backend Tests

```bash
cd backend
pytest --cov=. --cov-report=html
```

### Frontend Tests

```bash
cd frontend
npm test -- --coverage
```

### Integration Tests

```bash
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

### Writing Tests

- Write unit tests for new functions
- Write integration tests for API endpoints
- Aim for >80% code coverage
- Test edge cases and error conditions

## Documentation

- Update README.md for user-facing changes
- Update API documentation in code comments
- Add examples for new features
- Keep documentation clear and concise

## Community

- 💬 [GitHub Discussions](https://github.com/yourusername/docker-registry-ui/discussions)
- 🐛 [Issue Tracker](https://github.com/yourusername/docker-registry-ui/issues)
- 📧 [Email](mailto:maintainers@example.com)

## Recognition

Contributors will be recognized in:
- The project README
- Release notes
- Our hall of fame

## Questions?

Don't hesitate to ask! Create a discussion or reach out to the maintainers.

---

Thank you for contributing to Docker Registry UI! 🚀
