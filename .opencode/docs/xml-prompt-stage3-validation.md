# XML Structured Prompting - Stage 3 Validation

## 🚨 Nowy Template: Stage 3 - Infrastructure Validation

### **Problem który rozwiązuje:**

**Przed:**
```bash
$ pytest
✅ 26 tests passed (tylko sprawdził pliki)

$ docker compose up
❌ ERROR: npm ci failed (brak package-lock.json)
```

**Po:**
```bash
$ git commit -m "feat: coś"
→ Running docker-build-validation.sh...
❌ Build failed
   Fix errors before committing

# Commit ZABLOKOWANY! ✅
```

---

## 📁 Nowe Pliki

### **1. Template: Stage 3 Infrastructure Validation**
**Plik:** `.opencode/templates/xml-prompts/dev/stage3-infrastructure-validation.xml`

Główny template do walidacji infrastruktury z rzeczywistymi testami funkcjonalności.

### **2. Example: Docker Validation**
**Plik:** `.opencode/templates/xml-prompts/dev/EXAMPLE-docker-validation.xml`

Kompletny przykład pokazujący jak użyć Stage 3 template dla Docker.

### **3. Zaktualizowany Registry**
**Plik:** `.opencode/templates/xml-prompts/TEMPLATE_REGISTRY.md`

Dodana dokumentacja Stage 3 template.

---

## 🎯 Kluczowe Cechi Stage 3 Template

### **1. Test Rzeczywistej Funkcjonalności**
```xml
<testing_requirements>
  <test_real_functionality>
    REQUIRED - Test MUST verify actual functionality
  </test_real_functionality>

  <test_pattern>
    ❌ FORBIDDEN: assert Path("Dockerfile").exists()
    ✅ REQUIRED: subprocess.run(["docker", "build", "."])
  </test_pattern>
</testing_requirements>
```

### **2. Zakaz Pomijania Testów Integracyjnych**
```xml
<no_slow_marker>
  TRUE - Do NOT use @pytest.mark.slow on integration tests
  Integration tests MUST run in CI
</no_slow_marker>
```

### **3. Pre-commit Hooki**
```xml
<pre_commit_hooks>
  <hook name="docker-build-validation">
    <action>Test docker-compose config syntax</action>
    <action>Build Docker images without cache</action>
    <action>Block commit if build fails</action>
  </hook>
</pre_commit_hooks>
```

### **4. Zakaz Mocków**
```xml
<no_mocks>
  TRUE - Use real tools (docker, kubectl, terraform)
  Mocks prohibited for infrastructure validation
</no_mocks>
```

---

## 🚀 Jak Używać

### **Metoda 1: Użyj Template bezpośrednio**

```bash
# Wczytaj template
cat .opencode/templates/xml-prompts/dev/stage3-infrastructure-validation.xml

# Edytuj dla swojego taska
# Zastęp {{task}}, {{context}}, {{requirements}} itd.

# Uruchom agenta z template
Task tool → agent: docker-containerization-expert
Prompt: "Use XML template from stage3-infrastructure-validation.xml
         to validate Docker setup for Weekend Insight"
```

### **Metoda 2: Użyj Example jako wzorzec**

```bash
# Otwórz example
cat .opencode/templates/xml-prompts/dev/EXAMPLE-docker-validation.xml

# Skopiuj i edytuj dla swojego przypadku
cp EXAMPLE-docker-validation.xml my-validation.xml

# Dostosuj sekcje:
# - <task> - opis taska
# - <requirements> - wymagania
# - <agent_context> - kontekst agenta
```

### **Metoda 3: Integracja z taskiem**

W pliku tasku (np. `.opencode/epics/.../task.md`):

```yaml
---
xml_prompt: .opencode/templates/xml-prompts/dev/stage3-infrastructure-validation.xml
agent_context:
  validation_type: docker
  test_real_functionality: true
---
```

---

## 📋 Struktura XML Prompt

### **Sekcje obowiązkowe:**

#### **1. Testing Requirements**
```xml
<testing_requirements>
  <test_real_functionality>REQUIRED</test_real_functionality>
  <test_pattern>
    ❌ FORBIDDEN: co jest zabronione
    ✅ REQUIRED: co jest wymagane
  </test_pattern>
  <no_slow_marker>TRUE</no_slow_marker>
  <no_mocks>TRUE</no_mocks>
</testing_requirements>
```

#### **2. Forbidden Testing Patterns**
```xml
<forbidden_test_patterns>
  <pattern>
    <name>File Existence Only</name>
    <anti_example>assert Path("file").exists()</anti_example>
    <why>Dlaczego to jest złe</why>
  </pattern>
</forbidden_test_patterns>
```

#### **3. Testing Sequence (TDD)**
```xml
<testing_sequence>
  <step order="1">
    <phase>RED - Write Failing Test</phase>
    <action>Co robi test</action>
    <expectation>Test zawodzi</expectation>
  </step>
  <step order="2">
    <phase>GREEN - Make Test Pass</phase>
    <action>Jak naprawić</action>
    <expectation>Test przechodzi</expectation>
  </step>
  <!-- ... -->
</testing_sequence>
```

#### **4. Deliverables**
```xml
<deliverables>
  <deliverable>
    <name>Real Functionality Tests</name>
    <tests>
      <test>test_docker_builds()</test>
      <test>test_kubectl_apply()</test>
    </tests>
    <format>pytest</format>
    <required>YES</required>
  </deliverable>
</deliverables>
```

#### **5. Quality Gates**
```xml
<quality_gates>
  <gate name="Docker Build">
    <command>docker compose build --no-cache</command>
    <failure>Block commit, show error</failure>
  </gate>
</quality_gates>
```

---

## 🎓 Przykłady Użycia

### **Przykład 1: Docker Walidacja**

