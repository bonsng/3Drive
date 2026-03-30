type DirectionCallback = () => void;

interface ScrollDirectionOptions {
  wheelCooldown: number;
  touchThreshold: number;
}

/**
 * wheel/touch 이벤트에서 스크롤 방향을 감지하여 콜백을 호출한다.
 * 기본 스크롤은 차단되며, wheel에는 쿨다운이 적용된다.
 */
export function listenScrollDirection(
  onNext: DirectionCallback,
  onPrev: DirectionCallback,
  options: ScrollDirectionOptions,
) {
  let isCoolingDown = false;

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    if (isCoolingDown) return;
    isCoolingDown = true;
    setTimeout(() => {
      isCoolingDown = false;
    }, options.wheelCooldown);
    if (e.deltaY > 0) onNext();
    else if (e.deltaY < 0) onPrev();
  }

  let touchStartY = 0;
  function onTouchStart(e: TouchEvent) {
    touchStartY = e.touches[0].clientY;
  }
  function onTouchMove(e: TouchEvent) {
    e.preventDefault();
  }
  function onTouchEnd(e: TouchEvent) {
    const delta = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(delta) < options.touchThreshold) return;
    if (delta > 0) onNext();
    else onPrev();
  }

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd, { passive: true });

  return function kill() {
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
  };
}
