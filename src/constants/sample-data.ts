import type { Node } from '@/types/node';

export const sampleTree: Node = {
  name: 'root',
  type: 'folder',
  parentId: null,
  id: 1,
  children: [
    {
      name: 'documents',
      type: 'folder',
      parentId: 1,
      id: 2,
      children: [
        {
          name: 'resume.pdf',
          type: 'file',
          parentId: 2,
          id: 3,
        },
        {
          name: 'cover_letter.pdf',
          type: 'file',
          parentId: 2,
          id: 4,
        },
        {
          name: 'projects',
          type: 'folder',
          parentId: 2,
          id: 5,
          children: [
            {
              name: 'project1.pdf',
              type: 'file',
              parentId: 5,
              id: 6,
            },
            {
              name: 'project2.pptx',
              type: 'file',
              parentId: 5,
              id: 7,
            },
            {
              name: 'archive',
              type: 'folder',
              parentId: 5,
              id: 8,
              children: [
                {
                  name: 'old_project1.zip',
                  type: 'file',
                  parentId: 8,
                  id: 9,
                },
                {
                  name: 'old_project2.zip',
                  type: 'file',
                  parentId: 8,
                  id: 10,
                },
                {
                  name: 'archive_sub',
                  type: 'folder',
                  parentId: 8,
                  id: 321,
                  children: [
                    {
                      name: 'archive_sub_sub',
                      type: 'folder',
                      parentId: 321,
                      id: 401,
                      children: [
                        {
                          name: 'archive5',
                          type: 'folder',
                          parentId: 401,
                          id: 777,
                          children: [],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'invoices',
          type: 'folder',
          parentId: 2,
          id: 11,
          children: [
            {
              name: 'invoice_jan.pdf',
              type: 'file',
              parentId: 11,
              id: 12,
            },
            {
              name: 'invoice_feb.pdf',
              type: 'file',
              parentId: 11,
              id: 13,
            },
            {
              name: 'invoice_mar.pdf',
              type: 'file',
              parentId: 11,
              id: 14,
            },
          ],
        },
      ],
    },
    {
      name: 'images',
      type: 'folder',
      parentId: 1,
      id: 15,
      children: [
        {
          name: 'photo1.jpg',
          type: 'file',
          parentId: 15,
          id: 16,
        },
        {
          name: 'photo2.png',
          type: 'file',
          parentId: 15,
          id: 17,
        },
        {
          name: 'vacation',
          type: 'folder',
          parentId: 15,
          id: 18,
          children: [
            {
              name: 'beach.jpg',
              type: 'file',
              parentId: 18,
              id: 19,
            },
            {
              name: 'mountain.jpg',
              type: 'file',
              parentId: 18,
              id: 20,
            },
          ],
        },
      ],
    },
    {
      name: 'music',
      type: 'folder',
      parentId: 1,
      id: 21,
      children: [
        {
          name: 'song1.mp3',
          type: 'file',
          parentId: 21,
          id: 22,
        },
        {
          name: 'song2.mp3',
          type: 'file',
          parentId: 21,
          id: 23,
        },
      ],
    },
    {
      name: 'videos',
      type: 'folder',
      parentId: 1,
      id: 24,
      children: [
        {
          name: 'movie1.mp4',
          type: 'file',
          parentId: 24,
          id: 25,
        },
        {
          name: 'clip1.mov',
          type: 'file',
          parentId: 24,
          id: 26,
        },
      ],
    },
    {
      name: 'scripts',
      type: 'folder',
      parentId: 1,
      id: 27,
      children: [
        {
          name: 'backup.sh',
          type: 'file',
          parentId: 27,
          id: 28,
        },
        {
          name: 'deploy.sh',
          type: 'file',
          parentId: 27,
          id: 29,
        },
      ],
    },
    {
      name: 'design',
      type: 'folder',
      parentId: 1,
      id: 30,
      children: [
        {
          name: 'logo.ai',
          type: 'file',
          parentId: 30,
          id: 31,
        },
        {
          name: 'flyer.psd',
          type: 'file',
          parentId: 30,
          id: 32,
        },
      ],
    },
    {
      name: 'todo.txt',
      type: 'file',
      parentId: 1,
      id: 33,
    },
    {
      name: 'notes.md',
      type: 'file',
      parentId: 1,
      id: 34,
    },
  ],
};

export const sampleTrash: Node[] = [
  {
    name: 'trash1.txt',
    type: 'file',
    parentId: 1,
    id: 35,
  },
  {
    name: 'trash2.pdf',
    type: 'file',
    parentId: 1,
    id: 36,
  },
  {
    name: 'trash3.mp3',
    type: 'file',
    parentId: 1,
    id: 37,
  },
  {
    name: 'trash4.mp4',
    type: 'file',
    parentId: 1,
    id: 38,
  },
  {
    name: 'design1',
    type: 'folder',
    parentId: 1,
    id: 39,
    children: [
      {
        name: 'logo2.ai',
        type: 'file',
        parentId: 39,
        id: 40,
      },
      {
        name: 'flyer2.psd',
        type: 'file',
        parentId: 39,
        id: 41,
      },
    ],
  },
  {
    name: 'trash6.docx',
    type: 'file',
    parentId: 1,
    id: 42,
  },
];
