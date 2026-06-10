#

 60x

##

### 1. REST API

```bash
# JS bundle API
grep -oE 'api/(presets|shaders|collections)[^"]*' /tmp/*.js
#
curl -s -L --compressed 'https://example.com/api/collections/slug/uuid'
```

API → `encoded-definitions.md`

### 2. Nuxt.js Payload

```bash
grep -oE '_payload\.json[^"]*' /tmp/page.html # payload URL
grep -oE 'public:\{[^}]*\}' /tmp/page.html # runtime config
```

### 3. Next.js

```bash
# App Router (RSC)
grep -oE '"(scene|glass|postProcessing)":\{' /tmp/page.html
# Pages Router
grep -o '<script id="__NEXT_DATA__"[^>]*>[^<]*' /tmp/page.html | sed 's/.*>//'
```

### 4. JSON / window

```bash
grep -oE 'window\.__CONFIG__\s*=\s*\{[^;]+' /tmp/page.html
```

### 5. JS Bundle

```bash
grep -oE '(config|options|settings)\s*=\s*\{' /tmp/entry-chunk.js
```

##

- 0-1 0-255
- resolution
- `false` pass
