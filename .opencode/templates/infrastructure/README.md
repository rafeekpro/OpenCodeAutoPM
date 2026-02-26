# OpenCodeAutoPM Infrastructure Templates

## 🎯 Cel

Automatyczne zabezpieczenie każdego projektu przed typowymi błędami infrastruktury:
- Konflikty portów
- Problemy z uprawnieniami w multi-stage builds
- Testy które przechodzą ale kod nie działa

## 📁 Szablony

### 1. `docker-compose.yml.template`
Standardowa konfiguracja z:
- **Non-conflicting ports** (zakres 5xxxx)
- Health checks dla wszystkich usług
- Proper dependencies

**Użycie:**
```bash
cp .opencode/templates/infrastructure/docker-compose.yml.template docker-compose.yml
```

**Porty:**
- Backend: `58000:8000`
- Frontend: `58080:80`
- PostgreSQL: `54320:5432`
- Redis: `56379:6379`

### 2. `Dockerfile.python.template`
Dla Python backendów z:
- Multi-stage build
- System-wide package installation
- Non-root user support

**KLUCZOWE:** Nie używa `pip install --user` - używa system-wide installation

**Użycie:**
```bash
cp .opencode/templates/infrastructure/Dockerfile.python.template backend/Dockerfile
```

### 3. `Dockerfile.nodejs.template`
Dla Node.js frontendów z:
- Multi-stage build (builder + nginx runtime)
- Proper ownership
- Non-root user

**Użycie:**
```bash
cp .opencode/templates/infrastructure/Dockerfile.nodejs.template frontend/Dockerfile
```

## 🔧 Instalacja Hooks

```bash
# Zainstaluj wszystkie infrastructure hooks
.opencode/scripts/hooks/install-infrastructure-hooks.sh
```

**To zainstaluje:**
1. `docker-build-validation.sh` - Blokuje commity jeśli Docker build fail
2. `check-ports.sh` - Blokuje commity jeśli porty są zajęte

## 🚀 Szybki Start Nowego Projektu

```bash
# 1. Skopiuj szablony
cp .opencode/templates/infrastructure/docker-compose.yml.template docker-compose.yml
cp .opencode/templates/infrastructure/Dockerfile.python.template backend/Dockerfile
cp .opencode/templates/infrastructure/Dockerfile.nodejs.template frontend/Dockerfile

# 2. Zainstaluj hooks
.opencode/scripts/hooks/install-infrastructure-hooks.sh

# 3. Zbuduj i testuj
docker compose build
docker compose up -d

# 4. Zverify działanie
curl http://localhost:58080      # Frontend
curl http://localhost:58000/health  # Backend
```

## ⚠️ Najczęstsze Błędy (i jak je uniknąć)

### Błąd 1: "Port already in use"
**Problem:** Używasz standardowych portów (8000, 5432, 6379)
**Rozwiązanie:** Zawsze używaj portów 5xxxx z szablonu

### Błąd 2: "Permission denied" w multi-stage build
**Problem:** Używasz `pip install --user` w builder stage
**Rozwiązanie:** Użyj szablonu - instaluje system-wide

### Błąd 3: "Tests pass but code doesn't work"
**Problem:** Testy tylko sprawdzają istnienie plików
**Rozwiązanie:** Używaj `subprocess.run()` z real tools

## 📋 Checklist przed commitem

```bash
# 1. Sprawdź porty
lsof -ti :58000 :58080 :54320 :56379  # Nic nie powinno być w użyciu

# 2. Zbuduj Docker
docker compose build --no-cache

# 3. Uruchom kontenery
docker compose up -d

# 4. Testuj endpointy
curl -f http://localhost:58080
curl -f http://localhost:58000/health

# 5. Zatrzymaj
docker compose down

# Teraz możesz commitować - hooks sprawdzą to automatycznie!
git add .
git commit -m "feat: infrastructure"
```

## 🔄 Aktualizacja Szablonów

Jeśli znajdziesz nowy wzorzec błędu:

1. **Zaktualizuj szablony** w `.opencode/templates/infrastructure/`
2. **Dodaj test** do `stage3-infrastructure-validation.xml`
3. **Zaktualizuj ten README** z nowym błędem

Wszystkie przyszłe projekty będą automatycznie chronione! 🎉

## 📚 Dodatkowe Zasoby

- `INFRASTRUCTURE_QUALITY_ASSURANCE.md` - Pełna dokumentacja systemu
- `stage3-infrastructure-validation.xml` - XML prompt dla AI
- `.opencode/rules/infrastructure-quality.md` - Quality rule

---

**Created:** 2026-02-26
**Maintained by:** OpenCodeAutoPM Framework
**Status:** Production-ready
