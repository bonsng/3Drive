// Renderer
export const MAX_PIXEL_RATIO = 1.5;

// Camera
export const HOMEPAGE_CAMERA = {
  fov: 50,
  near: 0.1,
  far: 100,
  position: [0, 0, 5] as const,
} as const;

export const DRIVEPAGE_CAMERA = {
  fov: 50,
  near: 0.1,
  far: 100,
  position: { x: 0, y: 0, z: 5 },
} as const;

// Landing page
export const LANDING = {
  sphere: {
    count: 2000,
    radius: 1.5,
    pointSize: 0.04,
    color: 0x6688ff,
    waveAmplitude: 0.02,
    waveFrequency: 10,
    autoRotateSpeed: 0.15,
  },
  ambient: {
    count: 100,
    spread: 8,
    pointSize: 0.03,
    color: 0x4466aa,
    floatSpeed: 0.3,
    floatAmplitude: 0.5,
    opacity: 0.4,
  },
} as const;
