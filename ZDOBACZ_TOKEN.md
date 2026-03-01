# 🔑 Jak zdobyć GitHub Token - Przez przeglądarkę

## KROK 1: Otwórz stronę GitHub Token

**Kliknij ten link (otworzy się w nowej zakładce):**

```
https://github.com/settings/tokens/new
```

---

## KROK 2: Wypełnij formularz

### Nazwa (Note)
```
OpenCodeAutoPM - Full Access
```

### Wygaszenie (Expiration)
Wybierz jedną opcję:
- ✅ **No expiration** (bez terminu ważności - ZALECANE)
- **90 days** (90 dni)
- **30 days** (30 dni)

### Scopes (Uprawnienia) - ZAZNACZ WSZYSTKIE poniższe:

#### 1. repo (repozytoria)
- ✅ Zaznacz **repo** - "Full control of private repositories"

#### 2. workflow (KLUCZOWE!)
- ✅ Zaznacz **workflow** - "GitHub Actions workflows"

#### 3. organization (organizacje)
- ✅ Zaznacz **write:org** - "Organization permissions"
- ✅ Zaznacz **admin:org** - "Organization administration" (jeśli widzisz)

#### 4. pozostałe (opcjonalnie)
- ✅ Zaznacz **gist** - "Gists"
- ✅ Zaznacz **user** - "User profile"
- ✅ Zaznacz **delete_repo** - "Delete repos"

---

## KROK 3: Utwórz token

Przewiń listę scopes w dół i kliknij duży przycisk:

```
Generate token
```

---

## KROK 4: SKOPIUJ TOKEN! ⚠️

**WAŻNE - Token pojawi się TYLKO RAZ!**

Na górze strony zobaczysz go w zielonym polu:

```
ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Kliknij przycisk "Copy" obok tokena!** 📋

---

## KROK 5: Wklej token tutaj

**Wklej skopiowany token tutaj:**

```bash
ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 📋 Checklist przed kliknięciem "Generate token":

- [ ] Przeczytałem nazwę: "OpenCodeAutoPM - Full Access"
- [ ] Wybrałem "No expiration"
- [ ] Zaznaczyłem ✅ repo
- [ ] Zaznaczyłem ✅ workflow (KLUCZOWE!)
- [ ] Zaznaczyłem ✅ write:org
- [ ] Zaznaczyłem ✅ admin:org
- [ ] Zaznaczyłem ✅ gist
- [ ] Zaznaczyłem ✅ user
- [ ] Zaznaczyłem ✅ delete_repo

---

## ✅ Po utworzeniu tokena

1. **Kliknij "Copy"** obok tokena
2. **Wklej go tutaj w czacie**
3. **Użyję go do pushnięcia na GitHub**

---

## 🔗 Bezpośredni link:

**Kliknij tutaj:**
```
https://github.com/settings/tokens/new
```

---

*Po utworzeniu tokena wklej go tutaj! 🎯*

