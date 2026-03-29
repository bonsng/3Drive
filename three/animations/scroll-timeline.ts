import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LANDING } from '../constants';
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

  const { camera: CAM } = LANDING;

  // Section 1→2: 구체 → 점 수렴 → 트리 폭발 + 카메라 3/4 뷰로 이동
  tl.to(landingSceneState, { morphProgress: 1, duration: 1 }, 0);
  tl.to(landingSceneState.camera, { ...CAM.treeView, duration: 0.6 }, 0.4);
  tl.to(landingSceneState.lookAt, { ...CAM.treeViewLookAt, duration: 0.6 }, 0.4);
  // 연결선: 섹션 2 텍스트가 중간에 왔을 때 fade in (0.7~1.0 구간)
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

  return {
    timeline: tl,
    kill() {
      tl.scrollTrigger?.kill();
      tl.kill();
    },
  };
}
