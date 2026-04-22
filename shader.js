import { WebGLRenderer, Scene, PerspectiveCamera, MeshBasicMaterial, Box3, Vector3, Color, Fog, MathUtils, Clock } from "three";
import { OBJLoader } from "three/addons";

// adjustable parameters
const MOUSE_STRENGTH = -10;
const TILT_STRENGTH  = 10;
const LERP_SPEED     = 1;
const LOOK_AT        = [1, -3, 0];
const FOG_COLOR      = 15659506;
const FOG_NEAR       = 1;
const FOG_FAR        = 10;

const canvas = document.querySelector('.webgl');
const scene = new Scene();
const renderer = new WebGLRenderer({ canvas, antialias: true });
const camera = new PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.001, 100);

const object = await new OBJLoader().loadAsync('./model-3-lod-0.obj');
const material = new MeshBasicMaterial({ wireframe: true, color: 0x000000 });
object.traverse(c => c.isMesh && (c.material = material));
object.scale.setScalar(.25);
scene.add(object);

const box = new Box3().setFromObject(object);
object.position.sub(box.getCenter(new Vector3()));

camera.position.set(0, 0, 0);
camera.lookAt(...LOOK_AT);

const baseCameraPos = camera.position.clone();
const cameraOffset = new Vector3();
const targetOffset = new Vector3();

const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (isMobile) {
    const handleOrientation = (e) => {
        targetOffset.x = ((e.gamma || 0) / 90) * TILT_STRENGTH;
        targetOffset.y = (((e.beta || 0) - 45) / 90) * TILT_STRENGTH;
    };

    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
        const req = () => {
            DeviceOrientationEvent.requestPermission().then(s => {
                if (s === 'granted') addEventListener('deviceorientation', handleOrientation);
            });
            removeEventListener('pointerdown', req);
        };
        addEventListener('pointerdown', req);
    } else {
        addEventListener('deviceorientation', handleOrientation);
    }
} else {
    addEventListener('pointermove', (e) => {
        targetOffset.x =  ((e.clientX / innerWidth)  * 2 - 1) * MOUSE_STRENGTH;
        targetOffset.y = -((e.clientY / innerHeight) * 2 - 1) * MOUSE_STRENGTH;
    });
}

scene.background = new Color(0x000000);
scene.fog = new Fog(FOG_COLOR, FOG_NEAR, FOG_FAR);

const updateSize = () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
};
addEventListener('resize', updateSize);
updateSize();

const clock = new Clock();
(function animate() {
    const dt = clock.getDelta();
    cameraOffset.lerp(targetOffset, 1 - Math.exp(-LERP_SPEED * dt));
    camera.position.copy(baseCameraPos);
    camera.lookAt(...LOOK_AT);
    camera.translateX(cameraOffset.x);
    camera.translateZ(-cameraOffset.y);
    object.rotation.y += 0.05 * dt;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
})();