---
allowed-tools: Task, Bash, Read, Write, Edit, WebFetch, Glob, Grep
command: azure:vg-show
description: "Show detailed information about a specific variable group"
---

# Azure DevOps Variable Group Show

**Display detailed information about a variable group**

Shows all variables (excluding secret values), linked pipelines, and metadata.

**Usage**: `/azure:vg-show <id> [--reveal-secrets] [--format=<table|json>]`

**Examples**:
- `/azure:vg-show 5` - Show variable group details
- `/azure:vg-show 5 --reveal-secrets` - Show secret values (use with caution!)
- `/azure:vg-show 5 --format=json` - Output as JSON

## Required Environment Variables

Ensure `.opencode/.env` contains:

```bash
AZURE_DEVOPS_PAT=<your-pat-token>
AZURE_DEVOPS_ORG=<your-organization>
AZURE_DEVOPS_PROJECT=<your-project>
```

## Required Documentation Access

**MANDATORY:** Before Azure DevOps integration, query Context7 for best practices:

**Documentation Queries:**
- `mcp://context7/azure-devops/variable-groups` - Variable groups management
- `mcp://context7/infrastructure/secrets-management` - Secrets handling

**Why This is Required:**
- Ensures adherence to security best practices
- Prevents accidental secret exposure

## Instructions

**CRITICAL**: This command MUST use the azure-devops-specialist agent for all Azure DevOps operations.

### Command Execution Pattern

```bash
# Use the Task tool to invoke the azure-devops-specialist agent
Task(subagent_type="azure-devops-specialist",
     description="Show variable group details",
     prompt="Show complete details for variable group ID: **$ARGUMENTS**

Include:
- All variables (hide secrets by default)
- Linked pipelines
- Metadata (created, modified, author)
- Usage statistics")
```

### Agent Instructions

#### 1. Fetch Variable Group

```bash
# Get variable group details
az pipelines variable-group show \
  --id $VG_ID \
  --project "$AZURE_DEVOPS_PROJECT" \
  --output json
```

#### 2. Fetch Linked Pipelines

```bash
# Get all pipelines
az pipelines list --project "$AZURE_DEVOPS_PROJECT" --output json

# Filter to those using this variable group
pipelines | select(.configuration.variableGroups | contains($VG_ID))
```

#### 3. Display Details

**Table Format**:
```
📋 Variable Group #5: production-vars

Description: Production environment configuration

📊 Variables:
  Public (9):
    • APP_ENV = production
    • API_URL = https://api.example.com
    • DEBUG = false
    • LOG_LEVEL = warn
    • DATABASE_URL = postgresql://db.example.com/prod
    • CACHE_TTL = 3600
    • MAX_CONNECTIONS = 100
    • TIMEOUT = 30
    • WORKERS = 4

  Secrets (3): 🔒
    • API_KEY = ******** (hidden)
    • DB_PASSWORD = ******** (hidden)
    • SECRET_KEY = ******** (hidden)

🔗 Linked Pipelines (3):
  • #51: CI Pipeline
  • #52: Staging Pipeline
  • #53: Production Pipeline

📝 Metadata:
  Created: 2024-01-15 10:30:00
  Modified: 2024-02-28 15:45:00
  Created by: john.doe@example.com
  Modified by: jane.smith@example.com
  Type: Vsts
  Description: Production configuration
```

**JSON Format**:
```json
{
  "id": 5,
  "name": "production-vars",
  "description": "Production environment configuration",
  "variables": {
    "APP_ENV": { "value": "production", "isSecret": false },
    "API_KEY": { "isSecret": true },
    "DB_PASSWORD": { "isSecret": true }
  },
  "variableGroupsProjectReferences": [
    {
      "projectReference": {
        "name": "MyProject"
      }
    }
  ],
  "linkedPipelines": [
    { "id": 51, "name": "CI Pipeline" },
    { "id": 52, "name": "Staging Pipeline" },
    { "id": 53, "name": "Production Pipeline" }
  ],
  "createdDate": "2024-01-15T10:30:00Z",
  "modifiedDate": "2024-02-28T15:45:00Z"
}
```

