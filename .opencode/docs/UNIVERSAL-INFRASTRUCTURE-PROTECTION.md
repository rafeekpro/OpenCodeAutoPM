# Universal Infrastructure Protection System

## 🎯 Cel: "Chronione zawsze w każdym systemie"

Stworzyłem kompletny system zabezpieczeń który automatycznie chroni **każdy** projekt przed typowymi błędami infrastruktury.

## 📦 Co zostało utworzone

### 1. **Szablony Infrastruktury** (Automatyczna ochrona)

Lokalizacja: `.opencode/templates/infrastructure/`

```
.opencode/templates/infrastructure/
├── docker-compose.yml.template          # Standard port configuration
├── Dockerfile.python.template          # Python multi-stage build
├── Dockerfile.nodejs.template          # Node.js multi-stage build
└── README.md                           # Instrukcje użycia
```

**Każdy szablon zawiera:**
- ✅ Non-conflicting ports (5xxxx range)
- ✅ Poprawne multi-stage builds
- ✅ Health checks
- ✅ Non-root user support

### 2. **Pre-commit Hooks** (Automatyczna walidacja)

Lokalizacja: `.opencode/scripts/hooks/`

```
.opencode/scripts/hooks/
├── install-infrastructure-hooks.sh    # Instalator wszystkich hooks
├── docker-build-validation.sh         # Walidacja Docker builds
└── check-ports.sh                     # Sprawdzanie konfliktów portów
```

**Automatycznie blokują commity jeśli:**
- ❌ Docker build fails
- ❌ Porty są zajęte
- ❌ Kontenery nie startują

### 3. **XML Prompt Template** (AI enforcement)

Lokalizacja: `.opencode/templates/xml-prompts/dev/stage3-infrastructure-validation.xml`

**Zawiera wymagania:**
- Test real functionality (nie file existence)
- Non-conflicting ports (mandatory)
- Poprawne multi-stage builds
- Brak @pytest.mark.slow
- Brak mocków infrastructure tools

### 4. **Dokumentacja** (Knowledge base)

- `INFRASTRUCTURE_QUALITY_ASSURANCE.md` - Pełny system zabezpieczeń
- `.opencode/templates/infrastructure/README.md` - Jak używać szablonów
- `.opencode/templates/TEMPLATE_REGISTRY.md` - Rejestr wszystkich szablonów

## 🚀 Jak Używać w KAŻDYM Projekcie

### Metoda 1: Szybki start (z szablonów)

```bash
# 1. Skopiuj szablony
cp .opencode/templates/infrastructure/docker-compose.yml.template docker-compose.yml
cp .opencode/templates/infrastructure/Dockerfile.python.template backend/Dockerfile
cp .opencode/templates/infrastructure/Dockerfile.nodejs.template frontend/Dockerfile

# 2. Zainstaluj hooks
.opencode/scripts/hooks/install-infrastructure-hooks.sh

# 3. Gotowe!
docker compose up -d
```

### Metoda 2: XML Prompt (dla AI)

Gdy pracujesz z AI nad infrastrukturą:

```xml
<prompt_workflow>
  <stage>3</stage>
  <workflow_type>infrastructure_validation</workflow_type>
  <!-- Automatycznie wymaga:
       - Non-conflicting ports
       - Poprawne multi-stage builds
       - Real functionality tests
  -->
</prompt_workflow>
```

AI automatycznie przestrzega wszystkich wymagań z szablonu!

### Metoda 3: Manual implementation (nadal chronione)

Nawet jeśli tworzzysz od zera, pre-commit hooks zablokują złe rozwiązanie:

```bash
# Tworzysz docker-compose.yml ze standardowymi portami
vim docker-compose.yml

# Próbujesz commitować
git add docker-compose.yml
git commit -m "add docker compose"

# ❌ BLOCKED by check-ports.sh!
# Error: Port 6379 already in use
```

## 🛡️ Warstwy Ochrony

### Warstwa 1: Szablony (Prevention)
**Działa przed:** Zanim napiszesz kod
**Jak:** Kopiujesz szablon z poprawną konfiguracją
**Chroni przed:** Błędami w konfiguracji

### Warstwa 2: Hooks (Detection)
**Działa podczas:** Git commit
**Jak:** Automatycznie testuje przed commitem
**Chroni przed:** Wprowadzeniem błędów do repo

### Warstwa 3: XML Templates (AI Guidance)
**Działa gdy:** AI pomaga z infrastrukturą
**Jak:** AI otrzymuje wymagania w XML
**Chroni przed:** AI sugerując błędne rozwiązania

### Warstwa 4: CI/CD (Last Line)
**Działa gdy:** Pull request
**Jak:** GitHub Actions walidują
**Chroni przed:** Mergem błędnego kodu

## 📊 Pokrycie Problemów

| Problem | Szablon | Hooks | XML | CI/CD |
|---------|---------|-------|-----|-------|
| Port conflicts | ✅ | ✅ | ✅ | ✅ |
| Multi-stage permissions | ✅ | ✅ | ✅ | ✅ |
| Fake tests | ❌ | ✅ | ✅ | ✅ |
| Missing outputs | ✅ | ✅ | ✅ | ✅ |
| Broken builds | ❌ | ✅ | ✅ | ✅ |

## 🔄 Continuous Improvement

### Jak dodać nowy wzorzec błędu

1. **Zidentyfikuj problem** w aktualnym projekcie
2. **Rozwiąż go** i zrozum przyczynę
3. **Zaktualizuj szablony** żeby prevenować
4. **Dodaj do XML** wymagania
5. **Dokumentuj** w INFRASTRUCTURE_QUALITY_ASSURANCE.md

### Example: Port conflicts

**Odkryto:** Redis 6379 conflicts
**Rozwiązanie:** Port 56379 w szablonie
**Enforced:**
- Szablon używa 56379
- Hook sprawdza wolne porty
- XML wymaga non-conflicting range
- CI/CD testuje wszystkie porty

**Wynik:** Żaden przyszły projekt nie będzie miał tego problemu! 🎉

## 🎯 Efekt Końcowy

### Przed tym systemem:
```
Developer: "Docker działa u mnie! Commitujemy..."
CI: "❌ Build failed - port 6379 allocated"
Developer: "Ale u mnie działa..."
Team: "Waste time debugging..."
```

### Po tym systemie:
```
Developer: "Użyję szablonu z .opencode/templates/"
Hooks: "✅ Port 56379 wolne, kontenery działają"
CI: "✅ Wszystko zielone"
Team: "Infrastructure works first time! 🎉"
```

## 📝 Checklist Nowego Projektu

```bash
# [ ] Skopiuj szablony infrastruktury
cp -r .opencode/templates/infrastructure/* .  # (z modyfikacjami)

# [ ] Zainstaluj hooks
.opencode/scripts/hooks/install-infrastructure-hooks.sh

# [ ] Zbuduj i testuj
docker compose build --no-cache
docker compose up -d
curl http://localhost:58080
curl http://localhost:58000/health

# [ ] Zcommituj (hooks sprawdzą)
git add .
git commit -m "feat: infrastructure setup"
```

## 🌟 Universal Protection

Ten system teraz:

1. **Chroni KAŻDY projekt** który używa szablonów
2. **Uczy AI** jak poprawnie implementować
3. **Zapobiega błędom** zanim się pojawią
4. **Ewoluuje** z każdym nowym odkrytym problemem

**Wynik:** Infrastructure always works! 🚀

---

**Created:** 2026-02-26
**Status:** Active
**Applies to:** All future projects
