---
allowed-tools: Task, Bash, Read, Write, Edit, WebFetch, Glob, Grep
command: azure:vg-update
description: "Update an existing variable group's variables and secrets"
---

# Azure DevOps Variable Group Update

**Update variables and/or secrets in an existing variable group**

**Usage**: `/azure:vg-update <id> --variables="KEY=value" --secrets="SECRET=value" [--description=<text>]`

**Examples**:
- `/azure:vg-update 5 --variables="APP_ENV=production"` - Update a variable
- `/azure:vg-update 5 --secrets="API_KEY=new-key"` - Update a secret
- `/azure:vg-update 5 --variables="KEY1=value1" --delete-vars="KEY2"` - Add and delete variables

## Instructions

**CRITICAL**: Use azure-devops-specialist agent via Task tool.

```bash
Task(subagent_type="azure-devops-specialist",
     description="Update variable group",
     prompt="Update variable group **$ARGUMENTS**

1. Validate VG exists
2. Parse updates, additions, deletions
3. Update public variables via CLI (delete & recreate)
4. Update/add secrets via REST API
5. Verify all changes")
```

### Key Points

**CLI Limitation**: Azure CLI doesn't support updating variable groups directly
- Must delete and recreate
- Command handles this automatically
- Preserves order where possible

**Update Strategies**:
```bash
# Simple update
/azure:vg-update 5 --variables="API_URL=https://new-url.com"

# Update secrets
/azure:vg-update 5 --secrets="API_KEY=new-secret-key"

# Add new variables
/azure:vg-update 5 --variables="NEW_VAR=value" --mode=add

# Delete variables
/azure:vg-update 5 --delete-vars="OLD_VAR,ANOTHER_VAR"

# Update description
/azure:vg-update 5 --description="Production configuration 2024"
```

### Success Output

```
✅ Variable group #5 updated successfully!

Changes:
  • Updated: APP_ENV (staging → production)
  • Added: NEW_CONFIG = enabled
  • Deleted: DEBUG
  • Updated secret: API_KEY

📊 New State:
  Variables: 10 (was 9)
  Secrets: 3 (unchanged)

🔗 Azure DevOps:
https://dev.azure.com/{org}/{project}/_library?variableGroupId={vgId}
```

## Related Commands

- `/azure:vg-create` - Create new variable group
- `/azure:vg-show <id>` - Show current state
- `/azure:vg-export <id>` - Export before updating
