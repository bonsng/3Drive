import { SectionText } from '../shared/SectionText';

export function FeatureDragDrop() {
  return (
    <section className="pointer-events-none relative flex h-screen items-center">
      <div className="w-full">
        <SectionText
          label="Drag & Drop"
          title="드래그로 정리하세요"
          description="파일을 잡고 원하는 폴더로 끌어다 놓으세요. 공간 속에서의 파일 이동이 이렇게 자연스러울 수 있습니다."
          align="right"
        />
      </div>
    </section>
  );
}
