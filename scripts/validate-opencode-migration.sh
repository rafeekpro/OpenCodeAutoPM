#!/bin/bash

# OpenCode Migration Validation Script
# Validates that all migration steps have been completed successfully

echo "🔍 Validating OpenCode Migration..."
echo "══════════════════════════════════════════════"
echo ""

ERRORS=0
WARNINGS=0
CHECKS=0

# Function to print check result
print_check() {
  CHECKS=$((CHECKS + 1))
  if [ $1 -eq 0 ]; then
    echo "✅ Check $CHECKS: $2"
  else
    echo "❌ Check $CHECKS: $2"
    ERRORS=$((ERRORS + 1))
  fi
}

print_warning() {
  echo "⚠️  Warning: $1"
  WARNINGS=$((WARNINGS + 1))
}

# 1. Check package name
echo "📦 Checking package configuration..."
if [ -f "package.json" ]; then
  PACKAGE_NAME=$(jq -r '.name' package.json)
  if [ "$PACKAGE_NAME" = "opencode-autopm" ]; then
    print_check 0 "Package name is 'opencode-autopm'"
  else
    print_check 1 "Package name is '$PACKAGE_NAME' (expected 'opencode-autopm')"
  fi
  
  VERSION=$(jq -r '.version' package.json)
  echo "   Version: $VERSION"
else
  print_check 1 "package.json not found"
fi

# 2. Check for Claude Code product references
echo ""
echo "📝 Checking for Claude Code product references..."
REFERENCES=$(grep -r "Claude Code\|claude-code" \
  --include="*.md" \
  --include="*.js" \
  --include="*.json" \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  . 2>/dev/null | wc -l | tr -d ' ')

if [ "$REFERENCES" -lt 10 ]; then
  print_check 0 "Claude Code references minimized ($REFERENCES found)"
else
  print_warning "Found $REFERENCES Claude Code references (expected <10)"
  echo "   Note: Some references may be legitimate (e.g., AI model mentions)"
fi

# 3. Verify directory structure
echo ""
echo "📁 Checking directory structure..."
if [ -d "autopm/.opencode" ]; then
  print_check 0 "autopm/.opencode/ directory exists"
else
  print_check 1 "autopm/.opencode/ directory missing"
fi

if [ -d ".opencode" ]; then
  print_check 0 ".opencode/ directory exists"
else
  print_check 1 ".opencode/ directory missing"
fi

# 4. Check environment variable migration
echo ""
echo "🔧 Checking environment variable migration..."
if grep -r "OPENCODE_[A-Z_]*:" autopm/.opencode/ .opencode/ 2>/dev/null | grep -q .; then
  print_check 0 "OPENCODE_ environment variables present"
else
  print_check 1 "OPENCODE_ environment variables missing"
fi

# 5. Check for ConfigManager
echo ""
echo "⚙️  Checking configuration management..."
if [ -f "lib/config/ConfigManager.js" ]; then
  print_check 0 "ConfigManager.js exists"
  
  # Check if it has getEnvVar method
  if grep -q "getEnvVar" lib/config/ConfigManager.js; then
    print_check 0 "ConfigManager has backward compatibility methods"
  else
    print_check 1 "ConfigManager missing getEnvVar method"
  fi
else
  print_check 1 "ConfigManager.js not found"
fi

# 6. Check test files
echo ""
echo "🧪 Checking test files..."
if [ -f "test/config/env-var-compatibility.test.js" ]; then
  print_check 0 "Environment variable compatibility tests exist"
else
  print_check 1 "Environment variable compatibility tests missing"
fi

# 7. Verify config.json has hybrid parallel
echo ""
echo "🚀 Checking execution strategy configuration..."
if [ -f "autopm/.opencode/config.json" ]; then
  MODE=$(jq -r '.execution_strategy.mode' autopm/.opencode/config.json 2>/dev/null)
  if [ "$MODE" = "hybrid-parallel" ]; then
    print_check 0 "Execution mode set to 'hybrid-parallel'"
  else
    print_check 1 "Execution mode is '$MODE' (expected 'hybrid-parallel')"
  fi
  
  MAX_AGENTS=$(jq -r '.execution_strategy.max_agents // "null"' autopm/.opencode/config.json 2>/dev/null)
  if [ "$MAX_AGENTS" = "5" ]; then
    print_check 0 "Max agents set to 5"
  else
    echo "   ℹ️  Max agents: $MAX_AGENTS"
  fi
else
  print_check 1 "autopm/.opencode/config.json not found"
fi

# 8. Check documentation
echo ""
echo "📚 Checking documentation..."
if [ -f "OPENCODE.md" ]; then
  print_check 0 "OPENCODE.md exists"
else
  print_check 1 "OPENCODE.md not found"
fi

if [ -f "CLAUDE.md" ]; then
  if grep -q "DEPRECATED" CLAUDE.md; then
    print_check 0 "CLAUDE.md has deprecation notice"
  else
    print_check 1 "CLAUDE.md missing deprecation notice"
  fi
else
  print_warning "CLAUDE.md not found (may have been removed)"
fi

# 9. Check CLI entry points
echo ""
echo "💻 Checking CLI entry points..."
if [ -f "bin/opencode-autopm.js" ]; then
  print_check 0 "Primary CLI entry point exists (opencode-autopm.js)"
else
  print_check 1 "Primary CLI entry point missing"
fi

if [ -f "bin/open-autopm.js" ]; then
  if grep -q "deprecated" bin/open-autopm.js; then
    print_check 0 "Deprecated CLI has deprecation notice"
  else
    print_warning "Deprecated CLI missing deprecation notice"
  fi
else
  print_warning "Deprecated CLI entry point not found"
fi

# 10. Summary
echo ""
echo "══════════════════════════════════════════════"
echo "📊 Validation Summary"
echo "══════════════════════════════════════════════"
echo "Checks performed: $CHECKS"
echo "Errors found: $ERRORS"
echo "Warnings: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ]; then
  echo "🎉 Migration validation PASSED!"
  echo ""
  echo "✅ All critical checks passed successfully"
  echo "✅ The migration to OpenCode is complete"
  echo ""
  if [ $WARNINGS -gt 0 ]; then
    echo "⚠️  Note: $WARNINGS warning(s) should be reviewed"
  fi
  echo ""
  echo "🚀 Ready for release: opencode-autopm v$(jq -r '.version' package.json)"
  exit 0
else
  echo "❌ Migration validation FAILED!"
  echo ""
  echo "❌ $ERRORS error(s) need to be fixed before release"
  echo ""
  echo "Please review the errors above and run the migration again."
  exit 1
fi
