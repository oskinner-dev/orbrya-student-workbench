using System;
using System.Runtime.InteropServices.JavaScript;

namespace OrbryaCubeDemo;

public partial class CubeController
{
    [JSImport("setRotationSpeed", "main.js")]
    internal static partial void SetRotationSpeed(double x, double y);
    
    [JSExport]
    public static void SetSpeed(double speedMultiplier)
    {
        double baseSpeed = 0.01;
        SetRotationSpeed(baseSpeed * speedMultiplier, baseSpeed * speedMultiplier);
        Console.WriteLine($"Speed set to: {speedMultiplier}x");
    }
    
    [JSExport]
    public static void IncreaseSpeed()
    {
        SetRotationSpeed(0.02, 0.02);
        Console.WriteLine("Speed increased to 2x");
    }
    
    [JSExport]
    public static void DecreaseSpeed()
    {
        SetRotationSpeed(0.005, 0.005);
        Console.WriteLine("Speed decreased to 0.5x");
    }
    
    [JSExport]
    public static void StopRotation()
    {
        SetRotationSpeed(0, 0);
        Console.WriteLine("Rotation stopped");
    }
    
    [JSExport]
    public static void SetCustomSpeed(double xSpeed, double ySpeed)
    {
        SetRotationSpeed(xSpeed, ySpeed);
        Console.WriteLine($"Custom speed set - X: {xSpeed}, Y: {ySpeed}");
    }
}

public partial class Program
{
    [JSExport]
    public static void Main()
    {
        Console.WriteLine("🎮 Orbrya Student Workbench - C# WASM Initialized!");
        Console.WriteLine("✅ Backend ready - Student Workbench UI active");
    }
}