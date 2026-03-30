# Bundle Optimization

Vite 빌드 번들 사이즈 최적화 기록.

## 문제

단일 JS 청크 1,262 KB (gzip 375 KB)로 모든 코드가 하나에 번들링됨.

```
dist/assets/index-CXYokHQD.js  1,262.27 kB │ gzip: 375.05 kB
```

주요 원인:
- Three.js (37MB npm 패키지)가 앱 코드와 같은 청크에 포함
- GSAP도 동일하게 포함
- 라우트별 코드 스플리팅 없음 (HomePage, DrivePage 동시 로드)

## 적용한 최적화

### 1. Route-based Code Splitting

`React.lazy` + `Suspense`로 페이지 단위 동적 import.

```tsx
const HomePage = lazy(() => import('./pages/HomePage'));
const DrivePage = lazy(() => import('./pages/DrivePage'));
```

사용자가 방문하지 않는 페이지의 코드를 초기 로드에서 제외.

### 2. Vendor Chunk Splitting

`vite.config.ts`에서 `manualChunks`로 Three.js, GSAP을 별도 청크로 분리.

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules/three/')) return 'three';
        if (id.includes('node_modules/gsap/')) return 'gsap';
      },
    },
  },
},
```

> **주의**: Vite 8 (Rolldown 기반)에서는 `manualChunks`가 함수 형태만 지원됨.
> 객체 형태 `{ three: ['three'] }`는 동작하지 않는다.

벤더 라이브러리는 앱 코드 대비 변경 빈도가 낮으므로, 별도 청크로 분리하면 브라우저 캐싱 효율이 높아짐.

## 결과

| 청크 | 사이즈 | gzip |
|---|---|---|
| index.js (앱 코드) | 332 KB | 105 KB |
| three.js | 796 KB | 219 KB |
| gsap.js | 112 KB | 44 KB |
| HomePage.js | 19 KB | 7 KB |
| DrivePage.js | 0.15 KB | 0.14 KB |

- 앱 코드 청크: **1,262 KB → 332 KB** (74% 감소)
- 총 6개 청크로 분리, 각각 독립적으로 캐싱 가능
- Three.js 796 KB 경고는 라이브러리 자체 크기로, tree-shaking 외 추가 최적화 어려움
