#!/bin/bash

# OpenCode Migration Script - Test Files
# Updates all references from Claude Code to OpenCode in test files

echo "🔄 Migrating test files to OpenCode..."
echo ""

# Count of files to process
TOTAL_FILES=0
UPDATED_FILES=0

# Find all JavaScript test files
find test -name "*.js" -type f ! -path "*/node_modules/*" | while read -r file; do
  TOTAL_FILES=$((TOTAL_FILES + 1))
  
  # Check if file needs updating
  if grep -q "\.claude-code\|CLAUDE_CODE\|Claude Code\|open-autopm" "$file" 2>/dev/null; then
    echo "  Updating: $file"
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Apply replacements
    sed -i '' \
      -e 's/\.claude-code/\.opencode/g' \
      -e 's/CLAUDE_CODE/OPENCODE_ENV/g' \
      -e 's/"Claude Code"/"OpenCode"/g' \
      -e "s/'Claude Code'/'OpenCode'/g" \
      -e 's/open-autopm/opencode-autopm/g' \
      -e 's/claude-open-autopm/opencode-autopm/g' \
      "$file"
    
    # Remove backup if successful
    if [ $? -eq 0 ]; then
      rm "$file.bak"
      UPDATED_FILES=$((UPDATED_FILES + 1))
    else
      echo "  ❌ Error updating: $file"
      mv "$file.bak" "$file"
    fi
  fi
done

echo ""
echo "✅ Test file migration complete!"
echo "   Files processed: $TOTAL_FILES"
echo "   Files updated: $UPDATED_FILES"
