import * as THREE from 'three';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';
import { RNG } from './rng';
import { blocks , resources } from './blocks';
import { ModelLoader } from './modelLoader';
import { modelName } from './modelName';
import { Animal } from './animal';
import { Player } from './player';


const geometry = new THREE.BoxGeometry();
const Sphere = new THREE.SphereGeometry();


export class WorldChunk extends THREE.Group {
    /**
     * @type {{
     *  id: number,
     * instanceId: number,
     * geo: constructer
     * }[][][]}
     */
    data = [];
    
    constructor(size, params, dataStore) {
        super();
        this.loaded = false;
        this.size = size;
        this.params = params;
        this.dataStore = dataStore;
        this.models = {};
    }

    loadModels(onModelsLoaded) {
        const modelLoader = new ModelLoader();
        modelLoader.loadModels((loadedModels) => {
            this.models = loadedModels;
            onModelsLoaded();
        });
    }

    /**
     * Generate the world data and meshes
     */
    generate() {
        const start = performance.now();

        const rng = new RNG(this.params.seed);
        const rng1 = new RNG(this.params.seed);
        this.initializeTerrain();
        // this.generateResource(rng);
        this.generateTerrain(rng);
        this.generateClounds(rng1);
        // this.addAnimalsToTundra(rng, 'Tundra',1 ,1 , 1);
        // this.addDragon(rng, 32, 15, 32);
        this.loadPlayerChanges();
        this.generateMeshes();

        this.loaded = true;

    }

    /**
     * Generate the world terrain data
     */
    initializeTerrain() {
        this.data = [];
        for (let x = 0; x < this.size.width; x++) {
            const slice = [];
            for (let y = 0; y < this.size.height; y++){
                const row = [];
                for (let z = 0; z < this.size.width; z++) {
                    row.push({
                        id: blocks.empty.id,
                        instanceId: null
                    }); 
                }
                slice.push(row);
            }
            this.data.push(slice);
        }
    }

    /**
     * Get the biom at the world coordinates (x,z)
     * @param {SimplexNoise} simplex
     * @param {number} x
     * @param {number} z
     */
    getBiome(simplex, x, z) {
        let noise = 0.5 * simplex.noise(
            (this.position.x + x) / this.params.biomes.scale, 
            (this.position.z + z) / this.params.biomes.scale
        ) + 0.5;

        noise += this.params.biomes.variation.amplitude * (simplex.noise(
            (this.position.x + x) / this.params.biomes.variation.scale, 
            (this.position.z + z) / this.params.biomes.variation.scale
        ));

        if (noise < this.params.biomes.tundraToTemperate) {
            return 'Tundra';
        } else if (noise < this.params.biomes.temperateToJungle) {
            return 'Temperate';
        } else if (noise < this.params.biomes.jungleToDesert) {
            return 'Jungle';
        } else {
            return 'Desert';
        }

        // if (temperature > 0.5) {
        //     if (humidity > 0.5) {
        //         return 'Jungle';
        //     } else {
        //         return 'Desert';
        //     }
        // } else {
        //     if (humidity > 0.5) {
        //         return 'Temperate';
        //     } else {
        //         return 'Tundra';
        //     }
        // }
    }

    
    /**
     * Generates the terrain data for the world 
     */
    generateTerrain(rng) {
        const simplex = new SimplexNoise(rng);
        
        for (let x = 0; x < this.size.width; x++) {
            for (let z = 0; z < this.size.width; z++) {
                const biome =this.getBiome(simplex, x, z);
                const value = simplex.noise(
                    (this.position.x + x) / this.params.terrain.scale, 
                    (this.position.z + z) / this.params.terrain.scale
                );

                // scale the noise based on the magnutude/offset
                const scaleNoise = this.params.terrain.offset + 
                    this.params.terrain.magnitude * value;
                
                // computing the height of the terrian at this x-z location
                let height = Math.floor(scaleNoise);

                // clamping the height between 0 and max height
                height = Math.max(0, Math.min(height, this.size.height - 1));

                // fill in all block at or below the terrain height
                for (let y = this.size.height; y >= 0; y--) {
                    if (y <= this.params.terrain.waterOffset && y === height) {
                        this.setBlockId(x, y, z, blocks.mud.id);
                        this.addAnimalsToTundra(rng, 'water',x ,this.params.terrain.waterOffset, z);
                    } else if (y === height) {
                        let grassBlockType;
                        if (biome === 'Desert') {
                            grassBlockType = blocks.sand.id;
                        } else if (biome === 'Temperate' || biome === 'Jungle') {
                            grassBlockType = blocks.grass.id;
                        } else if (biome === 'Tundra') {
                            grassBlockType = blocks.snow.id;
                        }
                        this.setBlockId(x, y, z, grassBlockType);
                        if (rng.random() < this.params.trees.frequency) {
                            this.generateTree(rng, biome, x, height , z);
                        }
                        this.addAnimalsToTundra(rng, biome,x ,height + 1, z);
                        // if (rng.random() < modelName.snow_goat.frequency) {
                        //     this.addAnimalsToTundra(rng, biome,x ,height + 1, z);
                        // };
                    } else if (y < height && this.getBlock(x, y, z).id === blocks.empty.id) {
                        this.generateResourceIfNeeded(simplex, x, y, z)
                    } //else if(y > height) {
                        // this.setBlockId(x, y, z, blocks.empty.id);
                    //}
                }    
                
            }
        }
    }

