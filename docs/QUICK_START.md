# Quick Start Guide

**Get started with OpenCodeAutoPM in 5 minutes**

This guide will help you install OpenCodeAutoPM and run your first automated project management command.

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js 16+** installed ([Download Node.js](https://nodejs.org/))
- **npm** (comes with Node.js)
- **OpenCode** CLI installed
- **Git** installed and configured
- (Optional) GitHub account
- (Optional) Azure DevOps account

---

## Step 1: Install OpenCodeAutoPM

Install OpenCodeAutoPM globally using npm:

```bash
npm install -g opencode-autopm
```

**Verification**:

```bash
opencode-autopm --version
# Output: opencode-autopm/3.7.0
```

---

## Step 2: Initialize Your Project

Navigate to your project directory and run the install command:

```bash
cd your-project
opencode-autopm install
```

### Choose Your Installation Scenario

The installer will prompt you to choose a scenario:

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

**For first-time users**, we recommend **Scenario 5 (Full DevOps)** for the complete experience.

---

## Step 3: Choose Execution Strategy

```
? Select execution strategy:
  1. Sequential - Safe, one agent at a time
  2. Adaptive  - Intelligent mode selection [DEFAULT]
  3. Hybrid    - Maximum parallelization (5 concurrent agents)
```

**Recommendation**: Start with **Adaptive** (default) for intelligent mode selection.

---

## Step 4: Verify Installation

After installation completes, verify:

```bash
# Check OpenCode configuration
ls -la .opencode/
# Should show: agents/, commands/, rules/, scripts/, checklists/

# Test a basic command (run in OpenCode, not terminal)
/context:create
```

---

## Step 5: Your First Command

Let's run your first project management command!

### Option A: Local PM (No External Services)

```bash
# Create a new PRD (Product Requirements Document)
/pm:prd-new "User Authentication System"

# This creates:
# - .opencode/prds/prd-{timestamp}-user-authentication-system.md
# - With structured sections: Overview, Goals, Features, Requirements
```

### Option B: With Azure DevOps

```bash
# Initialize Azure DevOps integration
/azure:init

# Create a new user story
/azure:us-new "As a user, I want to login with email and password"

# View all tasks
/azure:task-list
```

### Option C: With GitHub

```bash
# Create a GitHub workflow
/github:workflow-create

# This creates a workflow file based on your project needs
```

---

## Step 6: Work with Your First Agent

OpenCodeAutoPM includes 40 specialized AI agents. Let's use one:

```bash
# Get code analysis
@code-analyzer Review my recent changes for potential issues

# Run tests
@test-runner Execute all tests and provide detailed analysis

# Build a new feature
@python-backend-engineer Create a FastAPI endpoint for user authentication
```

---

## What Just Happened?

You now have:

✅ **OpenCodeAutoPM installed** with your chosen scenario
✅ **Project configured** with agents, commands, and rules
✅ **PM system ready** to track features and tasks
✅ **40 AI agents** available for specialized tasks
✅ **269 commands** across 12 plugins (depending on scenario)

---

## Next Steps

### Learn the Basics

1. **Explore Commands**: Try `/help` to see available commands
2. **Meet the Agents**: Check the [Agent Registry](../docs/user/AGENTS.md)
3. **Read the User Guide**: [User Guide Overview](../docs/user/USER_GUIDE.md)

### Configure Providers (Optional)

**GitHub Integration**:
```bash
/github:install
```

**Azure DevOps Integration**:
```bash
/azure:init
```

### Create Your First Feature

```bash
# 1. Create a PRD
/pm:prd-new "My First Feature"

# 2. Decompose into Epics
/pm:epic-new prd-{timestamp}-my-first-feature "Implementation Phase 1"

# 3. Create tasks
/pm:task-new epic-{id} "Set up project structure"

# 4. Track progress
/pm:status
```

---

## Common First Commands

Here are the most commonly used commands for beginners:

### Context and Testing

```bash
/context/create          # Create/update project context
/testing:prime           # Detect and configure testing framework
/testing:run             # Run all tests
```

### Project Management

```bash
/pm:prd-list             # List all PRDs
/pm:epic-list            # List all epics
/pm:task-list            # List all tasks
/pm:status               # Show project status
```

### Git Workflow

```bash
/git:branch              # Create feature branch
/git:commit              # Commit changes with semantic message
/git:push                # Push to remote
```

### Agent Examples

```bash
@code-analyzer Review recent changes
@test-runner Run all tests with analysis
@python-backend-engineer Build REST API endpoint
@javascript-frontend-engineer Create React component
@docker-containerization-expert Add Dockerfile
```

---

## Installation Scenarios Explained

### Lite (~50 commands)
- **Best for**: Simple projects, learning, minimal context
- **Includes**: Core commands, basic PM, sequential execution
- **Use when**: You're just starting or have a simple project

### Standard (~55 commands)
- **Best for**: Typical development projects
- **Includes**: Core + PM essentials, language agents
- **Use when**: You need PM features without heavy DevOps tools

### Azure (~95 commands)
- **Best for**: Teams using Azure DevOps
- **Includes**: Standard + full Azure DevOps integration
- **Use when**: Your organization uses Azure DevOps for work tracking

### Docker (~85 commands)
- **Best for**: Container-based development
- **Includes**: Standard + Docker and container tools
- **Use when**: You're developing in containers or deploying to Docker

### Full DevOps (~125 commands) ⭐ **RECOMMENDED**
- **Best for**: Complete development lifecycle
- **Includes**: All features + GitHub + Azure DevOps + CI/CD
- **Use when**: You want the complete, production-ready setup

### Performance (~145 commands)
- **Best for**: Maximum productivity on powerful machines
- **Includes**: Full DevOps + maximum parallelization (5 concurrent agents)
- **Use when**: You have a powerful machine and want maximum speed

### Custom
- **Best for**: Advanced users with specific needs
- **Includes**: Choose exactly which plugins to install
- **Use when**: You know exactly what you need

---

## Execution Strategies Explained

### Sequential
- **Safe**: One agent at a time
- **Predictable**: Easy to follow
- **Resource-light**: Minimal memory/CPU usage
- **Best for**: Limited resources, debugging, learning

### Adaptive (Default) ⭐ **RECOMMENDED**
- **Intelligent**: Automatically chooses strategy
- **Balanced**: Good performance and resource usage
- **Context-aware**: Adapts to task complexity
- **Best for**: Most users and situations

### Hybrid
- **Fast**: Up to 5 agents working in parallel
- **Resource-intensive**: Higher memory/CPU usage
- **Complex**: More advanced coordination
- **Best for**: Powerful machines, large tasks, experienced users

---

## Troubleshooting

### Installation Fails

```bash
# Clear npm cache
npm cache clean --force

# Uninstall existing version
npm uninstall -g opencode-autopm

# Reinstall
npm install -g opencode-autopm
```

### Command Not Found

```bash
# Check npm global bin directory
npm config get prefix

# Ensure it's in your PATH
export PATH=$(npm config get prefix)/bin:$PATH
```

### Installation Shows Warnings

Some warnings are normal:
- "deprecated glob@11.1.0" - Can be ignored, from dependency
- "audited X packages" - Normal security audit

### Context Creation Fails

```bash
# Manually create context directory
mkdir -p .opencode/context

# Try again
/context:create
```

---

## Getting Help

### Documentation
- [Full Documentation Hub](../DOCUMENTATION.md)
- [Installation Guide](../docs/INSTALLATION.md)
- [Configuration Guide](../docs/CONFIGURATION.md)

### Community
- [GitHub Issues](https://github.com/rafeekpro/OpenCodeAutoPM/issues)
- [GitHub Discussions](https://github.com/rafeekpro/OpenCodeAutoPM/discussions)

### In OpenCode
```bash
/help                  # Show available commands
/pm:help              # PM system help
/azure:help           # Azure DevOps help
/github:help          # GitHub integration help
```

---

## What's Next?

Now that you're set up, explore:

1. **[User Guide](../docs/user/USER_GUIDE.md)** - Learn all features
2. **[Agent Registry](../docs/reference/AGENTS.md)** - Meet all 40 agents
3. **[Best Practices](../docs/user/BEST_PRACTICES.md)** - Use OpenCodeAutoPM effectively
4. **[Examples](../docs/examples/README.md)** - Real-world examples

---

**Congratulations!** 🎉 You're ready to use OpenCodeAutoPM to transform your development workflow.

**Next**: Learn more about [commands and agents](../docs/user/COMMANDS.md) or explore [project management features](../docs/user/PM_SYSTEM.md).
