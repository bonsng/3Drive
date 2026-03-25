import { smoothstep, uv } from 'three/tsl';

/** 원형 파티클 마스크 (UV 중심 기준 smoothstep falloff) */
export function circleMask(outer = 0.5, inner = 0.3) {
  const dist = uv().sub(0.5).length();
  return smoothstep(outer, inner, dist);
}
