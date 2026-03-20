# Tailwind CSS는 왜 빌드가 필요한가?

## CSS 빌드란?

Tailwind로 `bg-blue-500` 같은 클래스를 쓰면, 브라우저는 이걸 모른다.
누군가가 이걸 실제 CSS(`.bg-blue-500 { background-color: #3b82f6 }`)로 변환해줘야 한다.
이 변환 과정이 "빌드"다.

## PostCSS란?

CSS를 변환해주는 도구. "CSS용 플러그인 시스템"이라고 보면 된다.

1. 소스 CSS 파일을 읽고
2. 등록된 플러그인들이 순서대로 CSS를 가공하고
3. 최종 CSS를 출력

Tailwind v3에서는 PostCSS 플러그인으로 동작했다.
즉 `PostCSS → Tailwind 플러그인 → 최종 CSS` 흐름.

## @tailwindcss/vite란?

Tailwind v4에서는 PostCSS를 중간에 거치지 않고, Vite에 직접 플러그인으로 붙는 방식을 만들었다.

```
v3: 소스코드 → Vite → PostCSS → Tailwind → 최종 CSS  (중간 단계가 하나 더 있음)
v4: 소스코드 → Vite → Tailwind → 최종 CSS             (직접 연결)
```

중간 단계가 줄어드니 더 빠르고, `postcss.config.js` 설정 파일도 필요 없어서 간결하다.

## 정리

| 개념 | 역할 |
|------|------|
| **빌드** | Tailwind 클래스 → 실제 CSS로 변환하는 과정 |
| **PostCSS** | CSS 변환을 담당하는 범용 도구 (v3에서 사용) |
| **@tailwindcss/vite** | PostCSS 없이 Vite에 직접 붙는 Tailwind v4 전용 플러그인 |
