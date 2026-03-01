---
allowed-tools: Task, Bash, Read, Write, Edit, WebFetch, Glob, Grep
command: azure:vg-link
description: "Link a variable group to a pipeline using REST API (CLI doesn't support this!)"
---

# Azure DevOps Variable Group Link

**Link a variable group to one or more pipelines**

This command solves the critical problem: Azure CLI does NOT support linking variable groups to pipelines. You had to do this manually in the UI. Now you can automate it!

**Usage**: `/azure:vg-link <variable-group-id> --pipeline=<pipeline-id>`

**Examples**:
- `/azure:vg-link 5 --pipeline=51` - Link variable group 5 to pipeline 51
- `/azure:vg-link 5 --pipeline=51 --pipeline=52 --pipeline=53` - Link to 3 pipelines at once

**Why This Matters**:
- ✅ No more manual clicking in Azure DevOps UI
- ✅ Automate multi-pipeline deployments
- � Infrastructure as Code for variable group links
- ✅ CI/CD pipeline integration

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
- `mcp://context7/infrastructure/secrets-management` - Secrets handling

**Why This is Required:**
- Ensures adherence to current industry standards
- Prevents outdated or incorrect implementation patterns
- Provides access to latest Azure DevOps API documentation
- Reduces errors from stale knowledge

## Instructions

**CRITICAL**: This command MUST use the azure-devops-specialist agent for all Azure DevOps operations.

### Command Execution Pattern

```bash
# Use the Task tool to invoke the azure-devops-specialist agent
Task(subagent_type="azure-devops-specialist",
     description="Link variable group to pipeline",
     prompt="Link variable group **$ARGUMENTS** to pipeline(s)

Follow the complete workflow:
1. Validate variable group and pipeline exist
2. Check if already linked (idempotent)
3. Link using REST API (CLI doesn't support this!)
4. Verify link was successful
5. Display confirmation with linked pipeline IDs")
```

### Agent Instructions

#### 1. Preflight Checks

**Validate Variable Group:**
```bash
# Check if variable group exists
az pipelines variable-group show --id $VARIABLE_GROUP_ID
```

If error: `❌ Variable group not found: $VARIABLE_GROUP_ID`
Show similar variable groups: `az pipelines variable-group list`

**Validate Pipeline(s):**
```bash
# Check each pipeline exists
for pipeline_id in $PIPELINE_IDS; do
  az pipelines show --id $pipeline_id
done
```

If error: `❌ Pipeline not found: $pipeline_id`

#### 2. Check Existing Links

```bash
# Get current variable groups for pipeline
az pipelines show --id $PIPELINE_ID --query "configuration.variableGroups"
```

Show: `📋 Current variable groups linked to pipeline #$PIPELINE_ID: [1, 2, 3]`

#### 3. Link Variable Group (REST API)

**CRITICAL**: This operation requires REST API because Azure CLI doesn't support it!

```javascript
// Use AzureDevOpsResourcesProvider
const provider = new AzureDevOpsResourcesProvider({
  organization: process.env.AZURE_DEVOPS_ORG,
  project: process.env.AZURE_DEVOPS_PROJECT,
  pat: process.env.AZURE_DEVOPS_PAT
});

// Link variable group to pipeline
for (const pipelineId of pipelineIds) {
  await provider.linkVariableGroupToPipeline(variableGroupId, pipelineId);
}
```

**REST API Endpoint** (if implementing manually):
```
PATCH https://dev.azure.com/{org}/{project}/_apis/pipelines/{pipelineId}?api-version=6.0-preview

Authorization: Basic {base64(:PAT)}
Content-Type: application/json

[
  {
    "op": "add",
    "path": "/configuration/variableGroups/-1",
    "value": variableGroupId
  }
]
```

#### 4. Verify Link

```bash
# Verify link was successful
az pipelines show --id $PIPELINE_ID --query "configuration.variableGroups"
```

Should include the new variable group ID.

#### 5. Success Output

```
✅ Variable group #$VARIABLE_GROUP_ID linked successfully!

🔗 Linked to Pipelines:
  • Pipeline #51: my-ci-pipeline
  • Pipeline #52: my-staging-pipeline
  • Pipeline #53: my-prod-pipeline

📊 Variable Group Details:
  ID: $VARIABLE_GROUP_ID
  Variables: APP_ENV, DATABASE_URL, API_KEY

🔗 Azure DevOps:
https://dev.azure.com/{org}/{project}/_build?view=pipelines&_a=edit-pipeline&id={pipelineId}

💡 Next steps:
1. Verify pipeline uses the variables
2. Run a test build: /azure:pipeline-run {pipelineId}
3. Check variable values in pipeline logs

✨ No more manual linking needed!
```

### 6. Error Handling

**Variable Group Not Found**:
```
❌ Variable group not found: #999

Did you mean?
• #10: production-vars
• #11: staging-vars

List all: /azure:vg-list
```

**Pipeline Not Found**:
```
❌ Pipeline not found: #999

Available pipelines:
• #51: CI Pipeline
• #52: Staging Pipeline

List all: /azure:pipeline-list
```

