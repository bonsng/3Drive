import type { Angle } from '@/types/camera';

export const angles: Angle[] = [
  // default
  {
    position: { x: -10.6, y: 0, z: 0 },
    target: { x: 0, y: 0, z: 0 },
  },
  // trashcan
  {
    position: { x: -102, y: 0.5, z: -1.4 },
    target: { x: -102, y: 0, z: 0.3 },
  },
  // pre-search
  {
    position: { x: -16, y: 0, z: 0 },
    target: { x: 0, y: 0, z: 0 },
  },
  // search
  { position: { x: -3, y: 0, z: 0.1 }, target: { x: -3, y: 0, z: -1 } },
  // custom
  { position: { x: -10.6, y: 0, z: 0 }, target: { x: 0, y: 0, z: 0 } },
];
