# Installation Guide

**Detailed installation instructions for OpenCodeAutoPM**

This guide covers all aspects of installing OpenCodeAutoPM, from system requirements to troubleshooting.

---

## Table of Contents

- [System Requirements](#system-requirements)
- [Installation Methods](#installation-methods)
- [Installation Scenarios](#installation-scenarios)
- [Step-by-Step Installation](#step-by-step-installation)
- [Post-Installation Configuration](#post-installation-configuration)
- [Verification](#verification)
- [Upgrading](#upgrading)
- [Uninstallation](#uninstallation)
- [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements

- **Node.js**: v16.0.0 or higher
- **npm**: v7.0.0 or higher (comes with Node.js)
- **Disk Space**: 100 MB for installation
- **RAM**: 512 MB available
- **OS**: Linux, macOS, or Windows 10+

### Recommended Requirements

- **Node.js**: v18 LTS or v20 LTS
- **npm**: v9 or v10
- **Disk Space**: 500 MB for full installation
- **RAM**: 2 GB available
- **OS**: Latest stable release of your OS

### Optional Requirements

- **Git**: v2.0+ for Git workflow commands
- **GitHub CLI**: `gh` for enhanced GitHub integration
- **Azure DevOps CLI**: `az` for enhanced Azure integration
- **Docker**: v20+ for container-related features

### Check Your System

```bash
# Check Node.js version
node --version  # Should be v16+

# Check npm version
npm --version   # Should be v7+

# Check Git
git --version   # Optional

# Check disk space
df -h           # Linux/macOS
dir             # Windows
```

---

## Installation Methods

### Method 1: Global npm Installation (Recommended)

Install OpenCodeAutoPM globally on your system:

```bash
npm install -g opencode-autopm
```

**Advantages**:
- Available system-wide
- Easy to update
- Standard npm package management
- Works on all platforms

**Best for**: Most users, production use, team deployments

### Method 2: Per-Project Installation

Install as a dev dependency in a specific project:

```bash
cd your-project
npm install --save-dev opencode-autopm
```

Then use via:
```bash
npx opencode-autopm install
```

**Advantages**:
- Version locked to project
- Works in CI/CD environments
- No global installation needed

**Best for**: CI/CD pipelines, specific project requirements

### Method 3: Development Installation

Install from source for development:

```bash
git clone https://github.com/rafeekpro/OpenCodeAutoPM.git
cd OpenCodeAutoPM
npm install
npm link
```

**Advantages**:
- Latest development version
- Can modify and test changes
- Contribute to project

**Best for**: Contributors, testers, developers

---

## Installation Scenarios

OpenCodeAutoPM offers 7 installation scenarios to match your needs:

### Scenario 1: Lite (~50 commands)

**Description**: Core features with sequential execution

**Includes**:
- Core commands (context, testing, config)
- Basic PM commands
- Sequential execution strategy
- Minimal context footprint

**Best For**:
- Simple projects
- Learning the framework
- Systems with limited resources
- Users who want minimal setup

**Commands**: ~50
**Plugins**: Core, PM-Basic

### Scenario 2: Standard (~55 commands) **[DEFAULT]**

**Description**: Core + PM essentials

**Includes**:
- All Lite features
- Language agents (Python, JavaScript, Node.js)
- Basic framework agents
- PM workflow integration
- Adaptive execution strategy

**Best For**:
- Typical development projects
- Small to medium teams
- Users wanting PM features without heavy DevOps

**Commands**: ~55
**Plugins**: Core, PM-Basic, Languages

### Scenario 3: Azure (~95 commands)

**Description**: Standard + Azure DevOps integration

**Includes**:
- All Standard features
- Azure DevOps commands (user stories, tasks, features, sprints)
- Azure Boards integration
- Azure Repos integration
- Azure Pipelines support

**Best For**:
- Teams using Azure DevOps
- Organizations with Azure infrastructure
- Projects requiring Azure integration

**Commands**: ~95
**Plugins**: Core, PM-Basic, Languages, PM-Azure

### Scenario 4: Docker (~85 commands)

**Description**: Standard + Docker containerization

**Includes**:
- All Standard features
- Docker agents and commands
- Container orchestration
- Kubernetes basics
- Container testing

**Best For**:
- Container-based development
- Microservices architectures
- Docker/Kubernetes workflows

**Commands**: ~85
**Plugins**: Core, PM-Basic, Languages, DevOps-Docker

### Scenario 5: Full DevOps (~125 commands) ⭐ **RECOMMENDED**

**Description**: Complete CI/CD pipeline

**Includes**:
- All Azure scenario features
- GitHub integration (workflows, Actions, Projects)
- Full DevOps toolchain
- CI/CD automation
- Cloud deployment support
- Observability and monitoring

**Best For**:
- Production environments
- Complete development lifecycle
- Teams wanting full automation
- DevOps best practices

**Commands**: ~125
**Plugins**: Core, PM-Basic, Languages, PM-Azure, PM-GitHub, DevOps, Cloud, Testing

### Scenario 6: Performance (~145 commands)

**Description**: Maximum parallelization

**Includes**:
- All Full DevOps features
- Hybrid execution (5 concurrent agents)
- Performance optimizations
- Advanced caching
- Parallel task processing

**Best For**:
- Powerful workstations (16GB+ RAM)
- Large codebases
- Teams requiring maximum speed
- Experienced users

**Commands**: ~145
**Plugins**: All plugins with hybrid execution

### Scenario 7: Custom

**Description**: Choose your plugins

**Includes**:
- Hand-picked plugins
- Custom configuration
- Flexible setup

**Best For**:
- Advanced users
- Specific requirements
- Custom workflows

**Available Plugins**:
- `plugin-core` - Core functionality (required)
- `plugin-pm` - Project management
- `plugin-azure` - Azure DevOps
- `plugin-github` - GitHub integration
- `plugin-languages` - Language experts
- `plugin-frameworks` - Framework specialists
- `plugin-devops` - DevOps tools
- `plugin-databases` - Database experts
- `plugin-cloud` - Cloud architects
- `plugin-ai` - AI/ML integration
- `plugin-data` - Data pipelines
- `plugin-testing` - Testing utilities

---

## Step-by-Step Installation

### Step 1: Install OpenCodeAutoPM Package

```bash
npm install -g opencode-autopm
```

**Expected Output**:
```
npm WARN deprecated glob@11.1.0: Old versions of glob are not supported...
added 1 package, and audited 50 packages in 5s
found 0 vulnerabilities
```

**Note**: The glob deprecation warning is from a dependency and can be safely ignored.

### Step 2: Verify Installation

```bash
opencode-autopm --version
```

**Expected Output**:
```
opencode-autopm/3.7.0
```

### Step 3: Navigate to Your Project

```bash
cd /path/to/your/project
```

**Note**: The project must be a Git repository for full functionality.

### Step 4: Run Installation

```bash
opencode-autopm install
```

### Step 5: Choose Installation Scenario

The installer will display:
```
? Select installation scenario:
  1. Lite      - Core features, sequential execution (~50 commands)
  2. Standard  - Core + PM essentials (~55 commands) [DEFAULT]
  3. Azure     - Standard + Azure DevOps integration (~95 commands)
  4. Docker    - Container development focus (~85 commands)
  5. Full DevOps - Complete CI/CD pipeline (~125 commands) [RECOMMENDED]
  6. Performance - Maximum parallelization (~145 commands)
  7. Custom    - Choose your plugins
```

Enter the number of your choice (2 for Standard, 5 for Full DevOps, etc.)

### Step 6: Choose Execution Strategy

```
? Select execution strategy:
  1. Sequential - Safe, one agent at a time
  2. Adaptive  - Intelligent mode selection [DEFAULT]
  3. Hybrid    - Maximum parallelization (5 concurrent agents)
```

Press Enter for Adaptive (recommended).

### Step 7: Installation Completes

The installer will:
1. Create `.opencode/` directory
2. Copy agents, commands, rules, scripts, and checklists
3. Create initial configuration files
4. Set up execution strategy
5. Install selected plugins

**Expected Output**:
```
✓ Created .opencode/ directory
✓ Installed 40 agents
✓ Installed 125 commands
✓ Created configuration files
✓ Set up Adaptive execution strategy

Installation complete! Run /context:create in OpenCode to get started.
```

---

## Post-Installation Configuration

### Configure GitHub Integration (Optional)

```bash
# Set GitHub token (for private repos)
/github:install

# Or set environment variable
export GITHUB_TOKEN=your_token_here
```

### Configure Azure DevOps Integration (Optional)

```bash
# Initialize Azure DevOps
/azure:init

# Provide:
# - Organization URL
# - Project name
# - Personal Access Token
```

### Configure MCP Servers (Optional)

```bash
# List available MCP servers
/mcp:list

# Install an MCP server
/mcp:install context7

# Configure MCP server
/mcp:config-set context7 '{"enabled": true}'
```

### Set Environment Variables (Optional)

Create `.env` file in your project root:

```bash
# GitHub
GITHUB_TOKEN=your_github_token
GITHUB_REPO=owner/repo

# Azure DevOps
AZURE_ORG_URL=https://dev.azure.com/yourorg
AZURE_PROJECT=YourProject
AZURE_TOKEN=your_azure_token

# OpenCodeAutoPM
AUTOPM_EXECUTION_STRATEGY=adaptive
AUTOPM_LOG_LEVEL=info
```

---

## Verification

### Verify Directory Structure

```bash
ls -la .opencode/
```

**Expected Structure**:
```
.opencode/
├── agents/           # Agent definitions
├── commands/         # PM commands
├── rules/            # Development rules
├── scripts/          # Helper scripts
├── checklists/       # Quality checklists
├── context/          # Project context (created by /context:create)
├── prds/             # PRDs (created by PM commands)
└── epics/            # Epics (created by PM commands)
```

### Verify Agents

```bash
ls .opencode/agents/ | wc -l
# Should show 40+ agents (depending on scenario)
```

### Verify Commands

```bash
ls .opencode/commands/ | wc -l
# Should show 50-145 commands (depending on scenario)
```

### Test Basic Command (in OpenCode)

```bash
/context:create
```

**Expected Result**: Creates `.opencode/context/project-context.md` with project information.

---

## Upgrading

### Check for Updates

```bash
npm outdated -g opencode-autopm
```

### Upgrade to Latest Version

```bash
npm update -g opencode-autopm
```

### Upgrade Specific Project

```bash
cd your-project
opencode-autopm install --upgrade
```

### Upgrade Between Major Versions

When upgrading between major versions (e.g., 3.x → 4.0):

1. **Read the changelog**: Check [CHANGELOG.md](../CHANGELOG.md) for breaking changes
2. **Backup configuration**: Copy `.opencode/` directory
3. **Update package**: `npm update -g opencode-autopm`
4. **Reinstall in project**: `opencode-autopm install --upgrade`
5. **Update configuration**: Adjust for any breaking changes
6. **Test thoroughly**: Run tests and verify workflows

---

## Uninstallation

### Uninstall from Project

```bash
cd your-project
rm -rf .opencode/
```

### Uninstall Global Package

```bash
npm uninstall -g opencode-autopm
```

### Clean Up Configuration

```bash
# Remove configuration files
rm ~/.opencode-autopm/config.json

# Remove environment variables from .bashrc, .zshrc, etc.
# Remove lines starting with AUTOPM_ or containing opencode-autopm
```

---

## Troubleshooting

### Problem: Command Not Found

**Symptoms**:
```bash
opencode-autopm: command not found
```

**Solutions**:

1. **Check npm global prefix**:
```bash
npm config get prefix
```

2. **Add to PATH** (if needed):
```bash
# For bash
export PATH=$(npm config get prefix)/bin:$PATH

# For zsh
export PATH=$(npm config get prefix)/bin:$PATH

# Add to ~/.bashrc or ~/.zshrc for persistence
```

3. **Reinstall**:
```bash
npm uninstall -g opencode-autopm
npm install -g opencode-autopm
```

### Problem: Permission Denied

**Symptoms**:
```
Error: EACCES: permission denied
```

**Solutions**:

1. **Fix npm permissions** (Linux/macOS):
```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

2. **Use sudo** (not recommended):
```bash
sudo npm install -g opencode-autopm
```

### Problem: Installation Fails with EEXIST

**Symptoms**:
```
npm error EEXIST: file already exists
```

**Solutions**:

1. **Remove existing file**:
```bash
rm /path/to/existing/file
npm install -g opencode-autopm
```

2. **Use force**:
```bash
npm install -g opencode-autopm --force
```

### Problem: Missing Files After Installation

**Symptoms**:
```
⚠ Cannot create template for: FILENAME - file missing from source
```

**Solutions**:

This is usually just a warning and can be ignored. If files are genuinely missing:

1. **Verify installation**:
```bash
npm list -g opencode-autopm
```

2. **Reinstall**:
```bash
npm uninstall -g opencode-autopm
npm cache clean --force
npm install -g opencode-autopm
```

3. **Report issue**:
   - Check if it's a known issue: [GitHub Issues](https://github.com/rafeekpro/OpenCodeAutoPM/issues)
   - Create a new issue with details

### Problem: Azure DevOps Authentication Fails

**Symptoms**:
```
Error: Authentication failed for Azure DevOps
```

**Solutions**:

1. **Verify token**:
   - Ensure token has correct permissions (Read & Write)
   - Check token hasn't expired

2. **Verify URL**:
```bash
# Should be: https://dev.azure.com/yourorg
# NOT: https://dev.azure.com/yourorg/project
```

3. **Test connection**:
```bash
curl -u :$AZURE_TOKEN $AZURE_ORG_URL/_apis/projects?api-version=6.0
```

### Problem: GitHub Integration Not Working

**Symptoms**:
```
Error: GitHub API rate limit exceeded
```

**Solutions**:

1. **Authenticate**:
```bash
export GITHUB_TOKEN=your_token_here
```

2. **Use GitHub CLI**:
```bash
gh auth login
```

### Problem: Tests Fail After Installation

**Symptoms**:
```
Testing framework detection failed
```

**Solutions**:

1. **Ensure project has tests**:
```bash
ls test/
ls *.test.js
```

2. **Manually configure**:
```bash
/testing:configure --framework jest --test-dir test
```

3. **Create test directory**:
```bash
mkdir -p test
```

### Problem: High Memory Usage

**Symptoms**:
- System slows down
- Out of memory errors

**Solutions**:

1. **Switch execution strategy**:
```bash
# From Hybrid to Adaptive
/config:set execution.strategy adaptive
```

2. **Reduce concurrent agents**:
```bash
/config:set execution.concurrent 3
```

3. **Use Lite scenario**:
```bash
opencode-autopm install --scenario lite
```

---

## Getting Help

If you encounter issues not covered here:

1. **Documentation**: [Full Documentation Hub](../DOCUMENTATION.md)
2. **Troubleshooting**: [Troubleshooting Guide](../docs/reference/TROUBLESHOOTING.md)
3. **GitHub Issues**: [Report a problem](https://github.com/rafeekpro/OpenCodeAutoPM/issues)
4. **GitHub Discussions**: [Ask a question](https://github.com/rafeekpro/OpenCodeAutoPM/discussions)

---

## Next Steps

After successful installation:

1. **[Quick Start Guide](../docs/QUICK_START.md)** - Get started quickly
2. **[Configuration Guide](../docs/CONFIGURATION.md)** - Configure for your needs
3. **[First Project Guide](../docs/FIRST_PROJECT.md)** - Create your first managed project
4. **[User Guide](../docs/user/USER_GUIDE.md)** - Learn all features

---

**Last Updated**: 2025-02-28
**Framework Version**: 3.7.0
