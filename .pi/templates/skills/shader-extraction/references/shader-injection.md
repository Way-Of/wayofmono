# onBeforeCompile GLSL

##

 `MeshPhysicalMaterial` `transmission` drei MeshTransmissionMaterial
 `material.onBeforeCompile` GLSL

##

### 1.

Three.js

```glsl
// r166
vec4 getIBLVolumeRefraction(n, v, roughness, diffuseColor, specularColor, specularF90,
 pos, modelMatrix, viewMatrix, projectionMatrix, ior, thickness,
 attenuationColor, attenuationDistance)

// r167+ dispersion
vec4 getIBLVolumeRefraction(n, v, roughness, diffuseColor, specularColor, specularF90,
 pos, modelMatrix, viewMatrix, projectionMatrix, dispersion, ior, thickness,
 attenuationColor, attenuationDistance)
```

****
```bash
curl -s "https://cdn.jsdelivr.net/npm/three@0.167.0/src/renderers/shaders/ShaderChunk/transmission_pars_fragment.glsl.js" \
 | tr '\n' ' ' | grep -oE 'vec4 getIBLVolumeRefraction\([^)]+\)'
```

### 2. GLSL

```glsl
// GLSL
void main() {
 float myRand(vec2 co) { return fract(sin(...)); } //
}

//
float myRand(vec2 co) { return fract(sin(...)); }
void main() {
 float r = myRand(uv);
}
```

### 3.


- `vWorldPosition` → `USE_TRANSMISSION`
- `vTransmissionMapUv` → `USE_TRANSMISSIONMAP`
- `roughnessFactor` → `lights_physical_fragment`

```glsl
// #include <transmission_fragment>
// #ifdef USE_TRANSMISSION
#ifdef USE_TRANSMISSION
 // ...
#endif
```

### 4.

/ Three.js
- `hash`, `random`, `noise`
- `snoise` → OK`random` →
- uniform `u``uDistortion`, `uNoiseTime`

##

### normal chunk

```javascript
material.onBeforeCompile = (shader) => {
 shader.uniforms.uDistortion = { value: 0 };
 shader.uniforms.uNoiseTime = { value: 0 };

 // fragment shader uniform +
 shader.fragmentShader = `
 uniform float uDistortion;
 uniform float uNoiseTime;
 ${noiseGLSL}
 ` + shader.fragmentShader;

 // transmission_fragment
 shader.fragmentShader = shader.fragmentShader.replace(
 '#include <transmission_fragment>',
 `
 #ifdef USE_TRANSMISSION
 {
 // normal
 if (uDistortion > 0.0) {
 normal = normalize(normal + uDistortion * vec3(
 snoiseFractal(vWorldPosition * 0.08 + vec3(uNoiseTime)),
 snoiseFractal(vWorldPosition.zxy * 0.08 - vec3(uNoiseTime)),
 snoiseFractal(vWorldPosition.yxz * 0.08)
 ));
 }
 }
 #endif
 #include <transmission_fragment>
 `
 );
};
```

### +

 MeshTransmissionMaterial
 `#include <transmission_fragment>`

1. `#ifdef USE_TRANSMISSION` / `#endif`
2. transmissionMap thicknessMap `#ifdef`
3. `getIBLVolumeRefraction`
4. `dispersion = 0.0` IOR R/G/B
5. 6+ →

##

| | | |
|------|------|----------|
| | MeshPhysicalMaterial `transmission` | Three.js |
| (chromatic aberration) | IOR R/G/B | transmission_fragment |
| | + | transmission_fragment |
| | simplex noise / | onBeforeCompile |
| | `dispersion` (r167+) | MeshPhysicalMaterial |
