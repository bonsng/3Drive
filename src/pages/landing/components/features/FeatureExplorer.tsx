import { SectionText } from '../shared/SectionText';

export function FeatureExplorer() {
  return (
    <section className="pointer-events-none relative flex h-screen items-center">
      <div className="w-full">
        <SectionText
          label="3D File Explorer"
          title="공간 속의 파일 시스템"
          description="폴더와 파일이 3차원 공간에 펼쳐집니다. 직관적인 트리 구조로 전체 파일 시스템을 한눈에 파악하세요."
          align="left"
        />
      </div>
    </section>
  );
}
