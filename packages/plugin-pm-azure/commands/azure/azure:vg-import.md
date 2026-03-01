---
allowed-tools: Task, Bash, Read, Write, Edit, WebFetch, Glob, Grep
command: azure:vg-import
description: "Import variable group from JSON or YAML file"
---

# Azure DevOps Variable Group Import

**Import variable group configuration from file**

**Usage**: `/azure:vg-import <file> [--rename=<new-name>] [--merge] [--dry-run]`

**Examples**:
- `/azure:vg-import backup.json` - Import from JSON file
- `/azure:vg-import config.yaml` - Import from YAML file
- `/azure:vg-import backup.json --rename=restored-vars` - Import with new name
- `/azure:vg-import config.json --merge` - Merge with existing VG

## Instructions

**CRITICAL**: Use azure-devops-specialist agent via Task tool.

```bash
Task(subagent_type="azure-devops-specialist",
     description="Import variable group",
     prompt="Import variable group from **$ARGUMENTS**

1. Validate file exists and is valid JSON/YAML
2. Parse variables and secrets
3. Check for name conflicts
4. Create variable group (CLI)
5. Add secrets (REST API)
6. Verify import
7. Display confirmation")
```

### Supported Formats

**JSON Format**:
```json
{
  "name": "production-vars",
  "description": "Production configuration",
  "variables": {
    "APP_ENV": "production",
    "API_URL": "https://api.example.com"
  },
  "secrets": {
    "API_KEY": "secret-value-here",
    "DB_PASSWORD": "password-here"
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
secrets:
  API_KEY: secret-value-here
  DB_PASSWORD: password-here
```

**.env Format**:
```bash
APP_ENV=production
API_URL=https://api.example.com
API_KEY=secret-value-here
```

### Import Options

**Simple Import**:
```bash
/azure:vg-import backup.json

✅ Variable group imported successfully!

Imported:
  Name: production-vars
  Variables: 9
  Secrets: 3
  ID: 15

🔗 Azure DevOps:
https://dev.azure.com/{org}/{project}/_library?variableGroupId=15
```

**Import with Rename**:
```bash
/azure:vg-import backup.json --rename=restored-vars

✅ Imported as: restored-vars
ID: 16
```

**Merge Mode**:
```bash
/azure:vg-import config.json --merge --into=5

⚠️  Merge mode: combining config.json with existing VG #5

Changes:
  • Added: NEW_VAR (from import)
  • Updated: API_URL (from import)
  • Preserved: LOCAL_VAR (existing)
  • Skipped: CONFLICT_VAR (exists in both)

Review and confirm:
  /azure:vg-show 5
```

**Dry Run**:
```bash
/azure:vg-import backup.json --dry-run

Would create variable group:
  Name: production-vars
  Variables: 9
  Secrets: 3

Remove --dry-run to execute.
```

### Validation

**File Validation**:
```bash
/azure:vg-import invalid.json

❌ Validation failed:

Error: Invalid JSON at line 15
  Expected: "key": "value"
  Got: "key" = "value"

Fix JSON syntax and try again.
```

**Variable Validation**:
```bash
/azure:vg-import config.json

⚠️  Warnings:

• Variable name '123INVALID' doesn't follow naming conventions
  Suggestion: Start with letter or underscore

• Variable 'PASSWORD' might be a secret
  Suggestion: Use 'secrets' section instead

Continue anyway? (y/n)
```

### Use Cases

**Restore from Backup**:
```bash
# Restore deleted VG
/azure:vg-import backup-vg-5.json --rename=restored-vg-5

✅ Restored as: restored-vg-5
Original ID: 5 → New ID: 17
```

**Copy Variable Group**:
```bash
# Export from one project
/azure:vg-export 5 --output=template.json

# Import to another project
export AZURE_DEVOPS_PROJECT=other-project
/azure:vg-import template.json --rename=copy-of-prod-vars

✅ Copied to other-project
```

**Environment Promotion**:
```bash
# Promote staging to production
/azure:vg-export staging-vars --output=base-config.json

# Edit production values
vim base-config.json
# s/staging/production/g

# Import as new production config
/azure:vg-import base-config.json --rename=prod-vars-v2
```

**Bulk Import**:
```bash
# Import multiple files
/azure:vg-import *.json --batch

Found 3 config files:
  • config1.json
  • config2.json
  • config3.json

Import all? (y/n)

✅ Imported 3 variable groups
```

### Safety Features

**Name Conflict Handling**:
```bash
/azure:vg-import config.json

❌ Variable group 'production-vars' already exists (ID: 5)

Options:
  • Use --rename to import with different name
  • Delete existing: /azure:vg-delete 5
  • Update existing: /azure:vg-update 5 --from-file=config.json
  • Cancel import
```

**Secret Warnings**:
```bash
/azure:vg-import config.json

⚠️  SECURITY WARNING

This file contains 5 secret variables:
  • API_KEY
  • DB_PASSWORD
  • SECRET_KEY
  • AUTH_TOKEN
  • PRIVATE_KEY

Ensure:
  ✅ File is not in version control
  ✅ File permissions are restrictive (600)
  ✅ Secrets are correct for this environment
  ✅ File will be deleted after import

Continue? (type 'import-secrets' to confirm)
```

### Success Output

```
✅ Variable group imported successfully!

Imported from: backup-vg-5.json

Created:
  ID: 18
  Name: production-vars
  Description: Production configuration

Content:
  • 9 variables imported
  • 3 secrets imported
  • Metadata preserved

🔗 Azure DevOps:
https://dev.azure.com/{org}/{project}/_library?variableGroupId=18

💡 Recommended:
  • Verify: /azure:vg-show 18
  • Link to pipelines: /azure:vg-link 18 --pipeline=51
  • Delete import file: rm backup-vg-5.json
```

## Related Commands

- `/azure:vg-export <id>` - Export to file
- `/azure:vg-create` - Create new VG manually
- `/azure:vg-list` - List all VGs
