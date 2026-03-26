import { useEffect, useRef } from 'react';
import { useLandingScene } from '../hooks/use-landing-scene';
import { createScrollTimeline } from '../../three/animations/scroll-timeline';

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useLandingScene(canvasRef);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { kill } = createScrollTimeline(container);
    return kill;
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 h-full w-full" />
      <div ref={containerRef} className="relative z-10">
        <section className="h-screen" />
        <section className="h-screen" />
        <section className="h-screen" />
        <section className="h-screen" />
        <section className="h-screen" />
        <section className="h-screen" />
        <section className="h-screen" />
      </div>
    </>
  );
}
