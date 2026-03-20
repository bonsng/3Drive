export const extensionTypePairs = [
  { extension: "xls", type: "excel" },
  { extension: "xlsx", type: "excel" },
  { extension: "xlsm", type: "excel" },
  { extension: "xlsb", type: "excel" },
  { extension: "csv", type: "excel" },
  { extension: "jpg", type: "image" },
  { extension: "jpeg", type: "image" },
  { extension: "png", type: "image" },
  { extension: "gif", type: "image" },
  { extension: "bmp", type: "image" },
  { extension: "svg", type: "image" },
  { extension: "webp", type: "image" },
  { extension: "tiff", type: "image" },
  { extension: "pdf", type: "pdf" },
  { extension: "psd", type: "photoshop" },
  { extension: "psb", type: "photoshop" },
  { extension: "mp4", type: "video" },
  { extension: "avi", type: "video" },
  { extension: "mov", type: "video" },
  { extension: "mkv", type: "video" },
  { extension: "webm", type: "video" },
  { extension: "flv", type: "video" },
  { extension: "wmv", type: "video" },
  { extension: "doc", type: "word" },
  { extension: "docx", type: "word" },
  { extension: "dot", type: "word" },
  { extension: "dotx", type: "word" },
  { extension: "ppt", type: "ppt" },
  { extension: "pptx", type: "pptx" },
  { extension: "mp3", type: "music" },
  { extension: "zip", type: "zip" },
];

export function getTypeFromExtension(extension: string | undefined): string {
  const match = extensionTypePairs.find(
    (pair) => pair.extension.toLowerCase() === extension?.toLowerCase(),
  );
  return match?.type || "free";
}
