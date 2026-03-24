import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ModalPropsMap } from '@/types/modal';

export function UploadModal({ parentNodeId }: ModalPropsMap['UploadModal']) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>파일 업로드 (폴더 #{parentNodeId})</DialogTitle>
      </DialogHeader>
      {/* TODO: Phase 6에서 구현 */}
    </>
  );
}
