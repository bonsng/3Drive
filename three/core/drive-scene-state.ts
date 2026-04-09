import { DRIVEPAGE_CAMERA } from '../constants';

const [camX, camY, camZ] = DRIVEPAGE_CAMERA.position;

export const driveSceneState = {
  camera: { x: camX, y: camY, z: camZ },
  lookAt: { x: 0, y: 0, z: 0 },
};

export type DriveSceneState = typeof driveSceneState;
