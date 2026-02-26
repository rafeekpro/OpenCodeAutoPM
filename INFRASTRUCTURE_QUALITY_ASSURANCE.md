# 🛡️ System Zabezpieczeń - "Always Works" Framework

## **Cel: Zero błędów typu "tests pass but code doesn't work"**

---

## **1. Automatyczne Testy Integracyjne (CI/CD)**

### **GitHub Actions Workflow**

Stwórz `.github/workflows/infrastructure-validation.yml`:

```yaml
name: Infrastructure Validation

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # Job 1: Test Docker builds
  test-docker:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Build Docker images
        run: |
          docker compose build --no-cache

      - name: Verify containers start
        run: |
          docker compose up -d

          # Wait for health checks
          timeout 60s bash -c 'until docker compose ps | grep -q "healthy"; do sleep 5; done'

      - name: Test endpoints (updated port configuration)
        run: |
          # Test frontend (port 58080)
          curl -f http://localhost:58080/ || exit 1

          # Test backend health (port 58000)
          curl -f http://localhost:58000/health || exit 1

      - name: Show logs on failure
        if: failure()
        run: |
          docker compose logs

      - name: Cleanup
        if: always()
        run: |
          docker compose down -v

  # Job 2: Run all tests
  test-suite:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Install Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install pytest pytest-cov

      - name: Run ALL tests (including integration)
        run: |
          # CRITICAL: Do NOT skip slow tests
          pytest -v --cov=.

      - name: Check coverage
        run: |
          # Require 80% coverage minimum
          pytest --cov= --cov-fail-under=80

  # Job 3: Validate configurations
  validate-configs:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Validate docker-compose syntax
        run: |
          docker compose config > /dev/null

      - name: Validate Kubernetes manifests
        run: |
          # Install kubectl
          curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/darwin/amd64/kubectl"
          chmod +x kubectl

          # Validate all manifests
          for manifest in manifests/**/*.yaml; do
            kubectl apply --dry-run=client -f "$manifest" || exit 1
          done

      - name: Validate Terraform
        run: |
          # Install terraform
          wget https://releases.hashicorp.com/terraform/0.15.0/terraform_0.15.0_linux_amd64.zip
          unzip terraform_0.15.0_linux_amd64.zip
          chmod +x terraform

          # Validate configuration
          cd terraform
          ../terraform init
          ../terraform validate
          ../terraform plan -out=tfplan
```

---

## **2. Lokalne Pre-commit Hooks**

### **Zaktualizuj `.git/hooks/pre-commit.d/docker-build-validation.sh`:**

```bash
#!/bin/bash
# Pre-commit hook: Maksymalna walidacja Docker

set -euo pipefail

echo "🐳 Validating Docker infrastructure..."

# Sprawdź czy zmieniono pliki Docker
if git diff --cached --name-only | grep -qE "(Dockerfile|docker-compose.yml|package\.json)"; then
    echo "📦 Docker changes detected"

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
        echo "📋 Build log:"
        tail -50 /tmp/docker-build.log
        echo ""
        echo "💡 Common fixes:"
        echo "   - package.json missing build script"
        echo "   - npm ci without package-lock.json → use npm install"
        echo "   - Dockerfile references non-existent files"
        exit 1
    fi
    echo "  ✅ Docker images built successfully"

    # 3. Sprawdź czy kontenery startują
    echo "  → Testing container startup..."
    if ! docker compose up -d > /dev/null 2>&1; then
        echo "❌ Containers failed to start"
        docker compose logs
        exit 1
    fi
    echo "  ✅ Containers started"

    # 4. Sprawdź health checki
    echo "  → Checking service health..."
    sleep 10  # Czekaj na start

    if docker compose ps | grep -q "Exit"; then
        echo "❌ Some containers exited unexpectedly"
        docker compose ps
        docker compose logs
        docker compose down
        exit 1
    fi
    echo "  ✅ All containers healthy"

    # 5. Cleanup
    echo "  → Cleaning up..."
    docker compose down
    echo "  ✅ Cleanup complete"
fi

echo "✅ Docker validation passed"
exit 0
```

