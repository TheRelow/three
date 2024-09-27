import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// Инициализация рендерера
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Создание сцены
const scene = new THREE.Scene()

// Настройка камеры
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

// Управление камерой
const orbit = new OrbitControls(camera, renderer.domElement)
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

// Создание сферы
// const sphereGeometry = new THREE.SphereGeometry(4, 50, 50)
// const sphereMaterial = new THREE.MeshBasicMaterial({
//   color: 0x0000FF,
//   wireframe: true,
// })
// const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
// scene.add(sphere)

// Позиция камеры
camera.position.set(-10, 30, 30)
orbit.update()

// Загрузка текстуры из файла
import lettersTexturePath from './../assets/letters-texture7.png'
const textureLoader = new THREE.TextureLoader()
const lettersTexture = textureLoader.load(lettersTexturePath, () => {
  console.log('Texture loaded successfully')
}, undefined, (error) => {
  console.error('An error occurred while loading the texture', error)
})

// Создание нового шейдерного материала
const newShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    iTime: { value: 0.0 },
    iMouse: { value: new THREE.Vector2(-1000, -1000) },
    iChannel0: { value: lettersTexture },
    symbolSize: { value: 18.0 }, // Размер символов
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision mediump float;
    uniform vec2 iResolution;
    uniform float iTime;
    uniform vec2 iMouse;
    uniform sampler2D iChannel0;
    uniform float symbolSize;

    float rand(float seed, float amt, float min) {
      return floor(fract(sin(seed * 12.9898) * 43758.5453) * amt) + min;
    }

    float text(vec2 fragCoord) {
      vec2 uv = mod(fragCoord, symbolSize) / symbolSize;
      vec2 block = fragCoord / symbolSize - uv;
      uv /= 8.0;

      uv.x += rand(floor(block.x * 126.0 / block.y * 12.), 8., 0.) / 8.0;
      uv.y = rand(floor(block.x * 126.0 / block.y * 12.), 4., 5.) / 8.0 - uv.y;

      return texture2D(iChannel0, uv).r;
    }

    float rand(float x) {
      return fract(sin(x * 12.9898) * 43758.5453);
    }

    vec3 rain(vec2 fragCoord) {
      fragCoord.x -= mod(fragCoord.x, symbolSize);
      float offset = sin(fragCoord.x * 1234.0);
      float randomFactor = rand(fragCoord.x) * 0.9 + 0.1;
      float randomScale = randomFactor * 3.5 + 1.;
      float speed = (cos(fragCoord.x * 1234.0) * 0.07 + 0.17) / randomScale;
      float y = fract(fragCoord.y / iResolution.y / randomScale + iTime * speed + offset);
      float adjustedY = y > 0.03 ? 0.03 : y;
      float intensity = smoothstep(325.0, 0.0, length(fragCoord.xy - iMouse.xy)) * 2.0 + 1.0;

      return vec3(0.0, 0.373, 1.0) / (adjustedY * 20.0) * intensity;
    }

    void main() {
      vec2 fragCoord = gl_FragCoord.xy;
      vec3 backgroundColor = vec3(28.0 / 255.0, 24.0 / 255.0, 51.0 / 255.0);
      vec3 textColor = text(fragCoord) * rain(fragCoord);
      vec3 finalColor = mix(backgroundColor, textColor, length(textColor));
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
})

// Создание плоскости с новым шейдерным материалом
const planeGeometry = new THREE.PlaneGeometry(30, 30)
const plane = new THREE.Mesh(planeGeometry, newShaderMaterial)
scene.add(plane)
plane.rotation.x = -0.5 * Math.PI

// Обновление униформ для шейдера
function updateUniforms() {
  newShaderMaterial.uniforms.iTime.value += 0.05
  newShaderMaterial.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight)
}

// Добавление нового слоя с изображением bg.svg
import bgTexturePath from './../assets/bg.svg'
const bgTexture = textureLoader.load(bgTexturePath, () => {
  console.log('Background texture loaded successfully')
}, undefined, (error) => {
  console.error('An error occurred while loading the background texture', error)
})

// Создание нового плоскостного объекта для фона
const bgPlaneGeometry = new THREE.PlaneGeometry(30, 30)
const bgPlaneMaterial = new THREE.MeshBasicMaterial({
  map: bgTexture,
  transparent: true, // Если вы хотите сделать фон полупрозрачным
})
const bgPlane = new THREE.Mesh(bgPlaneGeometry, bgPlaneMaterial)
scene.add(bgPlane)
bgPlane.rotation.x = -0.5 * Math.PI
bgPlane.position.y = 30 // Поднимаем на 30 пикселей

// Анимация
function animate() {
  updateUniforms()
  renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate)

// Обновление позиции мыши для шейдера
document.addEventListener('mousemove', (event) => {
  const rect = renderer.domElement.getBoundingClientRect()
  newShaderMaterial.uniforms.iMouse.value.set(
    event.clientX - rect.left,
    window.innerHeight - (event.clientY - rect.top)
  )
})