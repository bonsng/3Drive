import { forwardRef } from 'react';

export const PreviewOverlay = forwardRef<HTMLDivElement>(function PreviewOverlay(_, ref) {
  return (
    <div
      ref={ref}
      className="pointer-events-none fixed top-[50vh] left-[22vw] z-20 -translate-y-1/2"
      style={{ opacity: 0 }}
    >
      <div className="w-72 rounded-xl border border-white/25 bg-white/15 p-4 shadow-2xl backdrop-blur-xl">
        {/* 썸네일 영역 */}
        <div className="mb-3 aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-blue-500/80 to-purple-500/80">
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <div className="text-3xl">📄</div>
            <div className="text-xs text-white">미리보기</div>
          </div>
        </div>

        {/* 파일 정보 */}
        <div className="space-y-1">
          <div className="text-sm font-medium text-white/80">quarterly-report.pdf</div>
          <div className="text-xs text-white/40">2.4 MB · PDF 문서</div>
        </div>

        {/* 메타 정보 */}
        <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
          <div className="flex justify-between text-xs">
            <span className="text-white/30">수정일</span>
            <span className="text-white/50">2024.03.15</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/30">생성자</span>
            <span className="text-white/50">나</span>
          </div>
        </div>
      </div>
    </div>
  );
});
