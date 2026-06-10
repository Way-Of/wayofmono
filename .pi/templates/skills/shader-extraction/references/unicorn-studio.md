# Unicorn Studio

Unicorn Studio (unicorn.studio) no-code WebGL curtains.js Firebase/Firestore

##

- URL : `unicorn.studio/remix/{remixId}` `unicorn.studio/edit/{designId}`
- Meta tag: `<meta name="ai:technical-stack" content="Vue 3, curtains.js, Firebase, JavaScript SDK">`
- SDK: `unicornStudio-*.js`~84KB embed
- bundle: `index-*.js`~2.1MB shader

##

### 1: Firestore REST API remix

```bash
# Firebase unicorn.studio JS bundle
# curl -s https://www.unicorn.studio/ | grep -oP 'apiKey:"[^"]+"' | head -1
API_KEY="< bundle >"
PROJECT="unicorn-studio"

# Step 1: remix versionIddesignIdcre
curl -s "https://firestore.googleapis.com/v1/projects/$PROJECT/databases/(default)/documents/remixes/{REMIX_ID}?key=$API_KEY"

# Step 2:
# versionId Step 1 fields.versionId.stringValue
curl -s "https://firestore.googleapis.com/v1/projects/$PROJECT/databases/(default)/documents/versions/{VERSION_ID}?key=$API_KEY"
```

### 2: GCS/CDN Embed

```bash
# Pro
curl -s "https://storage.googleapis.com/unicornstudio-production/embeds/{DESIGN_ID}"

# Pro
curl -s "https://assets.unicorn.studio/embeds/{DESIGN_ID}"
```

Embed JSON : `{ options: {...}, layers/history: [...], modules: [...] }`
 `compiledFragmentShaders[]` `compiledVertexShaders[]` GLSL

### 3: JSON

Unicorn Studio `data-us-project` `data-us-project-src` HTML
SDK `init()`

##

Unicorn Studio

### 1. embed/export scene

- `addScene()` scene JSON
- `compiledFragmentShaders[]` / `compiledVertexShaders[]`
- embed runtime

### 2. editor/version history

- Firestore `versions/{id}` `history`
- **** `addScene()`

 `history` embed scene

- `Plane: No fragment shader provided, will use a default one`
- `Plane: No vertex shader provided, will use a default one`
- `No composite shader data for element`
- canvas

## Firestore

| Collection | | |
|---|---|---|
| `designs` | | creatorId, name, versionId, hasEmbed |
| `versions` | | history[], options |
| `remixes` | remix | designId, versionId, creatorId, thumbnail |

##

Firestore REST `{stringValue, integerValue, arrayValue, mapValue, ...}`

`history`

```
layerType: "effect" | "text" | "image" | "model" | "shape"
type: (gradient, noiseFill, sdf_shape, glyphDither, bloomFast, ...)
```

###

- `pos`, `scale`, `speed`, `opacity`, `blendMode`
- `trackMouse`, `trackAxes`, `mouseMomentum`
- `parentLayer`: UUID false
- `breakpoints[]`:
- `states`: appear/scroll/hover/mousemove
- `customFragmentShaders[]`, `customVertexShaders[]`

##

 Firestore `version/history` embed API



1. `unpackageHistory()` `unpackVersion()`
2. `createFontScript()`
3. `createCurtains()`
4. `handleItemPlanes()`
5. `fullRedraw()`

 bundle Remix/Preview UMD/SDK

###

- image/font/texture
- `history` `src``fontCSS.src`
- key map

###

| | |
|---|---|
| gradient | fill[], stops[], gradientType, gradientAngle, wrap |
| noiseFill | noiseType, turbulence, color1, color2, colorPhase, chroma, direction |
| sdf_shape | shape(0-22), refraction, extrude, smoothing, axis, animationDirection, lightPosition |
| glyphDither | characters, glyphSet, scale, gamma, monochrome, texture(sprite atlas) |
| bloomFast | amount, intensity, exposure, tint |

## Shader

****: Embed SDK~84KB GLSL shader Shader bundle~2.1MB 7 embed JSON

### Shader App Bundle

Shader

```
 →
glyphDither → X$ (fragment)
noiseFill → WY (fragment)
sdf_shape → XY (fragment)
gradient → eX (fragment)
bloomFast → Hj (fragment)
 → ye (vertex)
 → ko (vertex)
 → Uz (composite fragment)
 → Nz (composite vertex)
```



###

Shader `${variable}`

| | |
|---|---|
| `${fe}` | mask uniform |
| `${Vt}` | (applyLayerMix, applyLayerMixAlpha, applyLayerMixClip) |
| `${gt}` | PCG hash / (pcg2d, randFibo) |
| `${ht}` | (17 : Normal, Add, Multiply, Screen, Overlay, ...) |
| `${pe("var")}` | mask + fragColor |
| `${wf}` | BCC noise derivatives (OpenSimplex2S) |
| `${Aa}` | Perlin noise |
| `${yr}` | deband |
| `${cm}` | / uniform |
| `${xz}` | (bloom blur) |

###

