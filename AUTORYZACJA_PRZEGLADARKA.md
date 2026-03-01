# 🔐 Autoryzacja GitHub przez Przeglądarkę

## KROK 1: Otwórz stronę tworzenia tokena

**Kliknij w ten link:**
```
https://github.com/settings/tokens/new
```

---

## KROK 2: Utwórz nowy Personal Access Token

### Ustawienia tokena:

1. **Note (nazwa):**
   ```
   OpenCodeAutoPM - Full Access
   ```

2. **Expiration (ważność):**
   - Wybierz: **No expiration** (bez terminu ważności)
   - Lub: **90 days** (90 dni)

3. **Scopes (uprawnienia) - ZAZNACZ WSZYSTKIE:**
   
   ✅ **repo** - Full control of private repositories
   ✅ **workflow** - GitHub Actions workflows (to jest KLUCZOWE!)
   ✅ **write:org** - Organizations (jeśli masz org)
   ✅ **admin:org** - Org administration (jeśli masz org)
   ✅ **gist** - Gists
   ✅ **user** - User profile
   ✅ **delete_repo** - Delete repos

4. Kliknij **"Generate token"** na dole strony

---

## KROK 3: Skopiuj token (WAŻNE! ⚠️)

**Token pojawi się tylko RAZ!** Będzie wyglądać tak:

```
ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

(Skopiuj go natychmiast!)

---

## KROK 4: Push commity

**W terminalu wpisz:**

```bash
# Zastąp YOUR_TOKEN skopiowanym tokenem:
git push https://YOUR_TOKEN@github.com/rafeekpro/OpenCodeAutoPM.git main
```

---

## KROK 5: Push tag

```bash
git push origin v3.7.0
```

---

## ✅ Gotowe!

Po tym:
1. ✅ Wszystkie commity będą na GitHub
2. ✅ Tag v3.7.0 będzie na GitHub  
3. ✅ GitHub Actions automatycznie opublikuje na npm

---

## 🔗 Przydatne linki:

- Token settings: https://github.com/settings/tokens
- Repozytorium: https://github.com/rafeekpro/OpenCodeAutoPM
- Actions: https://github.com/rafeekpro/OpenCodeAutoPM/actions

---

