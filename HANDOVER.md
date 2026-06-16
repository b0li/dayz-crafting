# DayZ Crafting Guide – Handover

## Projekt

- **Lokaler Pfad:** `/Users/lakestudio/localhost/claude/apps/dayz-crafting/`
- **Repo:** https://github.com/b0li/dayz-crafting
- **Live:** https://b0li.github.io/dayz-crafting/
- **Stack:** Single `index.html` – Vanilla JS, kein Build-Step, keine Dependencies
- **Datenstand:** DayZ Build 1.26 – 1.27 (PC/Xbox/PS), Quelle: Asmondian Crafting Charts + DayZ Wiki

---

## Design System

Identisch zum Schwester-Projekt `dayz-food` (gleiche CSS-Variablen, Typografie, Look).

### CSS Custom Properties

```css
:root {
	--bg:        #14150f;
	--bg-panel:  rgba( 20, 22, 18, 0.82 );
	--bg-row:    rgba( 28, 31, 26, 0.55 );
	--line:      rgba( 120, 130, 110, 0.18 );
	--text:      #d6d8cf;
	--text-dim:  #8b9082;
	--text-head: #e8eae2;
	--energy:    #d9a441; /* Akzent / Ergebnis-Titel */
	--water:     #5aa9d6;
	--danger:    #c8503c;
	--accent:    #aeb89a; /* aktive States, Sprachswitch, Mengen */
	--pad:       32px;    /* horizontales Padding, < 768px → 20px */
}
```

### Body-Background

```css
body {
	background-image:
		linear-gradient( rgba( 16, 17, 13, 0.85 ), rgba( 16, 17, 13, 0.93 ) ),
		radial-gradient( circle at 30% 0%, #2c3327 0%, #14150f 60% );
	background-attachment: fixed;
}
```

### Typografie

- **Font-Stack:** `"Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif` – keine Google Fonts
- **Base:** 16px / line-height 1.4

| Element | Font-Size | Weight | Color | Besonderheit |
|---|---|---|---|---|
| Ergebnis-Titel | 14px | 600 | --energy | uppercase, letter-spacing 0.5px |
| Kategorie (Card) | 10px | 400 | --text-dim | uppercase |
| Zutat / Ingredient | 11px | 400 | --text | Chip mit Border |
| Menge (Ingredient) | 10px | 700 | --accent | z. B. `2×` |
| Chip / Filter-Button | 12px | 600 | --text-dim | aktiv: bg --accent |
| Sprachswitch | 12px | 700 | --text-dim | aktiv: bg --accent |

---

## Layout

- **Max-width:** 1400px, zentriert (`.app`)
- **Padding:** `--pad` (32px), responsiv 20px unter 768px
- **Header** (`.app__header`): Logo links + DE/EN-Sprachswitch rechts, keine Trennlinie
- **Controls** (`.controls`): sticky `top: 0`, klebt beim Scrollen ohne Gap am Viewport-Rand
  - Innen `.controls__card` – Suche + Zähler + Filter-Chips als eigene Card (Border + Radius), bündig mit den Rezept-Cards
  - Padding `0 var(--pad) 14px` (Abstand sitzt UNTER der Card, nicht darüber)
- **Grid** (`.recipes-grid`): `repeat( auto-fill, minmax( 300px, 1fr ) )`, gap 14px, < 768px einspaltig
- **Filter-Chips:** `flex-wrap`, gap 10px – konsistent mit Card-Gap

