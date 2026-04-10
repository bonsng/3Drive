import type { BackendNode, BackendResponse, Node } from '@/types/node';

export const normalizeBackendTree = (rawNode: BackendNode): Node => {
  // Ensure id is never null: fallback to -1 if both folderId and fileId are null
  const id = rawNode.folderId ?? rawNode.fileId ?? -1;

  return {
    id,
    name: rawNode.name,
    type: rawNode.type,
    parentId: rawNode.parentId,
    createdAt: rawNode.createdAt,
    updatedAt: rawNode.updatedAt,
    extension: rawNode.extension,
    children: Array.isArray(rawNode.children) ? rawNode.children.map(normalizeBackendTree) : [],
  };
};

export const processBackendResponse = (
  response: BackendResponse,
): { treeData: Node; trashData: Node[] } => {
  return {
    treeData: normalizeBackendTree(response.root),
    trashData: response.trash.map(normalizeBackendTree),
  };
};
