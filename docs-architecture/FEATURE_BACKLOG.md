# Feature Requests & Enhancement Backlog

## UI/UX Improvements

### Draggable UI Panels
**Status:** Backlog  
**Priority:** Medium  
**Requested:** Phase 1 (User feedback)  
**Target Phase:** Phase 2 (Tool System) or Phase 4 (Education Layer)  
**Estimated Effort:** 30-45 minutes  

**Description:**
Make the following UI panels draggable so users can reposition them:
- Coding Editor Panel (right side)
- Socratic Tutor Chat (bottom left)

**Implementation Notes:**
- Add drag handle to panel headers
- Store position in localStorage for persistence
- Snap to edges for cleaner layout
- Mobile: Keep fixed position (dragging on touch is poor UX)

**Acceptance Criteria:**
- [ ] User can click and drag coding panel by header
- [ ] User can click and drag tutor chat by header
- [ ] Position persists across page refreshes
- [ ] Panels cannot be dragged offscreen
- [ ] Works on desktop only (disabled on mobile)

**Dependencies:** None

---

## Phase-Specific Features

### Phase 1 Days 3-4 (CURRENT - CRITICAL)
- [ ] Three.js rendering bridge
- [ ] Asset loading system (Kenney .glb models)
- [ ] Spawn entity → visual mesh connection
- [ ] GPU instancing for trees

### Phase 2 (Next)
- [ ] Transform tools (move/rotate/scale)
- [ ] Entity selection via raycasting
- [ ] **Draggable panels** ← Add here
- [ ] Undo/redo stack

### Phase 3
- [ ] Asset picker modal
- [ ] All 4 palette categories working
- [ ] Texture atlasing

### Phase 4
- [ ] Socratic Tutor rule-based system
- [ ] Code editor syntax highlighting
- [ ] WCAG keyboard navigation
- [ ] Telemetry logging

### Phase 5
- [ ] Adaptive FPS (30fps fallback)
- [ ] Performance profiler overlay
- [ ] Memory leak detection

### Phase 6
- [ ] .orbrya file format export
- [ ] Project sharing via URL
- [ ] Teacher dashboard analytics
