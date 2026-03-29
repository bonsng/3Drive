import { useEffect, useRef } from 'react';
import { useLandingScene } from '../hooks/use-landing-scene';
import { createScrollTimeline } from '../../three/animations/scroll-timeline';
import { initTextAnimations } from './landing/animations/text-animations';
import { landingSceneState } from '../../three/core/landing-scene-state';
import { HeroSection } from './landing/components/hero/HeroSection';
import { FeatureExplorer } from './landing/components/features/FeatureExplorer';
import { FeatureDragDrop } from './landing/components/features/FeatureDragDrop';
import { FeatureContextMenu } from './landing/components/features/FeatureContextMenu';
import { FeaturePreview } from './landing/components/features/FeaturePreview';
import { FeatureCamera } from './landing/components/features/FeatureCamera';
import { FooterCTA } from './landing/components/footer/FooterCTA';
import { ContextMenuOverlay } from './landing/components/overlay/ContextMenuOverlay';
import { PreviewOverlay } from './landing/components/overlay/PreviewOverlay';

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useLandingScene(canvasRef);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { kill: killScroll } = createScrollTimeline(container);
    const killText = initTextAnimations(container);

    // 오버레이 opacity를 landingSceneState와 동기화
    let rafId: number;
    function syncOverlays() {
      if (contextMenuRef.current) {
        contextMenuRef.current.style.opacity = String(landingSceneState.contextMenuOpacity);
      }
      if (previewRef.current) {
        previewRef.current.style.opacity = String(landingSceneState.previewOpacity);
      }
      rafId = requestAnimationFrame(syncOverlays);
    }
    rafId = requestAnimationFrame(syncOverlays);

    return () => {
      killScroll();
      killText();
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 h-full w-full" />
      <ContextMenuOverlay ref={contextMenuRef} />
      <PreviewOverlay ref={previewRef} />
      <div ref={containerRef} className="relative z-10">
        <HeroSection />
        <FeatureExplorer />
        <FeatureDragDrop />
        <FeatureContextMenu />
        <FeaturePreview />
        <FeatureCamera />
        <FooterCTA />
      </div>
    </>
  );
}
