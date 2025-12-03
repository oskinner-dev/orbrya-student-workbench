using System;
using System.Collections.Generic;
using System.Runtime.InteropServices.JavaScript;

namespace Orbrya.Engine;

/// <summary>
/// Manages memory budget tracking with real runtime measurements.
/// Implements hybrid approach: entity cost accounting + GC heap monitoring.
/// </summary>
public partial class MemoryManager
{
    // Entity-based memory accounting (educational approximation)
    private static int entityMemoryKB = 0;
    private static int memoryLimitKB = 409600; // 400MB = 400 * 1024 KB

    // Memory cost table (KB per entity type)
    private static readonly Dictionary<string, int> memoryCosts = new()
    {
        ["tree_pine"] = 12,
        ["tree_oak"] = 15,
        ["tree_birch"] = 13,
        ["building_house"] = 30,
        ["building_castle"] = 45,
        ["spaceship"] = 45,
        ["marker"] = 1
    };

    /// <summary>
    /// Get current entity-based memory cost (educational approximation).
    /// </summary>
    [JSExport]
    public static int GetEntityMemoryCost()
    {
        return entityMemoryKB;
    }

    /// <summary>
    /// Get real C# managed heap size in kilobytes.
    /// Note: We skip the Bytes version to avoid long marshaling issues with JS Interop.
    /// </summary>
    [JSExport]
    public static int GetManagedHeapKB()
    {
        long bytes = GC.GetTotalMemory(forceFullCollection: false);
        return (int)(bytes / 1024);
    }

    /// <summary>
    /// Get memory limit in KB (400MB).
    /// </summary>
    [JSExport]
    public static int GetMemoryLimit()
    {
        return memoryLimitKB;
    }

    /// <summary>
    /// Get memory percentage based on entity accounting (0-100).
    /// </summary>
    [JSExport]
    public static float GetMemoryPercentage()
    {
        return (float)entityMemoryKB / memoryLimitKB * 100f;
    }

    /// <summary>
    /// Check if can spawn entity without exceeding memory limit.
    /// </summary>
    [JSExport]
    public static bool CanSpawn(string type)
    {
        int cost = GetMemoryCost(type);
        return (entityMemoryKB + cost) <= memoryLimitKB;
    }

    /// <summary>
    /// Get memory cost for a specific entity type.
    /// </summary>
    [JSExport]
    public static int GetMemoryCost(string type)
    {
        return memoryCosts.GetValueOrDefault(type, 10); // Default 10KB
    }

    /// <summary>
    /// Called internally when entity spawned. Updates budget and notifies UI.
    /// </summary>
    internal static void AddMemory(string type)
    {
        int cost = GetMemoryCost(type);
        entityMemoryKB += cost;
        Console.WriteLine($"[Memory] +{cost}KB for {type}. Total: {entityMemoryKB}KB / {memoryLimitKB}KB");
        // NotifyUIUpdate(); // DISABLED: JS polling handles UI updates (prevents flicker)
    }

    /// <summary>
    /// Called internally when entity destroyed. Updates budget and notifies UI.
    /// </summary>
    internal static void RemoveMemory(string type)
    {
        int cost = GetMemoryCost(type);
        entityMemoryKB = Math.Max(0, entityMemoryKB - cost);
        Console.WriteLine($"[Memory] -{cost}KB for {type}. Total: {entityMemoryKB}KB / {memoryLimitKB}KB");
        // NotifyUIUpdate(); // DISABLED: JS polling handles UI updates (prevents flicker)
    }

    /// <summary>
    /// Reset memory tracking (for scene clear).
    /// </summary>
    internal static void Reset()
    {
        entityMemoryKB = 0;
        Console.WriteLine("[Memory] Reset to 0KB");
        // NotifyUIUpdate(); // DISABLED: JS polling handles UI updates (prevents flicker)
    }

    /// <summary>
    /// Notify JavaScript to update budget bar (calls hybrid calculation).
    /// CURRENTLY DISABLED - JS polling handles updates to prevent flicker.
    /// </summary>
    [JSImport("updateMemoryBudget", "main.js")]
    private static partial void NotifyUIUpdate();
}