---

## **3. Mandatory Test Template**

### **Utwórz szablon testów integracyjnych:**

**Plik:** `.opencode/templates/tests/integration-test-template.py`

```python
"""
MANDATORY Integration Test Template

ALL infrastructure changes MUST include tests that:
1. Build the actual artifact
2. Verify output is created
3. Test the artifact works as expected

NO EXCEPTIONS - NO FILE EXISTENCE TESTS ONLY
"""

import subprocess
import pytest
from pathlib import Path


class TestRealBuildFunctionality:
    """Test that build actually produces output."""

    def test_build_command_creates_output(self):
        """
        GIVEN the project with build configuration
        WHEN running the build command
        THEN it must create the expected output directory
        """
        # ... build steps ...

        # CRITICAL: Verify output was created
        output_dir = Path("dist")  # or "build", "out", etc.
        assert output_dir.exists(), (
            f"Build command did not create {output_dir}/ directory"
        )

        # Verify expected files exist
        expected_files = [
            output_dir / "index.html",
            # Add more required files
        ]

        for file in expected_files:
            assert file.exists(), f"Expected file not found: {file}"

    def test_docker_build_succeeds(self):
        """
        GIVEN the Dockerfile
        WHEN building the Docker image
        THEN the build must succeed
        """
        dockerfile = Path("Dockerfile")
        if not dockerfile.exists():
            pytest.skip("Dockerfile not created yet")

        # Build image
        result = subprocess.run(
            ["docker", "build", "-t", f"test-{dir}:latest", "."],
            capture_output=True,
            text=True,
            timeout=300  # 5 minutes
        )

        # CRITICAL: Build must succeed
        assert result.returncode == 0, (
            f"Docker build failed:\n{result.stderr}"
        )

        # Verify image exists
        result = subprocess.run(
            ["docker", "images", f"test-{dir}:latest"],
            capture_output=True,
            text=True
        )

        assert f"test-{dir}" in result.stdout, "Image not found after build"

    def test_container_runs_successfully(self):
        """
        GIVEN the built Docker image
        WHEN running the container
        THEN it must start and respond to health checks
        """
        # ... container startup code ...

        # CRITICAL: Container must respond
        response = subprocess.run(
            ["docker", "run", "--rm", "image", "curl", "-f", "http://localhost/"],
            capture_output=True,
            timeout=30
        )

        assert response.returncode == 0, "Container not responding"
```

---

## **4. Strict Code Review Checklist**

### **Dodaj do `.github/PULL_REQUEST_TEMPLATE.md`:**

```markdown
## Infrastructure Validation Checklist

### Docker Changes
- [ ] Docker images build successfully locally
- [ ] `docker compose up -d` starts all services
- [ ] All health checks pass
- [ ] Endpoints respond (curl tests)
- [ ] Integration tests updated

### Tests
- [ ] Real functionality tested (not just file existence)
- [ ] No `@pytest.mark.slow` on critical tests
- [ ] Tests use real tools (no mocks)
- [ ] CI/CD pipeline green

### Pre-commit
- [ ] Hooks installed (`make install-hooks`)
- [ ] Hooks block broken builds
- [ ] Manual `make validate` passes
```

---

## **5. Mandatory Documentation Standards**

### **Każdy tworzysz komponent infrastruktury:**

#### **A. README z sekcją "Testing":**

```markdown
## Testing

### Local Testing
\`\`\`bash
# 1. Test build
make test-docker

# 2. Start services
make docker-up

# 3. Verify
curl http://localhost
curl http://localhost:8000/health
\`\`\`

### Integration Tests
\`\`\`bash
# Run ALL tests (no skipping)
pytest tests/test_integration.py -v
\`\`\`

### Pre-commit Validation
\`\`\`bash
# Hooks automatically validate on commit
# To manually trigger:
make validate
\`\`\`
```

#### **B. FAILED test jako pierwsza rzecz:**

