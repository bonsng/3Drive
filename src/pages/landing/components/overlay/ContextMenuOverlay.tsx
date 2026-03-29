import { forwardRef } from 'react';

const menuItems = [
  { icon: '✏️', label: '이름 변경', shortcut: 'F2' },
  { icon: '📋', label: '복사', shortcut: '⌘C' },
  { icon: '📁', label: '이동', shortcut: '⌘M' },
  { icon: '🔗', label: '공유', shortcut: '⌘⇧S' },
  null, // divider
  { icon: '🗑️', label: '삭제', shortcut: '⌫' },
];

export const ContextMenuOverlay = forwardRef<HTMLDivElement>(function ContextMenuOverlay(_, ref) {
  return (
    <div
      ref={ref}
      className="pointer-events-none fixed top-1/2 right-[18%] z-20 -translate-y-1/2 opacity-0"
    >
      <div className="w-56 rounded-xl border border-white/20 bg-white/10 p-1.5 shadow-2xl backdrop-blur-xl">
        {menuItems.map((item, i) =>
          item === null ? (
            <div key={i} className="my-1 h-px bg-white/10" />
          ) : (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/80"
            >
              <span className="text-xs">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              <span className="text-xs text-white/30">{item.shortcut}</span>
            </div>
          ),
        )}
      </div>
    </div>
  );
});
