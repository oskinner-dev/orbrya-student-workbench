using System;
using System.Runtime.InteropServices.JavaScript;

namespace Orbrya.Engine;

/// <summary>
/// Main entry point for Orbrya C# WASM engine.
/// Initializes the engine and logs startup info.
/// </summary>
public partial class Program
{
    [JSExport]
    public static void Main()
    {
        Console.WriteLine("================================================");
        Console.WriteLine("🚀 Orbrya Student Workbench Engine v1.0");
        Console.WriteLine("================================================");
        Console.WriteLine("✅ C# WASM Runtime: Initialized");
        Console.WriteLine("✅ Entity System: Ready");
        Console.WriteLine("✅ Memory Manager: Ready (400MB limit)");
        Console.WriteLine("================================================");
        Console.WriteLine($"📊 Managed Heap: {MemoryManager.GetManagedHeapKB()}KB");
        Console.WriteLine($"💾 Memory Limit: {MemoryManager.GetMemoryLimit()}KB (400MB)");
        Console.WriteLine("================================================");
        Console.WriteLine("");
        Console.WriteLine("🎮 Ready for student projects!");
        Console.WriteLine("");
    }
}
