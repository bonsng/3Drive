import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ModalPropsMap } from '@/types/modal';

export function FileModal({ node }: ModalPropsMap['FileModal']) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{node.name}</DialogTitle>
      </DialogHeader>
      {/* TODO: Phase 6에서 구현 */}
    </>
  );
}
