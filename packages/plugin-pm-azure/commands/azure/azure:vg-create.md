---
allowed-tools: Task, Bash, Read, Write, Edit, WebFetch, Glob, Grep
command: azure:vg-create
description: "Create a new variable group with support for secret variables"
---

# Azure DevOps Variable Group Create

**Create a new variable group in Azure DevOps**

Supports both regular and secret variables. Secret variables are handled securely via REST API.

**Usage**: `/azure:vg-create <name> --variables="KEY=value" --secrets="SECRET_KEY=secret_value"`

**Examples**:
- `/azure:vg-create my-vars --variables="APP_ENV=prod"` - Create with regular variables
- `/azure:vg-create api-vars --variables="API_URL=https://api.example.com" --secrets="API_KEY=secret123"` - Create with secrets
- `/azure:vg-create config --variables="FILE=config.json" --secrets="DB_PASS=mypass" --description="Production config"`

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
     description="Create variable group",
     prompt="Create variable group **$ARGUMENTS**

Follow the complete workflow:
1. Validate variable group name doesn't exist
2. Parse variables and secrets from arguments
3. Create variable group using CLI
4. Add secret variables using REST API
5. Verify creation
6. Display VG ID and link")
```

### Agent Instructions

#### 1. Preflight Checks

**Validate Name**:
```bash
# Check if variable group already exists
az pipelines variable-group list --query "[?name=='$VG_NAME']"
```

If exists: `❌ Variable group already exists: $VG_NAME (ID: 5)`
Show: `Use /azure:vg-update to modify or /azure:vg-delete to remove`

**Validate Variables**:
- Check for duplicate keys between variables and secrets
- Validate variable names (alphanumeric, underscore, hyphen)
- Check for empty values (warn user)

#### 2. Parse Arguments

**Variables Format**:
```bash
# Parse --variables argument
--variables="KEY1=value1,KEY2=value2"

# Or multiple flags
--variables="KEY1=value1" --variables="KEY2=value2"
```

**Secrets Format**:
```bash
# Parse --secrets argument
--secrets="SECRET_KEY1=secret1,SECRET_KEY2=secret2"

# Or multiple flags
--secrets="SECRET_KEY1=secret1" --secrets="SECRET_KEY2=secret2"
```

**Handle Special Characters**:
- Values with spaces: `KEY="value with spaces"`
- Values with equals: `KEY="value=with=equals"`
- Values with quotes: `KEY='value"with"quotes'`

#### 3. Create Variable Group (CLI)

```bash
# Build variables string for CLI
VARS_STRING=""
for key, value in variables; do
  VARS_STRING="$VARS_STRING $key=$value"
done

# Create using Azure CLI
az pipelines variable-group create \
  --name "$VG_NAME" \
  --variables $VARS_STRING \
  --output json
```

**Expected Output**:
```json
{
  "id": 5,
  "name": "my-vars",
  "variables": {
    "APP_ENV": { "value": "production" }
  }
}
```

#### 4. Add Secret Variables (REST API)

**CRITICAL**: Azure CLI doesn't support adding secrets! Must use REST API.

```javascript
// Use AzureDevOpsResourcesProvider
const provider = new AzureDevOpsResourcesProvider({
  organization: process.env.AZURE_DEVOPS_ORG,
  project: process.env.AZURE_DEVOPS_PROJECT,
  pat: process.env.AZURE_DEVOPS_PAT
});

// Add secret variables
if (Object.keys(secrets).length > 0) {
  await provider.addSecretVariables(variableGroupId, secrets);
}
```

**Security Note**:
- Secrets are added via REST API (not CLI)
- Secrets appear as `null` in CLI output
- Never log secret values
- Secrets are encrypted at rest in Azure DevOps

#### 5. Verify Creation

```bash
# Verify variable group was created
az pipelines variable-group show --id $VG_ID

# Verify secret variables (will show as null)
az pipelines variable-group show --id $VG_ID --query "variables.SECRET_KEY"
# Output: null (expected for secrets)
```

#### 6. Success Output

```
✅ Variable group created successfully!

📋 Variable Group Details:
  ID: 5
  Name: my-vars
  Description: Production configuration

📊 Variables (3):
  • APP_ENV: production
  • API_URL: https://api.example.com
  • DEBUG: false

🔐 Secret Variables (2):
  • API_KEY: ******** (hidden)
  • DB_PASSWORD: ******** (hidden)

🔗 Azure DevOps:
https://dev.azure.com/{org}/{project}/_library?view=variableGroup&variableGroupId={vgId}

💡 Next steps:
1. Link to pipeline: /azure:vg-link 5 --pipeline=51
2. Export for backup: /azure:vg-export 5
3. Use in pipeline YAML: $(APP_ENV)

✨ Ready to use in your pipelines!
```

### 7. Error Handling

**Name Already Exists**:
```
❌ Variable group 'my-vars' already exists (ID: 5)

Options:
• Update existing: /azure:vg-update 5 --variables="NEW=value"
• Delete and recreate: /azure:vg-delete 5
• Use different name: /azure:vg-create my-vars-v2
```

**Invalid Variable Name**:
```
❌ Invalid variable name: '123INVALID'

Variable names must:
  • Start with letter or underscore
  • Contain only letters, numbers, underscore, hyphen
  • Be 1-256 characters
