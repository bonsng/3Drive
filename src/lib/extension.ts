import type { FileExtension } from '@/types/extension';
import { extensionTypePairs } from '@/constants/extension-map';

export function getTypeFromExtension(extension: string | undefined): string {
  if (!extension) return 'free';
  const key = extension.toLowerCase() as FileExtension;
  return extensionTypePairs[key] || 'free';
}
