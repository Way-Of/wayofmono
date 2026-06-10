# shaders.com

shaders.com shader Nuxt.js + Three.js r183 TSL + Supabase

##

- URL: `shaders.com/collection/{slug}/{presetId}` `shaders.com/preset/{id}`
- Canvas: `data-renderer="shaders"` + `data-engine="three.js r183"`
- Nuxt.js (`_nuxt/` )
- Clerk
- Supabase (`data.shaders.com/storage/v1/`)

##

 Unicorn Studio
- ** GLSL** Three.js TSL (Three Shader Language)
- **87 ** TSL `fragmentNode`
- ** XOR + base64 **
- **** Glass children

##

### API

```bash
#
curl -s "https://shaders.com/api/collections/{slug}/{variantId}"

# API +
curl -s "https://shaders.com/api/preview/preset/{presetId}"

# Nuxt payload shader
curl -s "https://shaders.com/collection/{slug}/{id}/_payload.json"
```

###

 XOR + base64

1. ** API**`/api/collections/`
 - : `a5e7244ad0973f07e10285bfa75ddbe4` Nuxt runtime config
 - /`C52`=Plasma, `p06`=angle,
 - : `JSON.parse(XOR(base64decode(encoded), keyBytes))`
 - code→name

2. ** API**`/api/preview/`
 - : `shaders-preview-key`
 -
 - `ImageTexture`

###

87 `C00-C86`233 `p00-p232`
 JS bundle

##

### Y

**SDF UV Y **

shaders.com SDF `.bin`****Y=0
 WebGL Y=0

```glsl
// shapeUV
float sdf = texture(tSDF, shapeUV).r;

// Y
vec2 sdfUV = vec2(shapeUV.x, 1.0 - shapeUV.y);
float sdf = texture(tSDF, sdfUV).r;

// Y
float dSdy = -(texture(tSDF, sdfUV - vec2(0, eps)).r - sdf) / eps;
```

 `center.y` DOM Y=0
 Glass shader `center.y = 1.0 - center.y`

### SDF

- 512×512 Float32 1,048,576 bytes = 512² × 4
- == [-0.065, 0.486]
- **** `*2-1`
- `OES_texture_float_linear`
- WebGL2 `gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, 512, 512, 0, gl.RED, gl.FLOAT, data)`

##

| | | |
|------|------|--------|
| | Plasma, Godrays, SimplexNoise, LinearGradient, RadialGradient | |
| | Glass, Blob, Circle, Ring, Star, RoundedRect, Polygon | Glass |
| | WaveDistortion, ChromaticAberration, Liquify, Twirl, Bulge | - |
| | FilmGrain, Halftone, Ascii, Dither, Glow, Bloom | - |
| | Blur, ProgressiveBlur, BrightnessContrast, HueShift | |

##

```
Three.js r183 TSL
├─ WebGPU WebGL
├─ +
├─
├─ children RTT (render-to-texture)
├─ blend mode
└─ Glass SDF → → → → → → → →
```

##

1. **TSL ** GLSL
2. ** JS bundle TSL `fragmentNode`** → → GLSL
3. ** → multi-pass FBO **
4. **SDF Y-flip**
5. **Glass **20+

##

shaders.com Three.js **linear **
- hex `#2c2c42` **sRGB**
- TSL `color()` sRGB→linear
- FBO linear
- linear→sRGB


```glsl
// 1. sRGB hex → linear
vec3 colorA = pow(vec3(0.173, 0.173, 0.259), vec3(2.2)); // #2c2c42

// 2. pass linear gamma
// 3. passlinear → sRGB
fragColor = vec4(pow(color.rgb, vec3(1.0/2.2)), color.a);
```

**** pass gamma pass /

##

**** TSL

```
TSL → GLSL
aberration * 0.06 → 0.12
fresnelSoftness * 0.06 → 0.12
fresnel (0.17) → 0.4
SDF gradient eps = 0.01 → 0.005
```


1. sRGB/linear
2. Perlin vs `mx_noise_float`
3.
4. FBO

****""

## TSL

`timerLocal(speed)` = `speed` `uTime = seconds * speed`

 shader

| | speed | shader | / |
|------|-----------|----------------|------------|
| Plasma | 2 | × 0.125 | 0.25 |
| Godrays | 0.7 | × 0.2 | 0.14 |
| WaveDistortion | 0.8 | × 0.5 | 0.4 |
| FilmGrain | | | 0 |

## TSL→GLSL SPCVwBqR.js



| | TSL | GLSL |
|--------|---------|------|
| C / z | vec4() | vec4 |
| x / D | vec2() | vec2 |
| q / N | vec3() | vec3 |
| P / J | resolution | u_resolution |
| A / $ | uv | vUv |
| se / Oe | sin() | sin() |
| W / I | cos() | cos() |
| ne | mix() | mix() |
| D | smoothstep() | smoothstep() |
| fe | clamp() | clamp() |
| ar | mx_noise_float() | perlinNoise3D() |
| dr / Gt | timerLocal() | u_time × speed |
| Me / wt | rtt() | FBO pass |
| Ce | renderOutput() | fragColor |