    /**
     * Determines if a resource block should be grnerated at (x, y, z)
     * @param {SimplexNoise} simplex
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    generateResourceIfNeeded(simplex, x, y, z) {
        this.setBlockId(x, y, z, blocks.dirt.id);
        resources.forEach(resources => {
            const value = simplex.noise3d(
                (this.position.x + x) / resources.scale.x, 
                (this.position.y + y) / resources.scale.y, 
                (this.position.z + z) / resources.scale.z);  
            if (value > resources.scarcity) {
                this.setBlockId(x, y, z, resources.id);
                return;
            }          
        });
    }

    /**
     * Popular the world with trees
     * @param {RNG} rng
     */
    generateTree(rng, biome, x, y, z) {
        const minH = this.params.trees.trunk.minHeight;
        const maxH = this.params.trees.trunk.maxHeight;
        const h = Math.round(minH + (maxH - minH) * rng.random());
        
        const useCylinder = rng.random() > 0.5;
        for (let treeY = y; treeY <= y + h; treeY++) {
            if (biome === 'Temperate' || biome === 'Tundra') {
                this.setBlockId(x, treeY, z, blocks.tree.id);
            } else if (biome === 'Jungle') {
                this.setBlockId(x, treeY, z, blocks.jungleTree.id)
            } else if (biome === 'Desert') {
                if (useCylinder) {
                    this.setBlockId(x, treeY, z, blocks.cactus.id)
                } else {
                    this.setBlockId(x, treeY, z, blocks.cactusG.id)
                }
            }
        }
        if (biome === 'Temperate' || biome === 'Jungle' || biome === 'Tundra') {
            this.generateTreeCanopy(biome, x, y + h, z, rng);         
        }
    }

    generateTreeCanopy(biome, centerX, centerY, centerZ, rng) {
        const minR = this.params.trees.canopy.minRadius;
        const maxR = this.params.trees.canopy.maxRadius;
        const r = Math.round(minR + (maxR - minR) * rng.random());
        const useCylinder = rng.random() > 0.5;
        
        for (let x = -r; x <= r; x++) {
            for (let y = -r; y <= r; y++) {
                for (let z = -r; z <= r; z++) {
                    const n = rng.random();
                    // Don't creates leaves outside the canopy radius
                    if (x * x + y * y + z * z > r * r) continue;
                    const block = this.getBlock(centerX + x, centerY + y, centerZ + z);
                    if (block && block.id !== blocks.empty.id) continue;
                    if (n < this.params.trees.canopy.density) {
                        if (biome ==='Temperate') {
                            this.setBlockId(centerX + x, centerY + y, centerZ + z, blocks.leaves.id);
                        } else if (biome ==='Jungle') {
                            if (useCylinder) {
                                this.setBlockId(centerX + x, centerY + y, centerZ + z, blocks.jungleLeavesB.id);
                            } else {
                                this.setBlockId(centerX + x, centerY + y, centerZ + z, blocks.jungleLeaves.id);
                            }
                        } else if (biome ==='Tundra') {
                            this.setBlockId(centerX + x, centerY + y, centerZ + z, blocks.snowT.id);
                        }
                    }
                }
            }
        }
    }

