import { useRef } from 'react';
import { useLandingScene } from '../hooks/use-landing-scene';
import { useLandingAnimations } from '../hooks/use-landing-animations';
import { LANDING_SECTIONS } from './landing/components/sections';
import { ContextMenuOverlay } from './landing/components/overlay/ContextMenuOverlay';
import { PreviewOverlay } from './landing/components/overlay/PreviewOverlay';

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useLandingScene(canvasRef);
  useLandingAnimations(containerRef, { contextMenuRef, previewRef });

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 h-full w-full" />
      <ContextMenuOverlay ref={contextMenuRef} />
      <PreviewOverlay ref={previewRef} />
      <div ref={containerRef} className="relative z-10">
        {LANDING_SECTIONS.map((Section, i) => (
          <Section key={i} />
        ))}
      </div>
    </>
  );
}
