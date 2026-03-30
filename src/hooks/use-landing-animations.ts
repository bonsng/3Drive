import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
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
  const [currentSection, setCurrentSection] = useState(0);
  const goToSectionRef = useRef<((index: number) => void) | null>(null);

  const onSectionChange = useCallback((section: number) => setCurrentSection(section), []);
  const goToSection = useCallback((index: number) => goToSectionRef.current?.(index), []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { kill: killScroll, goToSection: go } = createScrollTimeline(container, onSectionChange);
    goToSectionRef.current = go;
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
      goToSectionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs and callbacks are stable
  }, [containerRef, onSectionChange]);

  return { currentSection, goToSection };
}
