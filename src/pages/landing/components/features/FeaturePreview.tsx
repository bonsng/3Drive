import { SectionText } from '../shared/SectionText';

export function FeaturePreview() {
  return (
    <section className="pointer-events-none relative flex h-screen items-center">
      <div className="w-full">
        <SectionText
          label="File Preview"
          title="열지 않고 미리보기"
          description="이미지, 텍스트, 문서를 선택하는 즉시 미리봅니다. 파일을 찾는 시간을 절약하세요."
          align="right"
        />
      </div>
    </section>
  );
}
