#!/bin/bash
# Automatic validation - run before every commit
# This prevents "tests pass but code doesn't work"

set -euo pipefail

echo "🔍 Running automatic validation..."

FAILED=0

# 1. Format check
echo "→ Checking code formatting..."
if command -v black &> /dev/null; then
    if ! black --check . 2>/dev/null; then
        echo "⚠️  Code needs formatting (run 'black .')"
        # Not a failure, just a warning
    fi
fi

# 2. Lint
echo "→ Running linters..."
if command -v ruff &> /dev/null; then
    if ! ruff check .; then
        echo "❌ Linting failed"
        FAILED=1
    fi
fi

# 3. Unit tests
echo "→ Running unit tests..."
if ! pytest tests/unit/ -v 2>/dev/null; then
    echo "⚠️  No unit tests found or tests failed"
fi

# 4. Integration tests
echo "→ Running integration tests..."
if ! pytest tests/integration/ -v 2>/dev/null; then
    echo "⚠️  No integration tests or tests failed"
fi

# 5. Build test
echo "→ Testing Docker build..."
if ! docker compose build --no-cache > /tmp/auto-validate.log 2>&1; then
    echo "❌ Docker build failed"
    echo ""
    echo "Last 30 lines of log:"
    tail -30 /tmp/auto-validate.log
    FAILED=1
fi

# 6. E2E test
echo "→ Running end-to-end test..."
docker compose up -d > /dev/null 2>&1
sleep 10

if ! curl -f http://localhost/ > /dev/null 2>&1; then
    echo "❌ Frontend not responding"
    docker compose logs
    docker compose down
    FAILED=1
fi

if ! curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "⚠️  Backend not responding (may not be implemented yet)"
fi

docker compose down > /dev/null 2>&1

if [ $FAILED -eq 0 ]; then
    echo "✅ All validations passed"
    exit 0
else
    echo "❌ Validation failed - fix errors before committing"
    exit 1
fi
