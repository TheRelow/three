import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const renderer = new THREE.WebGLRenderer()

renderer.setSize(window.innerWidth, window.innerHeight)

document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

const orbit = new OrbitControls(camera, renderer.domElement)

const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

const gridHelper = new THREE.GridHelper(30)
// scene.add(gridHelper)

const sphereGeometry = new THREE.SphereGeometry(4, 50, 50)
const sphereMaterial = new THREE.MeshBasicMaterial({
  color: 0x0000FF,
  wireframe: true
})
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
scene.add(sphere)

// camera.position.z = 5
// camera.position.y = 2
// camera.position.x = 2
camera.position.set(-10,30,30)
orbit.update()

const boxGeometry = new THREE.BoxGeometry()
const boxMaterial = new THREE.MeshBasicMaterial({color: 0x00FF00})
const box = new THREE.Mesh(boxGeometry, boxMaterial)
scene.add(box)
box.rotation.x = 5
box.rotation.y = 5

const planeGeometry = new THREE.PlaneGeometry(30, 30)
const planeMaterial = new THREE.MeshBasicMaterial({
  side: THREE.DoubleSide,
  color: 0xFFFFFF
})
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
scene.add(plane)
plane.rotation.x = -0.5 * Math.PI

function animate() {
  box.rotation.x += 0.01
  box.rotation.y += 0.03
  box.rotation.z += 0.02
  renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate)