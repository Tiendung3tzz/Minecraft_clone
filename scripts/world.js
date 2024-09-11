import * as THREE from 'three';
import { WorldChunk } from './worldChunk';
import { Player } from './player';
import { DataStore } from './dataStore';
import { Animal } from './animal';
import { ModelLoader } from './modelLoader';
import { RNG } from './rng';
import { modelName } from './modelName';

export class World extends THREE.Group {

    asyncLoading = true;

    drawDistance = 3;

    chunkSize = {
        width: 24, 
        height: 32
    };

    params = {
        seed: 0,
        terrain: {
            scale: 80,
            magnitude: 10,
            offset: 3,
            waterOffset: 3
        },
        biomes: {
            scale: 200,
            variation: {
                amplitude: 0.2,
                scale: 50
            },
            tundraToTemperate: 0.1,
            temperateToJungle: 0.5,
            jungleToDesert: 0.9,
        },
        trees: {
            trunk:{
                minHeight: 5,
                maxHeight: 7
            },
            canopy: {
                minRadius: 2,
                maxRadius: 3,
                density: 0.5
            },
            frequency: 0.005
        },
        clouds: {
            scale: 30,
            density: 0.3
        }
    };

    dataStore = new DataStore();

    constructor(seed = 0) {
        super();
        this.seed = seed;

        document.addEventListener('keydown', (ev) => {
            if (ev.code !== 'F12') {
                ev.preventDefault();
            }
            switch (ev.code) {
                case 'F1':
                    this.save();
                    break;
                case 'F2':
                    this.load();
                    break;
            }
        })
    }

    save() {
        localStorage.setItem('minecraft_params', JSON.stringify(this.params));
        localStorage.setItem('minecraft_data', JSON.stringify(this.dataStore.data));
        document.getElementById('status').innerHTML = 'Game Saved';
        setTimeout(() => document.getElementById('status').innerHTML = '', 3000)
    }

    load() {
        this.params = JSON.parse(localStorage.getItem('minecraft_params'));
        this.dataStore.data = JSON.parse(localStorage.getItem('minecraft_data'));
        document.getElementById('status').innerHTML = 'Game Loader';
        setTimeout(() => document.getElementById('status').innerHTML = '', 3000)
        this.generate();
    }

    /**
     *  Regenerate the world data model annd the meshes
     */
    generate(clearCache = false) {
        if (clearCache) {
            this.dataStore.clear();
        }
        this.disposeChunks();

        for (let x = -this.drawDistance; x <= this.drawDistance; x++) {
            for (let z = -this.drawDistance; z <= this.drawDistance; z++) {
                const chunk = new WorldChunk(this.chunkSize, this.params, this.dataStore);
                chunk.position.set(
                    x * this.chunkSize.width, 
                    0, 
                    z * this.chunkSize.width);
                chunk.userData = { x, z };
                chunk.generate();
                this.add(chunk);
            }
        }
    }

    /**
     * Update  the visible portions of the world based on the 
     * current player possition
     * @param {Player} player
     */
    update(player) {
        const visibleChunks = this.getVisibleChunks(player);
        const ChunksToAdd = this.getChunksToAdd(visibleChunks);
        this.removeUnusedChunks(visibleChunks);
        
        for (const chunk of ChunksToAdd) {
            this.generateChunk(chunk.x, chunk.z);
        }

    }

        /**
     * Return an array containing the coordinates of the chunks that
     * are currently visible to the player
     * @param {Player} player
     * @returns {{ x: number, z:number}[]} 
     */
    getVisibleChunks(player) {
        const visibleChunks = [];

        const coords = this.worldToChunkCoords(
            player.position.x, 
            0,
            player.position.z
        );

        const chunkX = coords.chunk.x;
        const chunkZ = coords.chunk.z;

        for (let x = chunkX - this.drawDistance; x <= chunkX + this.drawDistance; x++) {
            for (let z = chunkZ - this.drawDistance; z <= chunkZ + this.drawDistance; z++) {
                visibleChunks.push({ x, z });
            }
        }
        
        return visibleChunks;
    }

    /**
     * Return an array containing corrdinates of the chunk
     * are not yet loaded and need to be added to the scene
     * @param {{ x: number, z: number}[]}
     * @return {{ x: number, z: number}[]}
     */
    getChunksToAdd(visibleChunks) {
        return visibleChunks.filter((chunk) => {
            const chunkExists = this.children
                .map((obj) => obj.userData)
                .find(({ x, z }) => (
                    chunk.x === x && chunk.z === z
                ));
            return !chunkExists;
        })
    }

    /**
     * Remove current loaded chunks that are no longer visible to the player
     * @param {{ x: number, z: number}[]} visibleChunks
     */
    removeUnusedChunks(visibleChunks) {
        const ChunksToRemove = this.children.filter((chunk) => {
            const { x, z } = chunk.userData;
            const chunkExists = visibleChunks
                .find((visibleChunk) => (
                    visibleChunk.x === x && visibleChunk.z === z
                ));
                
            return !chunkExists;
        });

        for (const chunk of ChunksToRemove) {
            console.log('11',chunk)
            chunk.disposeInstances();
            this.remove(chunk);
        }
    }

