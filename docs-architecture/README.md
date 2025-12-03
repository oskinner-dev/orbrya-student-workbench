# Orbrya Architecture Documentation

**Version:** 1.0  
**Date:** December 3, 2025  
**Status:** Complete - Ready for Implementation

---

## 📚 DOCUMENTATION INDEX

### **1. FEATURE_REQUIREMENTS.md** (557 lines)
**Purpose:** Complete feature specification across all three layers

**Contents:**
- UI inventory (what exists in current HTML/CSS/JS)
- Required C# backend API
- Required Three.js rendering functions
- Data flow diagrams
- Performance constraints (N4000 optimization)
- 6-phase implementation plan (8 weeks to pilot)
- Educational features (Socratic Tutor, WCAG compliance)
- Asset library specification (Kenney assets only)
- Success metrics (technical + business + educational)

**Read This When:**
- Starting implementation of any feature
- Need to understand how components interact
- Estimating effort for new features
- Designing data structures

---

### **2. API_REFERENCE.md** (543 lines)
**Purpose:** Copy-paste ready code for all three layers

**Contents:**
- C# Backend function signatures with [JSExport]
- Three.js Renderer interface with examples
- UI Bridge (OrbryaUI) documentation
- Complete integration examples
- Entity data structures
- Build & deployment commands

**Read This When:**
- Writing actual C# code
- Implementing Three.js rendering
- Setting up JS Interop
- Debugging communication between layers
- Onboarding new developers

---

### **3. DECISION_LOG.md** (406 lines)
**Purpose:** Record of architectural decisions with rationale

**Contents:**
- Why we chose C# WASM + Three.js (not Unity)
- Why Kenney assets only (no user uploads)
- Why "Silence is Golden" telemetry (no real-time chat)
- Why 400MB memory limit (not full 1GB)
- Why target 30 FPS (not 60 FPS)
- Why struct-based entities (not classes)
- Rejected alternatives (Unity WebGL, multiplayer)
- Pending decisions (code sandbox, file format)

**Read This When:**
- Someone asks "why did we do it this way?"
- Evaluating new feature proposals
- Considering architectural changes
- Writing investor/partner updates
- Preparing for audits or reviews

---

### **4. IMPLEMENTATION_ROADMAP.md** (372 lines)
**Purpose:** Day-by-day plan for Phase 1 MVP (Weeks 1-2)

**Contents:**
- Daily task breakdown
- Acceptance tests for each task
- Code file locations and line counts
- Performance validation checklist
- Investor demo script (2 minutes)
- Go/No-Go decision criteria
- Next immediate actions

**Read This When:**
- Starting Phase 1 implementation
- Need to estimate effort/timeline
- Planning sprint work
- Tracking progress against deadline
- Preparing for demos

---

## 🎯 DESIGN PRINCIPLES (FROM CONTEXT)

These are non-negotiable constraints from the business plan and team documents:

