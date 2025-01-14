import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { resources } from './blocks';
import { Physics } from './physics';

/**
 * 
 * @param {WorldChunk} world 
 */
export function setupUI(world, player, physics, scene) {
    const gui = new GUI();

    const playerFolder = gui.addFolder('Player');
    playerFolder.add(player, 'maxSpeed', 1, 20, 0.1).name('Max Speed');
    playerFolder.add(player, 'jumpSpeed', 1, 10, 0.1).name('Jump Speed');
    playerFolder.add(player.boundsHelper, 'visible').name('Show Player Bounds');
    playerFolder.add(player.cameraHelper, 'visible').name('Show Camera Helper');
    
    
    const worldFolder = gui.addFolder('World');
    worldFolder.add(world, 'drawDistance', 0, 5, 1).name('Draw Distance');
    worldFolder.add(world, 'asyncLoading').name('Async Chunk Loading');
    worldFolder.add(scene.fog, 'near', 1, 200, 1).name('Fog Near');
    worldFolder.add(scene.fog, 'far', 1, 200, 1).name('Fog Far')
    
    const physicsFolder = worldFolder.addFolder('Physics');
    physicsFolder.add(physics.helpers, 'visible').name('Visualize Collisions');
    physicsFolder.add(physics, 'simulationRate', 10, 1000).name('Sim Rate');
    
    // const worldFolder = gui.addFolder('World');
    const terrainFolder = gui.addFolder('Terrain').close();    
    terrainFolder.add(world.params, 'seed', 0, 10000, 1).name('Seed');
    terrainFolder.add(world.params.terrain, 'scale', 10, 100).name('Scale');
    terrainFolder.add(world.params.terrain, 'magnitude', 0, 32, 1).name('Magnitude');
    terrainFolder.add(world.params.terrain, 'offset', 0, 32, 1).name('Offset');
    terrainFolder.add(world.params.terrain, 'waterOffset', 0, 32, 1).name('Water Offset');
    
    const biomesFolder = gui.addFolder('Biomes');
    biomesFolder.add(world.params.biomes, 'scale', 10, 500).name('Biome Scale');
    biomesFolder.add(world.params.biomes.variation, 'amplitude', 0, 1).name('Variation Amplitude');
    biomesFolder.add(world.params.biomes.variation, 'scale', 10, 500).name('Variation Scale');
    biomesFolder.add(world.params.biomes, 'tundraToTemperate', 0, 1).name('Tundra -> Temperate');
    biomesFolder.add(world.params.biomes, 'temperateToJungle', 0, 1).name('Temperate -> Jungle');
    biomesFolder.add(world.params.biomes, 'jungleToDesert', 0, 1).name('Jungle -> Desert');

    const resourcesFolder = worldFolder.addFolder('Resources').close();
    for (const resource of resources) {
        const resourceFolder = resourcesFolder.addFolder(resource.name);
        resourceFolder.add(resource, 'scarcity', 0, 1).name('Scarcity');
        const scaleFolder = resourceFolder.addFolder('Scale').close();
        scaleFolder.add(resource.scale, 'x', 10, 100).name('X Scale');
        scaleFolder.add(resource.scale, 'y', 10, 100).name('Y Scale');
        scaleFolder.add(resource.scale, 'z', 10, 100).name('Z Scale');
    }



    
    
    const treesFolder = terrainFolder.addFolder('Trees').close();
    treesFolder.add(world.params.trees, 'frequency', 0, 0.1).name('Frequency');
    treesFolder.add(world.params.trees.trunk, 'minHeight', 0, 10, 1).name('Min Trunk Height');
    treesFolder.add(world.params.trees.trunk, 'maxHeight', 0, 10, 1).name('Max Trunk Height');
    treesFolder.add(world.params.trees.canopy, 'minRadius', 0, 10, 1).name('Min Canopy Size');
    treesFolder.add(world.params.trees.canopy, 'maxRadius', 0, 10, 1).name('Max Canopy Size');
    treesFolder.add(world.params.trees.canopy, 'density', 0, 1).name('Canopy Density');
    
    
    const cloudsFolder = terrainFolder.addFolder('Clouds').close();
    cloudsFolder.add(world.params.clouds, 'scale', 0, 100).name('Cloud Size');
    cloudsFolder.add(world.params.clouds, 'density', 0, 1).name('Cloud Cover');
    
    gui.onFinishChange((event) => {
        world.generate(true);
    });
}