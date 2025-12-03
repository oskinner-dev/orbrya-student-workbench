# Orbrya API Reference - Quick Implementation Guide

**Purpose:** Copy-paste ready function signatures for all three layers

---

## 🧠 LAYER 1: C# BACKEND (WasmApp/Program.cs)

### **Namespace Structure**
```csharp
namespace Orbrya.Engine
{
    public partial class EntityManager { }
    public partial class MemoryManager { }
    public partial class PerformanceMonitor { }
    public partial class SceneSerializer { }
}
```

---

### **EntityManager.cs**

```csharp
using System.Runtime.InteropServices.JavaScript;

namespace Orbrya.Engine;

public partial class EntityManager
{
    private static List<Entity> entities = new List<Entity>();
    private static int nextId = 0;

    // Spawn new entity
    [JSExport]
    public static int SpawnEntity(string type, float x, float y, float z)
    {
        // Implementation: Create entity, add to list, return ID
    }

    // Destroy entity
    [JSExport]
    public static void DestroyEntity(int id)
    {
        // Implementation: Remove from list, notify renderer
    }

    // Get entity data (for serialization)
    [JSExport]
    public static string GetEntityJSON(int id)
    {
        // Implementation: Return JSON representation
    }

    // Get all entity IDs
    [JSExport]
    public static string GetAllEntityIdsJSON()
    {
        // Implementation: Return array of IDs as JSON
    }

    // Count entities
    [JSExport]
    public static int GetEntityCount()
    {
        return entities.Count;
    }
}
```

---

### **TransformManager.cs**

```csharp
namespace Orbrya.Engine;

public partial class TransformManager
{
    // Set position
    [JSExport]
    public static void SetPosition(int id, float x, float y, float z)
    {
        // Implementation: Update entity, notify renderer
    }

    // Set rotation (Euler angles in degrees)
    [JSExport]
    public static void SetRotation(int id, float x, float y, float z)
    {
        // Implementation: Update entity, notify renderer
    }

    // Set scale
    [JSExport]
    public static void SetScale(int id, float x, float y, float z)
    {
        // Implementation: Update entity, notify renderer
    }

    // Get transform (returns JSON)
    [JSExport]
    public static string GetTransformJSON(int id)
    {
        // Implementation: Return {position, rotation, scale}
    }
}
```

---

### **MemoryManager.cs** (REAL MEMORY TRACKING)

```csharp
namespace Orbrya.Engine;

public partial class MemoryManager
{
    // Entity-based memory accounting (educational approximation)
    private static int entityMemoryKB = 0;
    private static int memoryLimitKB = 409600; // 400MB = 400 * 1024 KB

    // Memory cost table (KB per entity type)
    private static Dictionary<string, int> memoryCosts = new()
    {
        ["tree_pine"] = 12,
        ["tree_oak"] = 15,
        ["tree_birch"] = 13,
        ["building_house"] = 30,
        ["building_castle"] = 45,
        ["spaceship"] = 45,
        ["marker"] = 1
    };

    // APPROACH 1: Entity Cost Accounting (Educational)
    [JSExport]
    public static int GetEntityMemoryCost()
    {
        return entityMemoryKB;
    }

    // APPROACH 2: Real C# Managed Heap (Actual Runtime)
    [JSExport]
    public static long GetManagedHeapBytes()
    {
        // Get current managed heap size without forcing GC
        return GC.GetTotalMemory(forceFullCollection: false);
    }

    [JSExport]
    public static int GetManagedHeapKB()
    {
        return (int)(GetManagedHeapBytes() / 1024);
    }

    // Get memory limit
    [JSExport]
    public static int GetMemoryLimit()
    {
        return memoryLimitKB;
    }

    // Get percentage based on entity accounting (fallback if JS heap unavailable)
    [JSExport]
    public static float GetMemoryPercentage()
    {
        return (float)entityMemoryKB / memoryLimitKB * 100f;
    }

    // Check if can spawn (uses entity cost prediction)
    [JSExport]
    public static bool CanSpawn(string type)
    {
        int cost = GetMemoryCost(type);
        return (entityMemoryKB + cost) <= memoryLimitKB;
    }

    // Get memory cost for a specific type
    [JSExport]
    public static int GetMemoryCost(string type)
    {
        return memoryCosts.GetValueOrDefault(type, 10); // Default 10KB
    }

    // Called internally when entity spawned
    internal static void AddMemory(string type)
    {
        int cost = GetMemoryCost(type);
        entityMemoryKB += cost;
        NotifyUIUpdate();
    }

    // Called internally when entity destroyed
    internal static void RemoveMemory(string type)
    {
        int cost = GetMemoryCost(type);
        entityMemoryKB = Math.Max(0, entityMemoryKB - cost);
        NotifyUIUpdate();
    }

    // Notify JS to update budget bar (calls hybrid calculation)
    [JSImport("updateMemoryBudget", "main.js")]
    private static partial void NotifyUIUpdate();
}
```

