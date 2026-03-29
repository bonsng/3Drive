import { SectionText } from '../shared/SectionText';

export function FeatureCamera() {
  return (
    <section className="pointer-events-none relative flex h-screen items-center">
      <div className="w-full">
        <SectionText
          label="Camera Controls"
          title="자유로운 시점 전환"
          description="회전, 줌, 패닝. 3D 공간을 자유롭게 탐색하며 원하는 각도에서 파일 구조를 살펴보세요."
          align="right"
        />
      </div>
    </section>
  );
}
