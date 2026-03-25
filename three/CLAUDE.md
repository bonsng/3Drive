# three/ — 프로젝트 Three.js 코어 코드

이 디렉토리는 **npm 패키지 `three`(node_modules/three)가 아닙니다.**

3Drive 프로젝트의 Three.js 관련 코어 로직을 담는 소스 디렉토리입니다.

- 파일을 읽거나 수정할 때 `node_modules/three/`가 아닌 이 경로를 사용할 것
- import 경로에서 `three`, `three/webgpu`, `three/addons`, `three/tsl`는 npm 패키지를 가리킴
- 이 디렉토리의 파일은 `@/three/...` 또는 상대 경로로 import됨

## 기술 컨텍스트

- **렌더러**: WebGPURenderer 사용 (WebGL fallback)
- **셰이더**: TSL(Three.js Shading Language)로 작성 — GLSL/WGSL 직접 작성 안 함
- **TSL 레퍼런스**: `docs/learnings/tsl-documents.md` 참고

## 현재 작업

- 랜딩 페이지 3D 씬 구현 중
- 작업 계획: `docs/plans/landing-page-plan.md` 참고