1. **Hardware Ceiling:** 60fps on Intel Celeron N4000 / 4GB RAM
2. **Zero-Install:** Browser-only, no Unity/Unreal/downloads
3. **The Architecture:**
   - **The Brain (C# WASM):** Game logic, physics, entity management
   - **The Hands (Three.js):** Lightweight rendering, N4000-optimized
   - **The UI (HTML/CSS/JS):** Glassmorphism overlay, zero canvas interference

4. **Performance Budget:**
   - Draw Calls: <50 per frame
   - Active Entities: <500
   - Memory Heap: 400MB max
   - Target FPS: 30-60 (adaptive)

5. **Compliance:**
   - FERPA (no PII in logs)
   - WCAG 2.1 AA (accessibility)
   - NY Ed Law 2-d (data privacy)
   - COPPA (no user-generated content sharing)

---

## 🚀 QUICK START GUIDE

### **For Developers:**

1. **Read in this order:**
   1. IMPLEMENTATION_ROADMAP.md (understand Phase 1)
   2. API_REFERENCE.md (see code examples)
   3. FEATURE_REQUIREMENTS.md (understand full scope)
   4. DECISION_LOG.md (understand why)

2. **Set up environment:**
   ```bash
   # Clone repo
   git clone https://github.com/oskinner-dev/orbrya-student-workbench.git
   cd orbrya-student-workbench
   
   # Install .NET 8 SDK
   # (from https://dotnet.microsoft.com/download)
   
   # Build C# WASM
   dotnet publish WasmApp/WasmApp.csproj -c Release -o publish
   
   # Test locally
   cd docs
   python -m http.server 8000
   # Open http://localhost:8000
   ```

3. **Start coding Phase 1:**
   - Create `WasmApp/Engine/` directory
   - Follow Day 1-2 tasks in IMPLEMENTATION_ROADMAP.md
   - Use code from API_REFERENCE.md as starting templates

### **For Stakeholders:**

1. **Read in this order:**
   1. This README (understand structure)
   2. IMPLEMENTATION_ROADMAP.md → Investor Demo Script section
   3. DECISION_LOG.md → Decision Summary Table
   4. FEATURE_REQUIREMENTS.md → Success Metrics section

2. **Review milestones:**
   - Week 2: Phase 1 MVP complete (entity spawn/destroy)
   - Week 3: Transform tools working (move/rotate/scale)
   - Week 4: Full asset library (20+ types)
   - Week 6: Educational features (Socratic Tutor)
   - Week 7: Performance validation on N4000
   - Week 8+: Deploy to 3 pilot districts

3. **Track progress:**
   - GitHub commits should reference Phase numbers
   - Weekly demo videos show incremental progress
   - Performance metrics logged in GitHub Issues

---

## 📊 DOCUMENT STATISTICS

| Document | Lines | Purpose |
|----------|-------|---------|
| FEATURE_REQUIREMENTS.md | 557 | What to build |
| API_REFERENCE.md | 543 | How to build it |
| DECISION_LOG.md | 406 | Why we built it this way |
| IMPLEMENTATION_ROADMAP.md | 372 | When to build it |
| **TOTAL** | **1,878** | **Complete specification** |

---

## ✅ VALIDATION CHECKLIST

Before implementation, verify:

### **Context Documents Reviewed:**
- [x] Team document (CTO role, Graphics Engineer role)
- [x] Business Plan (Sole Source strategy, 10-year roadmap)
- [x] Pilot Guide (Design Partner expectations)
- [x] Chromebook Performance Chart (N4000 validation)
- [x] Unity Analysis (bottleneck identification)

### **Technical Prerequisites:**
- [x] Three.js engine working (forest scene deployed)
- [x] C# WASM runtime tested (cube rotation demo)
- [x] UI mockup complete (glassmorphism overlay)
- [x] N4000 performance validated (40-60 FPS @ 175 entities)

### **Architecture Decisions:**
- [x] Entity system design (struct-based)
- [x] Memory budget strategy (400MB limit)
- [x] Rendering strategy (GPU instancing)
- [x] Compliance approach ("Silence is Golden")
- [x] Asset strategy (Kenney whitelist only)

---

## 🎯 SUCCESS CRITERIA

### **Phase 1 MVP (Week 2):**
- [ ] Click palette → tree spawns
- [ ] Budget bar updates in real-time
- [ ] Save/Load persists scene
- [ ] 60fps with 100 trees on N4000

### **Pilot Deployment (Week 8):**
- [ ] 3 districts using the tool (Conroe, Virginia Beach, Toledo)
- [ ] Teachers can monitor student progress
- [ ] Students can save/load projects
- [ ] Zero crashes in 30-minute sessions
- [ ] WCAG 2.1 AA compliance verified

### **Business Goals (April 2026):**
- [ ] 10 design partner districts signed
- [ ] Sole Source letter issued
- [ ] Perkins V invoices ready (June 30 deadline)
- [ ] Demo video for Amjad Masad / Dylan Field

---

## 🚦 CURRENT STATUS

**Architecture:** ✅ Complete  
**Phase 1 Plan:** ✅ Ready  
**Prerequisites:** ✅ Validated  
**Team:** ⏳ Pending assignment  
**Hardware:** ⏳ Need N4000 Chromebook for testing  

**READY TO BUILD:** YES 🚀

---

## 📞 NEXT STEPS

1. **Immediate:**
   - Verify GitHub Pages deployment works
   - Acquire N4000 Chromebook for testing
   - Assign C# developer to Phase 1

2. **This Week:**
   - Implement Entity.cs and EntityManager.cs
   - Set up JS Interop bridge
   - Connect palette UI to spawn function

3. **Next Week:**
   - Complete Phase 1 MVP
   - Record demo video
   - Send to design partners for feedback

---

**Document Maintainer:** Lead Systems Architect  
**Last Updated:** December 3, 2025  
**Questions?** Review DECISION_LOG.md first, then file GitHub Issue