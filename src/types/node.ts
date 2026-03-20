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

export interface PositionedNode extends Node {
  position: [number, number, number];
  depth: number;
  parentPosition?: [number, number, number];
}
