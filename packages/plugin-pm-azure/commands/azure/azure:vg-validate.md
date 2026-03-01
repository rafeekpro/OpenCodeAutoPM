---
allowed-tools: Task, Bash, Read, Write, Edit, WebFetch, Glob, Grep
command: azure:vg-validate
description: "Validate variable group configuration and health"
---

# Azure DevOps Variable Group Validate

**Validate variable group for issues and best practices**

**Usage**: `/azure:vg-validate <id> [--fix] [--verbose]`

**Examples**:
- `/azure:vg-validate 5` - Validate variable group
- `/azure:vg-validate 5 --fix` - Auto-fix simple issues
- `/azure:vg-validate 5 --verbose` - Detailed analysis

## Instructions

**CRITICAL**: Use azure-devops-specialist agent via Task tool.

```bash
Task(subagent_type="azure-devops-specialist",
     description="Validate variable group",
     prompt="Validate variable group **$ARGUMENTS**

1. Fetch variable group details
2. Check for common issues
3. Validate naming conventions
4. Check for security issues
5. Verify pipeline references
6. Report findings
7. Auto-fix if --fix provided")
```

### Validation Checks

**1. Naming Conventions**:
```bash
# Check variable names
• Valid: APP_ENV, API_KEY, DATABASE_URL
• Invalid: 123Start, -hyphen-start, space in name
• Suggestions: Use UPPER_CASE for constants
```

**2. Empty Values**:
```bash
# Check for empty variables
❌ Issue: Variable 'DEBUG' has empty value

Impact:
  • May cause pipeline failures
  • Empty strings vs null vs undefined differ

Fix: Set default value or remove variable
```

**3. Duplicate Values**:
```bash
# Check for duplicate values
⚠️  Warning: Multiple variables have same value

  • CACHE_TTL = 3600
  • SESSION_TIMEOUT = 3600

Consider: Are these supposed to be different?
```

**4. Security Issues**:
```bash
# Check for potential secrets in non-secret variables
🔐 Security Warning: Variable 'PASSWORD' is not marked as secret

Issue:
  • Should be in 'secrets' section
  • Visible in pipeline logs
  • Accessible to anyone with project access

Recommendation: Convert to secret variable
```

**5. Pipeline References**:
```bash
# Check which pipelines use this VG
✅ Used in 3 pipelines:
  • #51: CI Pipeline (uses: APP_ENV, API_URL)
  • #52: Staging Pipeline (uses: APP_ENV)
  • #53: Production Pipeline (uses: all variables)

⚠️  Unused variables:
  • UNUSED_VAR (not referenced in any pipeline)
```

**6. Best Practices**:
```bash
# Check for best practice violations
⚠️  Warnings:

• Hardcoded URLs: API_URL = https://specific-env.com
  Recommendation: Use environment-specific VGs

• Missing default values: OPTIONAL_VAR not set
  Recommendation: Provide sensible defaults

• Long values: DATABASE_URL > 200 characters
  Recommendation: Consider external secrets management
```

### Output Format

**Summary**:
```bash
/azure:vg-validate 5

📋 Validation Report: Variable Group #5 (production-vars)

✅ Passed: 7 checks
⚠️  Warnings: 3
❌ Errors: 1

❌ Errors (1):
  1. Variable 'EMPTY_VAR' has empty value

⚠️  Warnings (3):
  1. Variable 'PASSWORD' should be a secret
  2. Variable 'HARDCODED_URL' contains environment-specific value
  3. Unused variable: 'UNUSED_VAR'

✅ Good Practices:
  • Naming conventions followed
  • No duplicate values
  • Secrets properly configured
  • Linked to appropriate pipelines

Overall: ⚠️  Needs attention (1 error, 3 warnings)
```

**Verbose Mode**:
```bash
/azure:vg-validate 5 --verbose

📋 Detailed Validation Report: VG #5

**Variable Analysis** (12 total):
  ✅ APP_ENV: production (correct format, used in 3 pipelines)
  ✅ API_URL: https://api.example.com (correct format, used in 2 pipelines)
  ⚠️  DEBUG: false (consider removing in production)
  ❌ EMPTY_VAR: "" (empty value)
  🔐 PASSWORD: ******** (should be marked as secret!)
  ...

**Pipeline Usage**:
  CI Pipeline: Uses 8/12 variables (67%)
    Missing: UNUSED_VAR, OPTIONAL_VAR, DEBUG
    Extra: None (all used vars present)

  Staging Pipeline: Uses all 12 variables

  Production Pipeline: Uses 10/12 variables (83%)
    Missing: DEBUG, UNUSED_VAR

**Security Score**: 7/10
  ✅ Secrets properly isolated
  ⚠️ 1 potential secret in wrong place
  ✅ No hardcoded credentials
  ⚠️ 1 environment-specific URL found

**Recommendations**:
  1. Set EMPTY_VAR to default value or remove
  2. Move PASSWORD to secrets section
  3. Remove DEBUG or set to false
  4. Remove UNUSED_VAR
  5. Consider using environment-specific VGs for URLs
```

### Auto-Fix Mode

```bash
/azure:vg-validate 5 --fix

📋 Auto-Fixing Issues...

✅ Fixed: Removed empty variable EMPTY_VAR
✅ Fixed: Moved PASSWORD to secrets
⚠️  Skipped: HARDCODED_URL (requires manual review)

⚠️  Manual Action Required:
  1. Review HARDCODED_URL value
  2. Consider environment-specific configuration
  3. Run validation again: /azure:vg-validate 5
```

### Use Cases

**Pre-Deployment Check**:
```bash
# Validate before promoting to production
/azure:vg-validate 5

✅ All checks passed! Safe to deploy.
```

**Maintenance**:
```bash
# Regular health check
/azure:vg-validate --all

📊 All Variable Groups:
  #1: ✅ Healthy (0 errors, 0 warnings)
  #5: ⚠️  Needs attention (1 error, 3 warnings)
  #10: ❌ Unhealthy (5 errors, 2 warnings)

Review and fix issues.
```

**Security Audit**:
```bash
/azure:vg-validate --all --security-only

🔐 Security Audit Results:

🔐 Critical Issues (2):
  #5: PASSWORD not marked as secret
  #10: API_KEY exposed in logs

⚠️  Medium Issues (5):
  #3: PRIVATE_KEY not encrypted
  ...

Fix critical issues immediately!
```

### Success Output

```
✅ Validation complete!

Variable Group: #5 (production-vars)
Status: ⚠️  Needs attention

Summary:
  • 12 variables checked
  • 1 error found
  • 3 warnings generated
  • 3 suggestions provided

Next Steps:
  1. Review errors: /azure:vg-show 5
  2. Auto-fix: /azure:vg-validate 5 --fix
  3. Re-validate: /azure:vg-validate 5

📊 Score: 7/10 (Good)
```

## Related Commands

- `/azure:vg-show <id>` - View VG details
- `/azure:vg-update <id>` - Fix issues
- `/azure:vg-list` - Validate all VGs