```markdown
## Development

### TDD Cycle (REQUIRED)

1. **Write FAILING test first**
   \`\`\`python
   # Test MUST fail with real error
   def test_feature_x():
       result = subprocess.run(["docker", "build", "."])
       assert result.returncode == 0  # Will fail initially
   \`\`\`

2. **Implement minimal code to pass**

3. **Verify ALL tests pass**
   \`\`\`bash
   pytest -v  # ALL tests, no skipping
   \`\`\`
```

---

## **6. Auto-Validation Framework**

### **Skrypt automatycznej walidacji:**

**Plik:** `.opencode/scripts/auto-validate.sh`

```bash
#!/bin/bash
# Automatic validation - run before every commit
# This prevents "tests pass but code doesn't work"

set -euo pipefail

echo "🔍 Running automatic validation..."

# 1. Format check
echo "→ Checking code formatting..."
if command -v black &> /dev/null; then
    black --check . || echo "⚠️  Code needs formatting"
fi

# 2. Lint
echo "→ Running linters..."
if command -v ruff &> /dev/null; then
    ruff check . || exit 1
fi

# 3. Build test
echo "→ Testing Docker build..."
docker compose build --no-cache || exit 1

# 4. Unit tests
echo "→ Running unit tests..."
pytest tests/unit/ -v || exit 1

# 5. Integration tests
echo "→ Running integration tests..."
pytest tests/integration/ -v || exit 1

# 6. E2E test
echo "→ Running end-to-end test..."
docker compose up -d
sleep 10
curl -f http://localhost/ || exit 1
curl -f http://localhost:8000/health || exit 1
docker compose down

echo "✅ All validations passed"
exit 0
```

---

## **7. Project Structure Standards**

### **Wymagana struktura dla każdego komponentu:**

```
component/
├── Dockerfile              # ✅ Multi-stage build
├── docker-compose.yml      # ✅ Service definition
├── package.json            # ✅ build script that creates output
├── tests/
│   ├── test_unit.py       # Unit tests
│   ├── test_integration.py # ✅ Integration tests (real tools)
│   └── test_e2e.py        # ✅ End-to-end tests
├── README.md               # ✅ Testing section
└── .dockerignore           # Optimization
```

### **Test Coverage Requirements:**

```python
# tests/test_component_integration.py

class TestComponentIntegration:
    """REQUIRED: Test real functionality."""

    def test_build_creates_output():
        """✅ REQUIRED: Output directory created"""
        pass

    def test_docker_image_builds():
        """✅ REQUIRED: Real docker build succeeds"""
        pass

    def test_container_starts():
        """✅ REQUIRED: Container runs and responds"""
        pass

    def test_no_file_existence_only_tests():
        """✅ REQUIRED: No tests that only check Path().exists()"""
        # This test enforces the rule
        test_file = Path(__file__)
        content = test_file.read_text()

        # Find all test methods
        import re
        test_methods = re.findall(r'def (test_\w+)\(', content)

        for method in test_methods:
            # Check if test only does Path().exists()
            method_content = re.search(
                rf'def {method}\(self.*?\):(.*?)(?=\n    def|\nclass|\Z)',
                content,
                re.DOTALL
            )

            if method_content:
                code = method_content.group(1)

                # If test only has assert Path().exists()
                if re.search(r'assert.*Path.*\.exists\(\)', code) and \
                   len(re.findall(r'assert', code)) == 1:
                    raise AssertionError(
                        f"Test {method} only checks file existence. "
                        f"Must test real functionality with subprocess.run()"
                    )
```

---

## **8. CI/CD Quality Gates**

### **GitHub Actions - Mandatory Checks:**

