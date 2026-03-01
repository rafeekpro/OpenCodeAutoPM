# 📋 Instrukcja Utworzenia Repozytorium GitHub

## 🔍 Sprawdź czy repozytorium istnieje

**Otwórz w przeglądarce:**
```
https://github.com/rafeekpro/OpenCodeAutoPM
```

### Jeśli widzisz "404 Not Found" lub "Repository not found":
**Repozytorium nie istnieje** - musisz je utworzyć.

---

## ✅ Jak utworzyć repozytorium GitHub

### OPCJA 1: Przez GitHub UI (najprostsza)

1. **Otwórz:** https://github.com/new

2. **Wypełnij formularz:**
   - **Repository name**: `OpenCodeAutoPM` (dokładnie ta nazwa!)
   - **Description**: `OpenCode Autonomous Project Management Framework`
   - **Visibility**: 
     - **Public** (zalecane dla npm packages)
     - Lub **Private** (jeśli chcesz prywatne)
   
3. **Zaznacz opcje (zalecane):**
   - ✅ Add a README file (jeśli nie masz lokalnie)
   - ❌ Nie zaznaczaj ".gitignore" (masz już lokalnie)
   - ❌ Nie zaznaczaj "Choose a license" (dodasz później)

4. Kliknij **"Create repository"**

---

### OPCJA 2: Przez GitHub CLI (szybsza)

```bash
# Zainstaluj GitHub CLI jeśli nie masz:
brew install gh

# Zaloguj się:
gh auth login

# Utwórz repozytorium:
gh repo create OpenCodeAutoPM \
  --public \
  --description "OpenCode Autonomous Project Management Framework" \
  --source=. \
  --remote=origin \
  --push
```

---

## 🔄 Po utworzeniu repozytorium

### Dodaj NPM_TOKEN do GitHub Secrets

**Otwórz:**
```
https://github.com/rafeekpro/OpenCodeAutoPM/settings/secrets/actions
```

1. Kliknij **"New repository secret"**
2. **Name**: `NPM_TOKEN`
3. **Secret**: wklej swój npm token
4. Kliknij **"Add secret"**

---

## 📤 Push commitów do nowego repozytorium

```bash
# Push wszystkich commitów:
git push -u origin main

# Push tag v3.7.0:
git push origin v3.7.0
```

---

## ✅ Weryfikacja

Sprawdź czy wszystko działa:

1. **Repozytorium:** https://github.com/rafeekpro/OpenCodeAutoPM
2. **GitHub Actions:** https://github.com/rafeekpro/OpenCodeAutoPM/actions
3. **npm:** https://www.npmjs.com/package/opencode-autopm (po publikacji)

---

## 🎯 Alternatywa: Użyj istniejącego repo

Jeśli masz już inne repozytorium (np. stare `OpenAutoPM`):

```bash
# Zmień nazwę remote:
git remote set-url origin https://github.com/rafeekpro/TWOJE-STARE-REPO.git

# Lub użyj starej nazwy:
git remote set-url origin https://github.com/rafeekpro/openautopm.git
```

Ale **zmień też nazwę w package.json**!

---

## ❓ Nie wiesz jakie masz repozytoria?

```bash
# Sprawdź swoje repozytoria GitHub:
gh repo list

# Lub otwórz w przeglądarce:
https://github.com/settings/repositories
```

---