> **Wichtig:** `.recipe-card__meta` hat `min-height: 14px`, damit Cards ohne
> Mengenangabe (z. B. „Zucchini Seeds") trotzdem bündig zu Cards MIT Mengenangabe
> stehen. Im gefilterten View ist das Kategorie-Label leer → ohne min-height
> würde die Meta-Zeile kollabieren und der Titel hochrutschen.

---

## Datenstruktur

### Recipe-Objekt (JS)

```js
{
	category: 'Primal',          // Kategorie-Key (siehe CATEGORIES)
	result:   'Stone Knife',     // Ergebnis (englischer Basisname, immer Lookup-Key)
	resultQty: 4,                // optional: Ausgabemenge, zeigt "×4" oben rechts
	ingredients: [
		{ name: 'Stone', qty: 1 },
		{ name: 'Stone', qty: 1 }
	]
}
```

- `result` und `ingredients[].name` sind **immer Englisch** und dienen als
  Lookup-Key fürs Übersetzungs-Dictionary.
- `qty > 1` rendert ein `2×`-Badge vor der Zutat.
- Zusammengesetzte Strings (z. B. `'Long Stick + Short Sticks'`,
  `'Rag / Bandages'`, `'Stone / Bone Knife'`) sind als **ganzer String** ein
  eigener Dictionary-Eintrag – NICHT an `+` / `/` zerlegen.

### Kategorien (15)

`Primal` · `Wooden Source` · `Fire` · `Clothing` · `Leather & Animal` ·
`Bags & Backpacks` · `Traps & Fishing` · `Medical` · `Ghillie Suit` ·
`Structures` · `Weapons` · `Electricity` · `Explosives` · `Cooking` · `Farming`

Aktuell **102 Rezepte**.

---

## Mehrsprachigkeit (DE/EN)

Drei Ebenen, alle im `<script>` von `index.html`:

1. **`I18N[ lang ]`** – UI-Texte (subtitle, placeholder, count) + Kategorie-Labels
2. **`ITEM_DE`** – zentrales Dictionary `EN-Item → DE-Item` (~180 Einträge,
   offizielle DayZ-In-Game-/Wiki-Namen). DRY: Items wie *Knife*, *Rope*, *Stone*
   kommen dutzendfach vor, werden aber nur einmal gemappt.
3. **`tItem( name )`** – Helper: gibt im DE-Modus `ITEM_DE[name]` zurück,
   Fallback = Englisch. Im EN-Modus immer der Originalname.

- Sprache wird per `detectLang()` aus `navigator.language` vorbelegt (de → DE, sonst EN).
- Switch via `.lang__btn` rebuildet Chips + Liste.
- **Suche ist zweisprachig:** matcht sowohl den englischen als auch den
  übersetzten Namen (`tItem()`), unabhängig vom aktiven Sprachmodus.

### Neues Rezept hinzufügen

1. Objekt im `recipes`-Array unter passender Kategorie ergänzen.
2. Für jedes neue Item/Ergebnis einen `ITEM_DE`-Eintrag setzen (sonst Fallback EN).
3. Neue Kategorie? → auch in `I18N.de.categories` + `I18N.en.categories` eintragen.

---

## PWA

### Meta-Tags (index.html)

```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="theme-color" content="#14150f">
<link rel="manifest" href="manifest.json">
<link rel="apple-touch-icon" href="icon-192.png">
```

### manifest.json

```json
{
	"name": "DayZ Crafting Guide",
	"short_name": "DayZ Craft",
	"start_url": "./index.html",
	"display": "standalone",
	"background_color": "#14150f",
	"theme_color": "#14150f"
}
```

### Icons

- `icon-192.png` (192×192) und `icon-512.png` (512×512)
- Generiert aus `assets/img/logo.png` (Logo zentriert auf `#14150f`) via ffmpeg:

```bash
ffmpeg -y \
  -f lavfi -i color=c=0x14150f:size=192x192:rate=1 \
  -i assets/img/logo.png \
  -filter_complex "[1:v]scale=172:-1[logo];[0:v][logo]overlay=(W-w)/2:(H-h)/2:format=auto,trim=duration=0.04" \
  -frames:v 1 -update 1 icon-192.png

# 512er: scale=460:-1, size=512x512
```

### Service Worker (`sw.js`)

- Cache-Name: `dayz-crafting-v1` → **bei Updates hochzählen** (`v2`, `v3` …),
  sonst bleibt alter Cache aktiv
- Cached: `index.html`, `manifest.json`, beide Icons, `assets/img/logo.png`
- Strategie: network-first für HTML, cache-first für Assets

### iOS Install-Banner

`#installBanner` erscheint nur in iOS Safari (nicht im Standalone-Modus) –
Hinweis „Share → Add to Home Screen".

---

## Dateistruktur

```
dayz-crafting/
├── index.html          # komplette App (HTML + CSS + JS in einer Datei)
├── manifest.json
├── sw.js
├── icon-192.png
├── icon-512.png
├── assets/
│   └── img/
│       └── logo.png    # DayZ-Logo (aus dayz-food übernommen)
├── .claude/
│   └── launch.json     # lokaler Preview-Server (npx serve, Port 3400)
└── HANDOVER.md
```

---

## Deployment

```bash
# GitHub Pages aktiv (main branch, root /)
git add .
git commit -m "..."
git push
# → automatisch live auf https://b0li.github.io/dayz-crafting/
```

> **Workflow:** Vor jedem `git push` explizit bestätigen lassen – nie automatisch pushen.
> Bei JS/CSS-Änderungen am SW-Cache: `CACHE_NAME` in `sw.js` hochzählen.
