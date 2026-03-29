import { SectionText } from '../shared/SectionText';

export function FeatureContextMenu() {
  return (
    <section className="pointer-events-none relative flex h-screen items-center">
      <div className="w-full">
        <SectionText
          label="Context Menu"
          title="우클릭, 모든 기능"
          description="이름 변경, 복사, 이동, 삭제. 익숙한 컨텍스트 메뉴로 모든 작업을 빠르게 처리하세요."
          align="left"
        />
      </div>
    </section>
  );
}