```yaml
# .github/workflows/quality-gate.yml
name: Quality Gate

on:
  pull_request:
    branches: [main]

jobs:
  quality-gate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      # Gate 1: Real build tests
      - name: Infrastructure must build
        run: |
          docker compose build --no-cache

      # Gate 2: Real functionality tests
      - name: Integration tests must pass
        run: |
          pytest tests/integration/ -v --tb=short

      # Gate 3: No file-existence-only tests
      - name: Verify real tests
        run: |
          # Check for bad test patterns
          if grep -r "assert Path.*\.exists()" tests/; then
            echo "❌ Found file-existence-only tests"
            echo "   Tests must verify real functionality"
            grep -r "assert Path.*\.exists()" tests/
            exit 1
          fi

      # Gate 4: Coverage threshold
      - name: Minimum coverage
        run: |
          pytest --cov= --cov-fail-under=80
```

---

## **9. Development Workflow Rules**

### **Zasady pracy (CLAUDE.md rules update):**

```markdown
## Infrastructure Development Rules

### Rule 1: TDD is NON-NEGOTIABLE
- Write FAILING test first (RED)
- Test MUST verify real functionality
- Use real tools, never mocks

### Rule 2: Test Levels Required
Every infrastructure component MUST have:
1. Unit tests (configuration validation)
2. Integration tests (real build)
3. E2E tests (container starts and responds)

### Rule 3: No "Works on My Machine"
- Docker MUST build in CI
- Tests MUST pass in CI
- No local-only configurations

### Rule 4: Pre-commit Hooks Required
- Hooks MUST validate Docker builds
- Hooks MUST block broken code
- No bypassing hooks

### Rule 5: Documentation Required
Every component MUST document:
- How to test locally
- What integration tests exist
- How to verify it works
```

---

## **10. Monitoring and Alerts**

### **Health Check Dashboard:**

```python
# scripts/health-check.py
import subprocess
import requests

def check_docker():
    """Check Docker is running"""
    result = subprocess.run(["docker", "ps"], capture_output=True)
    return result.returncode == 0

def check_containers():
    """Check all containers healthy"""
    result = subprocess.run(
        ["docker", "compose", "ps"],
        capture_output=True,
        text=True
    )

    if "Exit" in result.stdout:
        return False

    # All healthy?
    return result.stdout.count("healthy") == 4  # Adjust for your services

def check_endpoints():
    """Check all endpoints respond"""
    endpoints = [
        "http://localhost:8000/health",
        "http://localhost/"
    ]

    for endpoint in endpoints:
        try:
            response = requests.get(endpoint, timeout=5)
            if response.status_code != 200:
                return False
        except:
            return False

    return True

def main():
    """Run all health checks"""
    checks = {
        "Docker": check_docker(),
        "Containers": check_containers(),
        "Endpoints": check_endpoints()
    }

    all_healthy = all(checks.values())

    print("\n🏥 Health Check Results:")
    for name, healthy in checks.items():
        status = "✅" if healthy else "❌"
        print(f"  {status} {name}")

    return 0 if all_healthy else 1

if __name__ == "__main__":
    exit(main())
```

---

## **11. Fail-Fast Development**

### **Makefile ze sprawdzaniem:**

```makefile
.PHONY: validate

validate: ## Run ALL validations
	@echo "🔍 Running complete validation..."
	@$(MAKE) test
	@$(MAKE) test-docker
	@$(MAKE) test-e2e
	@echo "✅ All validations passed"

test-e2e: ## End-to-end test
	@echo "🧪 Testing end-to-end..."
	docker compose up -d
	@sleep 10
	@curl -f http://localhost/ || $(MAKE) cleanup-and-fail
	@curl -f http://localhost:8000/health || $(MAKE) cleanup-and-fail
	docker compose down
	@echo "✅ E2E tests passed"

cleanup-and-fail:
	@echo "❌ E2E test failed"
	docker compose logs
	docker compose down
	@exit 1
```

---

## **12. Mandatory PR Template**

### **GitHub Pull Request Template:**