---

### **PerformanceMonitor.cs**

```csharp
namespace Orbrya.Engine;

public partial class PerformanceMonitor
{
    private static float currentFPS = 60f;
    private static int targetFPS = 60;

    [JSExport]
    public static float GetFPS()
    {
        return currentFPS;
    }

    [JSExport]
    public static void SetTargetFPS(int fps)
    {
        targetFPS = fps;
        // Notify renderer to adjust frame timing
    }

    // Called from JS each frame
    [JSExport]
    public static void UpdateFPS(float fps)
    {
        currentFPS = fps;
    }
}
```

---

### **SceneSerializer.cs**

```csharp
namespace Orbrya.Engine;

public partial class SceneSerializer
{
    [JSExport]
    public static string SerializeScene()
    {
        // Implementation: Convert all entities to JSON
        // Return: {"entities": [...], "metadata": {...}}
    }

    [JSExport]
    public static void DeserializeScene(string json)
    {
        // Implementation: Clear scene, recreate entities from JSON
    }

    [JSExport]
    public static void ClearScene()
    {
        // Implementation: Destroy all entities
    }
}
```

---

### **Entity.cs (Data Structure)**

```csharp
namespace Orbrya.Engine;

public struct Entity
{
    public int Id;
    public string Type;           // "tree", "building", etc.
    public Vector3 Position;
    public Vector3 Rotation;      // Euler angles
    public Vector3 Scale;
    public int MemoryCost;        // KB
    public bool IsActive;
}

public struct Vector3
{
    public float X;
    public float Y;
    public float Z;

    public Vector3(float x, float y, float z)
    {
        X = x; Y = y; Z = z;
    }
}
```

---

## 🖼️ LAYER 2: THREE.JS RENDERER (main.js bridge)

### **ThreeJSRenderer (Exposed to C#)**

```javascript
// Global renderer object exposed to window
window.ThreeJSRenderer = {
    // Render new entity
    renderEntity(id, type, x, y, z, rx, ry, rz, sx, sy, sz) {
        // Load asset from cache or fetch
        const mesh = getAssetInstance(type);
        mesh.position.set(x, y, z);
        mesh.rotation.set(rx * DEG2RAD, ry * DEG2RAD, rz * DEG2RAD);
        mesh.scale.set(sx, sy, sz);
        mesh.userData.entityId = id;
        
        entityMeshes.set(id, mesh);
        scene.add(mesh);
    },

    // Update existing entity transform
    updateTransform(id, x, y, z, rx, ry, rz, sx, sy, sz) {
        const mesh = entityMeshes.get(id);
        if (mesh) {
            mesh.position.set(x, y, z);
            mesh.rotation.set(rx * DEG2RAD, ry * DEG2RAD, rz * DEG2RAD);
            mesh.scale.set(sx, sy, sz);
        }
    },

    // Remove entity from scene
    removeEntity(id) {
        const mesh = entityMeshes.get(id);
        if (mesh) {
            scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
            entityMeshes.delete(id);
        }
    },

    // Selection feedback
    highlightEntity(id) {
        const mesh = entityMeshes.get(id);
        if (mesh) {
            mesh.userData.originalColor = mesh.material.color.getHex();
            mesh.material.color.setHex(0xa64ac9); // Purple highlight
            mesh.material.emissive.setHex(0xa64ac9);
        }
    },

    unhighlightEntity(id) {
        const mesh = entityMeshes.get(id);
        if (mesh && mesh.userData.originalColor) {
            mesh.material.color.setHex(mesh.userData.originalColor);
            mesh.material.emissive.setHex(0x000000);
        }
    },

    // Camera control
    setCameraPosition(x, y, z) {
        camera.position.set(x, y, z);
    },

    setCameraTarget(x, y, z) {
        camera.lookAt(x, y, z);
    },

    // Performance stats
    getStats() {
        return {
            drawCalls: renderer.info.render.calls,
            triangles: renderer.info.render.triangles,
            fps: currentFPS
        };
    },

    // Raycasting for selection
    raycast(mouseX, mouseY) {
        // Convert screen coords to NDC
        const mouse = new THREE.Vector2(
            (mouseX / window.innerWidth) * 2 - 1,
            -(mouseY / window.innerHeight) * 2 + 1
        );

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            return intersects[0].object.userData.entityId || -1;
        }
        return -1;
    }
};
```

