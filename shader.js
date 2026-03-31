import * as THREE from "three";
import { OBJLoader } from "three/addons";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// config & setup
const canvas = document.querySelector('.webgl');
const scene = new THREE.Scene();

// renderer
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias:true});

// camera
const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.001, 100);

// controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;
// controls.dampingFactor = 0.05;
// controls.enableZoom = false;

// material
const material = new THREE.MeshBasicMaterial({
    wireframe: true, color: 0x000000 });

// obj loading
const loader = new OBJLoader();
const object = await loader.loadAsync('./model-3-lod-0.obj');

object.traverse(child => child.isMesh && (child.material = material));
object.scale.set(.25,.25,.25);
// object.rotateOnAxis(new THREE.Vector3(1, 0, -1).normalize(), Math.PI / 2);

scene.add(object);

const box = new THREE.Box3().setFromObject(object);
const center = box.getCenter(new THREE.Vector3());
const size   = box.getSize(new THREE.Vector3());

object.position.sub(center);

const maxDim = Math.max(size.x, size.y, size.z);
const fovRad = THREE.MathUtils.degToRad(camera.fov);
const dist   = (maxDim / 2) / Math.tan(fovRad / 2);

camera.position.set(0, 0, dist*0);
camera.lookAt(1, -3, 0);
//fog
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.Fog(15659506, 1, 10);

// responsiveness
const updateSize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};
window.addEventListener('resize', updateSize);
updateSize();

// loop
const clock = new THREE.Clock();

const animate = () => {
    const delta = clock.getDelta();

    // object.rotation.x += 0.05 * delta;
    object.rotation.y += 0.05 * delta;

    // controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};
animate();