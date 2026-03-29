import { Color, PerspectiveCamera, Scene, Vector2, Vector3, WebGPURenderer } from 'three/webgpu';
import { HOMEPAGE_CAMERA, LANDING, MAX_PIXEL_RATIO } from '../constants';
import { createParticleSphere } from '../objects/sphere';
import { createAmbientParticles } from '../objects/particles';
import { createTreeLayout } from '../objects/tree-layout';
import { createTreeLines } from '../objects/tree-lines';
import { createDragData } from '../effects/drag-trail';
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

  const pointer = new Vector2();
  const lookAtTarget = new Vector3();

  // 3D objects
  const treeLayout = createTreeLayout(LANDING.sphere.count);
  const dragData = createDragData(treeLayout);
  const sphere = createParticleSphere(scene, {
    treePositions: treeLayout.positions,
    dragData,
  });
  const treeLines = createTreeLines(scene, treeLayout.nodes);
  const ambient = createAmbientParticles(scene);

  function animate() {
    const elapsed = performance.now() * 0.001;

    // Sync state → uniforms
    sphere.uniforms.morphProgress.value = landingSceneState.morphProgress;
    sphere.uniforms.dragProgress.value = landingSceneState.dragProgress;

    treeLines.update(landingSceneState.treeLinesOpacity);

    // Sync state → camera (orbitTheta로 XZ 평면 공전)
    const { camera: cam, lookAt, orbitTheta } = landingSceneState;
    const orbitX = Math.sin(orbitTheta) * cam.z;
    const orbitZ = Math.cos(orbitTheta) * cam.z;
    camera.position.set(cam.x + orbitX, cam.y, orbitZ);
    camera.lookAt(lookAtTarget.set(lookAt.x, lookAt.y, lookAt.z));

    sphere.update(elapsed);
    ambient.update(elapsed);

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

  function onPointerMove(e: PointerEvent) {
    pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    sphere.uniforms.pointerX.value = pointer.x;
    sphere.uniforms.pointerY.value = pointer.y;
  }

  async function init() {
    await renderer.init();
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointerMove);
    renderer.setAnimationLoop(animate);
  }

  let disposed = false;

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(resizeTimeout);
    renderer.setAnimationLoop(null);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointermove', onPointerMove);
    sphere.dispose();
    treeLines.dispose();
    ambient.dispose();
    renderer.dispose();
  }

  return { init, dispose, scene, camera, renderer };
}
