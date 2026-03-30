import { useEffect, type RefObject } from 'react';
import { createScrollTimeline } from '../../three/animations/scroll-timeline';
import { initTextAnimations } from '../pages/landing/animations/text-animations';
import { landingSceneState } from '../../three/core/landing-scene-state';

interface OverlayRefs {
  contextMenuRef: RefObject<HTMLDivElement | null>;
  previewRef: RefObject<HTMLDivElement | null>;
}

interface SectionScrollRefs {
  onSectionChange: (section: number) => void;
  goToSectionRef: RefObject<((index: number) => void) | null>;
}

export function useLandingAnimations(
  containerRef: RefObject<HTMLDivElement | null>,
  overlayRefs: OverlayRefs,
  sectionScroll?: SectionScrollRefs,
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { kill: killScroll, goToSection } = createScrollTimeline(
      container,
      sectionScroll?.onSectionChange,
    );
    if (sectionScroll) {
      sectionScroll.goToSectionRef.current = goToSection;
    }
    const killText = initTextAnimations(container);

    let rafId: number;
    function syncOverlays() {
      const { contextMenuRef, previewRef } = overlayRefs;
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
      if (sectionScroll) {
        sectionScroll.goToSectionRef.current = null;
      }
    };
  }, []);
}