---

### **Asset Loading System**

```javascript
// Asset cache (preload on startup)
const assetCache = new Map();
const entityMeshes = new Map(); // Maps entity ID to Three.js mesh

// Preload Kenney assets
async function preloadAssets() {
    const assets = [
        { type: 'tree_pine', url: 'https://cdn.kenney.nl/assets/tree_pine.glb' },
        { type: 'tree_oak', url: 'https://cdn.kenney.nl/assets/tree_oak.glb' },
        // ... more assets
    ];

    for (const asset of assets) {
        const gltf = await loader.loadAsync(asset.url);
        assetCache.set(asset.type, gltf.scene.clone());
    }

    console.log(`✅ Loaded ${assetCache.size} assets`);
}

// Get cloned instance of asset
function getAssetInstance(type) {
    const cached = assetCache.get(type);
    if (cached) {
        return cached.clone();
    }
    
    // Fallback: create basic geometry
    return createFallbackMesh(type);
}
```

---

### **Hybrid Memory Tracking (main.js)**

```javascript
// APPROACH 3: JavaScript Heap Monitoring (Chrome only)
function getJSHeapUsage() {
    if (performance.memory) {
        return {
            usedKB: Math.round(performance.memory.usedJSHeapSize / 1024),
            limitKB: Math.round(performance.memory.jsHeapSizeLimit / 1024),
            totalKB: Math.round(performance.memory.totalJSHeapSize / 1024)
        };
    }
    return null; // Fallback for Firefox/Safari
}

// APPROACH 4: GPU Memory Estimation
function getGPUMemory() {
    const info = renderer.info.memory;
    return {
        geometries: info.geometries,
        textures: info.textures,
        // Estimate: Each geometry ~10KB, each texture ~50KB
        estimatedKB: (info.geometries * 10) + (info.textures * 50)
    };
}

// HYBRID: Combine all 4 approaches for real-time budget
export function updateMemoryBudget() {
    // 1. Get C# managed heap (actual runtime memory)
    const csharpKB = window.CSharpEngine.GetManagedHeapKB();
    
    // 2. Get JS heap (Chrome only, fallback to 0)
    const jsHeap = getJSHeapUsage();
    const jsKB = jsHeap ? jsHeap.usedKB : 0;
    
    // 3. Get GPU memory estimate
    const gpuKB = getGPUMemory().estimatedKB;
    
    // 4. Get entity cost accounting (educational approximation)
    const entityKB = window.CSharpEngine.GetEntityMemoryCost();
    
    // 5. Combine: Use max of entity estimate vs actual measurements
    // This gives us educational accuracy AND real runtime protection
    const actualMemoryKB = csharpKB + jsKB + gpuKB;
    const totalKB = Math.max(entityKB, actualMemoryKB);
    
    // 6. Calculate percentage against 400MB limit
    const limitKB = 400 * 1024; // 400MB
    const percentage = Math.min((totalKB / limitKB) * 100, 100);
    
    // 7. Update UI with smooth transition
    window.OrbryaUI.updateBudget(percentage);
    
    // 8. Debug logging (visible in browser console)
    console.log(`💾 Memory: ${totalKB.toLocaleString()}KB / ${limitKB.toLocaleString()}KB (${percentage.toFixed(1)}%)`);
    console.log(`   └─ C# Heap: ${csharpKB}KB | JS Heap: ${jsKB}KB | GPU: ${gpuKB}KB | Entity Est: ${entityKB}KB`);
    
    // 9. Warn if approaching limit
    if (percentage > 85) {
        console.warn('⚠️ Memory usage high! Consider removing entities.');
        window.OrbryaUI.showTutorMessage(
            "You're using a lot of memory. What happens if you spawn more objects?"
        );
    }
    
    // 10. Block spawning at 95%+ (safety margin)
    if (percentage >= 95) {
        console.error('🚫 Memory limit reached! Cannot spawn more entities.');
        return false; // Prevent spawn
    }
    
    return true; // Allow spawn
}

