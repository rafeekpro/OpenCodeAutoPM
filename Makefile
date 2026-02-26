.PHONY: help test test-all test-docker test-integration docker-build docker-up docker-down install-hooks validate

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

test: ## Run all tests (including slow/integration - REQUIRED)
	@echo "🧪 Running ALL tests..."
	pytest -v

test-quick: ## Run quick tests only (skip slow/integration)
	@echo "⚡ Running quick tests only..."
	pytest -v -m "not slow"

test-docker: ## Test Docker builds (REQUIRED validation)
	@echo "🐳 Testing Docker builds..."
	docker compose build --no-cache
	@echo "✅ Docker builds successful"

test-integration: ## Run integration tests
	@echo "🔗 Running integration tests..."
	pytest -v -m "integration"

test-e2e: ## End-to-end test (start containers, test endpoints, stop)
	@echo "🧪 Testing end-to-end..."
	docker compose up -d
	@sleep 10
	@curl -f http://localhost:58080 || $(MAKE) cleanup-and-fail
	@curl -f http://localhost:58000/health || $(MAKE) cleanup-and-fail
	docker compose down
	@echo "✅ E2E tests passed"

docker-build: ## Build Docker images
	docker compose build

docker-up: ## Start development environment
	docker compose up -d
	@echo "✅ Services started:"
	@echo "  → Backend:  http://localhost:58000"
	@echo "  → Frontend: http://localhost:58080"
	@echo "  → PostgreSQL: localhost:54320"
	@echo "  → Redis: localhost:56379"
	@echo "  → Logs: docker compose logs -f"

docker-down: ## Stop development environment
	docker compose down
	@echo "✅ Services stopped"

docker-logs: ## Show service logs
	docker compose logs -f

docker-clean: ## Remove all containers, images, volumes
	docker compose down -v --rmi all
	@echo "✅ Cleaned up Docker resources"

install-hooks: ## Install Git pre-commit hooks
	@echo "🔧 Installing Git hooks..."
	bash .opencode/scripts/install-git-hooks.sh

validate: ## Run all validation (tests + Docker + E2E)
	@echo "🔍 Running full validation..."
	@$(MAKE) test
	@$(MAKE) test-docker
	@$(MAKE) test-e2e
	@echo "✅ All validations passed"

ci: ## Run CI checks (same as validate)
	$(MAKE) validate

cleanup-and-fail:
	@echo "❌ E2E test failed"
	docker compose logs --tail=100
	docker compose down
	@exit 1
