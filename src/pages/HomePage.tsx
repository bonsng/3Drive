import { useEffect, useRef } from 'react';
import { createLandingScene } from '../../three/core/landing-scene';

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const landing = createLandingScene(canvas);
    landing.init();

    return () => landing.dispose();
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 h-full w-full" />;
}
