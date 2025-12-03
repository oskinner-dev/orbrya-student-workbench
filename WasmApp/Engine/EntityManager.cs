using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices.JavaScript;
using System.Text.Json;

namespace Orbrya.Engine;

/// <summary>
/// Manages all entities in the scene. Handles spawn, destroy, and queries.
/// </summary>
public partial class EntityManager
{
    private static List<Entity> entities = new List<Entity>();
    private static int nextId = 0;

    /// <summary>
    /// Spawn a new entity at the specified position.
    /// Returns the entity ID, or -1 if spawn failed.
    /// </summary>
    [JSExport]
    public static int SpawnEntity(string type, float x, float y, float z)
    {
        // Check if memory allows spawning
        if (!MemoryManager.CanSpawn(type))
        {
            Console.WriteLine($"[EntityManager] Cannot spawn {type}: Memory limit reached");
            return -1;
        }

        // Create entity
        var position = new Vector3(x, y, z);
        var entity = new Entity(nextId, type, position)
        {
            MemoryCostKB = MemoryManager.GetMemoryCost(type)
        };

        entities.Add(entity);
        MemoryManager.AddMemory(type);

        Console.WriteLine($"[EntityManager] Spawned {type} #{nextId} at {position}");
        
        int id = nextId;
        nextId++;
        return id;
    }

    /// <summary>
    /// Destroy an entity by ID.
    /// </summary>
    [JSExport]
    public static void DestroyEntity(int id)
    {
        var entity = entities.FirstOrDefault(e => e.Id == id && e.IsActive);
        
        if (entity.Id == id) // Found it
        {
            // Mark as inactive
            int index = entities.FindIndex(e => e.Id == id);
            if (index >= 0)
            {
                var e = entities[index];
                e.IsActive = false;
                entities[index] = e;
                
                MemoryManager.RemoveMemory(entity.Type);
                Console.WriteLine($"[EntityManager] Destroyed {entity.Type} #{id}");
            }
        }
        else
        {
            Console.WriteLine($"[EntityManager] Entity #{id} not found or already destroyed");
        }
    }

    /// <summary>
    /// Get entity data as JSON string.
    /// </summary>
    [JSExport]
    public static string GetEntityJSON(int id)
    {
        var entity = entities.FirstOrDefault(e => e.Id == id && e.IsActive);
        
        if (entity.Id == id)
        {
            var data = new
            {
                id = entity.Id,
                type = entity.Type,
                position = new { x = entity.Position.X, y = entity.Position.Y, z = entity.Position.Z },
                rotation = new { x = entity.Rotation.X, y = entity.Rotation.Y, z = entity.Rotation.Z },
                scale = new { x = entity.Scale.X, y = entity.Scale.Y, z = entity.Scale.Z },
                memoryCostKB = entity.MemoryCostKB
            };
            return JsonSerializer.Serialize(data);
        }
        
        return "{}";
    }

    /// <summary>
    /// Get transform data as JSON string.
    /// </summary>
    [JSExport]
    public static string GetTransformJSON(int id)
    {
        var entity = entities.FirstOrDefault(e => e.Id == id && e.IsActive);
        
        if (entity.Id == id)
        {
            var data = new
            {
                position = new { x = entity.Position.X, y = entity.Position.Y, z = entity.Position.Z },
                rotation = new { x = entity.Rotation.X, y = entity.Rotation.Y, z = entity.Rotation.Z },
                scale = new { x = entity.Scale.X, y = entity.Scale.Y, z = entity.Scale.Z }
            };
            return JsonSerializer.Serialize(data);
        }
        
        return "{}";
    }

    /// <summary>
    /// Get total count of active entities.
    /// </summary>
    [JSExport]
    public static int GetEntityCount()
    {
        return entities.Count(e => e.IsActive);
    }

    /// <summary>
    /// Get all active entity IDs as JSON array.
    /// </summary>
    [JSExport]
    public static string GetAllEntityIdsJSON()
    {
        var ids = entities.Where(e => e.IsActive).Select(e => e.Id).ToList();
        return JsonSerializer.Serialize(ids);
    }

    /// <summary>
    /// Clear all entities from the scene.
    /// </summary>
    [JSExport]
    public static void ClearScene()
    {
        int count = GetEntityCount();
        entities.Clear();
        nextId = 0;
        MemoryManager.Reset();
        Console.WriteLine($"[EntityManager] Cleared scene ({count} entities removed)");
    }
}
