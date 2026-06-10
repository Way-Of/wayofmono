# Three.js TSL

Three.js r170+ TSL (Three Shading Language) JS shader GLSL

##

1. Bundle `uniform`/`shader` `precision`/`gl_FragColor`
2. canvas `data-engine` r170+
3. `.mul()`/`.add()`/`.toVar()`/`.assign()`

## TSL → GLSL

| TSL | GLSL |
|-----|------|
| `screenUV` | `gl_FragCoord.xy / resolution` |
| `viewportSize` | `uniform vec2 resolution` |
| `float()`/`vec2()`/`vec3()`/`vec4()` | TSL JS |
| `.mul()`/`.add()`/`.sub()`/`.div()` | `*`/`+`/`-`/`/` |
| `sin()`/`cos()`/`mix()`/`smoothstep()` | |
| `clamp()`/`abs()`/`fract()`/`floor()` | |
| `pow()`/`exp()`/`sqrt()`/`dot()`/`length()` | |
| `Fn()` | shader GLSL |
| `uniform()` | `uniform <type> name` |
| `convertToTexture()` | RTT pass |
| `.sample(uv)` | `texture(sampler, uv)` |
| `.toVar()`/`.assign()` | / |
| `.oneMinus()` | `1.0 - x` |

##

1. **** `fragmentNode`
2. **** bundle import minified → TSL
 ```javascript
 import { A as screenUV, W as sin, ... } from "three-module"
 ```
3. **** → GLSL
 ```javascript
 // TSL: screenUV.x.sub(center.x).mul(aspect)
 // GLSL: (uv.x - center.x) * aspect
 ```
4. **RTT**`convertToTexture(childNode)` → pass FBO shader `texture()`
