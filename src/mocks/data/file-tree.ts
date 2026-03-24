import type { BackendNode, BackendResponse } from '@/types/node';

/**
 * BackendNode 형식의 목 파일 트리.
 * ~100개 노드, 최대 depth 8. 다양한 확장자를 커버한다.
 */

const folder = (
  folderId: number,
  name: string,
  parentId: number | null,
  children: BackendNode[] = [],
): BackendNode => ({
  type: 'folder',
  name,
  parentId,
  folderId,
  fileId: null,
  children,
});

const file = (
  fileId: number,
  name: string,
  parentId: number,
  extension: string | null = null,
): BackendNode => ({
  type: 'file',
  name,
  parentId,
  folderId: null,
  fileId,
  extension,
});

export const mockFileTree: BackendNode = folder(1, 'root', null, [
  // ── documents (depth 1~8) ──
  folder(2, 'documents', 1, [
    file(3, 'resume.pdf', 2, 'pdf'),
    file(4, 'cover_letter.pdf', 2, 'pdf'),
    file(100, 'meeting_notes.docx', 2, 'docx'),
    file(101, 'budget.xlsx', 2, 'xlsx'),
    folder(5, 'projects', 2, [
      file(6, 'project1.pdf', 5, 'pdf'),
      file(7, 'project2.pptx', 5, 'pptx'),
      file(102, 'project3.doc', 5, 'doc'),
      file(103, 'timeline.xlsm', 5, 'xlsm'),
      folder(8, 'archive', 5, [
        file(9, 'old_project1.zip', 8, 'zip'),
        file(10, 'old_project2.zip', 8, 'zip'),
        file(104, 'old_project3.zip', 8, 'zip'),
        folder(50, '2023', 8, [
          file(105, 'q1_report.pdf', 50, 'pdf'),
          file(106, 'q2_report.pdf', 50, 'pdf'),
          file(107, 'q3_report.xlsx', 50, 'xlsx'),
          file(108, 'q4_summary.pptx', 50, 'pptx'),
          folder(51, 'attachments', 50, [
            file(109, 'chart1.png', 51, 'png'),
            file(110, 'chart2.svg', 51, 'svg'),
            folder(52, 'raw', 51, [
              file(111, 'data_export.csv', 52, 'csv'),
              file(112, 'analysis.xlsb', 52, 'xlsb'),
              folder(53, 'backup', 52, [
                file(113, 'snapshot_jan.zip', 53, 'zip'),
                file(114, 'snapshot_feb.zip', 53, 'zip'),
                folder(54, 'legacy', 53, [
                  file(115, 'v1_draft.doc', 54, 'doc'),
                  file(116, 'v1_final.pdf', 54, 'pdf'),
                ]),
              ]),
            ]),
          ]),
        ]),
      ]),
    ]),
    folder(11, 'invoices', 2, [
      file(12, 'invoice_jan.pdf', 11, 'pdf'),
      file(13, 'invoice_feb.pdf', 11, 'pdf'),
      file(14, 'invoice_mar.pdf', 11, 'pdf'),
      file(117, 'invoice_apr.pdf', 11, 'pdf'),
      file(118, 'invoice_may.pdf', 11, 'pdf'),
      file(119, 'invoice_jun.pdf', 11, 'pdf'),
    ]),
    folder(55, 'contracts', 2, [
      file(120, 'nda_2024.pdf', 55, 'pdf'),
      file(121, 'service_agreement.docx', 55, 'docx'),
      file(122, 'addendum.pdf', 55, 'pdf'),
    ]),
  ]),

  // ── images (depth 1~4) ──
  folder(15, 'images', 1, [
    file(16, 'photo1.jpg', 15, 'jpg'),
    file(17, 'photo2.png', 15, 'png'),
    file(123, 'banner.webp', 15, 'webp'),
    file(124, 'icon.svg', 15, 'svg'),
    folder(18, 'vacation', 15, [
      file(19, 'beach.jpg', 18, 'jpg'),
      file(20, 'mountain.jpg', 18, 'jpg'),
      file(125, 'sunset.jpeg', 18, 'jpeg'),
      file(126, 'forest.tiff', 18, 'tiff'),
      folder(56, 'hawaii', 18, [
        file(127, 'waikiki.jpg', 56, 'jpg'),
        file(128, 'volcano.png', 56, 'png'),
        file(129, 'snorkel.jpg', 56, 'jpg'),
      ]),
    ]),
    folder(57, 'screenshots', 15, [
      file(130, 'screen_001.png', 57, 'png'),
      file(131, 'screen_002.png', 57, 'png'),
      file(132, 'screen_003.bmp', 57, 'bmp'),
    ]),
    folder(58, 'wallpapers', 15, [
      file(133, 'dark_theme.jpg', 58, 'jpg'),
      file(134, 'light_theme.png', 58, 'png'),
      file(135, 'abstract.gif', 58, 'gif'),
    ]),
  ]),

  // ── music (depth 1~3) ──
  folder(21, 'music', 1, [
    file(22, 'song1.mp3', 21, 'mp3'),
    file(23, 'song2.mp3', 21, 'mp3'),
    folder(59, 'rock', 21, [
      file(136, 'track01.mp3', 59, 'mp3'),
      file(137, 'track02.mp3', 59, 'mp3'),
      file(138, 'track03.mp3', 59, 'mp3'),
    ]),
    folder(60, 'jazz', 21, [
      file(139, 'blue_in_green.mp3', 60, 'mp3'),
      file(140, 'so_what.mp3', 60, 'mp3'),
    ]),
    folder(61, 'classical', 21, [
      file(141, 'moonlight_sonata.mp3', 61, 'mp3'),
      file(142, 'four_seasons.mp3', 61, 'mp3'),
    ]),
  ]),

  // ── videos (depth 1~4) ──
  folder(24, 'videos', 1, [
    file(25, 'movie1.mp4', 24, 'mp4'),
    file(26, 'clip1.mov', 24, 'mov'),
    folder(62, '2024', 24, [
      file(143, 'birthday.mp4', 62, 'mp4'),
      file(144, 'graduation.mov', 62, 'mov'),
      file(145, 'concert.mkv', 62, 'mkv'),
      folder(63, 'edits', 62, [
        file(146, 'birthday_cut.mp4', 63, 'mp4'),
        file(147, 'graduation_highlight.webm', 63, 'webm'),
      ]),
    ]),
    folder(64, 'tutorials', 24, [
      file(148, 'react_basics.mp4', 64, 'mp4'),
      file(149, 'three_js_intro.mp4', 64, 'mp4'),
      file(150, 'css_tips.avi', 64, 'avi'),
    ]),
  ]),

  // ── scripts (depth 1) ──
  folder(27, 'scripts', 1, [
    file(28, 'backup.sh', 27),
    file(29, 'deploy.sh', 27),
    file(151, 'migrate.sh', 27),
    file(152, 'seed.sh', 27),
  ]),

  // ── design (depth 1~3) ──
  folder(30, 'design', 1, [
    file(31, 'logo.ai', 30),
    file(32, 'flyer.psd', 30, 'psd'),
    file(153, 'mockup.psb', 30, 'psb'),
    folder(65, 'brand', 30, [
      file(154, 'palette.svg', 65, 'svg'),
      file(155, 'typography.pdf', 65, 'pdf'),
      file(156, 'guidelines.pptx', 65, 'pptx'),
    ]),
  ]),

  // ── workspace (depth 1~3, 새 최상위 폴더) ──
  folder(66, 'workspace', 1, [
    file(157, 'todo.md', 66),
    file(158, 'scratch.txt', 66),
    folder(67, 'drafts', 66, [
      file(159, 'idea_v1.docx', 67, 'docx'),
      file(160, 'idea_v2.docx', 67, 'docx'),
      file(161, 'sketch.psd', 67, 'psd'),
    ]),
    folder(68, 'exports', 66, [
      file(162, 'report_final.pdf', 68, 'pdf'),
      file(163, 'data_dump.csv', 68, 'csv'),
      file(164, 'presentation.ppt', 68, 'ppt'),
    ]),
  ]),

  // ── downloads (depth 1~2, 새 최상위 폴더) ──
  folder(69, 'downloads', 1, [
    file(165, 'setup.exe', 69),
    file(166, 'archive.zip', 69, 'zip'),
    file(167, 'ebook.pdf', 69, 'pdf'),
    file(168, 'sample_video.flv', 69, 'flv'),
    file(169, 'wallpaper.wmv', 69, 'wmv'),
    file(170, 'font_pack.zip', 69, 'zip'),
  ]),

  file(33, 'todo.txt', 1),
  file(34, 'notes.md', 1),
  file(171, 'README.md', 1),
]);

export const mockTrash: BackendNode[] = [
  file(35, 'trash1.txt', 1),
  file(36, 'trash2.pdf', 1, 'pdf'),
  file(37, 'trash3.mp3', 1, 'mp3'),
  file(38, 'trash4.mp4', 1, 'mp4'),
  folder(39, 'design1', 1, [file(40, 'logo2.ai', 39), file(41, 'flyer2.psd', 39, 'psd')]),
  file(42, 'trash6.docx', 1, 'docx'),
  folder(70, 'old_workspace', 1, [
    file(172, 'notes_2022.txt', 70),
    file(173, 'draft.doc', 70, 'doc'),
    folder(71, 'attachments', 70, [
      file(174, 'photo.jpg', 71, 'jpg'),
      file(175, 'scan.pdf', 71, 'pdf'),
    ]),
  ]),
];

export const mockBackendResponse: BackendResponse = {
  root: mockFileTree,
  trash: mockTrash,
};
