import { useEffect, type RefObject } from 'react';
import { createScrollTimeline } from '../../three/animations/scroll-timeline';
import { initTextAnimations } from '../pages/landing/animations/text-animations';
import { landingSceneState } from '../../three/core/landing-scene-state';

interface OverlayRefs {
  contextMenuRef: RefObject<HTMLDivElement | null>;
  previewRef: RefObject<HTMLDivElement | null>;
}

export function useLandingAnimations(
  containerRef: RefObject<HTMLDivElement | null>,
  overlayRefs: OverlayRefs,
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { kill: killScroll } = createScrollTimeline(container);
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
    };
  }, []);
}
