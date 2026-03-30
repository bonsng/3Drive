import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LANDING } from '../constants';
import { landingSceneState } from '../core/landing-scene-state';
import { createSectionScroll } from './section-scroll';

gsap.registerPlugin(ScrollTrigger);

/**
 * 스크롤 컨테이너에 GSAP ScrollTrigger 타임라인을 생성한다.
 * 기본 스크롤을 차단하고 섹션 단위로만 이동.
 *
 * 7개 섹션 = duration 6 (섹션 간 전환 6구간)
 */
export function createScrollTimeline(
  container: HTMLElement,
  onSectionChange?: (section: number) => void,
) {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
    },
  });

  const { camera: CAM } = LANDING;

  // Section 1→2: 구체 → 트리 morph + 카메라 3/4 뷰
  tl.to(landingSceneState, { morphProgress: 1, duration: 1 }, 0);
  tl.to(landingSceneState.camera, { ...CAM.treeView, duration: 0.6 }, 0.4);
  tl.to(landingSceneState.lookAt, { ...CAM.treeViewLookAt, duration: 0.6 }, 0.4);
  tl.to(landingSceneState, { treeLinesOpacity: 1, duration: 0.3 }, 0.7);

  // Section 2→3: 드래그 시작 (단방향, 섹션 전체 사용)
  tl.to(landingSceneState, { dragProgress: 1, duration: 1 }, 1);

  // Section 3→4: 드래그 완료 상태 유지 + 줌인 + 컨텍스트 메뉴
  tl.to(landingSceneState.camera, { x: 0, y: 0, z: CAM.zoomInZ, duration: 1 }, 2);
  tl.to(landingSceneState.lookAt, { x: 0, y: 0, z: 0, duration: 0.5 }, 2);
  tl.to(landingSceneState, { contextMenuOpacity: 1, duration: 0.5 }, 2.3);

  // Section 4→5: 컨텍스트 메뉴 퇴장 + 패닝 + 프리뷰
  tl.to(landingSceneState, { contextMenuOpacity: 0, duration: 0.3 }, 3);
  tl.to(landingSceneState.lookAt, { ...CAM.panLookAt, duration: 1 }, 3);
  tl.to(landingSceneState, { previewOpacity: 1, duration: 0.5 }, 3.3);

  // Section 5→6: 프리뷰 퇴장 + 줌아웃 + 공전
  tl.to(landingSceneState, { previewOpacity: 0, duration: 0.3 }, 4);
  tl.to(landingSceneState.camera, { z: CAM.zoomOutZ, duration: 1 }, 4);
  tl.to(landingSceneState, { orbitTheta: Math.PI * 2, duration: 1 }, 4);

  // Section 6→7: 원점 복귀 + 구체 복귀
  tl.to(landingSceneState.lookAt, { x: 0, y: 0, duration: 0.5 }, 5);
  tl.to(landingSceneState, { treeLinesOpacity: 0, duration: 0.3 }, 5);
  tl.to(landingSceneState, { morphProgress: 0, duration: 1 }, 5);

  const { kill: killScroll, goToSection } = createSectionScroll(container, onSectionChange);

  return {
    timeline: tl,
    goToSection,
    kill() {
      killScroll();
      tl.scrollTrigger?.kill();
      tl.kill();
    },
  };
}
