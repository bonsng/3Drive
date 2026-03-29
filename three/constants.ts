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
  position: [0, 0, 5] as const,
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
    autoRotateSpeed: 0.05,
    mouseRotateX: 0.4,
    mouseRotateY: 0.3,
  },
  ambient: {
    count: 100,
    spread: 8,
    zRange: [-4, -1.5] as [number, number],
    pointSize: 0.03,
    color: 0x4466aa,
    floatSpeed: 0.3,
    floatAmplitude: 0.5,
    opacity: 0.4,
  },
  camera: {
    treeView: { x: -1, y: 6, z: 4 },
    treeViewLookAt: { x: 0, y: 0, z: 0 },
    zoomInZ: 3,
    zoomOutZ: 5,
    panLookAt: { x: 0.5, y: 0.3 },
  },
  tree: {
    rootCount: 300,
    rootRadius: 0.15,
    folderCount: 5,
    particlesPerFolder: 150,
    folderDistance: 2.0,
    folderRadius: 0.3,
    filesPerFolder: 3,
    particlesPerFile: 50,
    fileDistance: 0.8,
    fileRadius: 0.15,
  },
} as const;