// Export for C# to call via [JSImport]
window.updateMemoryBudget = updateMemoryBudget;
```

---

## 🎨 LAYER 3: UI BRIDGE (Already Exists in index.html)

### **OrbryaUI (Already Exposed)**

```javascript
window.OrbryaUI = {
    // Tool selection
    selectTool: (toolName) => { /* existing */ },
    getCurrentTool: () => currentTool,
    
    // Budget updates
    updateBudget: (percentage) => { /* existing */ },
    
    // Object management
    addObject: () => { /* existing */ },
    removeObject: () => { /* existing */ },
    
    // Tutor messages
    showTutorMessage: (message) => { /* existing */ },
    
    // Save/Load
    saveProject: () => { /* existing */ },
    loadProject: () => { /* existing */ },
    
    // Coding panel
    openCodingPanel: () => { /* existing */ },
    logToConsole: (message, type) => { /* existing */ }
};
```

---

## 🔄 INTEGRATION: How They Talk to Each Other

### **Example 1: Spawn Entity Flow**

```javascript
// 1. USER CLICKS PALETTE BUTTON
document.querySelector('[data-category="nature"]').addEventListener('click', () => {
    // 2. CALL C# BACKEND
    const id = window.CSharpEngine.SpawnEntity('tree_pine', 0, 0, 0);
    
    // 3. C# INTERNALLY CALLS:
    // - MemoryManager.AddMemory(12)
    // - MemoryManager.NotifyUIUpdate() → calls updateMemoryBudget()
    
    // 4. GET TRANSFORM FROM C#
    const transformJSON = window.CSharpEngine.GetTransformJSON(id);
    const t = JSON.parse(transformJSON);
    
    // 5. RENDER IN THREE.JS
    window.ThreeJSRenderer.renderEntity(
        id, 'tree_pine',
        t.position.x, t.position.y, t.position.z,
        t.rotation.x, t.rotation.y, t.rotation.z,
        t.scale.x, t.scale.y, t.scale.z
    );
});
```

### **Example 2: Transform Entity Flow**

```javascript
// 1. USER SELECTS ROTATE TOOL
window.OrbryaUI.selectTool('rotate');

// 2. USER CLICKS ENTITY IN 3D SCENE
canvas.addEventListener('click', (e) => {
    const id = window.ThreeJSRenderer.raycast(e.clientX, e.clientY);
    if (id !== -1) {
        selectedEntity = id;
        window.ThreeJSRenderer.highlightEntity(id);
    }
});

// 3. USER DRAGS TO ROTATE
canvas.addEventListener('mousemove', (e) => {
    if (selectedEntity && currentTool === 'rotate') {
        const deltaY = e.movementX * 0.5; // Rotation speed
        
        // 4. UPDATE IN C#
        window.CSharpEngine.SetRotation(selectedEntity, 0, deltaY, 0);
        
        // 5. GET UPDATED TRANSFORM
        const t = JSON.parse(window.CSharpEngine.GetTransformJSON(selectedEntity));
        
        // 6. UPDATE THREE.JS VISUAL
        window.ThreeJSRenderer.updateTransform(
            selectedEntity,
            t.position.x, t.position.y, t.position.z,
            t.rotation.x, t.rotation.y, t.rotation.z,
            t.scale.x, t.scale.y, t.scale.z
        );
    }
});
```

---

## ⚙️ BUILD & DEPLOYMENT

### **Build Command**
```bash
# Compile C# to WASM
dotnet publish WasmApp/WasmApp.csproj -c Release -o publish

# Copy to docs/ for GitHub Pages
cp -r publish/* docs/
cp WasmApp/wwwroot/index.html docs/index.html

# Deploy
git add docs/
git commit -m "Build $(date)"
git push origin main
```

### **Local Testing**
```bash
# Start simple HTTP server
cd docs
python -m http.server 8000

# Open browser
# http://localhost:8000
```

---

**NEXT STEP:** Implement Phase 1 MVP (Entity spawn/destroy only)