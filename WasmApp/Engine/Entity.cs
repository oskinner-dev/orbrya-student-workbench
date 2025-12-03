using System;

namespace Orbrya.Engine;

/// <summary>
/// Core entity data structure. Uses struct (value type) for zero-allocation performance.
/// Each entity represents a game object in the scene.
/// </summary>
public struct Entity
{
    public int Id;
    public string Type;           // "tree_pine", "building_house", etc.
    public Vector3 Position;
    public Vector3 Rotation;      // Euler angles in degrees
    public Vector3 Scale;
    public int MemoryCostKB;      // Memory cost in kilobytes
    public bool IsActive;
    
    public Entity(int id, string type, Vector3 position)
    {
        Id = id;
        Type = type;
        Position = position;
        Rotation = new Vector3(0, 0, 0);
        Scale = new Vector3(1, 1, 1);
        MemoryCostKB = 0;
        IsActive = true;
    }
}

/// <summary>
/// Simple 3D vector structure. Using struct for performance.
/// </summary>
public struct Vector3
{
    public float X;
    public float Y;
    public float Z;

    public Vector3(float x, float y, float z)
    {
        X = x;
        Y = y;
        Z = z;
    }

    public override string ToString()
    {
        return $"({X:F2}, {Y:F2}, {Z:F2})";
    }
}
