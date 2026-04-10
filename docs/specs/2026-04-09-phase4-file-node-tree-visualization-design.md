# Phase 4: 3D File Node & Tree Visualization Design

> Date: 2026-04-09
> Branch: feat/file-node-tree-visualization
> Scope: mock data to 3D scene visualization (read-only, no interaction)

## Overview

Root folder fixed. Render file/folder nodes as sphere GLB models in 3D space using InstancedMesh, with Sprite text labels and parent-child connection lines. No click, hover, or navigation — pure visualization only.

## Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Model | sphere GLB (`*_sphere_glb.glb`) | Consistent look, existing assets |
| Render depth | Current folder + 2 depth | Balance between information and performance |
| Performance | InstancedMesh per FileType | Draw calls = type count (~10), scales to 200+ nodes |
| Labels | Sprite (Canvas → CanvasTexture) | Pure Three.js, no DOM dependency |
| Font | Pretendard Bold subset (Korean syllables + ASCII) | Korean/English compatible, ~200-300KB |
| Font loading | Static file (`public/fonts/`) | No CDN dependency, offline support |
| Hover feedback | Cursor + scale (Phase 5) | Minimal, deferred |
| Connection lines | LineSegments (straight) | Simple, follows landing scene pattern |
| Architecture | SceneManager class | Central coordinator, easy Phase 5 extension |
| Interaction | None (Phase 5) | Clean scope boundary |

## File Structure

```
src/three/
├── loaders.ts                # GLTFLoader + model caching
├── objects/
│   ├── file-node.ts          # Single node creation (sprite label)
│   └── scene-manager.ts      # Tree → scene sync manager
public/
├── fonts/
│   └── Pretendard-Bold.subset.woff2
```

## Module Design

### loaders.ts — Model Loading & Caching

**Exports:**
- `loadModel(path: string): Promise<{ geometry: BufferGeometry, material: Material }>`
- `getModelForType(fileType: FileType): Promise<{ geometry, material }>`
- `disposeModelCache(): void`

**Model mapping:**
```ts
const MODEL_MAP: Record<string, string> = {
  folder: '/models/folder_sphere_glb.glb',
  pdf:    '/models/pdf_sphere_glb.glb',
  image:  '/models/image_sphere_glb.glb',
  video:  '/models/video_sphere_glb.glb',
  excel:  '/models/excel_sphere_glb.glb',
  word:   '/models/word_sphere_glb.glb',
  ppt:    '/models/ppt_sphere_glb.glb',
  pptx:   '/models/pptx_sphere_glb.glb',
  photoshop: '/models/photoshop_sphere_glb.glb',
  music:  '/models/music_sphere_glb.glb',
  zip:    '/models/zip_sphere_glb.glb',
  free:   '/models/free_sphere_glb.glb',   // fallback
}
```

**Caching strategy:**
- `Map<string, { geometry: BufferGeometry, material: Material }>` keyed by path
- First load: extract geometry + material from GLB, store in cache
- InstancedMesh uses cached geometry/material directly (no clone needed)
- `disposeModelCache()`: dispose all cached geometry/material

### file-node.ts — Sprite Label Creation

**Exports:**
- `createTextSprite(text: string, fontSize?: number): Sprite`
- `disposeSprite(sprite: Sprite): void`

**Sprite creation flow:**
1. `await document.fonts.load('bold 48px Pretendard')`
2. Create OffscreenCanvas (or Canvas)
3. `ctx.measureText(text)` → set canvas width to text width + padding
4. `ctx.font = 'bold 48px Pretendard'`, `ctx.fillStyle = 'white'`
5. `ctx.fillText(text, ...)`
6. `new CanvasTexture(canvas)` → `new SpriteMaterial({ map, transparent: true })`
7. `new Sprite(material)` → `sprite.scale.set()` proportional to text length
8. Return sprite

**Position:** Node position + y-axis offset (above the mesh)

**Dispose:** `sprite.material.map.dispose()` + `sprite.material.dispose()`

### scene-manager.ts — Central Coordinator

```ts
class SceneManager {
  private scene: Scene
  private nodeMap: Map<number, { instanceId: number, type: FileType, label: Sprite }>
  private instancedMeshes: Map<FileType, InstancedMesh>
  private positionedNodes: Map<number, PositionedNode>
  private lines: LineSegments | null

  constructor(scene: Scene)

  async renderTree(tree: Node, currentFolderId: number): Promise<void>
  clearTree(): void
  dispose(): void
}
```

**renderTree flow:**
1. `assignPositions(tree)` → `Map<nodeId, PositionedNode>`
2. Filter to 2 depth from currentFolderId
3. Group PositionedNode[] by FileType (via `getTypeFromExtension()`)
4. For each type:
   - `getModelForType(type)` → cached `{ geometry, material }`
   - `new InstancedMesh(geometry, material, count)`
   - For each instance: compose Matrix4 (position from PositionedNode) → `setMatrixAt()`
   - `scene.add(instancedMesh)`
5. For each node: `createTextSprite(name)` → position above mesh → `scene.add(label)`
6. Create LineSegments for parent-child connections → `scene.add(lines)`
7. Store all references in nodeMap/instancedMeshes

**Connection lines:**
- Collect pairs: `[parentPosition, childPosition]` for all rendered nodes
- `new BufferGeometry().setFromPoints(points)`
- `new LineBasicMaterial({ color, transparent: true, opacity })`
- `new LineSegments(geometry, material)` → scene.add

**clearTree:**
- Dispose all InstancedMesh (geometry is shared/cached, so only dispose InstancedMesh itself)
- Dispose all sprite labels
- Dispose connection lines
- Remove from scene, clear maps

**dispose:**
- `clearTree()` + `disposeModelCache()`

## Integration with drive-scene.ts

```ts
// createDriveScene returns sceneManager
export async function createDriveScene(canvas: HTMLCanvasElement) {
  // ... existing scene/camera/renderer/controls setup
  const sceneManager = new SceneManager(scene)

  return {
    // ... existing returns
    sceneManager,
    dispose: () => {
      sceneManager.dispose()
      // ... existing cleanup
    },
  }
}
```

```ts
// useDriveScene hook
export function useDriveScene(canvasRef: RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const driveScene = createDriveScene(canvas)
    driveScene.init().then(async () => {
      const { tree } = processBackendResponse(mockBackendResponse)
      await driveScene.sceneManager.renderTree(tree, tree.id)
    })
    return () => driveScene.dispose()
  }, [canvasRef])
}
```

## Data Flow

```
mockBackendResponse (BackendNode)
  → normalizeBackendTree()          [tree-transform.ts]
  → Node tree
  → assignPositions(tree)           [positioning.ts]
  → Map<nodeId, PositionedNode>
  → SceneManager.renderTree()
      → filter 2 depth
      → group by FileType
      → InstancedMesh per type      [loaders.ts]
      → Sprite label per node       [file-node.ts]
      → LineSegments connections
      → scene.add()
```

## Font Setup

- **Font:** Pretendard Bold
- **Subset:** Korean basic syllables (가-힣, 2,350 chars) + ASCII (printable range)
- **File:** `public/fonts/Pretendard-Bold.subset.woff2`
- **Size:** ~200-300KB estimated
- **CSS:** `@font-face` in `globals.css` with `font-display: swap`
- **Canvas usage:** `await document.fonts.load('bold 48px Pretendard')` before drawing

## Out of Scope (Phase 5+)

- Click / double-click interaction
- Folder navigation (enter/exit)
- Raycaster event system
- Camera animation (GSAP)
- Drag and drop
- Context menu
- Hover highlight (glow effect)
- Search filtering
