export interface Node {
  id: number;
  type: 'file' | 'folder';
  name: string;
  parentId: number | null;
  children?: Node[];
  isHidden?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendNode {
  type: 'file' | 'folder';
  name: string;
  parentId: number | null;
  folderId: number | null;
  fileId: number | null;
  createdAt?: string;
  updatedAt?: string;
  extension?: string | null;
  children?: BackendNode[] | null;
}

export interface BackendResponse {
  root: BackendNode;
  trash: BackendNode[];
}

import type { Vec3 } from '@/lib/positioning.types';

export interface PositionedNode extends Node {
  position: Vec3;
  depth: number;
  parentPosition?: Vec3;
  entryTime: number;
  exitTime: number;
}
