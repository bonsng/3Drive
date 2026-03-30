import { Link } from 'react-router';

export function HeroSection() {
  return (
    <section className="pointer-events-none relative flex h-screen items-center justify-center">
      <div data-animate="text-reveal" className="flex flex-col items-center gap-6 text-center">
        <h1
          data-animate-child
          className="text-7xl font-bold text-white md:text-8xl"
          style={{ textShadow: '0 2px 30px rgba(0,0,0,0.5)' }}
        >
          3Drive
        </h1>
        <p data-animate-child className="text-xl text-white/60 md:text-2xl">
          파일 시스템을 3D로 탐색하세요
        </p>
        <Link
          to="/drive"
          data-animate-child
          className="pointer-events-auto mt-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-8 py-3 font-medium text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/20"
        >
          시작하기
        </Link>
      </div>
    </section>
  );
}