#### 4. Security Warning (if --reveal-secrets)

```bash
⚠️  WARNING: You are about to reveal secret values!

This will display actual secret values in plain text.
Secrets will be visible in:
  • Terminal output
  • Shell history
  • Log files

Never commit secrets to version control!

Continue? (type 'reveal' to confirm):
```

If user confirms, show secrets:
```
🔓 Secret Values Revealed:
  • API_KEY = sk_live_abc123xyz789
  • DB_PASSWORD = Sup3rS3cr3tP@ssw0rd!
  • SECRET_KEY = production_secret_key_2024
```

#### 5. Smart Features

**Variable Value Analysis**:
```bash
/azure:vg-show 5 --analyze

📊 Variable Analysis:
  Empty values: 0
  Duplicate values: 2 (CACHE_TTL, TIMEOUT)
  Potential secrets: 3 (marked as secret)
  Long values (>100 chars): 1 (DATABASE_URL)
  References to other VGs: 0
```

**Usage Statistics**:
```bash
/azure:vg-show 5 --usage

📈 Usage Statistics:
  Linked to 3 pipelines
  Last used: 2 hours ago (in pipeline #53)
  Created: 45 days ago
  Modified 12 times
  Most active in: Production Pipeline
```

**Compare with Another VG**:
```bash
/azure:vg-show 5 --compare-with=10

📊 Comparison: #5 (production-vars) vs #10 (staging-vars)

Variables in both:
  • APP_ENV
  • API_URL

Only in #5:
  • MAX_CONNECTIONS = 100
  • WORKERS = 4

Only in #10:
  • DEBUG = true
  • LOG_LEVEL = debug
```

#### 6. Error Handling

**Variable Group Not Found**:
```
❌ Variable group not found: #999

Available variable groups:
  • #1: production-vars
  • #2: staging-vars
  • #3: development-vars

List all: /azure:vg-list
```

**Access Denied**:
```
❌ Access denied to variable group #5

Required permissions:
  • Variable Groups: Read
  • Project: Build (Read)

Contact your administrator for access.
```

### Use Cases

**Inspect Variables**:
```bash
/azure:vg-show 5

# Check if specific variable exists
/azure:vg-show 5 --search=API_KEY

Found: API_KEY is a secret variable
  Type: Secret
  Value: ******** (hidden)
  Last modified: 2024-02-28
```

**Audit Changes**:
```bash
/azure:vg-show 5 --history

📜 Modification History:
  2024-02-28 15:45: jane.smith@example.com
    Updated: API_KEY, DB_PASSWORD
  2024-02-15 10:20: john.doe@example.com
    Updated: APP_ENV, DEBUG
  2024-01-15 10:30: john.doe@example.com
    Created variable group
```

**Export for Backup**:
```bash
/azure:vg-show 5 --export > vg-5-backup.json

# Exported (secrets excluded)
# Use --reveal-secrets to include secrets (not recommended)
```

## Related Commands

- `/azure:vg-list` - List all variable groups
- `/azure:vg-update <id>` - Update variable group
- `/azure:vg-export <id>` - Export variable group
- `/azure:vg-validate <id>` - Validate variable group

## Security Notes

**Secret Protection**:
- Secrets are NEVER displayed by default
- `--reveal-secrets` requires explicit confirmation
- Secrets are masked in all output formats
- Shell history is preserved (no secrets logged)

**Best Practices**:
- Never use `--reveal-secrets` in production
- Never redirect output with `--reveal-secrets`
- Consider using `/azure:vg-export` for backups instead

## Exit Codes

- **0**: Success
- **1**: Variable group not found
- **2**: Access denied
- **3**: Invalid format requested
