import { Color, PerspectiveCamera, Scene, WebGPURenderer } from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HOMEPAGE_CAMERA, MAX_PIXEL_RATIO } from '../constants';
import { createParticleSphere } from '../objects/sphere';
import { createAmbientParticles } from '../objects/particles';
import { landingSceneState } from './landing-scene-state';

export function createLandingScene(canvas: HTMLCanvasElement) {
  const scene = new Scene();
  scene.background = new Color(0x050510);
  const camera = new PerspectiveCamera(
    HOMEPAGE_CAMERA.fov,
    window.innerWidth / window.innerHeight,
    HOMEPAGE_CAMERA.near,
    HOMEPAGE_CAMERA.far,
  );
  camera.position.set(...HOMEPAGE_CAMERA.position);

  const renderer = new WebGPURenderer({
    canvas,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, MAX_PIXEL_RATIO));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // TODO: remove OrbitControls before production
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  // 3D objects
  const sphere = createParticleSphere(scene);
  const ambient = createAmbientParticles(scene);

  function animate() {
    const elapsed = performance.now() * 0.001;

    // Sync state → uniforms
    sphere.uniforms.morphProgress.value = landingSceneState.morphProgress;
    sphere.update(elapsed);
    ambient.update(elapsed);

    controls.update();
    renderer.render(scene, camera);
  }

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

  async function init() {
    window.addEventListener('resize', onResize);
    renderer.setAnimationLoop(animate);
  }

  function dispose() {
    renderer.setAnimationLoop(null);
    controls.dispose();
    window.removeEventListener('resize', onResize);
    sphere.dispose();
    ambient.dispose();
    renderer.dispose();
  }

  return { init, dispose, scene, camera, renderer };
}
