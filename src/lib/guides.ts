export const tips = [
  {
    tag: "explore",
    title: "탐색",
    video: "/videos/explore.mp4",
    description: "입체적으로 둘러보세요",
  },
  {
    tag: "create",
    title: "생성",
    video: "/videos/create.mp4",
    description: "입체적으로 생성해보세요",
  },
  {
    tag: "move",
    title: "이동",
    video: "/videos/move.mp4",
    description: "드래그해서 이동해보세요",
  },
  {
    tag: "delete",
    title: "삭제",
    video: "/videos/delete.mp4",
    description: "휴지통에 넣어보세요",
  },
  {
    tag: "search",
    title: "검색",
    video: "/videos/search.mp4",
    description: "원하는 항목을 바로 찾아보세요",
  },
];

export const details: Record<string, string> = {
  explore: `✅\t드래그로 시점을 이동하고, 스크롤로 시점 확대/축소를 할 수 있습니다\n\n✅\t폴더를 더블클릭하면 해당 폴더 위치로 카메라가 이동합니다\n\n✅\t파일을 더블클릭 하면 파일에 대한 정보가 나옵니다`,
  create: "✅\t폴더에 우클릭 후, 해당 위치에 새 폴더를 생성 할 수 있습니다",
  move: "✅\t파일/폴더를 1초 이상 잡고, 드래그하여 옮기고 싶은 폴더 위치에 놓으면 이동을 할 수 있습니다",
  delete:
    "✅\t삭제한 폴더/파일은 휴지통으로 이동합니다\n\n✅\t휴지통에 있는 파일/폴더들은 모두 복원 가능합니다",
  search:
    "✅\t검색 탭에서 찾고싶은 파일/폴더를 검색해보세요\n\n✅\t처음 검색시에는 전체 구조에서 위치를 보여줍니다\n\n✅\tEnter를 누르면 검색 결과만 볼 수 있습니다",
};