    /** 
     * Popular the world with trees
     * @param {RNG} rng
     */
    generateClounds(rng) {
        const simplex = new SimplexNoise(rng);
        for (let x = 0; x < this.size.width; x++) {
            for (let z = 0; z < this.size.width; z++) {
                const value = (simplex.noise(
                    (this.position.x + x) / this.params.clouds.scale,
                    (this.position.z + z) / this.params.clouds.scale
                ) + 1) * 0.5;

                if (value < this.params.clouds.density) {
                    this.setBlockId(x, this.size.height - 1, z, blocks.cloud.id);
                }
            }
        }
    }

    addAnimalsToTundra(rng, biome,  x, y, z, key = 0) {
        const animal = new Animal();
        // Sử dụng ModelLoader để tải mô hình dê
        const modelLoader = new ModelLoader();
        if (key) {
            switch (biome) {
                case 'dumbo':
                    modelLoader.loadModels(modelName.dumbo, (models) => {
                        animal.setMesh(models.dumbo.mesh, x, y, z, {
                            name: 'dumbo',
                            animations: models.dumbo.animations
                        });
                        animal.layers.set(2);
                        animal.traverse((child) => {
                            child.layers.set(2);
                        });
                        this.add(animal);                        
                    });                    
                    break;
                case 'kijiaden':
                    modelLoader.loadModels(modelName.kijiaden, (models) => {
                        animal.setMesh(models.kijiaden.mesh, x, y, z, {
                            name: 'kijiaden',
                            animations: models.kijiaden.animations
                        });
                        animal.layers.set(2);
                        animal.traverse((child) => {
                            child.layers.set(2);
                        });                      
                        this.add(animal);                        
                    });  
                    break;
                case 'tiger':
                    modelLoader.loadModels(modelName.tiger, (models) => {
                        animal.setMesh(models.tiger.mesh, x, y, z, {
                            name: 'tiger',
                            animations: models.tiger.animations
                        });
                        animal.layers.set(2);
                        animal.traverse((child) => {
                            child.layers.set(2);
                        });                      
                        this.add(animal);                        
                    });  
                    break;
                case 'sun':
                    const textureLoader = new THREE.TextureLoader();
                    const texture = textureLoader.load('public/textures/sun.jpeg');
                    const r = Math.random() * 3 + 1
                    const geometry = new THREE.SphereGeometry(r, 32, 32);
                    const material = new THREE.MeshStandardMaterial({ map: texture });

                    // Tạo khối cầu
                    const sphere = new THREE.Mesh(geometry, material);

                    // Đặt vị trí cho khối cầu
                    sphere.position.set(x, y+r, z);
                    sphere.layers.set(2);
                    // Thêm khối cầu vào scene
                    this.add(sphere);
                    break
                default:
                    break;
            }
        } else {

            if (biome === 'Desert'){
                if (rng.random() < modelName.dragon.frequency) {
                    modelLoader.loadModels(modelName.dragon, (models) => {
                        // Gán mô hình và hoạt ảnh cho animal
                        animal.setMesh(models.dragon.mesh, x, y + 25, z, {
                            name: 'dragon',
                            animations: models.dragon.animations
                        });
                        animal.layers.set(2);
                        animal.traverse((child) => {
                            child.layers.set(2);
                        });
                        this.add(animal);
                    });
                }
                            
            } else if (biome === 'Tundra') {
                if (rng.random() < modelName.snow_goat.frequency) {
                    modelLoader.loadModels(modelName.snow_goat, (models) => {
                        animal.setMesh(models.snow_goat.mesh, x, y, z, {
                            name: 'snow_goat',
                            animations: models.snow_goat.animations
                        });
                        animal.layers.set(2);
                        animal.traverse((child) => {
                            child.layers.set(2);
                        });
                        
                        
                        this.add(animal);
                        
                    }); 
                }
            } else if (biome === 'water'){
                if (rng.random() < modelName.fish.frequency) {
                    modelLoader.loadModels(modelName.fish, (models) => {
                        // Gán mô hình và hoạt ảnh cho animal
                        animal.setMesh(models.fish.mesh, x, y -  Math.round(Math.random() * 2), z, {
                            name: 'fish',
                            animations: models.fish.animations
                        });
                        animal.layers.set(2);
                        animal.traverse((child) => {
                            child.layers.set(2);
                        });
                        this.add(animal);
                    });
                }
                            
            } else if (biome === 'Jungle'){
                if (rng.random() < modelName.bee.frequency) {
                    modelLoader.loadModels(modelName.bee, (models) => {
                        // Gán mô hình và hoạt ảnh cho animal
                        animal.setMesh(models.bee.mesh, x, y -  Math.round(Math.random() * 3)+1, z, {
                            name: 'bee',
                            animations: models.bee.animations
                        });
                        animal.layers.set(2);
                        animal.traverse((child) => {
                            child.layers.set(2);
                        });
                        this.add(animal);
                    });
                }
                            
            }
        }
    }

    
    

