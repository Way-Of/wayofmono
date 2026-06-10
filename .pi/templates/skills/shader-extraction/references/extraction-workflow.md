# Shader Agent Prompt

## Agent Prompt

 Agentsubagent_type: general-purpose bundle

```
 /tmp/main.js X MB minified JS bundle



1. **GLSL Shader ** "precision", "uniform", "void main",
 "gl_FragColor", "gl_Position" vertex/fragment shader

2. ** JS **canvas/renderer /
 requestAnimationFrame

3. ****minified →
 THREE.Vector2, THREE.Color, THREE.Scene

4. ****

 /tmp/extracted-effects.txt
```

****Agent 1MB+ bundle

## Minified



```javascript
new ??(40, w/h, 0.1, 1000) → PerspectiveCamera(fov, aspect, near, far)
new ??(-1, 1, 1, -1, 0, 1) → OrthographicCamera
new ??({canvas, antialias, ...}) → WebGLRenderer
new ??(2, 2) → PlaneGeometry(w, h)
new ??(data, w, h, fmt, type) → DataTexture
new ??(w, h, {minFilter, ...}) → WebGLRenderTarget

??.setRenderTarget() → renderer
??.getElapsedTime() → clock
??.setAttribute() → bufferGeometry
```

## React / Vue → Vanilla JS

Canvas React/Vue

1. ****`useEffect`/`onMounted` Canvas
2. ** cleanup**`removeEventListener``cancelAnimationFrame``observer.disconnect()` `destroy()`
3. ****Canvas RAF `let` `useState`/`ref`

 API`IntersectionObserver``ResizeObserver``matchMedia`

##

1. ****
2. ****`ringPos`, `particleScale`, `simMaterial`
3. **Shader **uniform/varying minify`uTime`, `vPosition`
4. ** GLSL**shader
5. ****`${someVar.noise}` shader
