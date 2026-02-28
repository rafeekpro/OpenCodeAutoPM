# Frequently Asked Questions

**Common questions about OpenCodeAutoPM**

---

## General Questions

### What is OpenCodeAutoPM?

OpenCodeAutoPM is an **AI-Powered Project Management Framework** designed specifically for OpenCode. It provides:

- **40 specialized AI agents** for different domains
- **269 commands** across 12 plugins
- **Complete PM workflow** (PRDs, Epics, Tasks)
- **GitHub and Azure DevOps integration**
- **Hybrid parallel execution** for maximum efficiency

### How is OpenCodeAutoPM different from other PM tools?

| Feature | OpenCodeAutoPM | Traditional Tools |
|---------|---------------|-------------------|
| AI-native | Built for OpenCode | Adapted/retrofitted |
| Modular | 12 plugins | Monolithic |
| Agents | 40 specialized experts | Generic or none |
| Workflow | Context to Production | Fragmented |
| Documentation | Context7-verified, always current | Often outdated |

### What version of OpenCode is required?

OpenCodeAutoPM works with the latest version of OpenCode CLI. Ensure you have:

```bash
opencode --version  # Should be latest
```

### Is OpenCodeAutoPM free?

Yes! OpenCodeAutoPM is **open source** (MIT License) and completely free to use.

---

## Installation Questions

### How do I install OpenCodeAutoPM?

```bash
npm install -g opencode-autopm
cd your-project
opencode-autopm install
```

See [Installation Guide](../docs/INSTALLATION.md) for details.

### Which installation scenario should I choose?

- **Lite (~50 commands)**: Simple projects, learning
- **Standard (~55 commands)**: Typical development (DEFAULT)
- **Azure (~95 commands)**: Azure DevOps teams
- **Docker (~85 commands)**: Container development
- **Full DevOps (~125 commands)**: Complete CI/CD (RECOMMENDED)
- **Performance (~145 commands)**: Maximum speed
- **Custom**: Choose your plugins

### Can I change scenarios after installation?

Yes! Re-run installation:

```bash
opencode-autopm install --scenario full-devops
```

### How do I uninstall OpenCodeAutoPM?

```bash
# From a project
rm -rf .opencode/

# Uninstall package
npm uninstall -g opencode-autopm
```

---

## Configuration Questions

### How do I configure GitHub integration?

```bash
/github:install

# Or set environment variable
export GITHUB_TOKEN=your_token_here
```

### How do I configure Azure DevOps?

```bash
/azure:init

# Provide:
# - Organization URL
# - Project name
# - Personal Access Token
```

### What are execution strategies?

- **Sequential**: One agent at a time (safe, predictable)
- **Adaptive**: Intelligent mode selection (balanced)
- **Hybrid**: Up to 5 agents in parallel (fastest)

### How do I change execution strategy?

```bash
/config:set execution.strategy hybrid

# Or use environment variable
export AUTOPM_EXECUTION_STRATEGY=hybrid
```

---

## Usage Questions

### How do I create a PRD?

```bash
/pm:prd-new "User Authentication System"
```

This creates `.opencode/prds/prd-{timestamp}-user-authentication-system.md`

### How do I use agents?

```bash
@agent-name Your task here

# Examples
@code-analyzer Review my changes
@test-runner Run all tests
@python-backend-engineer Build API endpoint
```

### How do I run tests?

```bash
/testing:run

# Or with coverage
/testing:coverage

# Specific test file
/testing:run test/auth.test.js
```

### How do I create a feature branch?

```bash
/git:branch feature/user-authentication
```

### How do I commit changes?

```bash
/git:commit "feat: add user login"
```

Uses semantic commit messages automatically.

---

## Agent Questions

### How many agents are available?

**40 specialized agents** across domains:
- 6 Core agents
- 4 Language agents
- 5 Framework agents
- 4 Database agents
- 6 DevOps agents
- 5 Cloud agents
- 2 Integration agents
- 3 Data/ML agents
- 2 AI API agents
- Plus testing and specialized agents

### How do I choose the right agent?

1. **Check agent registry**: `/agent:list`
2. **Read agent docs**: `/agent:docs agent-name`
3. **Use selection guide**: [Agent Selection Guide](../docs/agents/selection-guide.md)

### Can I create custom agents?

Yes! See [Agent Development Guide](../docs/developer/AGENT_DEVELOPMENT.md)

### Why isn't an agent working?

