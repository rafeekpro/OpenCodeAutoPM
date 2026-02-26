# Framework Path Rules

## Critical Path Convention

**NEVER** hardcode the `autopm/` directory path in framework files. The `autopm/` directory only exists during development and is **NOT** present after installation in user projects.

## The Problem

During installation, files from `autopm/.opencode/` are copied to user projects as `.opencode/`. Any references to `autopm/.opencode/` or `autopm/scripts/` will be broken after installation.

```
❌ WRONG (Development structure):
autopm/
├── .opencode/
│   ├── commands/
│   ├── scripts/
│   └── agents/

✅ CORRECT (After installation):
user-project/
├── .opencode/
│   ├── commands/
│   ├── scripts/
│   └── agents/
```

## Rules

### 1. Use Relative Paths from Project Root

All paths in framework files must be relative to the **user's project root** (where `.opencode/` will exist after installation).

**✅ CORRECT:**
```bash
bash .opencode/scripts/pm/epic-sync/create-epic-issue.sh "$EPIC_NAME"
node .opencode/lib/commands/pm/prdStatus.js
source .opencode/scripts/lib/github-utils.sh
```

**❌ WRONG:**
```bash
bash autopm/.opencode/scripts/pm/epic-sync/create-epic-issue.sh "$EPIC_NAME"
node autopm/.opencode/lib/commands/pm/prdStatus.js
source autopm/.opencode/scripts/lib/github-utils.sh
```

### 2. Exception: Comments and Documentation References

It's acceptable to reference `autopm/` in:
- Code comments explaining migration history
- Documentation describing the development structure
- Git commit messages

**✅ ACCEPTABLE:**
```javascript
/**
 * Migrated from autopm/.opencode/scripts/azure/validate.sh to Node.js
 */
```

**✅ ACCEPTABLE:**
```markdown
## Development Structure
During development, framework files are in `autopm/.opencode/`, but after
installation they are copied to the user project's `.opencode/` directory.
```

### 3. Files That Must Follow These Rules

- **Commands** (`autopm/.opencode/commands/**/*.md`)
- **Scripts** (`autopm/.opencode/scripts/**/*.sh`, `**/*.js`)
- **Agents** (`autopm/.opencode/agents/**/*.md`)
- **Rules** (`autopm/.opencode/rules/**/*.md`)
- **Templates** (`autopm/.opencode/templates/**/*`)

### 4. Environment Variables

If you need to reference the framework location dynamically, use environment variables that work in both contexts:

**✅ CORRECT:**
```bash
CLAUDE_DIR="${CLAUDE_DIR:-.opencode}"
bash "${CLAUDE_DIR}/scripts/pm/epic-sync/create-epic-issue.sh"
```

This allows:
- Development: `CLAUDE_DIR=autopm/.opencode`
- Production: `CLAUDE_DIR=.opencode` (default)

## Validation

### Pre-Commit Hook

A pre-commit hook validates all framework files before commit:

```bash
# Checks for hardcoded autopm/ paths (excluding comments)
grep -r "bash autopm" autopm/.opencode --include="*.md" --include="*.sh"
grep -r "node autopm" autopm/.opencode --include="*.md" --include="*.sh"
grep -r "source autopm" autopm/.opencode --include="*.md" --include="*.sh"
```

### Manual Check

Before committing changes to framework files:

```bash
# Run validation
npm run validate:paths

# Or manually
./scripts/validate-framework-paths.sh
```

## Common Mistakes

### Mistake 1: Copy-Paste from Development Environment

```bash
# ❌ Copying terminal command that worked in development
bash autopm/.opencode/scripts/pm/epic-sync/create-epic-issue.sh "feature-name"

# ✅ Use project-relative path
bash .opencode/scripts/pm/epic-sync/create-epic-issue.sh "feature-name"
```

### Mistake 2: Documentation Examples

```markdown
❌ WRONG:
To run the script:
`bash autopm/.opencode/scripts/pm/issue-sync/preflight-validation.sh`

✅ CORRECT:
To run the script:
`bash .opencode/scripts/pm/issue-sync/preflight-validation.sh`
```

### Mistake 3: Relative Imports in Scripts

```bash
# ❌ WRONG - hardcoded framework path
source autopm/.opencode/scripts/lib/github-utils.sh

# ✅ CORRECT - relative to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../lib/github-utils.sh"

# ✅ ALSO CORRECT - explicit project root
source .opencode/scripts/lib/github-utils.sh
```

## Enforcement

This rule is enforced by:

1. **Pre-commit hook** - Blocks commits with hardcoded `autopm/` paths
2. **CI/CD validation** - GitHub Actions check on every PR
3. **Installation tests** - Verify all paths work post-installation
4. **Code review** - Reviewers check for path correctness

## Quick Reference

| Context | Use | Don't Use |
|---------|-----|-----------|
| Shell scripts | `.opencode/scripts/` | `autopm/.opencode/scripts/` |
| Node.js scripts | `.opencode/lib/` | `autopm/.opencode/lib/` |
| Command files | `.opencode/commands/` | `autopm/.opencode/commands/` |
| Documentation | `.opencode/agents/` | `autopm/.opencode/agents/` |
| Comments | `autopm/` ✅ OK | N/A |

## Related Rules

- `/rules/naming-conventions.md` - File and directory naming
- `/rules/development-workflow.md` - Development best practices
- `/rules/golden-rules.md` - Core framework principles

---

**Remember:** If a user installs this framework, the `autopm/` directory will not exist in their project. All paths must work from their project root where `.opencode/` is located.
