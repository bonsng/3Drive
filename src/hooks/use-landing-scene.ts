import { type RefObject, useEffect, useRef } from 'react';
import { createLandingScene } from '../../three/core/landing-scene';

export function useLandingScene(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const landingRef = useRef<ReturnType<typeof createLandingScene> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    const landing = createLandingScene(canvas);
    landingRef.current = landing;

    landing.init().then(() => {
      if (cancelled) landing.dispose();
    });

    return () => {
      cancelled = true;
      landing.dispose();
      landingRef.current = null;
    };
  }, [canvasRef]);
}
