# Infrastructure Quality Rule

## **Purpose:**
Ensure "always works" infrastructure - zero tolerance for "tests pass but code doesn't work".

## **Quality Violations:**

### **Level 1: CRITICAL (BLOCK MERGE)**
These violations MUST be fixed before PR can be merged:

1. **File-existence-only tests**
   - ❌ `assert Path("Dockerfile").exists()`
   - ✅ `subprocess.run(["docker", "build", "."])`
   - **Action:** Reject PR, add real functionality tests

2. **Tests marked `@pytest.mark.slow`**
   - ❌ Integration tests skipped in CI
   - ✅ All tests run in CI
   - **Action:** Remove marker, explain importance

3. **Mocked infrastructure tools**
   - ❌ `mocker.patch("subprocess.run")`
   - ✅ Real `subprocess.run()` calls
   - **Action:** Use real tools, remove mocks

4. **No integration tests**
   - ❌ Only unit tests for infrastructure
   - ✅ Real build/run tests
   - **Action:** Add integration tests

### **Level 2: MAJOR (MUST FIX)**
These issues MUST be fixed but PR may stay open:

1. **Missing pre-commit hooks**
   - Hooks not installed
   - Hook doesn't validate Docker builds
   - **Action:** Run `make install-hooks`

2. **Docker build fails in CI**
   - Works locally but fails in CI
   - **Action:** Check environment differences

3. **Documentation incomplete**
   - README missing testing section
   - No "how to verify" instructions
   - **Action:** Update documentation

### **Level 3: MINOR (SHOULD FIX)**
Improvements recommended but not blocking:

1. **Suboptimal Docker layers**
   - Can optimize caching
   - **Action:** Suggest improvements in PR review

2. **Missing health checks**
   - Container has no HEALTHCHECK
   - **Action:** Add health checks

3. **Missing error handling**
   - Build scripts don't handle errors
   - **Action:** Add error handling

## **Enforcement:**

### **Pre-commit (Automatic):**
```bash
#!/bin/bash
# Check for file-existence-only tests
if grep -r "assert Path.*\.exists()" tests/; then
    echo "❌ File-existence-only tests detected"
    echo "   Use subprocess.run() to test real functionality"
    exit 1
fi
```

### **CI/CD (Automatic):**
```yaml
# GitHub Actions will fail if:
- Docker build fails
- Integration tests fail
- @pytest.mark.slow found on critical tests
- File-existence-only tests detected
```

### **PR Review (Manual):**
- Review checklist must be completed
- All tests must pass
- Documentation must be updated
- Someone must approve

## **Zero-Tolerance Policy:**

If you see ANY of these, immediately block merge:

1. **"Tests pass" but `docker compose up` fails**
   - Tests are fake
   - Require real integration tests

2. **Commit message: "fix tests"**
   - Indicates tests were broken
   - Review test strategy

3. **PR touches Docker without CI validation**
   - Missing GitHub Actions workflow
   - Add infrastructure validation job

## **Prevention Checklist:**

Before creating PR:

- [ ] `make validate` passes locally
- [ ] Integration tests added/updated
- [ ] README updated with testing section
- [ ] No `@pytest.mark.slow` on new tests
- [ ] Pre-commit hooks installed and working
- [ ] Docker build tested with `--no-cache`

## **Remediation Process:**

If critical violation found:

1. **Comment on PR** with specific violation
2. **Link to this rule document**
3. **Suggest fix** with example code
4. **Block merge** until fixed
5. **Re-review** after fix

## **Examples:**

### ❌ VIOLATION:
```python
def test_dockerfile_exists():
    assert Path("Dockerfile").exists()  # BAD
```

**Comment:**
> This test only checks file existence. It passes even if Dockerfile is broken.
>
> **Fix:** Use `subprocess.run(["docker", "build", "."])` to test real build.
>
> **Reference:** `.opencode/rules/infrastructure-quality.md`

### ✅ CORRECT:
```python
def test_docker_build_succeeds():
    result = subprocess.run(["docker", "build", "."])
    assert result.returncode == 0, f"Build failed: {result.stderr}"
```

## **Monitoring:**

Track violations over time:
- Number of rejected PRs per week
- Most common violation types
- Teams with best compliance

---

**Enforcement Level:** MANDATORY
**Review Frequency:** Every PR
**Effective Date:** 2026-02-26
