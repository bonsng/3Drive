/**
 * @module three/utils/geometry
 *
 * fibonacciSphere
 * 1. 올바른 길이의 Float32Array 반환
 * 2. 모든 점이 지정된 radius 위에 위치
 * 3. 점들이 구면에 균등 분포 (편향 없음)
 *
 * randomPositions
 * 4. 올바른 길이의 Float32Array 반환
 * 5. x, y 좌표가 [-spread, spread] 범위 내
 * 6. zRange 미지정 시 z도 [-spread, spread] 범위
 * 7. zRange 지정 시 z가 해당 범위 내
 *
 * randomSeeds
 * 8. 올바른 길이의 Float32Array 반환
 * 9. 모든 값이 [0, 2π) 범위
 */
import { describe, it, expect } from 'vitest';
import { fibonacciSphere, randomPositions, randomSeeds } from '../geometry';

describe('fibonacciSphere', () => {
  it('count * 3 길이의 Float32Array를 반환한다', () => {
    const result = fibonacciSphere(100, 5);
    expect(result).toBeInstanceOf(Float32Array);
    expect(result.length).toBe(300);
  });

  it('모든 점이 지정된 radius 위에 위치한다', () => {
    const radius = 10;
    const positions = fibonacciSphere(200, radius);

    for (let i = 0; i < 200; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      const dist = Math.sqrt(x * x + y * y + z * z);
      expect(dist).toBeCloseTo(radius, 4);
    }
  });

  it('점들이 반구에 편향되지 않고 균등 분포한다', () => {
    const positions = fibonacciSphere(1000, 1);
    let positiveZ = 0;

    for (let i = 0; i < 1000; i++) {
      if (positions[i * 3 + 2] > 0) positiveZ++;
    }

    // 균등 분포면 ~50%. 허용 오차 10%
    expect(positiveZ).toBeGreaterThan(400);
    expect(positiveZ).toBeLessThan(600);
  });

  it('count가 0이면 빈 배열을 반환한다', () => {
    const result = fibonacciSphere(0, 5);
    expect(result.length).toBe(0);
  });
});

describe('randomPositions', () => {
  it('count * 3 길이의 Float32Array를 반환한다', () => {
    const result = randomPositions(50, 10);
    expect(result).toBeInstanceOf(Float32Array);
    expect(result.length).toBe(150);
  });

  it('x, y 좌표가 [-spread, spread] 범위 내에 있다', () => {
    const spread = 5;
    const positions = randomPositions(500, spread);

    for (let i = 0; i < 500; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      expect(x).toBeGreaterThanOrEqual(-spread);
      expect(x).toBeLessThanOrEqual(spread);
      expect(y).toBeGreaterThanOrEqual(-spread);
      expect(y).toBeLessThanOrEqual(spread);
    }
  });

  it('zRange 미지정 시 z가 [-spread, spread] 범위 내에 있다', () => {
    const spread = 5;
    const positions = randomPositions(500, spread);

    for (let i = 0; i < 500; i++) {
      const z = positions[i * 3 + 2];
      expect(z).toBeGreaterThanOrEqual(-spread);
      expect(z).toBeLessThanOrEqual(spread);
    }
  });

  it('zRange 지정 시 z가 해당 범위 내에 있다', () => {
    const zRange: [number, number] = [-20, -10];
    const positions = randomPositions(500, 5, zRange);

    for (let i = 0; i < 500; i++) {
      const z = positions[i * 3 + 2];
      expect(z).toBeGreaterThanOrEqual(-20);
      expect(z).toBeLessThanOrEqual(-10);
    }
  });
});

describe('randomSeeds', () => {
  it('count 길이의 Float32Array를 반환한다', () => {
    const result = randomSeeds(100);
    expect(result).toBeInstanceOf(Float32Array);
    expect(result.length).toBe(100);
  });

  it('모든 값이 [0, 2π) 범위 내에 있다', () => {
    const seeds = randomSeeds(1000);
    const twoPi = Math.PI * 2;

    for (let i = 0; i < 1000; i++) {
      expect(seeds[i]).toBeGreaterThanOrEqual(0);
      expect(seeds[i]).toBeLessThan(twoPi);
    }
  });
});
