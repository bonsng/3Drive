export default function DrivePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="w-96 rounded-2xl border border-white/15 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
        <h1 className="mb-2 text-xl font-semibold text-white/90">페이지 준비 중</h1>
        <p className="mb-6 text-sm leading-relaxed text-white/50">
          3D 파일 탐색기를 열심히 만들고 있습니다.
          <br />
          조금만 기다려 주세요!
        </p>
        <div className="flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block h-2 w-2 animate-bounce rounded-full bg-blue-400/70"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
