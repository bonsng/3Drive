import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { landingSceneState } from '../core/landing-scene-state';

gsap.registerPlugin(ScrollTrigger);

/**
 * 스크롤 컨테이너에 GSAP ScrollTrigger 타임라인을 생성한다.
 * 스크롤 진행도(0~1)에 따라 landingSceneState 값을 tween.
 *
 * 7개 섹션 = duration 6 (섹션 간 전환 6구간)
 * label: s1→s2 = 0, s2→s3 = 1, ... s6→s7 = 5
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

  // Section 1→2: 구체 → 클러스터 morph
  tl.to(landingSceneState, { morphProgress: 1, duration: 1 }, 0);

  // Section 2→3: 클러스터 유지, dragProgress 시작
  tl.to(landingSceneState, { dragProgress: 1, duration: 1 }, 1);

  // Section 3→4: dragProgress 리셋
  tl.to(landingSceneState, { dragProgress: 0, duration: 0.5 }, 2);

  // Section 5→6: 카메라 공전
  tl.to(landingSceneState, { orbitTheta: Math.PI * 2, duration: 1 }, 4);

  // Section 6→7: 클러스터 → 구체 복귀
  tl.to(landingSceneState, { morphProgress: 0, duration: 1 }, 5);

  return {
    timeline: tl,
    kill() {
      tl.scrollTrigger?.kill();
      tl.kill();
    },
  };
}
