import { dotnet } from './_framework/dotnet.js';

// ============================================
// HYBRID MEMORY TRACKING (Phase 1 MVP)
// ============================================

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

// APPROACH 4: GPU Memory Estimation (Phase 2)
function getGPUMemory() {
    // Will be implemented when renderer is available
    return { estimatedKB: 0 };
}

// HYBRID: Combine all approaches for real-time budget
export function updateMemoryBudget() {
    if (!window.CSharpEngine) {
        console.warn('[Memory] C# Engine not ready yet');
        return true;
    }

    // 1. Get C# managed heap (actual runtime memory)
    const csharpKB = window.CSharpEngine.GetManagedHeapKB();
    
    // 2. Get JS heap (Chrome only, fallback to 0)
    const jsHeap = getJSHeapUsage();
    const jsKB = jsHeap ? jsHeap.usedKB : 0;
    
    // 3. Get GPU estimate (Phase 2 - currently 0)
    const gpuKB = getGPUMemory().estimatedKB;
    
    // 4. Get entity cost accounting (educational approximation)
    const entityKB = window.CSharpEngine.GetEntityMemoryCost();
    
    // 5. Combine: Use max of entity estimate vs actual measurements
    const actualMemoryKB = csharpKB + jsKB + gpuKB;
    const totalKB = Math.max(entityKB, actualMemoryKB);
    
    // 6. Calculate percentage against 400MB limit
    const limitKB = 400 * 1024; // 400MB
    const percentage = Math.min((totalKB / limitKB) * 100, 100);
    
    // 7. Update UI if available
    if (window.OrbryaUI && window.OrbryaUI.updateBudget) {
        window.OrbryaUI.updateBudget(percentage);
    }
    
    // 8. Debug logging (only on significant changes or warnings)
    if (percentage > 5 || entityKB > 1000) {
        console.log(`💾 Memory: ${totalKB.toLocaleString()}KB / ${limitKB.toLocaleString()}KB (${percentage.toFixed(1)}%)`);
        console.log(`   └─ C# Heap: ${csharpKB}KB | Entity Cost: ${entityKB}KB`);
    }
    
    // 9. Warn if approaching limit
    if (percentage > 85 && window.OrbryaUI && window.OrbryaUI.showTutorMessage) {
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

// Export for C# to call
window.updateMemoryBudget = updateMemoryBudget;

// ============================================
// C# WASM INITIALIZATION
// ============================================

async function initDotNet() {
    console.log('🔄 Loading Orbrya Engine (C# WASM)...');
    
    const { setModuleImports, getAssemblyExports, getConfig } = await dotnet
        .withDiagnosticTracing(false)
        .withApplicationArgumentsFromQuery()
        .create();

    // Set up module imports (C# can call these JS functions)
    setModuleImports('main.js', {
        updateMemoryBudget: updateMemoryBudget
    });

    const config = getConfig();
    const exports = await getAssemblyExports(config.mainAssemblyName);

    // Initialize engine
    await exports.Orbrya.Engine.Program.Main();

    // Expose C# Engine to window (JS can call these C# functions)
    window.CSharpEngine = {
        // Entity Management
        SpawnEntity: exports.Orbrya.Engine.EntityManager.SpawnEntity,
        DestroyEntity: exports.Orbrya.Engine.EntityManager.DestroyEntity,
        GetEntityJSON: exports.Orbrya.Engine.EntityManager.GetEntityJSON,
        GetTransformJSON: exports.Orbrya.Engine.EntityManager.GetTransformJSON,
        GetEntityCount: exports.Orbrya.Engine.EntityManager.GetEntityCount,
        GetAllEntityIdsJSON: exports.Orbrya.Engine.EntityManager.GetAllEntityIdsJSON,
        ClearScene: exports.Orbrya.Engine.EntityManager.ClearScene,

        // Memory Management
        GetEntityMemoryCost: exports.Orbrya.Engine.MemoryManager.GetEntityMemoryCost,
        GetManagedHeapKB: exports.Orbrya.Engine.MemoryManager.GetManagedHeapKB,
        GetMemoryLimit: exports.Orbrya.Engine.MemoryManager.GetMemoryLimit,
        GetMemoryPercentage: exports.Orbrya.Engine.MemoryManager.GetMemoryPercentage,
        CanSpawn: exports.Orbrya.Engine.MemoryManager.CanSpawn,
        GetMemoryCost: exports.Orbrya.Engine.MemoryManager.GetMemoryCost
    };

    console.log('✅ Orbrya Engine loaded successfully!');
    console.log('📦 Available functions:', Object.keys(window.CSharpEngine));
    console.log('');
    console.log('🎮 Try:');
    console.log('  window.CSharpEngine.SpawnEntity("tree_pine", 0, 0, 0)');
    console.log('  window.CSharpEngine.GetEntityCount()');
    console.log('  window.CSharpEngine.GetManagedHeapKB()');
    console.log('');
}

// Start engine initialization
initDotNet().catch(err => {
    console.error('❌ Failed to load Orbrya Engine:', err);
    console.error('Stack trace:', err.stack);
});