```
1. Fz(): uniform
2. Dz(): switch case
3. Mz(): switch
4. Rz(): #ifelseopen/#ifelseclose
5. Iz():
6. Cz(): uniform
7. Bp():
```

##

```
curtains.js WebGL2
├─ = Plane + FBO
├─ renderOrder plane FBO uTexture
├─ Elementshape/text/image+ render group
│ 1. Element plane → FBO_elem
│ 2. effects → FBO_child1, FBO_child2, ...
│ 3. Composite plane alpha-blend
├─ (parentLayer=false)
└─ plane canvas FBO
```

### Element + FBO

```
 shape group (sdf + noise)

FBO_before ─────────────────────────────────────────┐
 │
Shape plane → FBO_shape () │
 ↓ │
Child noiseFill → FBO_noise (uBgTexture = FBO_shape) │
 ↓ │
Child sdf_shape → FBO_sdf (uTexture = FBO_noise) │
 ↓ (showBg=0: = vec4(0) ) │
 ↓ │
Composite plane → FBO_result │
 uTexture = FBO_sdf () │
 uBgTexture = FBO_before (element ) ←─────┘
 output = alpha_blend(fg, bg) = fg + bg * (1 - fg.a)
```

###

```js
// Element effects → parentLayer UUID
shape.effects = ["e270a7cd-...", "fb591190-..."]

// element UUID
noiseFill.parentLayer = "e270a7cd-..." // effects[0]
sdf_shape.parentLayer = "fb591190-..." // effects[1]

// embed SDK
getChildEffectItems() {
 return this.effects.map(uuid =>
 state.layers.find(l => l.parentLayer === uuid)
 ).filter(Boolean)
}
```

### uTime

Embed SDK `uTime` ****
```js
// setEffectPlaneUniforms()
t.uniforms.time.value += speed * 60 / this.fps;
```

 60fps `uTime += speed` 1 `uTime = speed × 60`

| | speed | 1 uTime |
|--------|-------|-------------|
| noiseFill | 0.25 | 15 |
| sdf_shape | 0.5 | 30 |
| gradient | 0.25 | 15 |

** `speed × 60`** 15-60
```js
//
uni1f(prog, 'uTime', elapsedSeconds * speed * 60);
//
uni1f(prog, 'uTime', elapsedSeconds);
```

### showBg

- `showBg=0` `vec4(0)` ****
- `showBg=1` `uTexture/uBgTexture`

** showBg=0 ** `vec4(0,0,0,1)`
composite alpha blend alpha=0

##

1. ** 2D ** (glyphDither, bloomFast): WebGL2
2. **** (noiseFill, gradient): WebGL2
3. **3D SDF** (sdf_shape): WebGL2 raymarching
4. **** (): multi-pass FBO
5. ****: Canvas 2D → WebGL

## Playwright

Playwright headless WebGL

- `Renderer: WebGL context could not be created`
- `0 canvas(es) found`
- `Error creating Curtains instance`
-

 `swiftshader`

```bash
--use-angle=swiftshader
--use-gl=angle
--enable-unsafe-swiftshader
--ignore-gpu-blocklist
```



1. console shader/runtime WebGL context
2. DOM `canvas`
3. `swiftshader`
4.

### Glyph Atlas

 glyph atlas base64 PNG
 Canvas 2D

```js
function createGlyphAtlas(chars, size = 40) {
 const canvas = document.createElement('canvas');
 canvas.width = size * chars.length;
 canvas.height = size;
 const ctx = canvas.getContext('2d');
 ctx.fillStyle = '#000';
 ctx.fillRect(0, 0, canvas.width, canvas.height);
 ctx.fillStyle = '#fff';
 ctx.font = `bold ${size * 0.8}px monospace`;
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 for (let i = 0; i < chars.length; i++) {
 ctx.fillText(chars[i], size * i + size / 2, size / 2);
 }
 return canvas; // → gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)
}
```

## Cloud Functions

 `https://us-central1-unicorn-studio.cloudfunctions.net/`
- `publishEmbedTest` / embed
- `getUserIdByUsername` →userId
- `handleVideos/handleModels/handleImages`
- `generateImprovedMSDF` MSDF
- `generateDepthMap`
- `copyRemixAssets` remix

##

```bash
# 1. URL remix ID
REMIX_ID="QZxhNFb1X1OaUqaJLT9S"

# 2. remix
curl -s "https://firestore.googleapis.com/v1/projects/unicorn-studio/databases/(default)/documents/remixes/$REMIX_ID?key=$API_KEY" > remix.json

# 3. versionId
VERSION_ID=$(python3 -c "import json; print(json.load(open('remix.json'))['fields']['versionId']['stringValue'])")

# 4.
curl -s "https://firestore.googleapis.com/v1/projects/unicorn-studio/databases/(default)/documents/versions/$VERSION_ID?key=$API_KEY" > version.json

# 5. → Python/Node Firestore REST

# 6. app bundle shader
curl -s "https://www.unicorn.studio/assets/index-*.js" > app-bundle.js
# shader

# 7. + shader → WebGL2
```
