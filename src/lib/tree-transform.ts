import type { BackendNode, Node } from '@/types/node';

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
    children: Array.isArray(rawNode.children) ? rawNode.children.map(normalizeBackendTree) : [],
  };
};

export const processBackendTree = (rawTree: BackendNode): { treeData: Node; trashData: Node[] } => {
  const normalizedRoot = normalizeBackendTree(rawTree);
  const trashNodeIndex = normalizedRoot.children?.findIndex((n) => n.name === '휴지통');

  let trashData: Node[] = [];
  if (trashNodeIndex !== -1 && normalizedRoot.children) {
    const [trashNode] = normalizedRoot.children.splice(trashNodeIndex ?? 0, 1);
    trashData = trashNode.children || [];
  }

  return {
    treeData: normalizedRoot,
    trashData,
  };
};
