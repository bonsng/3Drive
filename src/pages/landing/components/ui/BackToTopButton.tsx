import { ArrowUp } from 'lucide-react';

interface BackToTopButtonProps {
  visible: boolean;
  onClick: () => void;
}

export function BackToTopButton({ visible, onClick }: BackToTopButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Back to top"
      className={`fixed right-8 bottom-8 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 backdrop-blur-xl transition-all duration-300 hover:bg-white/20 ${visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
