import { type RefObject, useEffect, useRef } from 'react';
import { createDriveScene } from '../../three/core/drive-scene';

export function useDriveScene(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const driveRef = useRef<ReturnType<typeof createDriveScene> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    const drive = createDriveScene(canvas);
    driveRef.current = drive;

    drive.init().then(() => {
      if (cancelled) drive.dispose();
    });

    return () => {
      cancelled = true;
      drive.dispose();
      driveRef.current = null;
    };
  }, [canvasRef]);
}
