import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useModalStore } from '@/stores/modal-store';
import type { ModalType, ModalPropsMap } from '@/types/modal';
import { FileModal } from './FileModal';
import { UploadModal } from './UploadModal';
import { CreateFolderModal } from './CreateFolderModal';
import { GuideModal } from './GuideModal';
import { SettingModal } from './SettingModal';

function renderModal(modalType: ModalType, props: ModalPropsMap[ModalType] | null) {
  switch (modalType) {
    case 'FileModal':
      return <FileModal {...(props as ModalPropsMap['FileModal'])} />;
    case 'UploadModal':
      return <UploadModal {...(props as ModalPropsMap['UploadModal'])} />;
    case 'CreateFolderModal':
      return <CreateFolderModal {...(props as ModalPropsMap['CreateFolderModal'])} />;
    case 'GuideModal':
      return <GuideModal {...(props as ModalPropsMap['GuideModal'])} />;
    case 'SettingModal':
      return <SettingModal {...(props as ModalPropsMap['SettingModal'])} />;
  }
}

export function ModalRenderer() {
  const { isOpen, modalType, props, close, reset } = useModalStore();

  if (!modalType) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent onAnimationEnd={() => !isOpen && reset()}>
        {renderModal(modalType, props)}
      </DialogContent>
    </Dialog>
  );
}
