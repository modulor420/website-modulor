import * as THREE from "three";
import {
    EffectComposer,RenderPass,BrightnessContrastEffect,EffectPass
} from "postprocessing";
import { OBJLoader } from "three/addons";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// --- config & setup ---
const canvas = document.querySelector('.webgl');
const scene = new THREE.Scene();
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight / 2
};

// --- core objects ---
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(-2, 1, 4);

const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
const composer = new EffectComposer(renderer);

// --- camera ---
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = false;

// --- material ---
const material = new THREE.MeshDepthMaterial({ wireframe: true });

// --- obj ---
const loader = new OBJLoader();
const object = await loader.loadAsync('model-3-lod-0.obj');

object.traverse((child) => {
    if (child.isMesh) child.material = material;
});
object.scale.set(.25, .25, .25);
object.rotateOnAxis(new THREE.Vector3(1, 0, -1), Math.PI / 2);

// --- scene ---
scene.add(camera, object);

// --- post ---
composer.addPass(new RenderPass(scene, camera));
composer.addPass(
    new EffectPass(
        camera,
        new BrightnessContrastEffect({ contrast: 0.25 })
    )
);

// --- responsiveness ---
const updateSize = () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight / 2;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.setSize(sizes.width, sizes.height);
};
window.addEventListener('resize', updateSize);
updateSize();

// --- loop ---
const animate = () => {
    object.rotation.x += 0.0001;
    object.rotation.y += 0.0001;

    controls.update();
    composer.render();
    requestAnimationFrame(animate);
};
animate();