# Orbrya Architecture - Decision Log

**Purpose:** Document key architectural decisions with rationale

---

## ✅ DECISION 1: Edit Existing Project vs. Rebuild

**Date:** December 3, 2025  
**Context:** Full UI exists in docs/, but C# backend is minimal  
**Decision:** EDIT existing project, don't rebuild  

**Rationale:**
- **Time Constraint:** 4 months until April deadline
- **Working Assets:** UI proves glassmorphism works, Three.js validated
- **Investor Demo:** Need to show N4000 constraint solved, not HTML writing skills
- **Risk:** Rebuild = 1-2 weeks lost on non-differentiating work

**Implementation Path:**
1. Move docs/index.html → WasmApp/wwwroot/index.html (source of truth)
2. Expand C# backend from toy (rotate cube) to real engine (entity system)
3. Build JS bridge for C# ↔ Three.js communication
4. Create repeatable build script

**Status:** Approved ✅

---

## ✅ DECISION 2: C# WASM + Three.js (Not Unity WebGL)

**Date:** Pre-project (from context docs)  
**Decision:** Build proprietary runtime instead of using Unity  

**Rationale from Context:**
- **Performance:** Unity WebGL won't launch on N4000
- **Legal Moat:** Proprietary engine = Sole Source justification
- **Cost:** No Unity licensing fees for schools
- **Control:** Can optimize specifically for N4000 chipset

