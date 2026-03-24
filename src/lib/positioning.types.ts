export type Vec3 = [number, number, number];

export interface TraverseContext {
  parentPosition?: Vec3;
  grandParentPosition?: Vec3;
  childIndex?: number;
  siblingCount?: number;
}
