import { WebGLRenderer, Scene, PerspectiveCamera, MeshBasicMaterial, Box3, Vector3, Color, Fog, Clock } from "three";
import { OBJLoader } from "three/addons";

const canvas = document.querySelector('.webgl');
const scene = new Scene();
const renderer = new WebGLRenderer({ canvas, antialias: true });
const camera = new PerspectiveCamera(75, 1, 0.001, 100);

scene.background = new Color(0x000000);
scene.fog = new Fog(0x999999, 1, 10);
camera.lookAt(1, -3, 0);

const object = await new OBJLoader().loadAsync('./model-3-lod-0.obj');
object.traverse(c => c.isMesh && (c.material = new MeshBasicMaterial({ wireframe: true, color: 0x000000 })));
object.scale.setScalar(.25);
object.position.sub(new Box3().setFromObject(object).getCenter(new Vector3()));
scene.add(object);

const velocity = new Vector3();
const addMove = (dx, dy) => {
    velocity.x -= dx / innerWidth * 4;
    velocity.z -= dy / innerHeight * 10;
};

addEventListener('mousemove', e => addMove(e.movementX, e.movementY));

let lastTouch = null;
addEventListener('touchstart', e => lastTouch = e.touches[0], { passive: true });
addEventListener('touchmove', e => {
    const t = e.touches[0];
    if (lastTouch) addMove(t.clientX - lastTouch.clientX, t.clientY - lastTouch.clientY);
    lastTouch = t;
}, { passive: true });
addEventListener('touchend', () => lastTouch = null);

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
    object.rotation.y += 0.02 * dt;
    camera.translateX(velocity.x * dt);
    camera.translateZ(velocity.z * dt);
    velocity.multiplyScalar(Math.exp(-4 * dt));
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
})();