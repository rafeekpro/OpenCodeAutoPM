#!/bin/bash
# OpenCodeAutoPM Infrastructure Pre-commit Hooks Installer
# Installs all required infrastructure validation hooks

set -euo pipefail

HOOKS_DIR=".git/hooks/pre-commit.d"
SCRIPTS_DIR=".opencode/scripts/hooks"

echo "🔧 Installing OpenCodeAutoPM infrastructure hooks..."

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# Define hooks to install
declare -A HOOKS=(
    ["docker-build-validation"]="docker-build-validation.sh"
    ["check-ports"]="check-ports.sh"
)

# Copy each hook
for hook_name in "${!HOOKS[@]}"; do
    hook_script="${HOOKS[$hook_name]}"
    source_path="$SCRIPTS_DIR/$hook_script"
    target_path="$HOOKS_DIR/$hook_script"

    if [ -f "$source_path" ]; then
        cp "$source_path" "$target_path"
        chmod +x "$target_path"
        echo "✅ Installed: $hook_name"
    else
        echo "⚠️  Warning: $source_path not found, skipping $hook_name"
    fi
done

# Create main pre-commit hook if it doesn't exist
MAIN_HOOK=".git/hooks/pre-commit"
if [ ! -f "$MAIN_HOOK" ] || ! grep -q "pre-commit.d" "$MAIN_HOOK"; then
    cat > "$MAIN_HOOK" << 'EOF'
#!/bin/bash
# OpenCodeAutoPM Pre-commit Hook
# Runs all validation scripts from pre-commit.d

HOOKS_DIR="$(git rev-parse --git-dir)/hooks/pre-commit.d"

if [ -d "$HOOKS_DIR" ]; then
    for hook in "$HOOKS_DIR"/*.sh; do
        if [ -x "$hook" ]; then
            "$hook" || exit 1
        fi
    done
fi

exit 0
EOF
    chmod +x "$MAIN_HOOK"
    echo "✅ Created main pre-commit hook"
fi

echo ""
echo "🎉 Infrastructure hooks installed successfully!"
echo ""
echo "📋 Installed hooks:"
for hook_name in "${!HOOKS[@]}"; do
    echo "   - $hook_name"
done
echo ""
echo "⚠️  Important: These hooks will:"
echo "   - Block commits if Docker builds fail"
echo "   - Block commits if required ports are in use"
echo "   - Validate infrastructure before allowing commits"
echo ""
echo "💡 To bypass temporarily: git commit --no-verify"
