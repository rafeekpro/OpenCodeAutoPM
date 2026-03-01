# 🚀 Instrukcja Publikacji na npm - KROK PO KROKU

## ✅ Już zrobione (automatycznie)

- ✅ GitHub Actions workflow utworzony
- ✅ Pliki zcommitowane
- ✅ Tag v3.7.0 utworzony lokalnie

---

## 📋 Pozostałe kroki (do wykonania ręcznie)

### KROK 1: Konfiguracja npm Token (jednorazowo, 5 minut)

#### 1.1 Utwórz npm Automation Token

```bash
# Otwórz w przeglądarce:
https://www.npmjs.com
```

1. Zaloguj się na swoje konto npm
2. Kliknij swój avatar → **Access Tokens**
3. Kliknij **"Create New Token"**
4. Wybierz typ: **Automation**
5. Nadaj nazwę: `GitHub Actions - opencode-autopm`
6. Wybierz uprawnienia: **Automation** lub **Full Access**
7. Kliknij **"Create Token"**

**⚠️ BARDZO WAŻNE**: Skopiuj token od razu! Będzie wyglądać tak:
```
npm_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

#### 1.2 Dodaj Token do GitHub

```bash
# Otwórz w przeglądarce:
https://github.com/rafeekpro/OpenCodeAutoPM/settings/secrets/actions
```

1. Kliknij **"New repository secret"**
2. **Name**: wpisz `NPM_TOKEN`
3. **Secret**: wklej swój token (zaczynając od `npm_`)
4. Kliknij **"Add secret"**

**✅ Konfiguracja zakończona!**

---

### KROK 2: Opcjonalnie - Zaktualizuj CHANGELOG.md (zalecane)

```bash
# Otwórz CHANGELOG.md i dodaj sekcję dla v3.7.0:

## [3.7.0] - 2025-02-27

### Added
- OpenCode platform migration
- Hybrid parallel execution (5 concurrent agents)
- Security layer with prompt injection prevention
- MCP integration enhancements
- Automated npm publishing via GitHub Actions

### Changed
- Package renamed: open-autopm → opencode-autopm
- Environment variables: CLAUDE_* → OPENCODE_*
- All documentation updated with OpenCode branding

### Fixed
- Backward compatibility issues
- Configuration management improvements

### Deprecated
- Old CLI command 'open-autopm' (use 'opencode-autopm')
- Old environment variables CLAUDE_* (use OPENCODE_*)
```

```bash
# Zcommituj zmiany
git add CHANGELOG.md
git commit -m "docs: update CHANGELOG for v3.7.0"
```

---

### KROK 3: Push do GitHub

```bash
# Opcja A: Push tag (uruchamia automatyczne publikowanie)
git push origin main
git push origin v3.7.0
```

**Po tym kroku GitHub Actions automatycznie:**
1. ✅ Przetestuje kod
2. ✅ Opublikuje na npm
3. ✅ Utworzy GitHub Release

---

## 📊 Śledź postęp

### Sprawdź status workflow:

```bash
# Otwórz w przeglądarce:
https://github.com/rafeekpro/OpenCodeAutoPM/actions
```

Szukaj workflow: **"Release to npm"** - zobaczysz postęp na żywo!

---

## ✅ Weryfikacja po publikacji

### Sprawdź czy pakiet jest na npm:

```bash
# Otwórz w przeglądarce:
https://www.npmjs.com/package/opencode-autopm
```

Powinna być widoczna wersja **v3.7.0**

### Sprawdź GitHub Release:

```bash
# Otwórz w przeglądarce:
https://github.com/rafeekpro/OpenCodeAutoPM/releases/tag/v3.7.0
```

Release powinien być utworzony automatycznie!

---

## 🔄 Przyszłe release'y (szybka instrukcja)

Dla każdej następnej wersji (np. v3.8.0):

```bash
# 1. Zmien wersję w package.json
npm version patch  # v3.7.1
# lub
npm version minor  # v3.8.0
# lub
npm version major  # v4.0.0

# 2. Zcommituj zmiany
git add package.json
git commit -m "chore: bump version to v3.7.1"

# 3. Utwórz tag
git tag v3.7.1

# 4. Push (automatycznie publikuje!)
git push origin main
git push origin v3.7.1
```

**To wszystko! Resztę robi GitHub Actions automatycznie. 🚀**

---

## 🐛 Jeśli coś nie działa

### Problem: "NPM_TOKEN not found"
```
Rozwiązanie: Dodaj NPM_TOKEN do GitHub Secrets
Szczegóły: docs/NPM_RELEASE_SETUP.md
```

### Problem: "401 Unauthorized"
```
Rozwiązanie: Token npm nieważny
Utwórz nowy token: https://www.npmjs.com/settings/tokens
```

### Problem: "Tests failed"
```
Rozwiązanie: Napraw testy lokalnie
npm test
git add .
git commit
git push
```

---

## 📚 Dodatkowa dokumentacja

- Pełna instrukcja: `docs/NPM_RELEASE_SETUP.md`
- Workflow: `.github/workflows/release.yml`
- Dokumentacja migracji: `MIGRATION_PROGRESS_FINAL.md`

---

## ✨ Podsumowanie

**Gotowe do publikacji!** 🎉

Potrzebujesz tylko:
1. Dodać NPM_TOKEN do GitHub (5 minut)
2. Push tag: `git push origin v3.7.0`

Resztę jest automatyczne!

---

*Gotowe do użycia: 2025-02-27*