**Authentication Failed**:
```
❌ Authentication failed

Check your PAT:
echo $AZURE_DEVOPS_PAT | wc -c
# Should be 52+ characters

Generate new: https://dev.azure.com/{org}/_usersSettings/tokens
```

**Already Linked**:
```
ℹ️  Variable group #$VARIABLE_GROUP_ID already linked to pipeline #$PIPELINE_ID

No action needed (idempotent operation).
```

### 7. Smart Features

**Link to Multiple Pipelines**:
```bash
# Link to 3 pipelines at once
/azure:vg-link 5 --pipeline=51 --pipeline=52 --pipeline=53

# Output:
✅ Linked to 3 pipelines
  • #51: ci-pipeline ✓
  • #52: staging-pipeline ✓
  • #53: prod-pipeline ✓
```

**Dry Run Mode**:
```bash
/azure:vg-link 5 --pipeline=51 --dry-run

Would link variable group #5 to pipeline #51

Current variable groups: [1, 2, 3]
After link: [1, 2, 3, 5]

Remove --dry-run to execute.
```

**Bulk Link with Pattern**:
```bash
# Link VG 5 to all pipelines with "staging" in name
/azure:vg-link 5 --pipeline-pattern=staging

Finds pipelines:
• #52: staging-backend
• #54: staging-frontend

Links to 2 pipelines ✓
```

### 8. Use Case Examples

**CI/CD Multi-Environment Setup**:
```bash
# Create variable groups
/azure:vg-create prod-vars --variables="ENV=prod"
/azure:vg-create staging-vars --variables="ENV=staging"

# Link to appropriate pipelines
/azure:vg-link 10 --pipeline=51  # prod vars → prod pipeline
/azure:vg-link 11 --pipeline=52  # staging vars → staging pipeline
```

**Shared Configuration**:
```bash
# Create common variables
/azure:vg-create common-vars --variables="NODE_ENV=production,API_VERSION=v2"

# Link to all pipelines
/azure:vg-link 12 --pipeline=51 --pipeline=52 --pipeline=53
```

**Environment Promotion**:
```bash
# Promote variables from staging to prod
/azure:vg-export 11 staging-vars
/azure:vg-import staging-vars.json --rename prod-vars
/azure:vg-link 13 --pipeline=51
```

### 9. Safety Features

**Idempotent Operation**:
- Safe to run multiple times
- Won't create duplicate links
- Checks existing links before adding

**Confirmation Prompt**:
```bash
/azure:vg-link 5 --pipeline=51 --pipeline=52 --pipeline=53

⚠️  This will link variable group #5 to 3 pipelines:
  • #51: CI Pipeline
  • #52: Staging Pipeline
  • #53: Production Pipeline

Continue? (y/n)
```

**Rollback Support**:
```bash
# If something goes wrong, unlink easily
/azure:vg-unlink 5 --pipeline=51 --pipeline=52 --pipeline=53

# Or unlink all
/azure:vg-unlink 5 --all
```

### 10. Hooks

Support for custom hooks:
- `pre-vg-link`: Run before linking
- `post-vg-link`: Run after successful link

Example: `.opencode/hooks/pre-vg-link.sh`
```bash
#!/bin/bash
# Ensure pipeline is not currently running
PIPELINE_STATUS=$(az pipelines run --pipeline-id $1 --query "status" -o tsv)
if [ "$PIPELINE_STATUS" = "inProgress" ]; then
  echo "❌ Pipeline is running - cannot link"
  exit 1
fi
```

## Notes

**Why REST API Only?**
- Azure CLI `az pipelines update` does NOT support variable group linking
- This is a known limitation of Azure CLI
- REST API provides full pipeline configuration access
- This command wraps the REST API for you

**Alternative Manual Process** (what you had to do before):
1. Open Azure DevOps in browser
2. Navigate to Pipelines
3. Click "Edit" on pipeline
4. Click "Variables"
5. Click "Variable groups"
6. Click "Link variable group"
7. Select variable group
8. Click "Link"
9. Repeat for each pipeline

**Now**: One command does it all!

## Related Commands

- `/azure:vg-create` - Create variable group
- `/azure:vg-unlink` - Unlink variable group from pipeline
- `/azure:vg-list` - List all variable groups
- `/azure:vg-show` - Show variable group details
- `/azure:pipeline-list` - List all pipelines

## Technical Details

**REST API Operation**:
```
PATCH /_apis/pipelines/{pipelineId}?api-version=6.0-preview
Content-Type: application/json-patch+json

[
  {
    "op": "add",
    "path": "/configuration/variableGroups/-1",
    "value": {variableGroupId}
  }
]
```

**Response**:
```json
{
  "id": 51,
  "name": "my-pipeline",
  "configuration": {
    "variableGroups": [1, 2, 3, 5]
  }
}
```

**Rate Limits**:
- Azure DevOps: 10,000 requests per hour
- This command: 1 request per pipeline link
- Safe to link to 100+ pipelines at once
