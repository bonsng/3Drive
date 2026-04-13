import { type RefObject, useEffect, useRef } from 'react';
import { createDriveScene } from '../../three/core/drive-scene';
import { processBackendResponse } from '@/lib/tree-transform';
import { mockBackendResponse } from '@/mocks/data';

export function useDriveScene(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const driveSceneRef = useRef<ReturnType<typeof createDriveScene> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const driveScene = createDriveScene(canvas);
    driveSceneRef.current = driveScene;

    driveScene
      .init()
      .then(async () => {
        const { treeData } = processBackendResponse(mockBackendResponse);
        await driveScene.sceneManager.renderTree(treeData, treeData.id);
      })
      .catch(console.error);

    return () => {
      driveScene.dispose();
      driveSceneRef.current = null;
    };
  }, [canvasRef]);
}
