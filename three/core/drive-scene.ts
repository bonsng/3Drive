import {
  AmbientLight,
  Color,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  WebGPURenderer,
} from 'three/webgpu';
import { OrbitControls } from 'three/addons';
import { DRIVEPAGE_CAMERA } from '../constants/camera';
import { MAX_PIXEL_RATIO } from '../constants/renderer';

export function createDriveScene(canvas: HTMLCanvasElement) {
  // ── Scene ──────────────────────────────────────────────
  const scene = new Scene();
  scene.background = new Color(0x050510);

  // ── Camera ─────────────────────────────────────────────
  const camera = new PerspectiveCamera(
    DRIVEPAGE_CAMERA.fov,
    window.innerWidth / window.innerHeight,
    DRIVEPAGE_CAMERA.near,
    DRIVEPAGE_CAMERA.far,
  );
  camera.position.set(...DRIVEPAGE_CAMERA.position);

  // ── Renderer ───────────────────────────────────────────
  const renderer = new WebGPURenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, MAX_PIXEL_RATIO));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // ── Lights ─────────────────────────────────────────────
  const ambientLight = new AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7);
  scene.add(directionalLight);

  // ── Controls ───────────────────────────────────────────
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 2;
  controls.maxDistance = 30;

  // ── Animation Loop ─────────────────────────────────────
  function animate() {
    controls.update();
    renderer.render(scene, camera);
  }

  // ── Resize ─────────────────────────────────────────────
  let resizeTimeout: number;

  function onResize() {
    cancelAnimationFrame(resizeTimeout);
    resizeTimeout = requestAnimationFrame(() => {
      const { innerWidth: w, innerHeight: h } = window;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  // ── Lifecycle ──────────────────────────────────────────
  async function init() {
    await renderer.init();
    window.addEventListener('resize', onResize);
    renderer.setAnimationLoop(animate);
  }

  let disposed = false;

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(resizeTimeout);
    renderer.setAnimationLoop(null);
    window.removeEventListener('resize', onResize);
    controls.dispose();
    renderer.dispose();
  }

  return { init, dispose, scene, camera, renderer, controls };
}
