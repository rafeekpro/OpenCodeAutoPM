---
allowed-tools: Task, Bash, Read, Write, Edit, WebFetch, Glob, Grep
command: azure:vg-delete
description: "Delete a variable group from Azure DevOps"
---

# Azure DevOps Variable Group Delete

**Delete a variable group permanently**

**⚠️ DANGER**: This operation cannot be undone!

**Usage**: `/azure:vg-delete <id> [--force] [--dry-run]`

**Examples**:
- `/azure:vg-delete 5` - Delete with confirmation
- `/azure:vg-delete 5 --force` - Delete without confirmation
- `/azure:vg-delete 5 --dry-run` - Preview what would be deleted

## Instructions

**CRITICAL**: Use azure-devops-specialist agent via Task tool.

```bash
Task(subagent_type="azure-devops-specialist",
     description="Delete variable group",
     prompt="Delete variable group **$ARGUMENTS**

1. Check if VG exists
2. Show what will be deleted
3. List affected pipelines
4. Request confirmation (unless --force)
5. Delete via CLI
6. Verify deletion")
```

### Safety Features

**Confirmation Prompt**:
```bash
/azure:vg-delete 5

⚠️  WARNING: You are about to delete variable group #5: production-vars

This will:
  • Delete the variable group permanently
  • Unlink from 3 pipelines:
    - #51: CI Pipeline
    - #52: Staging Pipeline
    - #53: Production Pipeline
  • Remove 12 variables
  • Remove 3 secret variables

This action CANNOT be undone!

Type 'DELETE' to confirm:
```

**Check Pipeline Impact**:
```bash
# Show what pipelines use this VG
/azure:vg-delete 5 --check-impact

📊 Affected Pipelines:
  • #51: CI Pipeline (uses APP_ENV, API_URL)
  • #52: Staging Pipeline (uses APP_ENV, API_URL)
  • #53: Production Pipeline (uses all variables)

⚠️  Pipelines may fail after deletion!
```

**Dry Run**:
```bash
/azure:vg-delete 5 --dry-run

Would delete variable group #5: production-vars

Variables to delete: 12
Secrets to delete: 3
Pipelines to unlink: 3

Remove --dry-run to execute.
```

### Error Handling

**VG in Use**:
```bash
/azure:vg-delete 5

❌ Variable group #5 is linked to 3 active pipelines

Unlink first:
  /azure:vg-unlink 5 --pipeline=51 --pipeline=52 --pipeline=53

Or use --force to unlink and delete:
  /azure:vg-delete 5 --force
```

### Success Output

```
✅ Variable group #5 deleted successfully!

Deleted:
  • Variable group: production-vars
  • Variables: 12
  • Secrets: 3
  • Unlinked from: 3 pipelines

Cleanup complete.
```

## Related Commands

- `/azure:vg-unlink <id>` - Unlink from pipelines before deleting
- `/azure:vg-export <id>` - Export before deletion (backup)
- `/azure:vg-list` - List all VGs
