import { Link } from 'react-router';

export function FooterCTA() {
  return (
    <section className="pointer-events-none relative flex h-screen items-center justify-center">
      <div data-animate="text-reveal" className="flex flex-col items-center gap-6 text-center">
        <h2
          data-animate-child
          className="text-5xl font-bold text-white md:text-6xl"
          style={{ textShadow: '0 2px 30px rgba(0,0,0,0.5)' }}
        >
          지금 시작하세요
        </h2>
        <p data-animate-child className="text-xl text-white/60">
          3D 파일 탐색의 새로운 경험
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
