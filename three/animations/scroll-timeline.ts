import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LANDING } from '../constants';
import { landingSceneState } from '../core/landing-scene-state';

gsap.registerPlugin(ScrollTrigger);

const SECTION_COUNT = 7;
const SEGMENT_COUNT = SECTION_COUNT - 1;

/**
 * 스크롤 컨테이너에 GSAP ScrollTrigger 타임라인을 생성한다.
 * 기본 스크롤을 차단하고 섹션 단위로만 이동.
 *
 * 7개 섹션 = duration 6 (섹션 간 전환 6구간)
 */
export function createScrollTimeline(container: HTMLElement) {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
    },
  });

  const { camera: CAM } = LANDING;

  // Section 1→2: 구체 → 점 수렴 → 트리 폭발 + 카메라 3/4 뷰로 이동
  tl.to(landingSceneState, { morphProgress: 1, duration: 1 }, 0);
  tl.to(landingSceneState.camera, { ...CAM.treeView, duration: 0.6 }, 0.4);
  tl.to(landingSceneState.lookAt, { ...CAM.treeViewLookAt, duration: 0.6 }, 0.4);
  tl.to(landingSceneState, { treeLinesOpacity: 1, duration: 0.3 }, 0.7);

  // Section 2→3: 트리 유지, dragProgress 시작
  tl.to(landingSceneState, { dragProgress: 1, duration: 1 }, 1);

  // Section 3→4: dragProgress 리셋 + 카메라 정면 줌인 + 컨텍스트 메뉴 등장
  tl.to(landingSceneState, { dragProgress: 0, duration: 0.5 }, 2);
  tl.to(landingSceneState.camera, { x: 0, y: 0, z: CAM.zoomInZ, duration: 1 }, 2);
  tl.to(landingSceneState.lookAt, { x: 0, y: 0, z: 0, duration: 0.5 }, 2);
  tl.to(landingSceneState, { contextMenuOpacity: 1, duration: 0.5 }, 2.3);

  // Section 4→5: 컨텍스트 메뉴 퇴장 + lookAt 패닝 + 프리뷰 등장
  tl.to(landingSceneState, { contextMenuOpacity: 0, duration: 0.3 }, 3);
  tl.to(landingSceneState.lookAt, { ...CAM.panLookAt, duration: 1 }, 3);
  tl.to(landingSceneState, { previewOpacity: 1, duration: 0.5 }, 3.3);

  // Section 5→6: 프리뷰 퇴장 + 줌아웃 + 공전 (orbitTheta 0→2π)
  tl.to(landingSceneState, { previewOpacity: 0, duration: 0.3 }, 4);
  tl.to(landingSceneState.camera, { z: CAM.zoomOutZ, duration: 1 }, 4);
  tl.to(landingSceneState, { orbitTheta: Math.PI * 2, duration: 1 }, 4);

  // Section 6→7: lookAt 원점 복귀 + 트리 → 구체 복귀 + 연결선 퇴장
  tl.to(landingSceneState.lookAt, { x: 0, y: 0, duration: 0.5 }, 5);
  tl.to(landingSceneState, { treeLinesOpacity: 0, duration: 0.3 }, 5);
  tl.to(landingSceneState, { morphProgress: 0, duration: 1 }, 5);

  // --- 섹션 단위 스크롤 (기본 스크롤 차단) ---
  let currentSection = 0;
  let isAnimating = false;
  const scrollProxy = { y: 0 };

  function getScrollMax() {
    return container.scrollHeight - window.innerHeight;
  }

  function goToSection(index: number) {
    currentSection = Math.max(0, Math.min(index, SEGMENT_COUNT));
    isAnimating = true;
    const target = (currentSection / SEGMENT_COUNT) * getScrollMax();
    scrollProxy.y = window.scrollY;
    gsap.to(scrollProxy, {
      y: target,
      duration: 0.8,
      ease: 'power2.inOut',
      onUpdate() {
        window.scrollTo(0, scrollProxy.y);
      },
      onComplete() {
        isAnimating = false;
      },
    });
  }

  let wheelCooldown = false;

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    if (isAnimating || wheelCooldown) return;
    wheelCooldown = true;
    setTimeout(() => {
      wheelCooldown = false;
    }, 1500);
    if (e.deltaY > 0) goToSection(currentSection + 1);
    else if (e.deltaY < 0) goToSection(currentSection - 1);
  }

  let touchStartY = 0;
  function onTouchStart(e: TouchEvent) {
    touchStartY = e.touches[0].clientY;
  }
  function onTouchMove(e: TouchEvent) {
    e.preventDefault();
  }
  function onTouchEnd(e: TouchEvent) {
    if (isAnimating) return;
    const delta = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(delta) < 50) return;
    if (delta > 0) goToSection(currentSection + 1);
    else goToSection(currentSection - 1);
  }

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd, { passive: true });

  return {
    timeline: tl,
    kill() {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      tl.scrollTrigger?.kill();
      tl.kill();
    },
  };
}
