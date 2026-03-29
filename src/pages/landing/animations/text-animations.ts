import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * 스크롤 기반 텍스트 reveal 애니메이션을 초기화한다.
 * [data-animate="text-reveal"] 요소를 찾아 개별 ScrollTrigger를 생성.
 * 반환된 함수를 호출하면 모든 트리거를 정리한다.
 */
export function initTextAnimations(container: HTMLElement): () => void {
  const elements = container.querySelectorAll<HTMLElement>('[data-animate="text-reveal"]');

  const triggers: ScrollTrigger[] = [];

  elements.forEach((el) => {
    const children = el.querySelectorAll<HTMLElement>('[data-animate-child]');
    const targets = children.length > 0 ? Array.from(children) : [el];

    gsap.set(targets, { opacity: 0, y: 40 });

    const tween = gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.15,
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        end: 'top 30%',
        toggleActions: 'play none none reverse',
      },
    });

    if (tween.scrollTrigger) {
      triggers.push(tween.scrollTrigger);
    }
  });

  return () => {
    triggers.forEach((t) => t.kill());
  };
}
