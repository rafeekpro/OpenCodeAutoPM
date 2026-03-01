# 🚀 Publikacja Manualna na npm (bez GitHub Actions)

## 📋 Aktualna sytuacja

- ✅ Kody są na GitHub (commits pushed)
- ✅ NPM_TOKEN jest dodany do GitHub Secrets
- ⚠️ GitHub token nie ma uprawnienia `workflow`
- ✅ Można publikować ręcznie!

---

## 🎯 Proces publikacji krok po kroku

### KROK 1: Przygotuj pakiet

```bash
# W katalogu projektu:
npm pack
```

To stworzy plik: `opencode-autopm-3.7.0.tgz`

---

### KROK 2: Publikuj na npm

```bash
# Upewnij się że jesteś zalogowany:
npm whoami

# Jeśli nie, zaloguj się:
npm login
# Wpisz username i password

# Opublikuj:
npm publish opencode-autopm-3.7.0.tgz
```

---

### KROK 3: Weryfikacja

Sprawdź czy pakiet jest na npm:
```bash
# Otwórz w przeglądarce:
https://www.npmjs.com/package/opencode-autopm
```

---

### KROK 4: Utwórz GitHub Release

**Otwórz:**
```
https://github.com/rafeekpro/OpenCodeAutoPM/releases/new
```

Wypełnij:
- **Tag**: Wybierz `v3.7.0` (powinien być na liście)
- **Title**: `OpenCodeAutoPM v3.7.0 - OpenCode Migration Release`
- **Description**: Wklej zawartość z `MIGRATION_PROGRESS_FINAL.md`

Zaznacz:
- ✅ **Set as the latest release**

Kliknij **"Publish release"**

---

## 🔄 Przyszłe publikacje

Dla następnych wersji (np. v3.8.0):

```bash
# 1. Zmień wersję:
npm version minor

# 2. Zcommituj:
git add package.json
git commit -m "chore: bump version to v3.8.0"

# 3. Utwórz tag:
git tag v3.8.0

# 4. Push tag (tylko tag, bez workflow):
git push origin v3.8.0

# 5. Publikuj:
npm publish
```

---

## ✅ Alternatywa: Zaktualizuj GitHub token

Jeśli chcesz automatyczne publikowanie w przyszłości:

**W terminalu:**
```bash
gh auth logout
gh auth login -h github.com -s workflow
```

To doda uprawnienie `workflow` do Twojego tokena.

---

## 📚 Podsumowanie

**Na teraz:** Publikuj ręcznie (powyższe kroki)
**W przyszłości:** Zaktualizuj GitHub token dla automatyzacji

---

*Gotowe do użycia: 2025-02-27*