```xml
<task>Validate Docker containerization</task>

<requirements>
  <requirement>All Dockerfiles must build successfully</requirement>
  <requirement>docker-compose.yml must be syntactically valid</requirement>
  <requirement>Services must respond to health checks</requirement>
</requirements>

<testing_requirements>
  <test_real_functionality>REQUIRED</test_real_functionality>
  <test_pattern>
    ✅ subprocess.run(["docker", "build", "."])
    ❌ assert Path("Dockerfile").exists()
  </test_pattern>
</testing_requirements>

<deliverables>
  <deliverable>
    <name>Real Build Tests</name>
    <test>test_backend_image_builds()</test>
    <test>test_frontend_image_builds()</test>
  </deliverable>
</deliverables>
```

### **Przykład 2: Kubernetes Walidacja**

```xml
<task>Validate Kubernetes manifests</task>

<requirements>
  <requirement>All manifests must be syntactically valid</requirement>
  <requirement>kubectl apply --dry-run must succeed</requirement>
  <requirement>Resources must be within limits</requirement>
</requirements>

<testing_requirements>
  <test_real_functionality>REQUIRED</test_real_functionality>
  <test_pattern>
    ✅ subprocess.run(["kubectl", "apply", "--dry-run", "-f", file])
    ❌ assert Path("manifest.yaml").exists()
  </test_pattern>
</testing_requirements>

<deliverables>
  <deliverable>
    <name>K8s Validation Tests</name>
    <test>test_manifest_dry_run()</test>
    <test>test_resource_limits()</test>
  </deliverable>
</deliverables>
```

### **Przykład 3: Terraform Walidacja**

```xml
<task>Validate Terraform configuration</task>

<requirements>
  <requirement>terraform plan must validate without errors</requirement>
  <requirement>Configuration must match best practices</requirement>
  <requirement>Cost estimate must be within budget</requirement>
</requirements>

<testing_requirements>
  <test_real_functionality>REQUIRED</test_real_functionality>
  <test_pattern>
    ✅ subprocess.run(["terraform", "plan"])
    ❌ assert Path("main.tf").exists()
  </test_pattern>
</testing_requirements>

<deliverables>
  <deliverable>
    <name>Terraform Validation</name>
    <test>test_terraform_plan_validates()</test>
    <test>test_cost_estimates()</test>
  </deliverable>
</deliverables>
```

---

## ⚠️ Krytyczne Przypomnienia

Template zawiera sekcję `<critical_reminders>`:

```xml
<critical_reminders>
  <reminder priority="1">
    NEVER report "100% tests passing" if only file-checking tests ran
    ALWAYS verify with actual execution tests
  </reminder>
  <reminder priority="2">
    NEVER use @pytest.mark.slow on integration tests
    Integration tests are REQUIRED, not optional
  </reminder>
  <reminder priority="3">
    NEVER mock infrastructure tools
    Use real tools to get real validation
  </reminder>
  <reminder priority="4">
    ALWAYS add pre-commit hooks for infrastructure changes
    Prevent broken code from being committed
  </reminder>
</critical_reminders>
```

---

## 📚 Powiązane Dokumenty

### **Podstawowe:**
- `TEMPLATE_REGISTRY.md` - Rejestr wszystkich template'ów
- `TESTING.md` - Strategia testów (projekt)
- `docs/testing-infrastructure-setup.md` - Przewodnik PL/EN

### **XML Templates:**
- `arch/stage1-infrastructure-planning.xml` - Planowanie architektury
- `dev/stage2-infrastructure-implementation.xml` - Implementacja z TDD
- `dev/stage3-infrastructure-validation.xml` - Walidacja funkcjonalna ⭐ NEW
- `dev/EXAMPLE-docker-validation.xml` - przykład użycia ⭐ NEW

---

## 🚀 Quick Start

```bash
# 1. Zobacz template
cat .opencode/templates/xml-prompts/dev/stage3-infrastructure-validation.xml

# 2. Zobacz example
cat .opencode/templates/xml-prompts/dev/EXAMPLE-docker-validation.xml

# 3. Skopiuj example dla swojego przypadku
cp .opencode/templates/xml-prompts/dev/EXAMPLE-docker-validation.xml \
   .opencode/templates/xml-prompts/dev/my-validation.xml

# 4. Edytuj sekcje:
#    - <task> - opis taska
#    - <requirements> - wymagania
#    - <agent_context> - kontekst
#    - <deliverables> - oczekiwane rezultaty

# 5. Użyj z agentem
#    W swoim message do agenta:
#    "Use XML prompt from .opencode/templates/xml-prompts/dev/my-validation.xml"
```

---

## ✅ Checklist Użycia Template

Przed użyciem Stage 3 template:

- [ ] Oznaczę testy jako REQUIRED, nie OPTIONAL
- [ ] Usunę `@pytest.mark.slow` z testów integracyjnych
- [ ] Dodam pre-commit hooki
- [ ] Zdefiniuję quality gates
- [ ] Specyfikuję deliverables (Makefile, dokumentacja)
- [ ] Dodam forbidden patterns (co nie może się zdarzyć)

---

## 🎯 Podsumowanie

**Stage 3 Infrastructure Validation** to XML template który:

✅ Wymaga testów rzeczywistej funkcjonalności
✅ Blokuje pomijanie testów integracyjnych
✅ Zabrania mockowania narzędzi infrastruktury
✅ Wymaga pre-commit hooków
✅ Definiuje jakościowe bramy (quality gates)
✅ Zapewnia Makefile z komendami

**Efekt:** Koniec z "testy przechodzą ale kod nie działa"! 🎉

---

**Created:** 2026-02-26
**Author:** Infrastructure Foundation Epic
**Status:** ✅ Active & Tested