    /**
     * Pulls any changes from the data store and applies them to the data model
     */
    loadPlayerChanges() {
        for (let x = 0; x < this.size.width; x++) {
        for (let y = 0; y < this.size.height; y++) {
            for (let z = 0; z < this.size.width; z++) {
            // Overwrite with value in data store if it exists
            if (this.dataStore.contains(this.position.x, this.position.z, x, y, z)) {
                const blockId = this.dataStore.get(this.position.x, this.position.z, x, y, z);
                this.setBlockId(x, y, z, blockId);
            }
            }
        }
        }
    }

    generateWater() {
        const material = new THREE.MeshLambertMaterial({
            color: 0x9090e0,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });

        const waterMesh = new THREE.Mesh(new THREE.PlaneGeometry(), material);
        waterMesh.rotateX(-Math.PI / 2.0);
        waterMesh.position.set(
            this.size.width / 2,
            this.params.terrain.waterOffset + 0.4,
            this.size.width / 2
        );

        waterMesh.scale.set(this.size.width, this.size.width, 1);
        waterMesh.layers.set(1);

        this.add(waterMesh);
    }

    /**
     * generate the 3d representation of the world from the world data
     */
    generateMeshes() {
        this.clear();
        this.generateWater();

        const  maxCount = this.size.width * this.size.width * this.size.height;

        //creating a lookup table where the key is the block id
        const meshes = {};

        Object.values(blocks)
            .filter(blockType => blockType.id !== blocks.empty.id)
            .forEach(blockType => {
                const mesh = new THREE.InstancedMesh(blockType.geo, blockType.material, maxCount);
                mesh.name = blockType.id;
                mesh.count = 0;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                meshes[blockType.id] = mesh;
            });


        const matrix = new THREE.Matrix4();
        for (let x = 0; x < this.size.width; x++) {
            for (let y = 0; y < this.size.height; y++){
                for (let z = 0; z < this.size.width; z++) {
                    const blockId = this.getBlock(x, y, z).id;

                    if (blockId === blocks.empty.id) continue;

                    const mesh = meshes[blockId];
                    const instanceId = mesh.count;

                    if (!this.isBlockObscured(x, y, z)) {
                        matrix.setPosition(x, y, z);
                        mesh.setMatrixAt(instanceId, matrix);
                        this.setBlockInstanceId(x, y, z, instanceId);
                        mesh.count++;
                    }
                }
            }
        }
        
        this.add(...Object.values(meshes));
    }
    /**
      * gets the block data at (x, y, z)
      * @param {number} x
      * @param {number} y
      * @param {number} z 
      * @return {{id: number, instanceId: number}}
      */
    getBlock(x, y, z) {
        if (this.inBounds(x, y, z)) {
            return this.data[x][y][z];
        } else {
            return null;
        }
    }

    /**
     * add the block at (x, y, z) pf type blockId
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} blockId
     */
    addBlock(x, y, z, blockId) {
        
        if (this.getBlock(x, y, z).id === blocks.empty.id) {
            // console.log(' ', x,' ',y,' ',z, ' ')
            this.setBlockId(x, y, z, blockId);
            this.addBlockInstance(x, y, z);
            this.dataStore.set(this.position.x, this.position.z, x, y, z, blockId);
        }
    }