```markdown
## Infrastructure Changes

### What changed
- Dockerfile updated
- docker-compose.yml modified
- Added new service

### Testing Performed
- [ ] Local `docker compose up` successful
- [ ] `make test` all passing
- [ ] `make validate` successful
- [ ] Integration tests pass (100%)

### Integration Tests Added
- [ ] `test_build_creates_output()` - ✅
- [ ] `test_docker_build_succeeds()` - ✅
- [ ] `test_container_responds()` - ✅

### CI/CD Status
- [ ] GitHub Actions: ✅ Green
- [ ] All quality gates: ✅ Passed

### Breaking Changes
- [ ] None / [ ] Describe here

### Rollback Plan
If this breaks production:
1. Revert commit
2. `docker compose down`
3. `git checkout previous-version`
4. `docker compose up -d`
```

---

## **13. Continuous Monitoring**

### **Slack/Discord Webhook Alert:**

```python
# scripts/alert-on-failure.py
import requests
import subprocess

def check_and_alert():
    """Run tests and alert on failure"""
    result = subprocess.run(
        ["pytest", "-v"],
        capture_output=True
    )

    if result.returncode != 0:
        # Send alert
        webhook_url = "YOUR_SLACK_WEBHOOK"

        payload = {
            "text": (
                "❌ *Infrastructure Tests Failed*\n"
                "Branch: main\n"
                "Commit: $(git rev-parse HEAD)\n\n"
                "```"
                f"{result.stdout}\n"
                f"{result.stderr}"
                "```"
            )
        }

        requests.post(webhook_url, json=payload)
```

---

## **14. Documentation: ALWAYS UP-TO-DATE**

### **Automated documentation validation:**

```bash
# .git/hooks/pre-commit.d/docs-validation.sh
#!/bin/bash

# Check if README has Testing section
if ! grep -q "## Testing" README.md; then
    echo "❌ README.md missing '## Testing' section"
    echo "   Documentation required for all infrastructure"
    exit 1
fi

# Check if Testing section has commands
if ! grep -A 10 "## Testing" README.md | grep -q "docker compose up"; then
    echo "❌ README.md missing docker compose command in Testing section"
    exit 1
fi
```

---

## **15. Zero-Tolerance Policy**

### **W .opencode/rules/infrastructure-quality.md:**

```markdown
# Infrastructure Quality Rule

## Violations

### Level 1: Critical (BLOCK MERGE)
- File-existence-only tests
- Tests marked @pytest.mark.slow
- Mocked infrastructure tools
- No integration tests
- **Action:** PR rejected, must fix

### Level 2: Major (MUST FIX)
- Missing pre-commit hooks
- Docker build fails in CI
- Documentation incomplete
- **Action:** Comment on PR, block merge

### Level 3: Minor (SHOULD FIX)
- Suboptimal Docker layers
- Missing health checks
- **Action:** Suggest improvements
```

---

## **📋 Implementation Checklist**

Skopiuj i wklej do projektu:

### **Immediate (Today):**
- [ ] Dodaj `.github/workflows/infrastructure-validation.yml`
- [ ] Zaktualizuj `.git/hooks/pre-commit.d/docker-build-validation.sh`
- [ ] Dodaj `tests/test_frontend_build.py` (jeśli nie ma)
- [ ] Dodaj `Makefile` z `make validate`

### **This Week:**
- [ ] Stwórz `.opencode/templates/tests/integration-test-template.py`
- [ ] Dodaj `.github/PULL_REQUEST_TEMPLATE.md`
- [ ] Zaktualizuj `CLAUDE.md` z zasadami

### **Ongoing:**
- [ ] Wszystkie PR muszą przejść `make validate`
- [ ] CI/CD automatycznie testuje Docker builds
- [ ] Alerts przy awariach

---

## **✅ Summary: System Zabezpieczeń**

1. **Automatyczne testy w CI/CD** - GitHub Actions
2. **Pre-commit hooks** - Blokują złe commity
3. **Szablon testów** - Wymagają real functionality
4. **Strict PR template** - Weryfikacja przed merge
5. **Monitoring** - Automatyczne alerty
6. **Dokumentacja** - Jak testować
7. **Zero-tolerance** - Żłe testy = rejected PR

**Efekt:** "Tests pass but code doesn't work" stanie się niemożliwe! 🎉

---

**Created:** 2026-02-26
**Status:** Ready to implement
**Priority:** CRITICAL
