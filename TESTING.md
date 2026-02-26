# Testing Strategy

## **Critical Rule: Test Functionality, Not Files**

### **❌ WRONG: Testing file existence only**
```python
def test_dockerfile_exists():
    assert Path("Dockerfile").exists()  # File exists? OK
    # BUT: Does it work? Unknown!
```

### **✅ CORRECT: Testing actual functionality**
```python
def test_docker_image_builds():
    result = subprocess.run(["docker", "build", "."])
    assert result.returncode == 0  # Image builds? Verified!
```

---

## **Test Categories**

### **1. Unit Tests (Quick)**
- Test individual functions/classes
- No external dependencies
- Run in milliseconds
- Example: `test_parse_config_file()`

### **2. Integration Tests (Required)**
- Test actual functionality
- Use real tools (Docker, kubectl, etc.)
- Take longer but REQUIRED
- Example: `test_docker_image_builds()`
- **DO NOT mark these as `@pytest.mark.slow` - they are REQUIRED**

### **3. End-to-End Tests (Slow)**
- Test complete workflows
- May take minutes
- Example: `test_full_deployment_pipeline()`

---

## **Test Execution**

### **Always Run ALL Tests**
```bash
# ✅ CORRECT: Run everything
make test
pytest -v

# ❌ WRONG: Skip integration tests
pytest -v -m "not slow"  # This misses real bugs!
```

### **Quick Development Cycle**
```bash
# During rapid development, you MAY skip slow tests
make test-quick
pytest -v -m "not slow"

# But ALWAYS run full tests before committing!
make test
```

---

## **Pre-Commit Validation**

Git hooks automatically run before each commit:

```bash
# Attempting to commit broken code
git commit -m "feat: update Dockerfile"

# Pre-commit hook runs:
→ Running docker-build-validation.sh...
  → Testing docker-compose syntax...
  ❌ docker-compose.yml syntax error
     Fix errors before committing

# Commit blocked until fixed ✅
```

---

## **Common Testing Anti-Patterns**

### **❌ Anti-Pattern #1: Testing Structure, Not Behavior**
```python
# BAD: Only checks file exists
def test_dockerfile_exists():
    assert Path("Dockerfile").exists()

# GOOD: Actually builds image
def test_dockerfile_works():
    result = subprocess.run(["docker", "build", "."])
    assert result.returncode == 0
```

### **❌ Anti-Pattern #2: Mocking External Tools**
```python
# BAD: Mocks docker command
def test_docker_build(mocker):
    mocker.patch("subprocess.run", return_value=0)
    # Always passes, never tests reality

# GOOD: Uses real docker
def test_docker_build():
    result = subprocess.run(["docker", "build", "."])
    assert result.returncode == 0
```

### **❌ Anti-Pattern #3: Skipping Integration Tests**
```python
# BAD: Marked as slow, never run
@pytest.mark.slow
def test_critical_functionality():
    ...

# GOOD: Always run
def test_critical_functionality():
    ...
```

---

## **TDD Cycle (Required)**

### **1. 🔴 RED: Write Failing Test**
```python
def test_docker_image_builds():
    result = subprocess.run(["docker", "build", "."])
    assert result.returncode == 0  # ❌ Will fail initially
```

### **2. ✅ GREEN: Make Test Pass**
```dockerfile
# Fix Dockerfile until build succeeds
FROM node:20-alpine
RUN npm install  # Fixed from npm ci
```

### **3. ♻️ REFACTOR: Improve While Tests Stay Green**
```dockerfile
# Optimize build while tests pass
RUN npm ci --only=production  # Tests still green? Yes!
```

---

## **CI/CD Integration**

### **GitHub Actions Workflow**
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run ALL tests
        run: |
          make test
          make test-docker
```

**Critical:** CI must run ALL tests, not skip "slow" ones.

---

## **Testing Checklist**

Before committing code, verify:

- [ ] ALL tests pass (`make test`)
- [ ] Integration tests run (not skipped)
- [ ] Docker builds work (`make test-docker`)
- [ ] No `@pytest.mark.slow` on critical tests
- [ ] Pre-commit hooks enabled (`make install-hooks`)

---

## **Learn From Our Mistake**

**What went wrong:**
- Tests marked as `@pytest.mark.slow` were skipped
- Agent reported "100% tests passing" but only ran file-checking tests
- Docker build failed when user tried `docker compose up`

**How we fixed it:**
1. Removed `@pytest.mark.slow` from integration tests
2. Added pre-commit hooks to test Docker builds
3. Updated pytest.ini to always run all tests
4. Created Makefile with proper test commands
5. Documented testing strategy (this file)

**Remember:**
> **"Tested" means it actually works, not just that files exist.**
