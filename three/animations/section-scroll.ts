import gsap from 'gsap';
import { LANDING } from '../constants/landing';
import { listenScrollDirection } from '../utils/scroll-direction';

const { sectionCount, snapDuration, snapEase, wheelCooldown, touchThreshold } = LANDING.scroll;
const SEGMENT_COUNT = sectionCount - 1;

/**
 * 기본 스크롤을 차단하고 섹션 단위로만 이동하는 컨트롤러를 생성한다.
 */
export function createSectionScroll(
  container: HTMLElement,
  onSectionChange?: (section: number) => void,
) {
  let currentSection = 0;
  let isAnimating = false;
  const scrollProxy = { y: 0 };

  function goToSection(index: number) {
    currentSection = Math.max(0, Math.min(index, SEGMENT_COUNT));
    onSectionChange?.(currentSection);
    isAnimating = true;
    scrollProxy.y = window.scrollY;
    gsap.to(scrollProxy, {
      y: (currentSection / SEGMENT_COUNT) * (container.scrollHeight - window.innerHeight),
      duration: snapDuration,
      ease: snapEase,
      onUpdate() {
        window.scrollTo(0, scrollProxy.y);
      },
      onComplete() {
        isAnimating = false;
      },
    });
  }

  const kill = listenScrollDirection(
    () => {
      if (!isAnimating) goToSection(currentSection + 1);
    },
    () => {
      if (!isAnimating) goToSection(currentSection - 1);
    },
    { wheelCooldown, touchThreshold },
  );

  return { kill, goToSection };
}
