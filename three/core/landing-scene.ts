import { PerspectiveCamera, Scene, WebGPURenderer } from 'three/webgpu';
import { HOMEPAGE_CAMERA, MAX_PIXEL_RATIO } from '../constants';

export function createLandingScene(canvas: HTMLCanvasElement) {
  const scene = new Scene();
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

  function animate() {
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
    window.removeEventListener('resize', onResize);
    renderer.dispose();
  }

  return { init, dispose, scene, camera, renderer };
}
