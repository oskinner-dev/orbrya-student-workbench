import { dotnet } from './_framework/dotnet.js';

export function setRotationSpeed(x, y) {
    if (window.setRotationSpeed) {
        window.setRotationSpeed(x, y);
    } else {
        console.warn('Three.js scene not ready yet');
    }
}

async function initDotNet() {
    console.log('🔄 Loading .NET WebAssembly...');
    
    const { setModuleImports, getAssemblyExports, getConfig } = await dotnet
        .withDiagnosticTracing(false)
        .withApplicationArgumentsFromQuery()
        .create();

    setModuleImports('main.js', {
        setRotationSpeed: setRotationSpeed
    });

    const config = getConfig();
    const exports = await getAssemblyExports(config.mainAssemblyName);

    await exports.OrbryaCubeDemo.Program.Main();

    window.CSharpController = {
        setSpeed: exports.OrbryaCubeDemo.CubeController.SetSpeed,
        increaseSpeed: exports.OrbryaCubeDemo.CubeController.IncreaseSpeed,
        decreaseSpeed: exports.OrbryaCubeDemo.CubeController.DecreaseSpeed,
        stopRotation: exports.OrbryaCubeDemo.CubeController.StopRotation,
        setCustomSpeed: exports.OrbryaCubeDemo.CubeController.SetCustomSpeed
    };

    console.log('✅ C# WASM loaded successfully!');
    console.log('💡 Student Workbench UI ready');
    
    // Update status in UI if element exists
    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.textContent = 'C# backend connected';
    }
}

initDotNet().catch(err => {
    console.error('❌ Failed to load .NET:', err);
});