    /**
     * Generates the chunk at the (x,z) coordinates
     * @param {number} x
     * @param {number} z
     */
    generateChunk(x, z) {
        const chunk = new WorldChunk(this.chunkSize, this.params, this.dataStore);
        chunk.position.set(
            x * this.chunkSize.width, 
            0, 
            z * this.chunkSize.width );
        chunk.userData = { x, z };

        if (this.asyncLoading) {
            requestIdleCallback(chunk.generate.bind(chunk), {timeout: 1000 });
        } else {
            chunk.generate();
        }
        this.add(chunk);
    }
    
    /**
     *  Gets the bloch data at (x, y , z)
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {{id: number, instanceId: number} | null}
     */
    getBlock(x, y, z) {
        
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);
        
        if (chunk && chunk.loaded) {
            return chunk.getBlock(
                coords.block.x,
                coords.block.y,
                coords.block.z
            )
        } else {
            return null;
        }
    }

    /**
     * Returns the chunk and world coordinates of the block at (x,y,z)\
     *  - `chunk` is the coordinates of the chunk containing the block
     *  - `block` is the world coordinates of the block
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @param {number} id
     * @returns {{
     *  chunk: { x: number, z: number},
     *  block: { x: number, y: number, z: number}
     * }}
     */
    worldToChunkCoords(x, y, z) {
        const chunkCoords = {
            x: Math.floor(x / this.chunkSize.width),
            z: Math.floor(z / this.chunkSize.width),
        };

        const blockCoords = {
            x: x - this.chunkSize.width * chunkCoords.x,
            y,
            z: z - this.chunkSize.width * chunkCoords.z
        }

        return {
            chunk: chunkCoords,
            block: blockCoords
        };
    }

    /**
     * Returns the WorldChunk object the contains the specified coordinates
     * @param {number} chunkX
     * @param {number} chunkZ
     * @returns {WorldChunk | null}
     */
    getChunk(chunkX, chunkZ) {
        return this.children.find((chunk) => {
            return chunk.userData.x === chunkX && 
                   chunk.userData.z === chunkZ;
        });
    }

    disposeChunks() {
        this.traverse((chunk) => {
           if (chunk.disposeInstances) {
                chunk.disposeInstances();
           } 
        });
        this.clear();
    }

    /**
     * Remove the block at (x, y, z) and sets it to empty
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {String} blockId
     */
    addBlock(x, y, z, blockId) {
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

        const animal = new Animal();
        // Sử dụng ModelLoader để tải mô hình dê
        const modelLoader = new ModelLoader();
        const rng = new RNG(this.params.seed);
        switch (blockId) {
            case 'm':
                chunk.addAnimalsToTundra(rng, 'dumbo' ,coords.block.x, coords.block.y, coords.block.z, 1)
                break;
            case 'n':
                chunk.addAnimalsToTundra(rng, 'kijiaden' ,coords.block.x, coords.block.y, coords.block.z, 1)
                break;
            case 'b':
                chunk.addAnimalsToTundra(rng, 'tiger' ,coords.block.x, coords.block.y, coords.block.z, 1)
                break;
            case 'v':
                chunk.addAnimalsToTundra(rng, 'sun' ,coords.block.x, coords.block.y, coords.block.z, 1)
                break;
        
            default:
                if (chunk) {
                    chunk.addBlock(
                        coords.block.x,
                        coords.block.y,
                        coords.block.z,
                        Number(blockId)
                    );
                    this.hideBlock(x - 1, y, z);
                    this.hideBlock(x + 1, y, z);
                    this.hideBlock(x, y - 1, z);
                    this.hideBlock(x, y + 1, z);
                    this.hideBlock(x, y, z - 1);
                    this.hideBlock(x, y, z + 1);
                }
                break;
        }
    }

    /**
     * Remove the block at (x, y, z) and sets it to empty
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    removeBlock(x, y, z) {
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

        if (chunk) {
            chunk.removeBlock(
                coords.block.x,
                coords.block.y,
                coords.block.z
            );
            this.revealBlock(x - 1, y, z);
            this.revealBlock(x + 1, y, z);
            this.revealBlock(x, y - 1, z);
            this.revealBlock(x, y + 1, z);
            this.revealBlock(x, y, z - 1);
            this.revealBlock(x, y, z + 1);
        }
    }

    revealBlock(x, y, z) {
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

        if (chunk) {
            chunk.addBlockInstance(
                coords.block.x,
                coords.block.y,
                coords.block.z
            )
                     
        }
    }

    hideBlock(x, y, z) {
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

        if (chunk && chunk.isBlockObscured(coords.block.x, coords.block.y, coords.block.z)) {
            chunk.deleteBlockInstance(
                coords.block.x,
                coords.block.y,
                coords.block.z
            )
                     
        }
    }
}