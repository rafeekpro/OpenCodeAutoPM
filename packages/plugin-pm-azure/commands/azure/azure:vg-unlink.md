---
allowed-tools: Task, Bash, Read, Write, Edit, WebFetch, Glob, Grep
command: azure:vg-unlink
description: "Unlink a variable group from one or more pipelines"
---

# Azure DevOps Variable Group Unlink

**Unlink a variable group from pipelines**

**Usage**: `/azure:vg-unlink <variable-group-id> --pipeline=<id> [--all]`

**Examples**:
- `/azure:vg-unlink 5 --pipeline=51` - Unlink from one pipeline
- `/azure:vg-unlink 5 --pipeline=51 --pipeline=52` - Unlink from multiple
- `/azure:vg-unlink 5 --all` - Unlink from all pipelines

## Instructions

**CRITICAL**: Use azure-devops-specialist agent via Task tool.

```bash
Task(subagent_type="azure-devops-specialist",
     description="Unlink variable group",
     prompt="Unlink variable group **$ARGUMENTS**

1. Validate VG and pipelines exist
2. Show current links
3. Unlink using REST API
4. Verify unlinked
5. Display confirmation")
```

### Process

**Unlink from Specific Pipelines**:
```bash
/azure:vg-unlink 5 --pipeline=51 --pipeline=52

✅ Variable group #5 unlinked successfully!

Unlinked from:
  • #51: CI Pipeline ✓
  • #52: Staging Pipeline ✓

Still linked to: 1 pipeline
```

**Unlink from All**:
```bash
/azure:vg-unlink 5 --all

⚠️  This will unlink variable group #5 from all 3 pipelines:
  • #51: CI Pipeline
  • #52: Staging Pipeline
  • #53: Production Pipeline

Continue? (y/n)

[After confirmation]
✅ Unlinked from all 3 pipelines
```

### Idempotent Operation

Safe to run multiple times:
```bash
/azure:vg-unlink 5 --pipeline=51

ℹ️  Variable group #5 not linked to pipeline #51

No action needed (idempotent).
```

### Safety Features

**Check Before Unlinking**:
```bash
/azure:vg-unlink 5 --pipeline=51 --check

⚠️  Pipeline #51 uses these variables from VG #5:
  • APP_ENV
  • API_URL
  • API_KEY (secret)

Consider updating pipeline variables before unlinking!
```

**Dry Run**:
```bash
/azure:vg-unlink 5 --all --dry-run

Would unlink from 3 pipelines:
  • #51: CI Pipeline
  • #52: Staging Pipeline
  • #53: Production Pipeline

Remove --dry-run to execute.
```

## Related Commands

- `/azure:vg-link <id>` - Link to pipelines
- `/azure:vg-show <id>` - See current links
- `/azure:vg-delete <id>` - Delete variable group