1. **Check agent exists**: `/agent:list`
2. **Check installation**: `/config:view scenario`
3. **Update context**: `/context:create`
4. **Be specific in your prompt**

---

## Command Questions

### How many commands are available?

**269 commands** across 12 plugins (depending on scenario).

### Where can I see all commands?

```bash
/help

# Or by category
/pm:help
/azure:help
/github:help
```

### How do I find a specific command?

```bash
# Search for command
/help | grep keyword

# Or check documentation
# [Command Reference](../docs/reference/COMMANDS.md)
```

### Can I create custom commands?

Yes! See [Command Development Guide](../docs/developer/COMMAND_DEVELOPMENT.md)

---

## Performance Questions

### Why is OpenCodeAutoPM slow?

Possible causes:
- **Sequential strategy**: Switch to hybrid
- **Large context**: Reduce context size
- **Network issues**: Check connectivity
- **Limited resources**: Reduce concurrent agents

### How can I improve performance?

```bash
# Use hybrid execution
/config:set execution.strategy hybrid
/config:set execution.maxConcurrent 5

# Optimize context
/config:set context.maxSize 50000
/config:set context.autoUpdate false

# Enable parallel tests
/config:set testing.parallel true
```

### What are the system requirements?

**Minimum**:
- Node.js 16+
- 512 MB RAM
- 100 MB disk space

**Recommended**:
- Node.js 18+ or 20+ LTS
- 2 GB RAM
- 500 MB disk space

---

## Integration Questions

### Does OpenCodeAutoPM work with GitHub?

Yes! Full GitHub integration:
- Issues and PRs
- Workflows and Actions
- GitHub Projects
- Repository automation

### Does OpenCodeAutoPM work with Azure DevOps?

Yes! Full Azure DevOps integration:
- User stories and tasks
- Features and epics
- Sprint planning
- Boards and pipelines

### Can I use both GitHub and Azure DevOps?

Yes! You can use both providers simultaneously.

### What MCP servers are supported?

OpenCodeAutoPM works with any MCP server:
- Context7 (documentation)
- File system
- Custom servers

See [MCP Server Guide](../docs/user/MCP_SERVERS.md)

---

## Testing Questions

### Does OpenCodeAutoPM require tests?

**TDD is mandatory** for OpenCodeAutoPM development, but you can use it however you prefer for your projects.

### How do I set up testing?

```bash
/testing:prime

# This auto-detects:
# - Testing framework (Jest, Mocha, etc.)
# - Test directory
# - Configuration
```

### What testing frameworks are supported?

- Jest (primary)
- Mocha
- Jasmine
- Vitest
- And more

---

## Best Practices Questions

### Should I follow TDD?

**Highly recommended!** TDD provides:
- Better code quality
- Fewer bugs
- Safety net for refactoring
- Living documentation

See [Best Practices Guide](../docs/user/BEST_PRACTICES.md)

### How do I structure my PRDs?

See [PM System Guide](../docs/user/PM_SYSTEM.md) for PRD templates and examples.

### What's the recommended Git workflow?

Feature branch workflow:
```bash
/git:branch feature/my-feature
# ... work ...
/testing:run
@code-analyzer Review changes
/git:commit "feat: add my feature"
/git:push
/github:pr-create
```

---

## Troubleshooting Questions

### Installation fails with EEXIST error

Remove old file and reinstall:
```bash
rm /path/to/conflicting/file
npm install -g opencode-autopm
```

Or force reinstall:
```bash
npm install -g opencode-autopm --force
```

### Command not found

Add npm bin to PATH:
```bash
export PATH=$(npm config get prefix)/bin:$PATH
```

### Agent gives poor responses

1. Update context: `/context:create`
2. Use more specific agent
3. Provide clearer prompt
4. Check agent expertise

### GitHub authentication fails

1. Verify token: `echo $GITHUB_TOKEN`
2. Check token permissions (needs `repo`, `workflow`)
3. Regenerate token if needed

### Azure DevOps authentication fails

1. Verify organization URL format
2. Check token permissions (Work Items R/W, Build R/X)
3. Test connection: `/azure:test`

See [Troubleshooting Guide](../docs/reference/TROUBLESHOOTING.md) for more solutions.

---

## Development Questions

### Can I contribute to OpenCodeAutoPM?

Yes! See [Contributing Guide](../docs/developer/CONTRIBUTING.md)

