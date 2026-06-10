#

##

1. API `_encoded: true`
2. `definition` Base64 JSON
3. JS `atob()`/`btoa()` + `TextEncoder`/`TextDecoder` + XOR
4. Runtime config `obfuscationKey`

```bash
grep -oE '(atob|btoa|obfuscation|_encoded)' /tmp/*.js | sort | uniq -c
grep -oE 'obfuscationKey:"[^"]*"' /tmp/page.html
```

##

### Base64 + XOR

```python
import base64, json

def decode(encoded, key):
 raw = base64.b64decode(encoded)
 key_bytes = key.encode('utf-8')
 decrypted = bytes([raw[i] ^ key_bytes[i % len(key_bytes)] for i in range(len(raw))])
 return json.loads(decrypted.decode('utf-8'))
```

### /

 `C74`/`p29` `StudioBackground`/`color`

```bash
grep -oE '(codeToComponent|codeToProp)' /tmp/bundle.js
```

 `C{nn}`/`p{nn}`

##

| | |
|------|------|
| Nuxt.js | `public:{obfuscationKey:"..."}` in HTML |
| Next.js | `__NEXT_DATA__` runtimeConfig |
| SPA | bundle `window.__CONFIG__` |

##

```bash
grep -l '_encoded' /tmp/*.js
grep -A3 '_encoded' /tmp/bundle.js
# if (t._encoded) { return decode(t.definition, key) }
```
