#!/bin/bash
# Pre-commit hook: Maksymalna walidacja Docker
# Blokuje commity które łamią Docker builds

set -euo pipefail

echo "🐳 Validating Docker infrastructure..."

# Sprawdź czy zmieniono pliki Docker
if git diff --cached --name-only | grep -qE "(Dockerfile|docker-compose.yml|package\.json|package-lock\.json)"; then
    echo "📦 Docker/infrastructure changes detected"

    # 1. Walidacja syntaxu docker-compose
    echo "  → Validating docker-compose.yml syntax..."
    if ! docker compose config > /dev/null 2>&1; then
        echo "❌ docker-compose.yml has syntax errors"
        docker compose config
        exit 1
    fi
    echo "  ✅ docker-compose.yml syntax valid"

    # 2. Zbuduj obrazy bez cache
    echo "  → Building Docker images (no cache)..."
    if ! docker compose build --no-cache > /tmp/docker-build.log 2>&1; then
        echo "❌ Docker build failed"
        echo ""
        echo "📋 Last 50 lines of build log:"
        tail -50 /tmp/docker-build.log
        echo ""
        echo "💡 Common fixes:"
        echo "   - package.json missing build script"
        echo "   - npm ci without package-lock.json → use npm install"
        echo "   - Dockerfile references non-existent files"
        echo "   - COPY --from=builder with missing directory"
        exit 1
    fi
    echo "  ✅ Docker images built successfully"

    # 3. Sprawdź czy kontenery startują
    echo "  → Testing container startup..."
    if ! docker compose up -d > /tmp/docker-startup.log 2>&1; then
        echo "❌ Containers failed to start"
        echo ""
        echo "📋 Startup logs:"
        tail -30 /tmp/docker-startup.log
        docker compose logs --tail=50
        exit 1
    fi
    echo "  ✅ Containers started"

    # 4. Czekaj na health checki
    echo "  → Waiting for health checks..."
    sleep 15  # Czekaj na start usług

    # Sprawdź status
    if docker compose ps | grep -q "Exit"; then
        echo "❌ Some containers exited unexpectedly"
        echo ""
        docker compose ps
        echo ""
        echo "📋 Container logs:"
        docker compose logs --tail=100
        docker compose down
        exit 1
    fi

    # Sprawdź healthy
    healthy_count=$(docker compose ps | grep -c "healthy" || echo "0")
    total_count=$(docker compose ps | grep -c "Up" || echo "0")

    if [ "$healthy_count" -lt "$total_count" ]; then
        echo "⚠️  Warning: Not all containers are healthy yet"
        echo "   Healthy: $healthy_count/$total_count"
    else
        echo "  ✅ All containers healthy"
    fi

    # 5. Test endpointów (jeśli kontenery mają porty)
    if docker compose ps | grep -q "0.0.0.0:80->"; then
        echo "  → Testing frontend endpoint..."
        if ! curl -f http://localhost/ > /dev/null 2>&1; then
            echo "❌ Frontend not responding"
            docker compose logs frontend
            docker compose down
            exit 1
        fi
        echo "  ✅ Frontend responding"
    fi

    if docker compose ps | grep -q "0.0.0.0:8000->"; then
        echo "  → Testing backend endpoint..."
        if ! curl -f http://localhost:8000/health > /dev/null 2>&1; then
            echo "❌ Backend not responding"
            docker compose logs backend
            docker compose down
            exit 1
        fi
        echo "  ✅ Backend responding"
    fi

    # 6. Cleanup
    echo "  → Cleaning up..."
    docker compose down
    echo "  ✅ Cleanup complete"
fi

echo "✅ Docker validation passed"
exit 0
