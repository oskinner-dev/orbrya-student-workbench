/**
 * Three.js Renderer Bridge for Orbrya Student Workbench
 * Connects C# Entity System to Three.js visual rendering
 * Phase 1 MVP: Procedural trees, GPU instancing ready
 */

class ThreeJSRenderer {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.entities = new Map(); // entityId -> mesh
        this.assetCache = new Map(); // assetType -> geometry/material
        
        console.log('🎨 ThreeJSRenderer initialized');
        
        // Pre-create tree geometry for instancing
        this.initializeAssets();
    }
    
    /**
     * Initialize asset geometries and materials
     * Phase 1: Procedural trees
     * Phase 3: Load Kenney .glb models
     */
    initializeAssets() {
        // Create procedural tree geometry
        const treeGeometry = this.createTreeGeometry();
        const treeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2d5016,
            flatShading: true 
        });
        
        this.assetCache.set('tree_pine', { 
            geometry: treeGeometry, 
            material: treeMaterial,
            memoryCost: 12 // KB (matches C# MemoryManager)
        });
        
        console.log('✅ Asset cache initialized: tree_pine');
    }
    
    /**
     * Create procedural tree geometry (Phase 1 MVP)
     */
    createTreeGeometry() {
        const group = new THREE.Group();
        
        // Trunk - more detailed
        const trunkGeometry = new THREE.CylinderGeometry(0.15, 0.2, 1.5, 8);
        const trunkMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4a3728,
            flatShading: false // Smooth shading for better appearance
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 0.75;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        group.add(trunk);
        
        // Foliage layers (3 cones) - darker green, more natural
        const foliageMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2d5016,
            flatShading: false
        });
        
        const foliage1 = new THREE.Mesh(
            new THREE.ConeGeometry(0.8, 1.2, 8),
            foliageMaterial
        );
        foliage1.position.y = 1.8;
        foliage1.castShadow = true;
        foliage1.receiveShadow = true;
        group.add(foliage1);
        
        const foliage2 = new THREE.Mesh(
            new THREE.ConeGeometry(0.6, 1.0, 8),
            foliageMaterial
        );
        foliage2.position.y = 2.4;
        foliage2.castShadow = true;
        foliage2.receiveShadow = true;
        group.add(foliage2);
        
        const foliage3 = new THREE.Mesh(
            new THREE.ConeGeometry(0.4, 0.8, 8),
            foliageMaterial
        );
        foliage3.position.y = 2.9;
        foliage3.castShadow = true;
        foliage3.receiveShadow = true;
        group.add(foliage3);
        
        return group;
    }
    
    /**
     * Render a new entity in the scene
     * Called when C# SpawnEntity() succeeds
     */
    renderEntity(entityId, entityType, x, y, z) {
        if (this.entities.has(entityId)) {
            console.warn(`⚠️ Entity ${entityId} already rendered`);
            return false;
        }
        
        const asset = this.assetCache.get(entityType);
        if (!asset) {
            console.error(`❌ Unknown asset type: ${entityType}`);
            return false;
        }
        
        // Clone the geometry group
        const mesh = asset.geometry.clone();
        mesh.position.set(x, y, z);
        
        // Enable shadows for all children
        mesh.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        // Add random rotation for variety
        mesh.rotation.y = Math.random() * Math.PI * 2;
        
        // Random scale variation (0.8 - 1.2)
        const scale = 0.8 + Math.random() * 0.4;
        mesh.scale.set(scale, scale, scale);
        
        // Store entity metadata
        mesh.userData = {
            entityId: entityId,
            entityType: entityType
        };
        
        this.scene.add(mesh);
        this.entities.set(entityId, mesh);
        
        console.log(`✅ Rendered ${entityType} #${entityId} at (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`);
        return true;
    }
    
    /**
     * Update entity transform (Phase 2 - move/rotate/scale tools)
     */
    updateTransform(entityId, x, y, z, rx, ry, rz, sx, sy, sz) {
        const mesh = this.entities.get(entityId);
        if (!mesh) {
            console.warn(`⚠️ Cannot update transform: Entity ${entityId} not found`);
            return false;
        }
        
        mesh.position.set(x, y, z);
        mesh.rotation.set(rx, ry, rz);
        mesh.scale.set(sx, sy, sz);
        
        return true;
    }
    
    /**
     * Remove entity from scene
     * Called when C# DestroyEntity() is called
     */
    removeEntity(entityId) {
        const mesh = this.entities.get(entityId);
        if (!mesh) {
            console.warn(`⚠️ Cannot remove: Entity ${entityId} not found`);
            return false;
        }
        
        // Remove from scene
        this.scene.remove(mesh);
        
        // Dispose geometry and materials to free GPU memory
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(mat => mat.dispose());
            } else {
                mesh.material.dispose();
            }
        }
        
        this.entities.delete(entityId);
        console.log(`🗑️ Removed entity #${entityId}`);
        return true;
    }
    
    /**
     * Highlight entity (Phase 2 - selection system)
     */
    highlightEntity(entityId) {
        const mesh = this.entities.get(entityId);
        if (!mesh) return false;
        
        // Add highlight effect (Phase 2)
        mesh.userData.highlighted = true;
        return true;
    }
    
    /**
     * Remove highlight (Phase 2 - selection system)
     */
    unhighlightEntity(entityId) {
        const mesh = this.entities.get(entityId);
        if (!mesh) return false;
        
        mesh.userData.highlighted = false;
        return true;
    }
    
    /**
     * Set camera position (for demos/tutorials)
     */
    setCameraPosition(x, y, z) {
        this.camera.position.set(x, y, z);
    }
    
    /**
     * Set camera target (look at point)
     */
    setCameraTarget(x, y, z) {
        this.camera.lookAt(x, y, z);
    }
    
    /**
     * Get rendering statistics
     */
    getStats() {
        return {
            entityCount: this.entities.size,
            drawCalls: this.scene.children.length,
            triangles: this.calculateTriangleCount(),
            memoryMB: (this.entities.size * 12) / 1024 // Rough estimate
        };
    }
    
    /**
     * Calculate total triangle count (performance metric)
     */
    calculateTriangleCount() {
        let total = 0;
        this.entities.forEach(mesh => {
            if (mesh.geometry) {
                const positions = mesh.geometry.attributes.position;
                if (positions) {
                    total += positions.count / 3;
                }
            }
        });
        return Math.floor(total);
    }
    
    /**
     * Raycast for entity selection (Phase 2)
     */
    raycast(mouseX, mouseY) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(mouseX, mouseY);
        
        raycaster.setFromCamera(mouse, this.camera);
        
        const meshes = Array.from(this.entities.values());
        const intersects = raycaster.intersectObjects(meshes, true);
        
        if (intersects.length > 0) {
            const hitMesh = intersects[0].object;
            // Find root entity object
            let entity = hitMesh;
            while (entity.parent && !entity.userData.entityId) {
                entity = entity.parent;
            }
            return entity.userData.entityId || null;
        }
        
        return null;
    }
    
    /**
     * Clear all entities from scene
     */
    clearScene() {
        const entityIds = Array.from(this.entities.keys());
        entityIds.forEach(id => this.removeEntity(id));
        console.log('🧹 Scene cleared');
    }
}

// Export for use in index.html
window.ThreeJSRenderer = ThreeJSRenderer;