    removeBlock(x, y, z) {
        const block = this.getBlock(x, y, z);

        if (block && block.id !== blocks.empty.id) {
            this.deleteBlockInstance(x, y, z);
            this.setBlockId(x, y, z, blocks.empty.id);
            this.dataStore.set(this.position.x, this.position.z, x, y, z, blocks.empty.id);

        }
    }

    /**
     * with the last instance decrementing the instance count.
     * @param {number} x
     * @param {number} y
     * @param {number} z 
     */
    deleteBlockInstance(x, y, z) {
        const block = this.getBlock(x, y, z);

        if (block.id === blocks.empty.id || block.instanceId === null) return;
        const mesh = this.children.find((instanceMesh) => instanceMesh.name === block.id);
        const instanceId = block.instanceId;

        const lastMatrix = new THREE.Matrix4();
        mesh.getMatrixAt(mesh.count - 1, lastMatrix);

        const v = new THREE.Vector3();
        v.applyMatrix4(lastMatrix);
        this.setBlockInstanceId(v.x, v.y, v.z, instanceId);

        mesh.setMatrixAt(instanceId, lastMatrix);

        mesh.count--;

        mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingSphere(); 

        this.setBlockInstanceId(x, y, z, undefined);
    }

    /**
      * Create a new instance for the block at x, y, z 
      * @param {number} x
      * @param {number} y
      * @param {number} z 
      */
    addBlockInstance(x, y, z) {
        const block = this.getBlock(x, y, z);
        // console.log(' ', x,' ',y,' ',z, ' ', block)
        if (block && block.id !== blocks.empty.id && !block.instanceId){
            const mesh = this.children.find((instanceMesh) => instanceMesh.name === block.id);
            const instanceId = mesh.count++;
            this.setBlockInstanceId(x, y, z, instanceId);
    
            const matrix = new THREE.Matrix4();
            matrix.setPosition(x, y, z);
            mesh.setMatrixAt(instanceId, matrix);
            mesh.instanceMatrix.needsUpdate = true;
            mesh.computeBoundingSphere();
        }

    }
    /**
      * Sets the block id for the block at (x, y, z)
      * @param {number} x
      * @param {number} y
      * @param {number} z 
      * @param {number} id      
      */
    setBlockId(x, y, z, id) {
        if (this.inBounds(x, y, z)) {
            this.data[x][y][z].id = id;
        }
    }
    /**
      * Sets the block instance id for the block at (x, y, z)
      * @param {number} x
      * @param {number} y
      * @param {number} z 
      * @param {number} instanceId     
      */
    setBlockInstanceId(x, y, z, instanceId,geo = geometry) {
        if (this.inBounds(x, y, z)) {
            this.data[x][y][z].instanceId = instanceId;
            this.data[x][y][z].geo = geo;
        }
    }
    /**
      * Checks if the (x, y, z) coordinates are withon bounds
      * @param {number} x
      * @param {number} y
      * @param {number} z 
      * @param {boolean} 
      */
    inBounds(x, y, z) {
        if (x >= 0 && x < this.size.width &&
            y >= 0 && y < this.size.height &&
            z >= 0 && z < this.size.width) {
                return true;
            } else {
                return false;
            }
    }

    isBlockObscured(x, y, z) {
        const up = this.getBlock(x, y + 1, z)?.id ?? blocks.empty.id;
        const down = this.getBlock(x, y - 1, z)?.id ?? blocks.empty.id;
        const left = this.getBlock(x + 1, y, z)?.id ?? blocks.empty.id;
        const right = this.getBlock(x - 1, y, z)?.id ?? blocks.empty.id;
        const forward = this.getBlock(x, y, z + 1)?.id ?? blocks.empty.id;
        const back = this.getBlock(x, y, z - 1)?.id ?? blocks.empty.id;

        // if any of the block's sides is exposed, it is not obscured
        if (up === blocks.empty.id ||
            down === blocks.empty.id ||
            left === blocks.empty.id ||
            right === blocks.empty.id ||
            forward === blocks.empty.id ||
            back === blocks.empty.id) {
           return false;
        } else {
            return true;
        }
    }

    disposeInstances() {
        this.traverse((obj) => {
            if (obj.dispose) obj.dispose();
        });
        this.clear();
    }

}

