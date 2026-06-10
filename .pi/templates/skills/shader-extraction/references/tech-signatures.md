#

## Three.js

****`THREE.`, `WebGLRenderer`, `ShaderMaterial`, `BufferGeometry`

****

| | |
|---------|--------|
| `new X({canvas, antialias, alpha})` | `WebGLRenderer` |
| `new X(fov, aspect, near, far)` 4 | `PerspectiveCamera` |
| `new X(-1, 1, 1, -1, 0, 1)` 6 | `OrthographicCamera` |
| `new X(w, h, {wrapS, minFilter})` | `WebGLRenderTarget` |
| `new X(data, w, h, format, type)` Float32Array | `DataTexture` |
| `new X(2, 2)` | `PlaneGeometry` |
| `new X({uniforms, vertexShader, fragmentShader})` | `ShaderMaterial` |
| `X.getElapsedTime()` | `Clock` |

****`ClampToEdgeWrapping`, `NearestFilter`, `RGBAFormat`, `FloatType`, `DoubleSide`

## 2D Canvas

`dataEngine: null` `getContext('2d')` + `createShader`/`shaderSource`
- `getContext('2d')` WebGL → 2D Canvas
- WebGL → Raw WebGL / PixiJS

## Raw WebGL

```javascript
gl.createShader / gl.shaderSource / gl.compileShader / gl.createProgram
gl.bindBuffer / gl.bindFramebuffer / gl.drawArrays
```

## PixiJS

`PIXI.Application`, `PIXI.Filter`, `new PIXI.Filter(vertSrc, fragSrc, uniforms)`

## Babylon.js

`BABYLON.Engine`, `BABYLON.ShaderMaterial`, `BABYLON.Effect.ShadersStore`

## GPGPU

 `WebGLRenderTarget`ping-pong+ `OrthographicCamera(-1,1,1,-1,0,1)` + `PlaneGeometry(2,2)` + `DataTexture` + `setRenderTarget`

##

| | |
|------|------|
| `snoise` | Simplex noise (Ashima) |
| `cnoise` | Classic Perlin |
| `cellular` | Worley/Voronoi |
| `fbm` | Fractal Brownian Motion |
