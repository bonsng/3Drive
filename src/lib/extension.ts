import { extensionTypePairs } from '@/constants/extension-map';

export function getTypeFromExtension(extension: string | undefined): string {
  const match = extensionTypePairs.find(
    (pair) => pair.extension.toLowerCase() === extension?.toLowerCase(),
  );
  return match?.type || 'free';
}
