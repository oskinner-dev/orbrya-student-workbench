# Orbrya Student Workbench - Feature Requirements Map
**Version:** 1.0  
**Date:** December 2025  
**Purpose:** Define the complete feature set and architecture before implementation

---

## 🎯 DESIGN PRINCIPLES FROM CONTEXT

1. **Hardware Ceiling:** 60fps on Intel Celeron N4000 / 4GB RAM
2. **Zero-Install:** Browser-only deployment (no Unity/Unreal)
3. **The Architecture:**
   - **The Brain (C# WASM):** Game logic, physics, entity management
   - **The Hands (Three.js):** Lightweight rendering, optimized for N4000
   - **The UI (HTML/CSS/JS):** Glassmorphism overlay, zero interference with canvas

4. **Performance Budget:**
   - Draw Calls: <50 per frame
   - Active Entities: <500
   - Memory Heap: 512MB - 1GB max
   - Target FPS: 30-60 (adaptive)

---

## 📦 PART 1: EXISTING UI INVENTORY

### **Zone A: The Palette (Left Sidebar)**
**Current Implementation:** 4 category buttons
- 🌲 Nature
- 🏰 Structures
- 🚀 Sci-Fi
- ⚡ Logic

**Expected Behavior:**
- Click → Opens asset picker for that category
- Should load from pre-approved Kenney asset library
- No user uploads (security/copyright risk per context doc)

### **Zone B: The Budget Bar (Top Center)**
**Current Implementation:** Visual progress bar
- Shows "Memory Budget" percentage
- Color states: Green (0-60%), Yellow (61-85%), Red (86-100%)
- Warning text appears at 85%+

**Expected Behavior:**
- Updates in real-time as entities are added/removed
- Calculates based on C# memory tracking
- Prevents spawning at 100% capacity

### **Zone C: The Socratic Tutor (Bottom Right)**
**Current Implementation:** Chat interface with avatar
- Collapsible chat bubble
- Message history
- Quick reply buttons
- Text input

**Expected Behavior:**
- Analyzes student code from Coding Panel
- Asks guiding questions (Socratic method)
- Does NOT give answers directly (per context doc)
- Example: "What happens if you change the Y value to -5?"

### **Hotbar Toolbar (Bottom Center)**
**Current Implementation:** 8 tools + 2 utility buttons
1. 👆 Select & Move (Key: 1)
2. 🔄 Rotate (Key: 2)
3. ↔️ Scale (Key: 3)
4. 🎨 Paint & Color (Key: 4)
5. 📑 Duplicate (Key: 5)
6. 🗑️ Delete (Key: 6)
7. ⊞ Snap to Grid (Key: 7)
8. ↶ Undo (Key: Z)

**Expected Behavior:**
- Keyboard shortcuts work (1-7, Z)
- Active tool highlights
- Tool affects click behavior in 3D scene

### **Save/Load Panel (Top Left)**
**Current Implementation:** Project management UI
- Project name input
- Author name input
- Stats display (objects, budget)
- Save/Load/Export buttons
- Recent projects list

**Expected Behavior:**
- Serializes scene to JSON
- Stores in localStorage or IndexedDB
- Export generates .orbrya file (custom format)

### **Coding Panel (Right Side)**
**Current Implementation:** Code editor interface
- Syntax highlighting
- Line numbers
- Console output
- Run/Stop buttons
- Multi-script tabs

**Expected Behavior:**
- Executes student-written C# snippets
- Sandboxed execution (no file system access)
- Results appear in console
- Integrates with Socratic Tutor for analysis

---

## 🧠 PART 2: REQUIRED C# BACKEND (The Brain)

### **Core Entity System**
```csharp
public class Entity
{
    public int Id;
    public string Type;        // "tree", "cube", "character"
    public Vector3 Position;
    public Vector3 Rotation;
    public Vector3 Scale;
    public int MemoryCost;     // KB
    public bool IsActive;
    public Dictionary<string, object> Properties;
}
```

### **Required C# API Functions**

#### **Entity Management**
- `int SpawnEntity(string type, float x, float y, float z)` → Returns entity ID
- `void DestroyEntity(int id)` → Removes from scene
- `Entity GetEntity(int id)` → Returns entity data
- `int GetEntityCount()` → Total active entities
- `List<int> GetAllEntityIds()` → For serialization

#### **Transform Operations**
- `void SetPosition(int id, float x, float y, float z)`
- `void SetRotation(int id, float x, float y, float z)` → Euler angles
- `void SetScale(int id, float x, float y, float z)`
- `Transform GetTransform(int id)` → Returns current transform

#### **Memory Management**
- `int GetMemoryUsed()` → Current KB usage
- `int GetMemoryLimit()` → Max KB allowed (tied to N4000 constraint)
- `float GetMemoryPercentage()` → For budget bar
- `bool CanSpawn(string type)` → Checks if memory available

#### **Scene Serialization**
- `string SerializeScene()` → Exports JSON
- `void DeserializeScene(string json)` → Loads from JSON
- `void ClearScene()` → Removes all entities

#### **Performance Tracking**
- `float GetFPS()` → Current frame rate
- `int GetDrawCallCount()` → For optimization
- `void SetTargetFPS(int fps)` → Adaptive performance (30 or 60)

---

## 🖼️ PART 3: REQUIRED THREE.JS FUNCTIONS (The Hands)

### **Rendering Bridge**
```javascript
window.ThreeJSRenderer = {
    // Entity rendering
    renderEntity(id, type, x, y, z, rx, ry, rz, sx, sy, sz),
    updateEntityTransform(id, x, y, z, rx, ry, rz, sx, sy, sz),
    removeEntity(id),
    
    // Visual feedback
    highlightEntity(id),      // For selection
    unhighlightEntity(id),
    setEntityColor(id, hexColor),
    
    // Camera controls
    setCameraPosition(x, y, z),
    setCameraTarget(x, y, z),
    
    // Performance
    getRendererStats()        // Returns draw calls, triangles, etc.
}
```

### **Asset Loading System**
- Load Kenney .glb files from CDN
- Implement instancing for duplicate objects (per context doc optimization)
- Use geometry batching where possible
- Texture atlas for materials

---

## 🔄 PART 4: DATA FLOW ARCHITECTURE

### **Workflow 1: Spawning an Entity**
```
USER CLICKS PALETTE BUTTON (🌲)
  ↓
UI Layer: Determines spawn position (raycast or grid)
  ↓
C# Backend: SpawnEntity("tree", x, y, z)
  ↓ 
C# Backend: Creates Entity, calculates memory cost, returns ID
  ↓
C# Backend: Calls JS Interop → ThreeJSRenderer.renderEntity(...)
  ↓
Three.js: Loads .glb asset, applies transform, adds to scene
  ↓
C# Backend: Calls JS Interop → OrbryaUI.updateBudget(percentage)
  ↓
UI Layer: Updates budget bar visuals
```

### **Workflow 2: Transform Tool (Rotate)**
```
USER SELECTS ROTATE TOOL (Key: 2)
  ↓
UI Layer: Sets active tool, highlights hotbar button
  ↓
USER CLICKS ENTITY IN 3D SCENE
  ↓
Three.js: Raycasts, returns clicked entity ID
  ↓
C# Backend: GetEntity(id) → Validates selection
  ↓
USER DRAGS MOUSE
  ↓
Three.js: Calculates rotation delta
  ↓
C# Backend: SetRotation(id, newX, newY, newZ)
  ↓
Three.js: ThreeJSRenderer.updateEntityTransform(...)
  ↓
Three.js: Applies rotation to mesh
```

### **Workflow 3: Memory Budget Enforcement**
```
USER TRIES TO SPAWN 501st ENTITY
  ↓
C# Backend: CanSpawn("tree") → FALSE (exceeds limit)
  ↓
C# Backend: Calls JS Interop → OrbryaUI.showTutorMessage("You've reached the memory limit...")
  ↓
UI Layer: Tutor avatar pulses, displays message
  ↓
SPAWN BLOCKED
```

---

## ⚡ PART 5: PERFORMANCE CONSTRAINTS
### **Hard Limits (From Unity Analysis Doc)**

| Constraint | Target Value | Rationale |
|------------|--------------|-----------|
| Target FPS | 30 FPS | Realistic for N4000 single-thread bottleneck |
| Draw Calls | <50 per frame | Minimize WebGL CPU dispatch overhead |
| Active Entities | <500 | Prevent physics recursion spiral |
| Memory Heap | 512MB - 1GB | Ensure contiguous allocation on 4GB RAM |
| Managed Allocations | Near Zero | Prevent GC stutter on weak CPU |

### **Optimization Strategies (From Context Docs)**

#### **The CTO's Domain: CPU Budget**
- Write zero-allocation C# code
- Use structs instead of classes where possible
- Object pooling for frequently spawned entities
- Update loop time: <8ms for logic

#### **The Graphics Engineer's Domain: GPU Budget**
- Geometry instancing (draw 500 trees in 1 command)
- Texture atlasing (combine images into one file)
- Frame time: <16ms for rendering (60fps) or <33ms (30fps)

#### **The Bridge: Marshaling Optimization**
- Binary protocol for C# ↔ JS communication
- Batch updates: communicate 10x/sec, not 60x/sec
- Minimize data transfer across WASM boundary

---

## 🎓 PART 6: EDUCATIONAL FEATURES (The "GovTech Twist")

### **WCAG 2.1 AA Compliance Requirements**
Per context doc: Schools legally require accessibility

- Screen reader support for all UI elements
- Color contrast ratios meet AA standards
- Keyboard navigation for all tools
- Alt text for palette icons
- Focus indicators visible

### **FERPA Privacy Layer**
Per context doc: No PII in logs

- "Silence is Golden" telemetry
- Batch logs every 5 seconds (not real-time)
- No chat sockets (anti-bullying by design)
- Teacher dashboard shows progress without personal data
- Roster integration via Clever/ClassLink (no stored passwords)

### **Socratic Tutor Behavior**
From context doc: "Asks guiding questions instead of giving answers"

**Example Interactions:**
```
Student spawns 100 trees in same spot
Tutor: "What do you notice about the memory budget? 
        Can you think of a way to test how many objects 
        your scene can handle?"

Student writes: tree.position.y = -999;
Tutor: "Interesting! What do you think happens when 
        an object goes below the ground plane?"

Student copies/pastes code without understanding
Tutor: "Before you run this, can you explain what 
        line 3 does in your own words?"
```

**NOT Allowed:**
```
Tutor: "The correct answer is X"
Tutor: "Here's the fixed code: ..."
Tutor: "You're wrong, try again"
```

---

## 🚀 PART 7: ASSET LIBRARY SPECIFICATION

### **Kenney Asset Whitelisting**
From context doc: "Asset Whitelisting: Only approved Kenney assets can be loaded"

**Why Kenney Assets Only:**
- Public domain / CC0 license (no copyright risk)
- Low poly aesthetic (optimized for N4000)
- Consistent art style
- Pre-approved for school use

**Asset Categories:**

#### **Nature Pack**
- Trees (5 variants): Pine, Oak, Palm, Birch, Dead
- Rocks (3 variants): Boulder, Stone, Pebble
- Plants (3 variants): Bush, Grass Clump, Flower
- Memory Cost: 8-15KB per instance

#### **Structures Pack**
- Buildings (4 variants): House, Castle Tower, Barn, Fence
- Roads (2 variants): Straight, Corner
- Props (3 variants): Bench, Lamp Post, Sign
- Memory Cost: 20-40KB per instance

#### **Sci-Fi Pack**
- Spaceships (3 variants): Fighter, Cruiser, Station Module
- Tech Props (3 variants): Computer, Robot, Energy Core
- Memory Cost: 30-50KB per instance

#### **Logic Pack** (Invisible Helpers)
- Spawn Point (marker only)
- Waypoint (marker only)
- Trigger Zone (wireframe box)
- Memory Cost: 1-2KB per instance

### **Asset Loading Strategy**
```javascript
// Preload common assets on startup
const assetCache = {
    'tree_pine': await loadGLB('https://cdn.kenney.nl/tree_pine.glb'),
    'tree_oak': await loadGLB('https://cdn.kenney.nl/tree_oak.glb'),
    // ... etc
};

// Use instancing for duplicates
function spawnTree(type, x, y, z) {
    const geometry = assetCache[type].geometry;
    const material = assetCache[type].material;
    
    // THREE.InstancedMesh for performance
    const instance = new THREE.InstancedMesh(geometry, material, 500);
    // Set transform for this instance
}
```

---

## 📋 PART 8: IMPLEMENTATION PRIORITY MATRIX

### **Phase 1: MVP Core (Week 1-2)**
**Goal:** Prove the architecture works

✅ **Must Have:**
- C# Entity spawn/destroy
- Three.js rendering of spawned entities
- Memory budget tracking (basic)
- Single asset type (tree)
- Save/Load to localStorage

⚠️ **Not Yet:**
- All 8 tools (just select/delete)
- Multiple asset types
- Socratic Tutor AI
- Code editor execution

**Success Criteria:**
- User clicks palette → tree spawns at (0,0,0)
- Budget bar updates
- Scene persists after page refresh
- 60fps with 100 trees on N4000

---

### **Phase 2: Tool System (Week 3)**
**Goal:** Enable basic scene editing

✅ **Add:**
- Transform tools (move, rotate, scale)
- Raycasting for entity selection
- Visual feedback (highlight selected)
- Undo/Redo stack (command pattern)

**Success Criteria:**
- User can select, move, rotate any entity
- Undo works for last 10 actions
- Still 60fps with 200 entities

---

### **Phase 3: Asset Library (Week 4)**
**Goal:** Complete visual variety

✅ **Add:**
- All 4 palette categories
- Asset picker UI modal
- Kenney .glb loading system
- Texture atlasing

**Success Criteria:**
- 20+ asset types available
- Assets load in <2 seconds
- Instancing optimization working

---

### **Phase 4: Education Layer (Week 5-6)**
**Goal:** School compliance features

✅ **Add:**
- Socratic Tutor message system
- Code editor with C# syntax highlight
- Simple code execution sandbox
- WCAG keyboard navigation
- Telemetry logging (batched)

**Success Criteria:**
- Tutor responds to common patterns
- Student can run basic C# snippets
- Accessibility audit passes

---

### **Phase 5: Performance Polish (Week 7)**
**Goal:** Prove N4000 optimization claims

✅ **Add:**
- Adaptive FPS (30fps fallback)
- Draw call batching optimization
- Memory leak detection
- Performance profiler overlay

**Success Criteria:**
- Stable 30fps with 500 entities on N4000
- No crashes after 30-minute session
- Memory stays under 1GB

---

### **Phase 6: Pilot Features (Week 8+)**
**Goal:** Deploy to Design Partners (Conroe, Virginia Beach, Toledo)

✅ **Add:**
- Export to .orbrya file format
- Project sharing (via URL)
- Teacher dashboard (basic analytics)
- "Grey Box" performance demo

**Success Criteria:**
- Teachers can monitor student progress
- Students can share projects
- Sole Source Letter data validated

---

## 🔒 PART 9: SECURITY & COMPLIANCE CHECKLIST

### **NY Ed Law 2-d Compliance**
From context doc: "Must pass NY Ed Law 2-d Audit"

- [ ] No PII in client-side storage
- [ ] Encrypted data transmission (HTTPS only)
- [ ] Roster integration via OAuth (Clever/ClassLink)
- [ ] Parental consent workflow (if under 13)
- [ ] Data retention policy (auto-delete after X months)
- [ ] Third-party audit preparation (SOC2 Type 1 readiness)

### **COPPA Compliance**
- [ ] No user-generated content sharing (prevents bullying)
- [ ] No real-time chat (prevents grooming)
- [ ] No external links without teacher approval
- [ ] Age-appropriate content only

### **Chromebook Security Model**
- [ ] Runs in browser sandbox (no file system access)
- [ ] No executable downloads
- [ ] No WebRTC (prevents IP leaks)
- [ ] Content Security Policy headers

---

## 📊 PART 10: SUCCESS METRICS

### **Technical Metrics**
- **Performance:** 30+ FPS on N4000 with 200+ entities
- **Stability:** Zero crashes in 30-minute session
- **Load Time:** <5 seconds to interactive on 4GB RAM
- **Memory:** <1GB heap usage (contiguous allocation success)

### **Business Metrics**
- **Design Partners:** 10 districts signed by April 2026
- **Sole Source:** Legal justification documented
- **Perkins V:** Invoice ready by June 30 fiscal deadline
- **Silent Alumni:** 1,000+ students trained (for Year 6 consumer pivot)

### **Educational Metrics**
- **Engagement:** Students spend 30+ minutes per session
- **Progression:** 80% complete first project
- **Teacher Satisfaction:** 4+ stars in pilot feedback
- **C# Proficiency:** Students can explain variables, loops, functions

---

## ✅ NEXT STEPS

1. **Review this document** with CEO/stakeholders
2. **Prioritize features** based on April deadline
3. **Create GitHub Issues** for each Phase 1 feature
4. **Write C# Entity class** (start with basic spawn/destroy)
5. **Build Three.js bridge** (test C# → JS communication)
6. **Deploy "Grey Box" MVP** to https://oskinner-dev.github.io

**Estimated Timeline:** 8 weeks to Pilot-Ready (April 1st target ✅)

---

**Document Owner:** Lead Systems Architect  
**Last Updated:** December 3, 2025  
**Status:** Ready for Implementation