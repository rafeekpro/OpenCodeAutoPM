# AutoPM Path Corrections Summary

**Date**: 2025-12-17
**Document**: AUTOPM_IMPROVEMENT_RECOMMENDATIONS.md
**Status**: Completed

---

## What Was Corrected

All file path references have been updated to use the correct `autopm/.opencode/` framework source paths instead of generic `.opencode/` paths.

### Path Changes Applied

**Before** (Incorrect):
```markdown
- `.opencode/agents/...`
- `.opencode/commands/...`
- `.opencode/scripts/...`
- `.opencode/rules/...`
```

**After** (Correct):
```markdown
- `autopm/.opencode/agents/...` (framework source)
- `autopm/.opencode/commands/...` (framework source)
- `autopm/.opencode/scripts/...` (framework source)
- `autopm/.opencode/rules/...` (framework source)
- `.opencode/...` (user project files only - PRDs, epics)
```

---

## Key Distinction Clarified

### Framework Source (autopm/.opencode/)
Location where framework files are stored and maintained:
- `autopm/.opencode/agents/` - Agent definitions
- `autopm/.opencode/commands/` - Command definitions
- `autopm/.opencode/scripts/` - Implementation scripts
- `autopm/.opencode/rules/` - Behavioral rules
- `autopm/.opencode/templates/` - File generation templates

### User Project Files (.opencode/)
Location after installation in user's project:
- `.opencode/prds/` - Product Requirements Documents
- `.opencode/epics/` - Technical implementation epics
- `.opencode/config.json` - Project configuration

---

## Sections Updated

### 1. System Architecture Overview
- ✅ Updated directory structure diagram
- ✅ Clarified framework source location
- ✅ Updated installation flow description

### 2. All 6 Issue Recommendations
Each recommendation now correctly references:
- ✅ **File to Modify**: `autopm/.opencode/commands/pm/...`
- ✅ **File to Modify**: `autopm/.opencode/scripts/pm/...`
- ✅ **File to Create**: `autopm/.opencode/scripts/setup/...`
- ✅ **File to Create**: `autopm/.opencode/rules/...`

### 3. Code Examples
- ✅ Updated template references: `autopm/.opencode/templates/prd-template.md`
- ✅ Updated rule references: `autopm/.opencode/rules/datetime.md`
- ✅ Agent paths correctly show user-side: `.opencode/agents/...` (after installation)

### 4. Test Cases
- ✅ Commands reference framework: `autopm/.opencode/commands/pm/...`
- ✅ User files reference project: `.opencode/prds/...`, `.opencode/epics/...`

---

## Specific Files Corrected

### Recommendation #1 (Pre-PRD Analysis)
- `autopm/.opencode/commands/pm/prd-new.md`
- `autopm/.opencode/scripts/pm/analyze-codebase.js` (new)
- `autopm/.opencode/rules/pre-prd-analysis.md` (new)
- `autopm/.opencode/templates/prd-template.md` (reference)

### Recommendation #2 (Non-Interactive PRDs)
- `autopm/.opencode/scripts/pm/prd-new.js`
- `autopm/.opencode/commands/pm/prd-new.md`
- `autopm/.opencode/templates/prd-template.md` (reference)

### Recommendation #3 (Agent Specification)
- `autopm/.opencode/commands/pm/epic-decompose.md`
- Agent paths (user-side): `.opencode/agents/...` ✅ Correct

### Recommendation #4 (GitHub Doc Links)
- `autopm/.opencode/scripts/pm/epic-sync/create-epic-issue.sh`
- `autopm/.opencode/scripts/pm/epic-sync/create-task-issues.sh`
- User file paths: `.opencode/epics/...` ✅ Correct

### Recommendation #5 (Issue Numbering)
- `autopm/.opencode/scripts/pm/epic-sync/update-references.sh`
- `autopm/.opencode/scripts/pm/epic-sync/create-github-mapping.sh` (new)
- `autopm/.opencode/commands/pm/epic-sync.md`

### Recommendation #6 (Context Optimization)
- `autopm/.opencode/scripts/setup/optimize-context.js` (new)
- User file paths: `.opencode/rules/...`, `.opencode/rules-archive/...` ✅ Correct

---

## Verification Checklist

- [x] All framework source paths use `autopm/.opencode/`
- [x] All user project paths use `.opencode/`
- [x] Installation flow correctly describes copy operation
- [x] Code examples use correct paths
- [x] Test cases reference correct locations
- [x] Agent references use post-installation paths
- [x] Template references use framework source paths
- [x] Rule references use framework source paths

---

## Next Steps

1. ✅ **Document Created**: `AUTOPM_IMPROVEMENT_RECOMMENDATIONS.md`
2. ⏭️ **Ready for**: AutoPM team review
3. ⏭️ **Options**:
   - Create GitHub issue with this document
   - Email to AutoPM maintainers
   - Submit as PR with implementation

---

## Notes

**Important**: The distinction between framework source (`autopm/.opencode/`) and user project files (`.opencode/`) is critical for:
- Correct implementation of changes
- Testing framework modifications
- Understanding installation process
- Maintaining the AutoPM framework

All paths in the recommendations document now correctly reflect this structure.