```

**Authentication Failed**:
```
❌ Authentication failed

Check your PAT:
echo $AZURE_DEVOPS_PAT | wc -c
# Should be 52+ characters

Required permissions:
  • Build: Read & Execute
  • Variable Groups: Read, Create, Manage
```

### 8. Smart Features

**Auto-Generate Unique Name**:
```bash
# If name exists, append number
/azure:vg-create my-vars

# Already exists, creating my-vars-2 instead
✅ Variable group created: my-vars-2
```

**Variable Validation**:
```bash
# Check for common mistakes
/azure:vg-create my-vars --variables="PASSWORD=hardcoded"

⚠️  Warning: PASSWORD looks like a secret
  Use --secrets flag instead: --secrets="PASSWORD=hardcoded"

Continue anyway? (y/n)
```

**Bulk Variables from File**:
```bash
# Load variables from .env file
/azure:vg-create my-vars --from-file=.env.production

✅ Loaded 12 variables from .env.production
✅ Loaded 5 secret variables (marked with SECRET_)
✅ Variable group created
```

**Template-Based Creation**:
```bash
# Create from template
/azure:vg-create staging-vars --template=production-vars

✅ Created staging-vars based on production-vars
✅ Changed values for: ENV, API_URL
✅ Preserved structure
```

### 9. Use Case Examples

**Multi-Environment Setup**:
```bash
# Development
/azure:vg-create dev-vars --variables="ENV=dev,DEBUG=true"

# Staging
/azure:vg-create staging-vars --variables="ENV=staging,DEBUG=false" --secrets="API_KEY=staging-key"

# Production
/azure:vg-create prod-vars --variables="ENV=production,DEBUG=false" --secrets="API_KEY=prod-key"
```

**Service Configuration**:
```bash
# Database configuration
/azure:vg-create db-config \
  --variables="DB_HOST=localhost,DB_PORT=5432,DB_NAME=mydb" \
  --secrets="DB_PASSWORD=mypass,DB_USER=admin"
```

**Application Secrets**:
```bash
# API configuration
/azure:vg-create api-secrets \
  --variables="API_URL=https://api.example.com,API_VERSION=v2" \
  --secrets="API_KEY=secret123,API_SECRET=secret456"
```

**Import from Environment**:
```bash
# Create from current environment
env | grep APP_ | /azure:vg-create app-vars --from-stdin

✅ Created app-vars with 25 variables
✅ Skipped 3 invalid names
```

### 10. Best Practices

**Naming Conventions**:
```bash
# Good names
/azure:vg-create prod-api-vars
/azure:vg-create staging-db-config
/azure:vg-create ci-build-parameters

# Avoid
/azure:vg-create vars (too vague)
/azure:vg-create config (ambiguous)
```

**Variable Organization**:
```bash
# Group related variables
/azure:vg-create api-vars \
  --variables="API_URL=...,API_TIMEOUT=30" \
  --secrets="API_KEY=...,API_SECRET=..."

/azure:vg-create db-vars \
  --variables="DB_HOST=...,DB_PORT=..." \
  --secrets="DB_PASSWORD=..."
```

**Secret Management**:
```bash
# Use separate VG for secrets
/azure:vg-create public-vars --variables="API_URL=..."
/azure:vg-create secret-vars --secrets="API_KEY=..."

# Link to same pipeline
/azure:vg-link 10 --pipeline=51
/azure:vg-link 11 --pipeline=51
```

### 11. YAML Pipeline Usage

After creating, use in pipeline YAML:

```yaml
# azure-pipelines.yml
variables:
- group: my-vars  # References variable group by name

steps:
- script: echo $(APP_ENV)
```

Or reference specific variable:

```yaml
variables:
- name: appEnv
  value: $[variables.APP_ENV]  # Runtime expansion

steps:
- script: echo $(appEnv)
```

## Related Commands

- `/azure:vg-list` - List all variable groups
- `/azure:vg-show <id>` - Show variable group details
- `/azure:vg-update <id>` - Update variable group
- `/azure:vg-link <id> --pipeline=<id>` - Link to pipeline
- `/azure:vg-delete <id>` - Delete variable group
- `/azure:vg-export <id>` - Export variable group

## Technical Details

**Creation Process**:
1. Parse variables and secrets
2. Create VG via Azure CLI (public vars only)
3. Add secrets via REST API (if any)
4. Return VG ID

**Secret Handling**:
- Secrets never appear in CLI output
- Secrets encrypted at rest in Azure DevOps
- Secrets masked in pipeline logs
- Only users with "Manage" permission can view

**Variable Limits**:
- Max variables per VG: 500
- Max variable name length: 256 chars
- Max variable value length: 2048 chars
- Max secret value length: 2048 chars

## Notes

**Why Separate Secrets?**
- Security: Separate access control
- Visibility: Secrets hidden in logs
- Flexibility: Mix public and private VGs

**Alternative Manual Process**:
1. Open Azure DevOps in browser
2. Navigate to Pipelines → Library
3. Click "+ Variable group"
4. Fill in name and description
5. Add variables one by one
6. For secrets: check lock icon
7. Click "Create"

**Now**: One command creates all variables at once!

## Exit Codes

- **0**: Success
- **1**: Authentication failed
- **2**: Variable group already exists
- **3**: Invalid variable name or value
- **4**: Permission denied
