---
allowed-tools: Task, Bash, Read, Write, Edit, WebFetch, Glob, Grep
command: azure:vg-export
description: "Export variable group to JSON or YAML file"
---

# Azure DevOps Variable Group Export

**Export variable group configuration for backup or migration**

**Usage**: `/azure:vg-export <id> [--format=<json|yaml>] [--output=<file>] [--include-secrets]`

**Examples**:
- `/azure:vg-export 5` - Export to JSON (default)
- `/azure:vg-export 5 --format=yaml` - Export to YAML
- `/azure:vg-export 5 --output=backup.json` - Save to file
- `/azure:vg-export 5 --include-secrets` - Include secrets (use with caution!)

## Instructions

**CRITICAL**: Use azure-devops-specialist agent via Task tool.

```bash
Task(subagent_type="azure-devops-specialist",
     description="Export variable group",
     prompt="Export variable group **$ARGUMENTS**

1. Validate VG exists
2. Fetch all variables (secrets excluded unless --include-secrets)
3. Convert to requested format
4. Save to file or display
5. Warn if secrets excluded")
```

### Export Formats

**JSON Format** (default):
```json
{
  "name": "production-vars",
  "description": "Production configuration",
  "variables": {
    "APP_ENV": "production",
    "API_URL": "https://api.example.com",
    "DEBUG": "false"
  },
  "secrets": {
    "API_KEY": null,
    "DB_PASSWORD": null
  }
}
```

**YAML Format**:
```yaml
name: production-vars
description: Production configuration
variables:
  APP_ENV: production
  API_URL: https://api.example.com
  DEBUG: "false"
secrets:
  API_KEY: null
  DB_PASSWORD: null
```

### Security Warning

```bash
/azure:vg-export 5

⚠️  Secrets NOT included in export

To include secrets, use --include-secrets:
  /azure:vg-export 5 --include-secrets

⚠️  WARNING: Including secrets will:
  • Write secrets to file in plain text
  • Make secrets visible in version control
  • Expose secrets in logs

Never commit files with secrets!

Continue anyway? (type 'include-secrets' to confirm):
```

### Output

**To File**:
```bash
/azure:vg-export 5 --output=vg-5-backup.json

✅ Variable group #5 exported to vg-5-backup.json

Content:
  • 9 variables
  • 3 secrets (excluded, use --include-secrets to include)
  • Metadata: name, description, created/modified dates

File size: 2.3 KB
```

**To Stdout**:
```bash
/azure:vg-export 5

{
  "name": "production-vars",
  "variables": {
    "APP_ENV": "production"
  },
  ...
}
```

### Use Cases

**Backup Before Changes**:
```bash
# Export before updating
/azure:vg-export 5 --output=backup-before-update.json

# Make changes
/azure:vg-update 5 --variables="NEW_VAR=value"

# If something goes wrong, restore
/azure:vg-import backup-before-update.json --rename 5
```

**Migration**:
```bash
# Export from source project
/azure:vg-export 5 --output=migrate-vg.json

# Switch to destination project
export AZURE_DEVOPS_PROJECT=destination-project

# Import
/azure:vg-import migrate-vg.json
```

**Version Control**:
```bash
# Export for version control (without secrets!)
/azure:vg-export 5 --output=config/production-vars.json

# Add to git
git add config/production-vars.json
git commit -m "docs: update production vars config"

⚠️  Never commit secrets!
```

**Documentation**:
```bash
# Export for documentation
/azure:vg-export 5 --format=yaml --output=docs/vars.md

# Include in README
echo '## Variables' >> README.md
/azure:vg-export 5 --format=yaml >> README.md
```

## Related Commands

- `/azure:vg-import <file>` - Import from file
- `/azure:vg-create` - Create new VG
- `/azure:vg-show <id>` - Show VG details
