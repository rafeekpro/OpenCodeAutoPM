#!/bin/bash
# Pre-commit hook: Check if required ports are available
# Blocks commits if ports are already allocated

set -euo pipefail

echo "🔍 Checking port availability..."

# Define ports to check
declare -A PORTS=(
    [58000]="Backend API"
    [58080]="Frontend"
    [54320]="PostgreSQL"
    [56379]="Redis"
)

PORTS_BUSY=0

for port in "${!PORTS[@]}"; do
    service="${PORTS[$port]}"

    # Check if port is in use
    if lsof -ti ":$port" >/dev/null 2>&1; then
        PID=$(lsof -ti ":$port")
        echo "❌ Port $port ($service) is already in use by PID $PID"

        # Try to get process name
        if command -v ps >/dev/null 2>&1; then
            PROCESS=$(ps -p $PID -o comm= 2>/dev/null || echo "unknown")
            echo "   Process: $PROCESS (PID: $PID)"
        fi

        PORTS_BUSY=$((PORTS_BUSY + 1))
    fi
done

if [ $PORTS_BUSY -gt 0 ]; then
    echo ""
    echo "💡 Solutions:"
    echo "   1. Stop the conflicting service"
    echo "   2. Use different ports in docker-compose.yml"
    echo "   3. Kill the process: kill -9 $PID"
    echo ""
    echo "🚫 Commit blocked until ports are available"
    exit 1
fi

echo "✅ All required ports are available"
exit 0
