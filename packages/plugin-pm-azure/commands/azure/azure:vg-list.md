---
allowed-tools: Task, Bash, Read, Write, Edit, WebFetch, Glob, Grep
command: azure:vg-list
description: "List all variable groups in Azure DevOps project"
---

# Azure DevOps Variable Group List

**List all variable groups in your Azure DevOps project**

Shows all variable groups with their IDs, names, variable counts, and usage information.

**Usage**: `/azure:vg-list [--filter=<pattern>] [--format=<table|json|csv>]`

**Examples**:
- `/azure:vg-list` - List all variable groups
- `/azure:vg-list --filter=prod` - Filter by name pattern
- `/azure:vg-list --format=json` - Output as JSON
- `/azure:vg-list --format=csv > vgs.csv` - Export to CSV

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
- `mcp://context7/azure-devops/pipelines` - Pipelines best practices
- `mcp://context7/azure-devops/variable-groups` - Variable groups management

**Why This is Required:**
- Ensures adherence to current industry standards
- Provides access to latest Azure DevOps API documentation

## Instructions

**CRITICAL**: This command MUST use the azure-devops-specialist agent for all Azure DevOps operations.

### Command Execution Pattern

```bash
# Use the Task tool to invoke the azure-devops-specialist agent
Task(subagent_type="azure-devops-specialist",
     description="List variable groups",
     prompt="List all variable groups in the project

If --filter provided, show only matching VGs
Display in requested format (table/json/csv)")
```

### Agent Instructions

#### 1. Fetch Variable Groups

```bash
# List all variable groups using Azure CLI
az pipelines variable-group list \
  --project "$AZURE_DEVOPS_PROJECT" \
  --output json
```

#### 2. Process and Format

**Filter** (if provided):
```javascript
const filter = process.argv.filter || '';
const vgs = rawData.filter(vg =>
  vg.name.toLowerCase().includes(filter.toLowerCase())
);
```

**Count Variables**:
```javascript
vgs.forEach(vg => {
  vg.variableCount = Object.keys(vg.variables || {}).length;
  vg.hasSecrets = Object.values(vg.variables || {}).some(v => v.isSecret);
});
```

#### 3. Output Formats

**Table Format** (default):
```
📋 Azure DevOps Variable Groups

┌──────┬─────────────────────┬──────────┬──────────┬────────────────┐
│ ID   │ Name                │ Variables │ Secrets  │ Pipelines      │
├──────┼─────────────────────┼──────────┼──────────┼────────────────┤
│ 1    │ production-vars     │ 12        │ 🔒 3     │ 3 pipelines    │
│ 2    │ staging-vars        │ 10        │ 🔒 2     │ 2 pipelines    │
│ 3    │ development-vars    │ 8         │ 0        │ 1 pipeline     │
└──────┴─────────────────────┴──────────┴──────────┴────────────────┘

Total: 3 variable groups
```

**JSON Format**:
```json
[
  {
    "id": 1,
    "name": "production-vars",
    "variableCount": 12,
    "secretCount": 3,
    "pipelines": [51, 52, 53],
    "description": "Production configuration"
  }
]
```

**CSV Format**:
```csv
ID,Name,VariableCount,SecretCount,Pipelines
1,production-vars,12,3,"51,52,53"
2,staging-vars,10,2,"51,52"
3,development-vars,8,0,"51"
```

#### 4. Smart Features

**Search/Filter**:
```bash
/azure:vg-list --filter=prod

📋 Variable Groups matching "prod"
  • #1: production-vars (12 vars, 3 secrets)
  • #5: prod-api-keys (5 vars, 5 secrets)
```

**Show Details**:
```bash
/azure:vg-list --verbose

📋 Variable Groups (Detailed)
  #1: production-vars
    Variables: 12
    Secrets: 🔒 3
    Pipelines: CI, Staging, Production
    Created: 2024-01-15
    Modified: 2024-02-28
```

**Sort Options**:
```bash
/azure:vg-list --sort=name          # Sort by name
/azure:vg-list --sort=variables     # Sort by variable count
/azure:vg-list --sort=pipelines     # Sort by pipeline count
```

#### 5. Error Handling

**Authentication Failed**:
```
❌ Authentication failed

Check your PAT:
echo $AZURE_DEVOPS_PAT | wc -c
# Should be 52+ characters
```

**No Variable Groups**:
```
📭 No variable groups found in this project

Create your first:
/azure:vg-create my-vars --variables="KEY=value"
```

### Use Cases

**Audit Variable Groups**:
```bash
/azure:vg-list

📊 Summary:
  Total variable groups: 15
  Total variables: 156
  Total secrets: 42
  Orphaned (no pipelines): 3
```

**Find Specific Variable**:
```bash
/azure:vg-list --search=API_KEY

Found in:
  • #5: prod-api-keys (API_KEY is secret)
  • #6: staging-api-keys (API_KEY is secret)
  • #7: dev-api-keys (API_KEY is secret)
```

**Count Usage**:
```bash
/azure:vg-list --stats

📊 Variable Group Statistics:
  Most used: #1 (linked to 8 pipelines)
  Least used: #15 (not linked)
  Most variables: #5 (25 variables)
  Most secrets: #10 (10 secrets)
```

## Related Commands

- `/azure:vg-show <id>` - Show variable group details
- `/azure:vg-create <name>` - Create new variable group
- `/azure:vg-update <id>` - Update variable group
- `/azure:vg-delete <id>` - Delete variable group

## Notes

**Performance**:
- Lists up to 1000 variable groups efficiently
- Caches results for 30 seconds
- Use filters for large projects

**Permissions Required**:
- Variable Groups: Read
- Build: Read (to show pipeline usage)

## Exit Codes

- **0**: Success
- **1**: Authentication failed
- **2**: No variable groups found
