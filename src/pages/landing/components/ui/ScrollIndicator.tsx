import { ChevronDown } from 'lucide-react';

interface ScrollIndicatorProps {
  visible: boolean;
}

export function ScrollIndicator({ visible }: ScrollIndicatorProps) {
  return (
    <div
      className={`pointer-events-none fixed bottom-10 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <span className="text-[10px] tracking-[0.2em] text-white/40 uppercase">Scroll</span>
      <ChevronDown className="h-4 w-4 animate-[scroll-bounce_1.5s_ease-in-out_infinite] text-blue-400/80" />
    </div>
  );
}
