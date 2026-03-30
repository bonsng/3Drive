import { HOMEPAGE_CAMERA } from '../constants';

const [camX, camY, camZ] = HOMEPAGE_CAMERA.position;

export const landingSceneState = {
  camera: { x: camX, y: camY, z: camZ },
  lookAt: { x: 0, y: 0, z: 0 },
  morphProgress: 0,
  dragProgress: 0,
  orbitTheta: 0,
  treeLinesOpacity: 0,
  contextMenuOpacity: 0,
  previewOpacity: 0,
};

export type LandingSceneState = typeof landingSceneState;
