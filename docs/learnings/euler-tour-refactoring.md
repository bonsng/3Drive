# Euler Tour를 활용한 트리 자손 탐색 최적화

## 문제: getDescendantIds가 느린 이유

기존 `getDescendantIds`는 모든 노드를 순회하면서, 각 노드마다 `parentId` 체인을 루트까지 거슬러 올라가며 조상 중에 대상 노드가 있는지 확인했다.

```ts
// 기존 방식 — O(N × D)
for (const [id, node] of nodeMap.entries()) {
  let current = node.parentId;
  while (current) {
    if (current === nodeId) { descendants.add(id); break; }
    current = nodeMap.get(current)?.parentId ?? null;
  }
}
```

노드 수(N)가 크고 트리가 깊으면(D) 성능이 급격히 떨어진다.
이 함수는 드래그 중 자손 노드를 숨기기 위해 호출되므로, 렌더 성능에 직접 영향을 준다.

## 해결: DFS Euler Tour

DFS 순회 시 각 노드에 **진입 시간(entryTime)**과 **퇴출 시간(exitTime)**을 기록한다.

```
        1 (entry:0, exit:13)
       / \
      2       3
  (1,4)    (5,12)
     /      / \
    4      5     6
  (2,3)  (6,7)  (8,11)
                  |
                  7
                (9,10)
```

### 핵심 성질

**노드 A가 노드 B의 자손이다** ⟺ `entry[B] < entry[A]` 이고 `exit[A] < exit[B]`

자손인지 판별하는 데 O(1)이면 충분하다. while 루프로 조상을 거슬러 올라갈 필요가 없다.

```ts
// 개선된 방식 — O(N)
const target = nodeMap.get(nodeId);
for (const [id, node] of nodeMap.entries()) {
  if (node.entryTime > target.entryTime && node.exitTime < target.exitTime) {
    descendants.add(id);
  }
}
```

## 왜 assignPositions에서 타임스탬프를 부여하는가

`assignPositions`가 이미 DFS 순회를 하고 있다. 카운터 변수 하나만 추가하면 추가 순회 없이 타임스탬프를 부여할 수 있다.

```ts
let timer = 0;
function traverse(node, depth, ctx) {
  const entryTime = timer++;
  // ... 위치 계산, 노드 생성
  // ... children 재귀 순회
  positionedNode.exitTime = timer++;
}
```

트리 데이터가 변경되면 `assignPositions`가 다시 호출되므로, 타임스탬프도 자동으로 갱신된다.

## 함께 진행한 assignPositions 리팩터링

| 변경 | 이유 |
|------|------|
| `_thetaRange`, `_phiRange` 파라미터 제거 | 어디에서도 사용되지 않는 죽은 코드 |
| traverse 인자 8개 → 컨텍스트 객체 | 가독성 개선 |
| 위치 계산을 3개 함수로 분리 | 각 depth별 전략을 독립적으로 테스트·수정 가능 |

```ts
computeRootPosition()        // depth 0 — 원점
computeSpherePosition(...)   // depth 1 — golden section spiral로 구면 분포
computeRingPosition(...)     // depth 2+ — 부모→조부모 방향 링 배치
```

## 정리

| | 기존 | 개선 후 |
|---|---|---|
| **자손 판별** | O(D) per node | O(1) per node |
| **전체 자손 수집** | O(N × D) | O(N) |
| **추가 메모리** | 없음 | 노드당 `number` 2개 |
| **구현 비용** | — | DFS에 카운터 1줄 추가 |
