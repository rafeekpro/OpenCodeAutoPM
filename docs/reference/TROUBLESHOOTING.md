# Troubleshooting Guide

**Solve common problems with OpenCodeAutoPM**

This guide helps you diagnose and resolve issues with OpenCodeAutoPM.

---

## Table of Contents

- [Installation Issues](#installation-issues)
- [Configuration Problems](#configuration-problems)
- [Agent Errors](#agent-errors)
- [Command Failures](#command-failures)
- [Provider Integration Issues](#provider-integration-issues)
- [Performance Problems](#performance-problems)
- [Testing Issues](#testing-issues)
- [Git Workflow Problems](#git-workflow-problems)
- [MCP Server Issues](#mcp-server-issues)
- [Getting Additional Help](#getting-additional-help)

---

## Installation Issues

### Problem: Command Not Found

**Symptoms**:
```bash
opencode-autopm: command not found
```

**Diagnosis**:
```bash
# Check if package is installed
npm list -g opencode-autopm

# Check npm bin directory
npm config get prefix
```

**Solutions**:

1. **Add npm bin to PATH**:
```bash
# For bash
echo 'export PATH=$(npm config get prefix)/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# For zsh
echo 'export PATH=$(npm config get prefix)/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

2. **Reinstall package**:
```bash
npm uninstall -g opencode-autopm
npm install -g opencode-autopm
```

3. **Verify installation**:
```bash
opencode-autopm --version
```

---

### Problem: Permission Denied (EACCES)

**Symptoms**:
```
Error: EACCES: permission denied, mkdir '/usr/lib/node_modules/opencode-autopm'
```

**Diagnosis**:
```bash
# Check npm prefix ownership
ls -la $(npm config get prefix)/lib/node_modules
```

**Solutions**:

1. **Fix npm permissions** (Recommended):
```bash
# Create .npm-global directory
mkdir ~/.npm-global

# Configure npm to use it
npm config set prefix '~/.npm-global'

# Add to PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Reinstall
npm install -g opencode-autopm
```

2. **Use sudo** (Not recommended):
```bash
sudo npm install -g opencode-autopm
```

3. **Use Node version manager** (Best):
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js
nvm install 20

# Reinstall package
npm install -g opencode-autopm
```

---

### Problem: EEXIST - File Already Exists

**Symptoms**:
```
npm error EEXIST: file already exists
npm error path /usr/local/bin/open-autopm-poc
```

**Diagnosis**:
```bash
# Check for conflicting files
ls -la /usr/local/bin/ | grep autopm
```

**Solutions**:

1. **Remove old file**:
```bash
rm /usr/local/bin/open-autopm-poc
npm install -g opencode-autopm
```

2. **Force reinstall**:
```bash
npm install -g opencode-autopm --force
```

---

### Problem: Installation Hangs or Times Out

**Symptoms**:
- Installation doesn't complete
- No output for long time

**Solutions**:

1. **Clear npm cache**:
```bash
npm cache clean --force
npm install -g opencode-autopm
```

2. **Check network connectivity**:
```bash
ping registry.npmjs.org
```

3. **Try different registry**:
```bash
npm install -g opencode-autopm --registry https://registry.npmjs.org/
```

4. **Increase timeout**:
```bash
npm install -g opencode-autopm --fetch-timeout=300000
```

---

## Configuration Problems

### Problem: Configuration Not Loading

**Symptoms**:
- Settings don't take effect
- Default values used instead

**Diagnosis**:
```bash
# Check config file exists
cat .opencode/config.json

# Validate configuration
/config:validate
```

**Solutions**:

1. **Check JSON syntax**:
```bash
# Validate JSON
cat .opencode/config.json | jq .

# Fix syntax errors
```

2. **Reset to defaults**:
```bash
/config:reset
```

3. **Recreate config**:
```bash
opencode-autopm install --force
```

---

### Problem: Environment Variables Not Working

**Symptoms**:
- Environment variables ignored
- Provider authentication fails

**Diagnosis**:
```bash
# Check if variable is set
echo $GITHUB_TOKEN
echo $AZURE_TOKEN

# Check .env file
cat .env
```

**Solutions**:

1. **Ensure .env is loaded**:
```bash
# In OpenCode, restart session after creating .env
# Or export manually:
export GITHUB_TOKEN=your_token
```

2. **Check .gitignore**:
```bash
# Ensure .env is ignored
echo ".env" >> .gitignore
```

3. **Use absolute paths**:
```bash
# In config.json, use ${VAR} syntax
{
  "providers": {
    "github": {
      "token": "${GITHUB_TOKEN}"
    }
  }
}
```

---

## Agent Errors

### Problem: Agent Not Found

**Symptoms**:
```
Error: Agent '@nonexistent-agent' not found in registry
```

**Diagnosis**:
```bash
# List available agents
/agent:list

# Check agent registry
ls .opencode/agents/
```

**Solutions**:

1. **Use correct agent name**:
```bash
# Check available agents
/agent:list

# Use exact name from registry
@code-analyzer Review code
```

2. **Install missing plugin**:
```bash
# If agent belongs to a plugin
opencode-autopm install --plugin plugin-ai
```

3. **Check scenario**:
```bash
# Some agents only available in certain scenarios
/config:view scenario

# Reinstall with different scenario if needed
opencode-autopm install --scenario full-devops
```

---

### Problem: Agent Gives Poor Responses

**Symptoms**:
- Agent doesn't understand task
- Generic or irrelevant responses

**Diagnosis**:
```bash
# Check context
/context:view

# Verify agent expertise
/agent:info agent-name
```

**Solutions**:

1. **Update context**:
```bash
/context:create
# Provide detailed project information
```

2. **Use more specific agent**:
```bash
# Instead of:
@python-backend-engineer

# Use:
@fastapi-expert (if available)
```

3. **Provide clearer prompt**:
```bash
# Be specific about:
# - What you need
# - Technologies to use
# - Constraints
# - Expected output

# Example:
@python-backend-engineer Create FastAPI endpoint for user authentication
using JWT tokens, with refresh token support, following OWASP security guidelines
```

4. **Check agent documentation**:
```bash
# Review agent's expertise and use cases
/agent:docs agent-name
```

---

### Problem: Agent Context Lost Mid-Task

**Symptoms**:
- Agent forgets previous work
- Inconsistent responses
- Starts over repeatedly

**Diagnosis**:
```bash
# Check context size
/context:size

# Check logs
tail -f .opencode/logs/autopm.log
```

**Solutions**:

1. **Reduce context size**:
```bash
/config:set context.maxSize 50000
```

2. **Update context**:
```bash
/context:update
```

3. **Break task into smaller pieces**:
```bash
# Instead of one large task
@agent Complete large feature

# Break into smaller tasks
@agent Step 1: Set up database
@agent Step 2: Create API endpoints
@agent Step 3: Build UI
```

---

## Command Failures

### Problem: Command Not Recognized

**Symptoms**:
```
Error: Unknown command: '/unknown:command'
```

**Diagnosis**:
```bash
# Check available commands
/help

# Check command exists
ls .opencode/commands/ | grep command-name
```

**Solutions**:

1. **Check command spelling**:
```bash
# List available commands
/help

# Use exact command name
/pm:prd-list  # not /pm:prdlist
```

2. **Check if plugin installed**:
```bash
/config:view plugins

# Install missing plugin
opencode-autopm install --plugin plugin-azure
```

3. **Check scenario**:
```bash
# Some commands only available in certain scenarios
/config:view scenario
```

---

### Problem: Command Fails Silently

**Symptoms**:
- Command runs but produces no output
- Expected files not created

**Diagnosis**:
```bash
# Check log file
tail -50 .opencode/logs/autopm.log

# Run with verbose output
/command --verbose
```

**Solutions**:

1. **Enable debug logging**:
```bash
/config:set logging.level debug
```

2. **Check file permissions**:
```bash
# Ensure .opencode/ is writable
ls -la .opencode/

# Fix permissions
chmod -R u+rw .opencode/
```

3. **Check disk space**:
```bash
df -h
```

---

## Provider Integration Issues

### GitHub Integration

#### Problem: GitHub Authentication Failed

**Symptoms**:
```
Error: GitHub authentication failed
```

**Diagnosis**:
```bash
# Check token
echo $GITHUB_TOKEN

# Test token
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
```

**Solutions**:

1. **Verify token is valid**:
```bash
# Check token at GitHub:
# Settings → Developer settings → Personal access tokens
```

2. **Check token permissions**:
- Must have: `repo`, `workflow`, `issues`, `pull_requests`

3. **Regenerate token**:
```bash
# Create new token at GitHub
export GITHUB_TOKEN=new_token
```

4. **Test connection**:
```bash
/github:test
```

---

#### Problem: GitHub API Rate Limit

**Symptoms**:
```
Error: GitHub API rate limit exceeded
```

**Diagnosis**:
```bash
# Check rate limit
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/rate_limit
```

**Solutions**:

1. **Authenticate**:
```bash
export GITHUB_TOKEN=your_token
```

2. **Wait for reset**:
- Rate limit resets every hour
- Check reset time in rate limit API response

3. **Reduce API calls**:
```bash
/config:set providers.github.autoSync false
```

---

### Azure DevOps Integration

#### Problem: Azure Authentication Failed

**Symptoms**:
```
Error: Azure DevOps authentication failed
```

**Diagnosis**:
```bash
# Check credentials
echo $AZURE_ORG_URL
echo $AZURE_TOKEN

# Test connection
curl -u :$AZURE_TOKEN $AZURE_ORG_URL/_apis/projects?api-version=6.0
```

**Solutions**:

1. **Verify organization URL**:
```bash
# Should be:
https://dev.azure.com/yourorg

# NOT:
https://dev.azure.com/yourorg/project
dev.azure.com/yourorg
```

2. **Verify token permissions**:
- Work Items: Read & Write
- Build: Read & Execute
- Code: Read

3. **Regenerate token**:
```bash
# Create new token at Azure DevOps
export AZURE_TOKEN=new_token
```

4. **Test connection**:
```bash
/azure:test
```

---

#### Problem: Work Item Not Found

**Symptoms**:
```
Error: Work item {id} not found
```

**Diagnosis**:
```bash
# Check if item exists
/azure:wi-show {id}

# Check current project
/azure:project-current
```

**Solutions**:

1. **Verify correct project**:
```bash
/azure:project-set YourProject
```

2. **Check item number**:
```bash
# List items to verify
/azure:wi-list
```

3. **Verify permissions**:
- Ensure token has access to project

---

## Performance Problems

### Problem: Slow Execution

**Symptoms**:
- Commands take long time to complete
- Agents respond slowly

**Diagnosis**:
```bash
# Check execution strategy
/config:get execution.strategy

# Check system resources
top
```

**Solutions**:

1. **Change execution strategy**:
```bash
# For better performance
/config:set execution.strategy hybrid

# For lower resource usage
/config:set execution.strategy sequential
```

2. **Adjust concurrent agents**:
```bash
/config:set execution.maxConcurrent 3
```

3. **Optimize context**:
```bash
/config:set context.maxSize 50000
/config:set context.autoUpdate false
```

4. **Check network**:
```bash
# Slow network can affect MCP servers, providers
ping registry.npmjs.org
```

---

### Problem: High Memory Usage

**Symptoms**:
- System slows down
- Out of memory errors

**Diagnosis**:
```bash
# Check memory usage
top

# Check execution strategy
/config:get execution.strategy
```

**Solutions**:

1. **Switch to sequential**:
```bash
/config:set execution.strategy sequential
```

2. **Reduce concurrent agents**:
```bash
/config:set execution.maxConcurrent 1
```

3. **Disable auto-updates**:
```bash
/config:set context.autoUpdate false
```

4. **Clear caches**:
```bash
rm -rf .opencode/cache/
```

---

## Testing Issues

### Problem: Tests Fail After Installation

**Symptoms**:
```
Testing framework detection failed
```

**Diagnosis**:
```bash
# Check for test files
ls test/
ls *.test.js

# Check package.json for test scripts
cat package.json | grep -A 5 scripts
```

**Solutions**:

1. **Ensure project has tests**:
```bash
# Create test directory
mkdir -p test

# Add basic test
cat > test/example.test.js << 'EOF'
test('example', () => {
  expect(true).toBe(true);
});
EOF
```

2. **Configure manually**:
```bash
/testing:configure --framework jest --test-dir test
```

3. **Install testing framework**:
```bash
npm install --save-dev jest
```

---

### Problem: Coverage Not Generated

**Symptoms**:
- Coverage command fails
- No coverage report

**Diagnosis**:
```bash
# Check Jest configuration
cat package.json | grep -A 10 jest

# Check coverage configuration
/config:get testing.coverageThreshold
```

**Solutions**:

1. **Configure Jest for coverage**:
```json
// In package.json
{
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.js",
      "!src/**/*.test.js"
    ]
  }
}
```

2. **Run coverage manually**:
```bash
npm test -- --coverage
```

---

## Git Workflow Problems

### Problem: Branch Creation Fails

**Symptoms**:
```
Error: Failed to create branch
```

**Diagnosis**:
```bash
# Check git status
git status

# Check current branch
git branch
```

**Solutions**:

1. **Commit or stash changes**:
```bash
git add .
git commit -m "WIP"

# Or stash
git stash
```

2. **Check remote**:
```bash
git remote -v
```

3. **Fetch latest**:
```bash
git fetch origin
```

---

### Problem: Commit Hooks Fail

**Symptoms**:
- Pre-commit hooks fail
- Can't commit changes

**Diagnosis**:
```bash
# Check hooks
ls .git/hooks/

# Test hook manually
.git/hooks/pre-commit
```

**Solutions**:

1. **Run tests manually**:
```bash
npm test
```

2. **Skip hook (not recommended)**:
```bash
git commit --no-verify
```

3. **Fix hook issues**:
```bash
# Ensure tests pass
npm test

# Validate paths
npm run validate:paths
```

---

## MCP Server Issues

### Problem: MCP Server Not Available

**Symptoms**:
- Context7 queries fail
- MCP tools not working

**Diagnosis**:
```bash
# List MCP servers
/mcp:list

# Test specific server
/mcp:test context7
```

**Solutions**:

1. **Install MCP server**:
```bash
/mcp:install context7
```

2. **Check MCP configuration**:
```bash
/mcp:config-get context7
```

3. **Restart OpenCode**:
- MCP servers load on startup

---

### Problem: Context7 Queries Fail

**Symptoms**:
- Context7 queries don't work
- Documentation not accessible

**Diagnosis**:
```bash
# Check Context7 server
/mcp:test context7

# Check configuration
/mcp:config-get context7
```

**Solutions**:

1. **Verify Context7 is enabled**:
```bash
/mcp:config-set context7 '{"enabled": true}'
```

2. **Check API key** (if required):
```bash
export MCP_CONTEXT7_API_KEY=your_key
```

3. **Reinstall Context7**:
```bash
/mcp:remove context7
/mcp:install context7
```

---

## Getting Additional Help

If you can't resolve your issue:

### 1. Check Documentation

- [Full Documentation Hub](../DOCUMENTATION.md)
- [FAQ](../docs/FAQ.md)
- [GitHub Issues](https://github.com/rafeekpro/OpenCodeAutoPM/issues)

### 2. Search Existing Issues

```bash
# Search GitHub Issues
https://github.com/rafeekpro/OpenCodeAutoPM/issues?q=is%3Aissue+{search-term}
```

### 3. Create New Issue

When creating an issue, include:

- **OpenCodeAutoPM version**: `opencode-autopm --version`
- **Node.js version**: `node --version`
- **npm version**: `npm --version`
- **Operating system**: `uname -a` (Linux/macOS) or system info (Windows)
- **Error message**: Full error output
- **Steps to reproduce**: Detailed steps
- **Expected behavior**: What you expected
- **Actual behavior**: What happened
- **Configuration**: `.opencode/config.json` (sanitize sensitive data)

### 4. Ask in Discussions

- [GitHub Discussions](https://github.com/rafeekpro/OpenCodeAutoPM/discussions)

### 5. Professional Support

For enterprise support, contact: support@opencode-autopm.com

---

## Diagnostic Commands

### Health Check

```bash
# Full system health check
/pm:health

# Check installation
opencode-autopm --version

# Check configuration
/config:validate

# Test providers
/github:test
/azure:test

# Test MCP servers
/mcp:test context7

# Run diagnostics
/pm:diagnostics
```

### Log Files

```bash
# OpenCodeAutoPM logs
tail -f .opencode/logs/autopm.log

# Last 100 lines
tail -100 .opencode/logs/autopm.log

# Search for errors
grep ERROR .opencode/logs/autopm.log
```

---

## Prevention

### Best Practices to Avoid Issues

1. **Keep updated**:
```bash
npm update -g opencode-autopm
```

2. **Regular maintenance**:
```bash
# Clean cache
npm cache clean --force

# Clear OpenCodeAutoPM cache
rm -rf .opencode/cache/
```

3. **Monitor resources**:
```bash
# Check disk space
df -h

# Check memory
free -h  # Linux
vm_stat  # macOS
```

4. **Backup configuration**:
```bash
cp .opencode/config.json .opencode/config.json.backup
```

---

**Last Updated**: 2025-02-28
**Framework Version**: 3.7.0
