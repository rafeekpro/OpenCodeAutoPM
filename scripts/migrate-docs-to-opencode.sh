#!/bin/bash

# OpenCode Migration Script - Documentation Files
# Updates all references from Claude Code to OpenCode

echo "🔄 Migrating documentation files to OpenCode..."
echo ""

# Count of files to process
TOTAL_FILES=0
UPDATED_FILES=0

# Find all markdown files in docs-site/docs
find docs-site/docs -name "*.md" -type f | while read -r file; do
  TOTAL_FILES=$((TOTAL_FILES + 1))
  
  # Check if file needs updating
  if grep -q "Claude Code\|claude-code\|\.claude-code\|open-autopm" "$file" 2>/dev/null; then
    echo "  Updating: $file"
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Apply replacements
    sed -i '' \
      -e 's/Claude Code/OpenCode/g' \
      -e 's/claude-code/opencode/g' \
      -e 's/ClaudeAutoPM/OpenCodeAutoPM/g' \
      -e 's/\.claude-code\//\.opencode\//g' \
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
echo "✅ Documentation migration complete!"
echo "   Files processed: $TOTAL_FILES"
echo "   Files updated: $UPDATED_FILES"