**Technical Architecture:**
- **The Brain (C# .NET 8 WASM):** Game logic, physics, entity management
- **The Hands (Three.js r128):** Lightweight WebGL rendering
- **The Bridge (JS Interop):** Batched communication (10x/sec, not 60x/sec)

**Validated Performance:**
- 40-60 FPS with 175 trees on N4000 (from Chromebook_Performance_Chart.html)
- 705 trees tested without crash (graceful degradation)

**Status:** Validated ✅

---

## ✅ DECISION 3: Kenney Assets Only (No User Uploads)

**Date:** Pre-project (from Team context doc)  
**Decision:** Whitelist only Kenney assets, block user uploads  

**Rationale from Context:**
- **Copyright Risk:** User uploads introduce porn/copyright liability
- **School Safety:** Pre-approved content only
- **Performance:** Low-poly assets optimized for N4000
- **Legal:** Public domain/CC0 license (no licensing disputes)

**Implementation:**
- Asset whitelisting pipeline in C# backend
- CDN-hosted Kenney .glb files only
- No file upload UI elements

**Quote from Context:**
> "Asset Whitelisting: Building the pipeline that strictly enforcing only approved Kenney assets can be loaded. No 'User Uploads' (which introduces porn/copyright risks)."

**Status:** Requirement ✅

---

## ✅ DECISION 4: "Silence is Golden" Telemetry (No Real-Time Chat)

**Date:** Pre-project (from Business Plan context)  
**Decision:** Batch telemetry every 5 seconds, no real-time sockets  

**Rationale from Context:**
- **Anti-Bullying:** Structurally prevents real-time harassment
- **Firewall Friendly:** Batched HTTP requests work on school WiFi
- **FERPA Compliance:** No PII in real-time logs
- **Performance:** Reduces network overhead on weak connections

**Implementation:**
- Batch student progress logs
- Teacher dashboard shows aggregated data
- No chat functionality at all
- Socratic Tutor is local AI (no server calls)

**Quote from Context:**
> "Built-in 'Silence is Golden' telemetry batches logs to teacher dashboards without real-time chat sockets, creating a structurally anti-bullying environment."

**Status:** Requirement ✅

---

## ✅ DECISION 5: Phase-Based Development (8 Weeks to Pilot)

**Date:** December 3, 2025  
**Decision:** Split into 6 phases, prioritize MVP + School Compliance  

**Phase Priority:**
1. **Phase 1 (Weeks 1-2):** Core entity system + memory tracking
2. **Phase 2 (Week 3):** Transform tools (move/rotate/scale)
3. **Phase 3 (Week 4):** Full asset library (20+ types)
4. **Phase 4 (Weeks 5-6):** Educational features (Tutor, code editor)
5. **Phase 5 (Week 7):** Performance optimization for N4000
6. **Phase 6 (Week 8+):** Pilot deployment to 3 districts

**Rationale:**
- **Business Goal:** Sign 10 districts by April 2026
- **Technical Goal:** Prove 60fps on N4000 with 200+ entities
- **Educational Goal:** WCAG 2.1 AA + FERPA compliance
- **Investor Goal:** Show working demo to Amjad Masad / Dylan Field

**Status:** Active 🚀

---

## ✅ DECISION 6: Memory Budget = 400MB (Not Full 1GB)

**Date:** December 3, 2025  
**Decision:** Set C# heap limit to 400MB (40% of system RAM)  

**Rationale:**
- **System RAM:** 4GB total on N4000 Chromebooks
- **OS Overhead:** ~1.5GB for Chrome OS
- **Browser Overhead:** ~1GB for Chrome browser + tabs
- **Safe Allocation:** 400MB allows contiguous memory block
- **Headroom:** Prevents crash due to memory fragmentation

**Memory Cost Table:**
| Asset Type | Memory Cost | Max Count at 400MB |
|------------|-------------|-------------------|
| Tree | 12 KB | 33,333 |
| Building | 30 KB | 13,653 |
| Spaceship | 45 KB | 9,102 |
| Marker | 1 KB | 409,600 |

**Realistic Target:** 500 entities mixed types = ~50% budget

**Quote from Unity Analysis Doc:**
> "Unity Heap Max Size in the Player settings to an extremely conservative value, ideally between 512 MB and 1 GB."

**Status:** Implemented in MemoryManager.cs ✅

---

## ✅ DECISION 7: Target 30 FPS (Not 60 FPS)

**Date:** December 3, 2025  
**Decision:** Adaptive FPS with 30 FPS as target, 60 FPS as bonus  

**Rationale from Unity Analysis:**
- **N4000 Bottleneck:** Single-thread performance = 1,037 MOps/Sec
- **Frame Budget:** 33.3ms at 30fps vs 16.6ms at 60fps
- **Physics Timestep:** Set Fixed Timestep = 0.033s (matches 30fps)
- **Graceful Degradation:** Drop to 30fps prevents physics spiral

**Implementation:**
```csharp
// Fixed Timestep = 0.033s (30 Hz)
// Maximum Allowed Timestep = 0.05s (prevents catch-up spiral)
```

**Quote from Unity Analysis:**
> "The Fixed Timestep value in Project Settings should be increased from the default 0.02 seconds to 0.033 to 0.035 seconds. This value synchronizes the physics updates closer to a stable 30 FPS target."

**Performance Validation:**
- 60 FPS @ 25 trees ✅
- 50 FPS @ 100 trees ✅
- 42 FPS @ 175 trees ✅
- 30 FPS @ 300 trees ⚠️
- 8 FPS @ 705 trees (no crash) ✅

**Status:** Target validated on real hardware ✅

---

## ✅ DECISION 8: Struct-Based Entities (Not Classes)

**Date:** December 3, 2025  
**Decision:** Use C# structs for Entity instead of classes  

**Rationale:**
- **Zero Allocation:** Structs are value types (stack-allocated)
- **GC Pressure:** No managed heap allocations = no GC pauses
- **Performance:** Critical for N4000 weak single-thread CPU
- **Copy Semantics:** Pass by value prevents accidental mutations

**Trade-off:**
- **Pro:** No GC stutters (huge win on N4000)
- **Con:** Larger memory footprint per entity
- **Verdict:** Worth it for stable frame times

**Implementation:**
```csharp
public struct Entity  // NOT class
{
    public int Id;
    public string Type;
    public Vector3 Position;
    public Vector3 Rotation;
    public Vector3 Scale;
    public int MemoryCost;
    public bool IsActive;
}
```

**Quote from Team Context:**
> "Write 'Zero-Allocation' C# code. Using Structs instead of Classes."

**Status:** Design pattern established ✅

---

## ✅ DECISION 9: GPU Instancing for Duplicate Objects

**Date:** Pre-project (from Team context)  
**Decision:** Use THREE.InstancedMesh for repeated geometry  

**Rationale:**
- **Draw Calls:** 1 draw call for 500 trees (vs 500 draw calls)
- **CPU Overhead:** Minimize WebGL dispatch on weak N4000 CPU
- **Memory:** Shares geometry/material across instances
- **Target:** <50 draw calls per frame (hard limit)

**Implementation:**
```javascript
// Bad: 500 draw calls
for (let i = 0; i < 500; i++) {
    const tree = new THREE.Mesh(geometry, material);
    scene.add(tree); // Each tree = 1 draw call
}

// Good: 1 draw call
const instancedMesh = new THREE.InstancedMesh(geometry, material, 500);
scene.add(instancedMesh); // All 500 trees = 1 draw call
```

**Quote from Team Context:**
> "Geometry Instancing (Drawing 500 trees in 1 command). Texture Atlasing (Combining all images into one file)."

**Status:** Planned for Phase 3 ⏳

---

## ✅ DECISION 10: Socratic Tutor = Rule-Based (Not LLM)

**Date:** December 3, 2025  
**Decision:** Pattern-matching tutor, not Claude/GPT API  

**Rationale:**
- **Cost:** No API fees (schools have no budget for OpenAI)
- **Privacy:** No student code sent to external servers (FERPA)
- **Latency:** Instant responses (no network delay)
- **Control:** Pedagogically designed responses

**Implementation:**
```javascript
// Detect patterns in student code/behavior
if (studentSpawned100TreesInSameSpot) {
    showTutorMessage("What do you notice about the memory budget?");
}

if (studentCopiedCodeWithoutUnderstanding) {
    showTutorMessage("Before running, explain what line 3 does.");
}
```

**NOT Allowed:**
- "The correct answer is X"
- "Here's the fixed code"
- Any external API calls

**Status:** Design pattern established ✅

---

## ✅ DECISION 11: No Static Batching (Memory Risk)

**Date:** December 3, 2025  
**Decision:** Avoid Unity-style static batching due to memory overhead  

**Rationale from Unity Analysis:**
- **Memory Cost:** Static batching merges meshes → massive memory increase
- **4GB RAM Limit:** Can't afford memory bloat on N4000
- **Crash Risk:** Out of memory = terminal failure (worse than lag)

**Quote from Unity Analysis:**
> "Static batching operates by merging entire meshes into larger blocks, which substantially increases the required memory footprint. On a 4GB RAM system, this aggressive memory consumption is highly detrimental."

**Alternative:** Use GPU instancing + dynamic batching for small meshes

**Status:** Design constraint ✅

---

## ⏳ PENDING DECISION: Code Editor Execution Sandbox

**Date:** TBD (Phase 4)  
**Context:** How to safely execute student C# code  

**Options:**
1. **Full WASM Compilation:** Compile student code to WASM (slow, complex)
2. **Roslyn Scripting API:** Eval C# at runtime (requires C# Scripting package)
3. **Predefined API Only:** Students call pre-built functions (limited)

**Criteria:**
- Must prevent file system access
- Must timeout after 5 seconds
- Must not crash main engine
- Must support basic C# (variables, loops, functions)

**Status:** Research needed ⏳

---

## ⏳ PENDING DECISION: .orbrya File Format

**Date:** TBD (Phase 6)  
**Context:** What format for project export/sharing  

**Options:**
1. **JSON:** Human-readable, easy to parse
2. **Binary:** Smaller file size, faster load
3. **JSON + Base64:** JSON with embedded binary assets

**Requirements:**
- Include entity data (positions, rotations, scales)
- Include metadata (author, date, version)
- Versioned format (future compatibility)
- Optionally include student code

**Status:** JSON likely winner (simplicity) ⏳

---

## 🚫 REJECTED DECISION: Unity WebGL

**Date:** Pre-project  
**Decision:** DO NOT use Unity WebGL  

**Reason for Rejection:**
- Unity WebGL won't launch on N4000 (verified by testing)
- 4GB RAM insufficient for Unity's memory requirements
- No control over optimization for specific chipset
- Licensing costs for schools

**Evidence from Chromebook Performance Chart:**
| Engine | N4000 Performance |
|--------|-------------------|
| Unity WebGL | ❌ Won't Launch |
| Unreal Engine | ❌ Won't Launch |
| Roblox | 15-20 FPS (Limited) |
| **Orbrya** | **40-60 FPS (Full 3D)** ✅ |

**Status:** Permanently rejected 🚫

---

## 🚫 REJECTED DECISION: Real-Time Multiplayer

**Date:** Pre-project  
**Decision:** NO multiplayer in MVP  

**Reason for Rejection:**
- **Network Infrastructure:** School WiFi too weak
- **Scope Creep:** Would delay April deadline
- **Privacy Risk:** Real-time data = FERPA complications
- **Not Differentiating:** Single-player enough for Sole Source

**Future Consideration:** Async sharing (upload project, others download)

**Status:** Deferred to Year 2+ 🚫

---

## 📋 DECISION SUMMARY TABLE

| Decision | Status | Impact | Risk Level |
|----------|--------|--------|-----------|
| Edit Existing Project | ✅ Approved | High | Low |
| C# WASM + Three.js | ✅ Validated | Critical | Low |
| Kenney Assets Only | ✅ Requirement | High | Low |
| Silence is Golden | ✅ Requirement | High | Low |
| 8-Week Phases | 🚀 Active | Critical | Medium |
| 400MB Memory Limit | ✅ Implemented | High | Low |
| Target 30 FPS | ✅ Validated | High | Low |
| Struct-Based Entities | ✅ Pattern Set | Medium | Low |
| GPU Instancing | ⏳ Planned | High | Low |
| Rule-Based Tutor | ✅ Pattern Set | Medium | Low |
| No Static Batching | ✅ Constraint | Medium | Low |
| Code Sandbox | ⏳ Research | High | High |
| .orbrya Format | ⏳ Pending | Low | Low |
| Unity WebGL | 🚫 Rejected | N/A | N/A |
| Multiplayer | 🚫 Deferred | N/A | N/A |

---

**Document Maintainer:** Lead Systems Architect  
**Review Frequency:** Every sprint (2 weeks)  
**Last Updated:** December 3, 2025