### How do I develop OpenCodeAutoPM?

```bash
git clone https://github.com/rafeekpro/OpenCodeAutoPM.git
cd OpenCodeAutoPM
npm install
npm link
```

### What are the development standards?

- **TDD is mandatory**
- **Context7 documentation queries** required
- **100% test coverage** for new code
- **Conventional commits**

See [Development Standards](../docs/developer/STANDARDS.md)

---

## Migration Questions

### How do I migrate from Claude Code?

See [Migration Guide](../docs/migration/CLAUDE_TO_OPENCODE.md)

Key changes:
- Package name: `opencode-autopm`
- Config files: `.opencode/` (same)
- Environment variables: `OPENCODE_*` prefix

### How do I upgrade between versions?

```bash
npm update -g opencode-autopm
cd your-project
opencode-autopm install --upgrade
```

Check [CHANGELOG.md](../CHANGELOG.md) for breaking changes.

---

## Security Questions

### Is my code safe with OpenCodeAutoPM?

Yes! OpenCodeAutoPM:
- Runs locally on your machine
- Doesn't send code to external servers
- Respects `.gitignore` for sensitive files
- Follows security best practices

### Where are tokens stored?

Tokens are stored in:
- Environment variables (recommended)
- `.env` file (not committed to git)
- `.opencode/config.json` (using `${VAR}` syntax)

**Never commit tokens to version control!**

### How do I secure my installation?

1. **Add `.env` to `.gitignore`**
2. **Use environment variables** for tokens
3. **Limit token permissions** (minimum required)
4. **Rotate tokens regularly**
5. **Keep OpenCodeAutoPM updated**

See [Security Guide](../docs/admin/SECURITY.md)

---

## Licensing Questions

### What license is OpenCodeAutoPM under?

**MIT License** - See [LICENSE](../LICENSE) for details.

### Can I use OpenCodeAutoPM commercially?

Yes! The MIT license allows commercial use.

### Can I modify OpenCodeAutoPM?

Yes! You can:
- Fork the repository
- Make modifications
- Distribute your changes
- (Must preserve MIT license)

---

## Support Questions

### Where can I get help?

- **Documentation**: [Full Documentation Hub](../DOCUMENTATION.md)
- **GitHub Issues**: [Report a problem](https://github.com/rafeekpro/OpenCodeAutoPM/issues)
- **GitHub Discussions**: [Ask a question](https://github.com/rafeekpro/OpenCodeAutoPM/discussions)

### How do I report a bug?

Use [GitHub Issues](https://github.com/rafeekpro/OpenCodeAutoPM/issues) with:
- OpenCodeAutoPM version
- Node.js version
- Error message
- Steps to reproduce
- Expected vs actual behavior

### How do I request a feature?

Use [GitHub Issues](https://github.com/rafeekpro/OpenCodeAutoPM/issues) with label "enhancement".

### Is professional support available?

For enterprise support, contact: support@opencode-autopm.com

---

## Miscellaneous Questions

### What does "OpenCodeAutoPM" mean?

**OpenCode** **Auto**mated **P**roject **M**anager

### Why was OpenCodeAutoPM created?

To provide AI-native project management specifically for OpenCode, with specialized agents and seamless integration.

### What's the roadmap?

See [GitHub Projects](https://github.com/rafeekpro/OpenCodeAutoPM/projects) for planned features.

### How can I stay updated?

- ⭐ **Star the repo**: [GitHub](https://github.com/rafeekpro/OpenCodeAutoPM)
- 👁️ **Watch releases**: [GitHub Releases](https://github.com/rafeekpro/OpenCodeAutoPM/releases)
- 📖 **Read changelog**: [CHANGELOG.md](../CHANGELOG.md)
- 💬 **Join discussions**: [GitHub Discussions](https://github.com/rafeekpro/OpenCodeAutoPM/discussions)

---

## Still Have Questions?

1. **Check Documentation**: [Full Documentation Hub](../DOCUMENTATION.md)
2. **Search Issues**: [GitHub Issues](https://github.com/rafeekpro/OpenCodeAutoPM/issues)
3. **Ask in Discussions**: [GitHub Discussions](https://github.com/rafeekpro/OpenCodeAutoPM/discussions)
4. **Create New Issue**: [Report your question](https://github.com/rafeekpro/OpenCodeAutoPM/issues/new)

---

**Last Updated**: 2025-02-28
**Framework Version**: 3.7.0
