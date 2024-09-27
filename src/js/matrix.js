import * as THREE from 'three';

// Вершинный шейдер
const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Фрагментный шейдер
const fragmentShader = `
  precision mediump float;
  uniform vec2 iResolution;
  uniform float iTime;
  uniform vec2 iMouse;
  uniform sampler2D iChannel0;
  uniform float symbolSize;
  varying vec2 vUv;

  float rand(float seed, float amt, float min) {
    return floor(fract(sin(seed * 12.9898) * 43758.5453) * amt) + min;
  }

  float text(vec2 fragCoord) {
    vec2 uv = mod(fragCoord, symbolSize) / symbolSize;
    vec2 block = fragCoord / symbolSize - uv; // px
    uv /= 8.0;

    uv.x += rand(floor(block.x * 126.0 / block.y * 12.0), 8.0, 0.0) / 8.0;
    uv.y = rand(floor(block.x * 126.0 / block.y * 12.0), 4.0, 5.0) / 8.0 - uv.y;

    return texture2D(iChannel0, uv).r;
  }

  float rand(float x) {
    return fract(sin(x * 12.9898) * 43758.5453);
  }

  vec3 rain(vec2 fragCoord) {
    fragCoord.x -= mod(fragCoord.x, symbolSize);

    float offset = sin(fragCoord.x * 1234.0);
    float randomFactor = rand(fragCoord.x) * 0.9 + 0.1;
    float randomScale = randomFactor * 3.5 + 1.0;
    float speed = (cos(fragCoord.x * 1234.0) * 0.07 + 0.17) / randomScale;
    float y = fract(fragCoord.y / iResolution.y / randomScale + iTime * speed + offset);
    float adjustedY = y > 0.03 ? 0.03 : y;
    float intensity = smoothstep(325.0, 0.0, length(fragCoord.xy - iMouse.xy)) * 2.0 + 1.0;

    return vec3(0.0, 0.373, 1.0) / (adjustedY * 20.0) * intensity;
  }

  void main() {
    vec2 fragCoord = gl_FragCoord.xy;

    // Цвет фона #1c1833
    vec3 backgroundColor = vec3(28.0 / 255.0, 24.0 / 255.0, 51.0 / 255.0);

    // Вычисляем текст и дождь
    vec3 textColor = text(fragCoord) * rain(fragCoord);

    // Смешиваем текст с фоном
    vec3 finalColor = mix(backgroundColor, textColor, length(textColor));

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// Создание материала шейдера Three.js
export const lightsShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    iTime: { value: 0.0 },
    iMouse: { value: new THREE.Vector2(0, 0) },
    iChannel0: { value: new THREE.TextureLoader().load('./letters-texture7.png') }, // путь к текстуре
    symbolSize: { value: 18.0 }
  },
  vertexShader,
  fragmentShader,
  side: THREE.DoubleSide,
  transparent: true
});