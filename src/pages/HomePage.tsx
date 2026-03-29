import { useEffect, useRef } from 'react';
import { useLandingScene } from '../hooks/use-landing-scene';
import { createScrollTimeline } from '../../three/animations/scroll-timeline';
import { initTextAnimations } from './landing/animations/text-animations';
import { HeroSection } from './landing/components/hero/HeroSection';
import { FeatureExplorer } from './landing/components/features/FeatureExplorer';
import { FeatureDragDrop } from './landing/components/features/FeatureDragDrop';
import { FeatureContextMenu } from './landing/components/features/FeatureContextMenu';
import { FeaturePreview } from './landing/components/features/FeaturePreview';
import { FeatureCamera } from './landing/components/features/FeatureCamera';
import { FooterCTA } from './landing/components/footer/FooterCTA';

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useLandingScene(canvasRef);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { kill: killScroll } = createScrollTimeline(container);
    const killText = initTextAnimations(container);

    return () => {
      killScroll();
      killText();
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 h-full w-full" />
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
