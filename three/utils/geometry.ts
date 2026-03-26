/** Fibonacci 구면 균등 분포 좌표 생성 */
export function fibonacciSphere(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  for (let i = 0; i < count; i++) {
    const theta = (2 * Math.PI * i) / goldenRatio;
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
    const idx = i * 3;
    positions[idx] = radius * Math.sin(phi) * Math.cos(theta);
    positions[idx + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[idx + 2] = radius * Math.cos(phi);
  }

  return positions;
}

/** 큐브 볼륨 내 랜덤 위치 생성. zRange로 z축 범위 제한 가능 */
export function randomPositions(
  count: number,
  spread: number,
  zRange?: [min: number, max: number],
): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    positions[idx] = (Math.random() - 0.5) * 2 * spread;
    positions[idx + 1] = (Math.random() - 0.5) * 2 * spread;
    positions[idx + 2] = zRange
      ? zRange[0] + Math.random() * (zRange[1] - zRange[0])
      : (Math.random() - 0.5) * 2 * spread;
  }
  return positions;
}

/** 파티클별 랜덤 위상 시드 생성 (0 ~ 2π) */
export function randomSeeds(count: number): Float32Array {
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    seeds[i] = Math.random() * Math.PI * 2;
  }
  return seeds;
}
