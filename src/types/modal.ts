import type { PositionedNode } from './node';

export type ModalType =
  | 'FileModal'
  | 'UploadModal'
  | 'CreateFolderModal'
  | 'GuideModal'
  | 'SettingModal';

export interface ModalPropsMap {
  FileModal: { node: PositionedNode };
  UploadModal: { parentNodeId: number };
  CreateFolderModal: { parentNodeId: number };
  GuideModal: Record<string, never>;
  SettingModal: Record<string, never>;
}
