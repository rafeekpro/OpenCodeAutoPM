# Configuration Guide

**Configure OpenCodeAutoPM for your needs**

This guide covers all aspects of configuring OpenCodeAutoPM, from basic setup to advanced customization.

---

## Table of Contents

- [Configuration Overview](#configuration-overview)
- [Configuration File](#configuration-file)
- [Environment Variables](#environment-variables)
- [Execution Strategies](#execution-strategies)
- [Provider Configuration](#provider-configuration)
- [MCP Server Configuration](#mcp-server-configuration)
- [Advanced Configuration](#advanced-configuration)
- [Configuration Examples](#configuration-examples)

---

## Configuration Overview

OpenCodeAutoPM can be configured through multiple methods:

1. **Configuration File** - `.opencode/config.json` (primary)
2. **Environment Variables** - `.env` or system environment
3. **Command-Line Options** - Runtime overrides
4. **Interactive Commands** - `/config:*` commands

### Configuration Priority

Settings are applied in this order (later overrides earlier):

1. Default values
2. Configuration file
3. Environment variables
4. Command-line options

---

## Configuration File

### Location

The main configuration file is located at:

```
.opencode/config.json
```

### Structure

```json
{
  "version": "3.7.0",
  "scenario": "full-devops",
  "execution": {
    "strategy": "adaptive",
    "maxConcurrent": 5,
    "timeout": 300000,
    "retryAttempts": 3
  },
  "providers": {
    "github": {
      "enabled": true,
      "token": "${GITHUB_TOKEN}",
      "defaultBranch": "main",
      "autoSync": true
    },
    "azure": {
      "enabled": false,
      "orgUrl": "${AZURE_ORG_URL}",
      "project": "${AZURE_PROJECT}",
      "token": "${AZURE_TOKEN}",
      "autoSync": true
    }
  },
  "context": {
    "autoUpdate": true,
    "maxSize": 100000,
    "includeFiles": [
      "README.md",
      "package.json",
      ".opencode/config.json"
    ]
  },
  "testing": {
    "framework": "jest",
    "testDirectory": "test",
    "coverageThreshold": 80,
    "autoRun": false
  },
  "logging": {
    "level": "info",
    "file": ".opencode/logs/autopm.log",
    "maxSize": 10485760,
    "maxFiles": 5
  },
  "plugins": [
    "plugin-core",
    "plugin-pm",
    "plugin-languages",
    "plugin-frameworks",
    "plugin-azure",
    "plugin-github",
    "plugin-devops",
    "plugin-testing"
  ]
}
```

### Configuration Commands

```bash
# View current configuration
/config:view

# Set a specific value
/config:set execution.strategy hybrid

# Get a specific value
/config:get execution.strategy

# Reset to defaults
/config:reset

# Validate configuration
/config:validate
```

---

## Environment Variables

### OpenCodeAutoPM Variables

```bash
# Execution
AUTOPM_EXECUTION_STRATEGY=adaptive|sequential|hybrid
AUTOPM_MAX_CONCURRENT=5
AUTOPM_TIMEOUT=300000
AUTOPM_RETRY_ATTEMPTS=3

# Context
AUTOPM_CONTEXT_AUTO_UPDATE=true
AUTOPM_CONTEXT_MAX_SIZE=100000

# Testing
AUTOPM_TESTING_FRAMEWORK=jest
AUTOPM_TESTING_DIR=test
AUTOPM_TESTING_COVERAGE_THRESHOLD=80

# Logging
AUTOPM_LOG_LEVEL=info|debug|warn|error
AUTOPM_LOG_FILE=.opencode/logs/autopm.log

# Plugins
AUTOPM_PLUGINS=plugin-core,plugin-pm,plugin-languages
```

### GitHub Variables

```bash
# Authentication
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=owner/repository

# Configuration
GITHUB_DEFAULT_BRANCH=main
GITHUB_AUTO_SYNC=true
GITHUB_WORKFLOW_ENABLED=true
```

### Azure DevOps Variables

```bash
# Authentication
AZURE_ORG_URL=https://dev.azure.com/yourorganization
AZURE_PROJECT=YourProject
AZURE_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Configuration
AZURE_AUTO_SYNC=true
AZURE_DEFAULT_ITERATION=MyTeam
AZURE_DEFAULT_AREA=Web
```

### MCP Server Variables

```bash
# Context7
MCP_CONTEXT7_ENABLED=true
MCP_CONTEXT7_API_KEY=your_key

# Custom MCP servers
MCP_CUSTOM_ENABLED=true
MCP_CUSTOM_ENDPOINT=http://localhost:3000
```

### Environment File (.env)

Create a `.env` file in your project root:

```bash
# OpenCodeAutoPM Configuration
AUTOPM_EXECUTION_STRATEGY=adaptive
AUTOPM_LOG_LEVEL=info

# GitHub
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=owner/repo

# Azure DevOps
AZURE_ORG_URL=https://dev.azure.com/yourorg
AZURE_PROJECT=YourProject
AZURE_TOKEN=your_token_here

# MCP Servers
MCP_CONTEXT7_ENABLED=true
```

**Security Note**: Never commit `.env` files to version control. Add to `.gitignore`:

```
.env
.env.local
.env.*.local
```

---

## Execution Strategies

### Sequential

**Configuration**:
```json
{
  "execution": {
    "strategy": "sequential",
    "maxConcurrent": 1,
    "timeout": 300000
  }
}
```

**Environment Variable**:
```bash
AUTOPM_EXECUTION_STRATEGY=sequential
```

**Characteristics**:
- One agent at a time
- Predictable execution order
- Minimal resource usage
- Best for: debugging, learning, limited resources

### Adaptive

**Configuration**:
```json
{
  "execution": {
    "strategy": "adaptive",
    "maxConcurrent": 3,
    "timeout": 300000
  }
}
```

**Environment Variable**:
```bash
AUTOPM_EXECUTION_STRATEGY=adaptive
```

**Characteristics**:
- Intelligently chooses strategy per task
- Balances performance and resources
- Context-aware decisions
- Best for: most users, general use

### Hybrid

**Configuration**:
```json
{
  "execution": {
    "strategy": "hybrid",
    "maxConcurrent": 5,
    "timeout": 300000
  }
}
```

**Environment Variable**:
```bash
AUTOPM_EXECUTION_STRATEGY=hybrid
AUTOPM_MAX_CONCURRENT=5
```

**Characteristics**:
- Up to 5 agents in parallel
- Maximum performance
- Higher resource usage
- Best for: powerful machines, large tasks, experienced users

---

## Provider Configuration

### GitHub

#### Enable GitHub Integration

```bash
# Using command
/github:install

# Or configure manually
/config:set providers.github.enabled true
```

#### Configuration Options

```json
{
  "providers": {
    "github": {
      "enabled": true,
      "token": "${GITHUB_TOKEN}",
      "repo": "owner/repo",
      "defaultBranch": "main",
      "autoSync": true,
      "features": {
        "issues": true,
        "pullRequests": true,
        "workflows": true,
        "projects": true,
        "actions": true
      }
    }
  }
}
```

#### Required Permissions

GitHub token requires these scopes:
- `repo` - Full repository access
- `workflow` - Workflow management
- `issues:write` - Issue management
- `pull_requests:write` - PR management

#### Create GitHub Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Select scopes: `repo`, `workflow`, `issues`, `pull_requests`
4. Copy token and set as `GITHUB_TOKEN`

### Azure DevOps

#### Enable Azure DevOps Integration

```bash
# Using command
/azure:init

# Or configure manually
/config:set providers.azure.enabled true
```

#### Configuration Options

```json
{
  "providers": {
    "azure": {
      "enabled": true,
      "orgUrl": "${AZURE_ORG_URL}",
      "project": "${AZURE_PROJECT}",
      "token": "${AZURE_TOKEN}",
      "autoSync": true,
      "defaults": {
        "iteration": "MyTeam\\Sprint 1",
        "area": "Web\\Frontend",
        "assignedTo": "",
        "priority": 2,
        "severity": 2
      },
      "features": {
        "userStories": true,
        "tasks": true,
        "features": true,
        "epics": true,
        "sprints": true,
        "boards": true,
        "pipelines": true
      }
    }
  }
}
```

#### Required Permissions

Azure DevOps token requires these permissions:
- **Work Items**: Read & Write
- **Build**: Read & Execute
- **Code**: Read
- **Project and Team**: Read

#### Create Azure DevOps Token

1. Go to dev.azure.com → Your Organization → User Settings → Personal Access Tokens
2. Create new token
3. Select organization
4. Choose scopes: Work Items (Read & Write), Build (Read & Execute), Code (Read)
5. Copy token and set as `AZURE_TOKEN`

---

## MCP Server Configuration

### What are MCP Servers?

Model Context Protocol (MCP) servers extend OpenCode's capabilities by providing:
- Live documentation access
- API integrations
- External data sources
- Custom tools and utilities

### Available MCP Servers

#### Context7

**Purpose**: Live documentation for best practices

```json
{
  "mcpServers": {
    "context7": {
      "enabled": true,
      "config": {
        "apiKey": "${MCP_CONTEXT7_API_KEY}",
        "documentation": [
          "aws",
          "azure",
          "gcp",
          "kubernetes",
          "terraform"
        ]
      }
    }
  }
}
```

#### File System MCP

**Purpose**: Enhanced file system operations

```json
{
  "mcpServers": {
    "filesystem": {
      "enabled": true,
      "config": {
        "allowedDirectories": [
          "/Users/rla/Projects",
          "/tmp"
        ]
      }
    }
  }
}
```

#### Custom MCP Servers

```json
{
  "mcpServers": {
    "my-custom-server": {
      "enabled": true,
      "command": "node",
      "args": ["/path/to/server.js"],
      "env": {
        "API_KEY": "custom_key"
      }
    }
  }
}
```

### MCP Commands

```bash
# List available MCP servers
/mcp:list

# Install an MCP server
/mcp:install context7

# Configure MCP server
/mcp:config-set context7 '{"enabled": true}'

# Remove MCP server
/mcp:remove context7

# Test MCP server connection
/mcp:test context7
```

---

## Advanced Configuration

### Custom Plugins

```json
{
  "plugins": [
    "plugin-core",
    "plugin-pm",
    "plugin-languages",
    {
      "name": "my-custom-plugin",
      "path": "/path/to/custom-plugin",
      "enabled": true
    }
  ]
}
```

### Custom Agents

```json
{
  "customAgents": {
    "my-specialist": {
      "id": "my-specialist",
      "name": "My Specialist",
      "description": "Specialist for my domain",
      "expertise": ["my-domain", "my-tech"],
      "path": ".opencode/agents/custom/my-specialist.md"
    }
  }
}
```

### Hooks Configuration

```json
{
  "hooks": {
    "pre-command": [
      ".opencode/hooks/pre-command-context7.js"
    ],
    "pre-agent": [
      ".opencode/hooks/pre-agent-context7.js"
    ],
    "pre-commit": [
      ".opencode/hooks/pre-commit-tdd.js"
    ],
    "post-commit": [
      ".opencode/hooks/post-commit-notify.js"
    ]
  }
}
```

### Templates Configuration

```json
{
  "templates": {
    "prd": ".opencode/templates/prd-template.md",
    "epic": ".opencode/templates/epic-template.md",
    "task": ".opencode/templates/task-template.md",
    "userStory": ".opencode/templates/user-story-template.md"
  }
}
```

### Rules Configuration

```json
{
  "rules": {
    "tdd": {
      "enabled": true,
      "enforcement": "strict"
    },
    "context7": {
      "enabled": true,
      "enforcement": "mandatory"
    },
    "documentation": {
      "enabled": true,
      "requirements": ["readme", "api-docs"]
    }
  }
}
```

---

## Configuration Examples

### Minimal Configuration

```json
{
  "version": "3.7.0",
  "scenario": "lite",
  "execution": {
    "strategy": "sequential"
  }
}
```

### Standard Development

```json
{
  "version": "3.7.0",
  "scenario": "standard",
  "execution": {
    "strategy": "adaptive",
    "maxConcurrent": 3
  },
  "context": {
    "autoUpdate": true
  },
  "testing": {
    "framework": "jest",
    "coverageThreshold": 80
  },
  "logging": {
    "level": "info"
  }
}
```

### Full DevOps with GitHub

```json
{
  "version": "3.7.0",
  "scenario": "full-devops",
  "execution": {
    "strategy": "hybrid",
    "maxConcurrent": 5
  },
  "providers": {
    "github": {
      "enabled": true,
      "autoSync": true
    }
  },
  "context": {
    "autoUpdate": true
  },
  "testing": {
    "framework": "jest",
    "coverageThreshold": 80,
    "autoRun": true
  },
  "logging": {
    "level": "debug"
  }
}
```

### Azure DevOps Team Setup

```json
{
  "version": "3.7.0",
  "scenario": "azure",
  "execution": {
    "strategy": "adaptive"
  },
  "providers": {
    "azure": {
      "enabled": true,
      "orgUrl": "https://dev.azure.com/mycompany",
      "project": "MyProject",
      "autoSync": true,
      "defaults": {
        "iteration": "Web Team\\Sprint 1",
        "area": "Web",
        "assignedTo": "",
        "priority": 2
      }
    }
  },
  "testing": {
    "framework": "jest",
    "testDirectory": "test",
    "coverageThreshold": 75
  }
}
```

### Performance Optimized

```json
{
  "version": "3.7.0",
  "scenario": "performance",
  "execution": {
    "strategy": "hybrid",
    "maxConcurrent": 5,
    "timeout": 600000,
    "retryAttempts": 3
  },
  "context": {
    "autoUpdate": true,
    "maxSize": 200000
  },
  "testing": {
    "framework": "jest",
    "coverageThreshold": 90,
    "autoRun": true,
    "parallel": true
  },
  "logging": {
    "level": "warn"
  }
}
```

---

## Configuration Validation

### Validate Your Configuration

```bash
# Validate configuration file
/config:validate

# Check for issues
/config:check

# View current configuration
/config:view
```

### Common Configuration Issues

#### Issue: Provider Not Working

**Symptoms**: Commands like `/azure:us-new` fail

**Solution**:
```bash
# Check provider is enabled
/config:get providers.azure.enabled

# Verify credentials
echo $AZURE_TOKEN

# Test connection
/azure:test
```

#### Issue: MCP Servers Not Available

**Symptoms**: Context7 queries not working

**Solution**:
```bash
# List MCP servers
/mcp:list

# Test MCP server
/mcp:test context7

# Reinstall MCP server
/mcp:install context7
```

#### Issue: Wrong Execution Strategy

**Symptoms**: Poor performance or high resource usage

**Solution**:
```bash
# Change strategy
/config:set execution.strategy adaptive

# Or use environment variable
export AUTOPM_EXECUTION_STRATEGY=adaptive
```

---

## Next Steps

- [Quick Start Guide](../docs/QUICK_START.md) - Get started quickly
- [Installation Guide](../docs/INSTALLATION.md) - Installation details
- [Provider Configuration](../docs/admin/PROVIDERS.md) - Detailed provider setup
- [MCP Servers](../docs/user/MCP_SERVERS.md) - MCP server documentation

---

**Last Updated**: 2025-02-28
**Framework Version**: 3.7.0
