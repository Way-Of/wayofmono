#

##

```
 2D CanvasgetContext('2d') WebGL
├─ YES → Vanilla JS § 2D Canvas
└─ NO → 2D shader /
 ├─ YES → WebGL2
 └─ NO → 3D / PBR / GPGPU / onBeforeCompile
 ├─ YES → CDN importmap
 └─ → Phase 6
```

## WebGL

```
<name>/
├── index.html # <canvas>
├── js/
│ ├── main.js # WebGL2 + pass
│ └── shaders/ # .glsl.jsexport const fragmentShader
└── README.md
```

- `canvas.getContext('webgl2')` + `#version 300 es``in`/`out``texture()`
- pass framebuffer + texture attachment
- `requestAnimationFrame`

## Three.js

```
<name>/
├── index.html # importmap CDN
├── js/
│ ├── main.js # // + RTT
│ └── shaders/ # .glsl.js
└── README.md
```

- `RawShaderMaterial` + `glslVersion: THREE.GLSL3`
- `WebGLRenderTarget` pass
- CDN importmap

CDN
```html
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.183.0/build/three.module.js" } }
</script>
```

`curl -sI '<url>' | head -3`

##

 Unicorn Studio / curtains.js no-code FBO

### 1. parentLayer effects

 Unicorn Studio
- **Element **shape/text/image `effects[]` UUID
- **Effect ** `parentLayer` UUID
- effects pass pass FBO

 FBO pass

### 2. showBg=0

`showBg=0` shader `vec4(0)`
""****

```glsl
// showBg=0 →
if (hit < 0.5) { fragColor = vec4(0.0); return; }

//
if (hit < 0.5) { fragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
```

 alpha composite pass`fg + bg * (1 - fg.a)`

### 3. /

Element text/image Canvas 2D WebGL
****

```glsl
// alpha-over
fragColor = mix(bg, vec4(txt.rgb, 1.0), txt.a);

// additive
fragColor = vec4(bg.rgb + txt.rgb * txt.a, 1.0);

//
fragColor = vec4(bg.rgb * mix(1.0, amplifyFactor, txt.a), 1.0);
```

**** glyph dither
ASCII
::
glyph dither

### 4.

 noiseFill
 shape group
 SDF

### 5. Glyph Atlas

base64 PNG glyph atlas /WebGL `texImage2D`
`INVALID_VALUE: bad image data` Canvas 2D

### 6.

Three.js / shaders.com **linear ** WebGL

```
 pass gamma
 Pass1: pow(linear, 1/2.2) ← sRGB
 Pass2: sRGB + (linear) + pow(result, 1/2.2) ←

 linear gamma
 Pass1~N: linear
 Final: pow(linear, 1/2.2) ← sRGB
```

hex → `pow(srgb, 2.2)` linear → linear → `pow(linear, 1/2.2)`

### 7.

**""**



## 2D Canvas

 `create<Name>Effect(container)` → `{ destroy }` `main.js`

###

- `IntersectionObserver` + `visibilitychange` RAF
- DPR `Math.min(devicePixelRatio, 2)`
- Canvas resize
- `Float32Array`

##

- ES Module`import`/`export`
- minified
- README

## Phase 6

********

```
 RawShaderMaterial + WebGLRenderTarget + fullscreen quad
├─ → WebGL2 ~600KB
 PBR / onBeforeCompile / 3D
├─ →

└─ →
```
