import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ModalPropsMap } from '@/types/modal';

export function CreateFolderModal({ parentNodeId }: ModalPropsMap['CreateFolderModal']) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>새 폴더 (부모 #{parentNodeId})</DialogTitle>
      </DialogHeader>
      {/* TODO: Phase 6에서 구현 */}
    </>
  );
}
