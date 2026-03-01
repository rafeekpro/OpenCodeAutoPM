# 🔧 Naprawa GitHub Token - Uprawnienia do Workflow

## Problem

Twój GitHub token nie ma uprawnień `workflow`, które są potrzebne do pushowania plików GitHub Actions.

---

## ✅ Rozwiązanie: Zaktualizuj GitHub Token

### KROK 1: Otwórz ustawienia GitHub CLI

```bash
# W terminalu wpisz:
gh auth refresh -h github.com -s workflow
```

Lub otwórz w przeglądarce:
```
https://github.com/settings/tokens
```

---

### KROK 2: Dodaj uprawnienia

1. Znajdź swój token (zaczyna się od `gho_`)
2. Kliknij **"Update token"** lub **"Edit"**
3. W sekcji **Scopes** zaznacz:
   - ✅ **workflow** (to jest kluczowe!)
4. Kliknij **"Update token"** lub **"Save"**

---

### KROK 3: Zaloguj ponownie

```bash
# W terminalu:
gh auth login

# Lub odśwież:
gh auth refresh
```

---

## 🚀 Alternatywa: Push przez osobisty token

Jeśli nie chcesz aktualizować gh CLI, użyj osobistego tokena:

### 1. Utwórz Personal Access Token

**Otwórz:** https://github.com/settings/tokens/new

Ustawienia:
- **Note**: `OpenCodeAutoPM - full access`
- **Expiration**: wybierz termin (lub No expiration)
- **Scopes**: zaznacz:
  - ✅ **repo** (full control)
  - ✅ **workflow** (to jest ważne!)
  - ✅ **write:org** (jeśli org)

Kliknij **"Generate token"**

### 2. Skopiuj token

Zacznie się od `ghp_...` (nie `gho_`!)

### 3. Push z tym tokenem

```bash
git push https://GHp_TWÓJ_TOKEN@github.com/rafeekpro/OpenCodeAutoPM.git main
```

---

## 📋 Alternatywa: Usuń tymczasowo workflow

Jeśli chcesz pushnąć TERAZ bez roboty:

```bash
# Usuń workflow tymczasowo:
rm .github/workflows/release.yml

# Commit:
git add .github/workflows/release.yml
git commit -m "chore: temporarily remove workflow"

# Push:
git push origin main

# Potem workflow przywrócimy
```

Ale **to nie jest zalecane** - workflow jest ważny!

---

## ✅ Zalecane rozwiązanie

**Zaktualizuj GitHub token z uprawnieniem `workflow`:**

```bash
gh auth refresh -h github.com -s workflow
```

To zajmie tylko 1 minutę i jest bezpieczne!

---

