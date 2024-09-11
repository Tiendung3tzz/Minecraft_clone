import { color } from "three/examples/jsm/nodes/Nodes.js";
import * as THREE from 'three';

const texttureLoader = new THREE.TextureLoader();

function loadTexture(path) {
    const texture = texttureLoader.load(path);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    return texture;
}

const textures = {
    cactusSide: loadTexture('textures/cactus_side.png'),
    cactusTop: loadTexture('textures/cactus_top.png'),
    dirt: loadTexture('textures/dirt.png'),
    grass: loadTexture('textures/grass.png'),
    grassSide: loadTexture('textures/grass_side.png'),
    stone: loadTexture('textures/stone.png'),
    coalOre: loadTexture('textures/coal_ore.png'),
    ironOre: loadTexture('textures/iron_ore.png'),
    jungleTreeSide: loadTexture('textures/jungle_tree_side.png'),
    jungleTreeTop: loadTexture('textures/jungle_tree_top.png'),
    jungleLeaves: loadTexture('textures/jungle_leaves.png'),
    leaves: loadTexture('textures/leaves.png'),
    treeSide: loadTexture('textures/tree_side.png'),
    treeTop: loadTexture('textures/tree_top.png'),
    sand: loadTexture('textures/sand.png'),
    snow: loadTexture('textures/snow.png'),
    snowSide: loadTexture('textures/snow_side.png'),
    mud: loadTexture('textures/mud.png'),
}

export const blocks = {
    empty: {
        id: 0,
        name: 'empty'
    },
    grass: {
        id: 1,
        geo: new THREE.BoxGeometry(),
        name: 'grass',
        color: 0x559020,
        material: [
            new THREE.MeshLambertMaterial({ map: textures.grassSide }), // right
            new THREE.MeshLambertMaterial({ map: textures.grassSide }), // left
            new THREE.MeshLambertMaterial({ map: textures.grass }), // top
            new THREE.MeshLambertMaterial({ map: textures.dirt }), // bottom
            new THREE.MeshLambertMaterial({ map: textures.grassSide }), // front
            new THREE.MeshLambertMaterial({ map: textures.grassSide })  // back
          ]
    },
    dirt: {
        id: 2,
        geo: new THREE.BoxGeometry(),
        name: 'dirt',
        material: new THREE.MeshLambertMaterial({ map: textures.dirt })
    },
    stone: {
        id: 3,
        geo: new THREE.BoxGeometry(),
        name: 'stone',
        scale: {x: 30, y: 30, z: 30 },
        scarcity: 0.8,
        material: new THREE.MeshLambertMaterial({ map: textures.stone })

    },
    coalOre: {
        id: 4,
        geo: new THREE.BoxGeometry(),
        name: 'coalOre',
        scale: {x: 20, y: 20, z: 20 },
        scarcity: 0.8,
        material: new THREE.MeshLambertMaterial({ map: textures.coalOre })

    },
    ironOre: {
        id: 5,
        geo: new THREE.BoxGeometry(),
        name: 'ironOre',
        scale: {x: 60, y: 60, z: 60 },
        scarcity: 0.9,
        material: new THREE.MeshLambertMaterial({ map: textures.ironOre })

    },
    tree: {
        id: 6,
        geo: new THREE.BoxGeometry(),
        name: 'tree',
        visible: true,
        material: [
          new THREE.MeshLambertMaterial({ map: textures.treeSide }), // right
          new THREE.MeshLambertMaterial({ map: textures.treeSide }), // left
          new THREE.MeshLambertMaterial({ map: textures.treeTop }), // top
          new THREE.MeshLambertMaterial({ map: textures.treeTop }), // bottom
          new THREE.MeshLambertMaterial({ map: textures.treeSide }), // front
          new THREE.MeshLambertMaterial({ map: textures.treeSide })  // back
        ]
      },
      leaves: {
        id: 7,
        geo: new THREE.TetrahedronGeometry(),
        name: 'leaves',
        visible: true,
        material: new THREE.MeshLambertMaterial({ map: textures.leaves })
      },
      snowC: {
        id: 8,
        geo: new THREE.ConeGeometry(),
        name: 'snowC',
        visible: true,
        material: new THREE.MeshLambertMaterial({ map: textures.snowSide })
      },
      cactus: {
        id: 9,
        geo: new THREE.CylinderGeometry(),
        name: 'cactus',
        material: [
          new THREE.MeshLambertMaterial({ map: textures.cactusSide }), // side
          new THREE.MeshLambertMaterial({ map: textures.cactusTop }),  // top
          new THREE.MeshLambertMaterial({ map: textures.cactusTop })
        ]
      },
      snow: {
        id: 10,
        geo: new THREE.BoxGeometry(),
        name: 'snow',
        material: [
          new THREE.MeshLambertMaterial({ map: textures.snowSide }), // right
          new THREE.MeshLambertMaterial({ map: textures.snowSide }), // left
          new THREE.MeshLambertMaterial({ map: textures.snow }), // top
          new THREE.MeshLambertMaterial({ map: textures.dirt }), // bottom
          new THREE.MeshLambertMaterial({ map: textures.snowSide }), // front
          new THREE.MeshLambertMaterial({ map: textures.snowSide })  // back
        ]
      },
      jungleTree: {
        id: 11,
        geo: new THREE.BoxGeometry(),
        name: 'jungleTree',
        material: [
          new THREE.MeshLambertMaterial({ map: textures.jungleTreeSide }), // right
          new THREE.MeshLambertMaterial({ map: textures.jungleTreeSide }), // left
          new THREE.MeshLambertMaterial({ map: textures.jungleTreeTop }),  // top
          new THREE.MeshLambertMaterial({ map: textures.jungleTreeTop }),  // bottom
          new THREE.MeshLambertMaterial({ map: textures.jungleTreeSide }), // front
          new THREE.MeshLambertMaterial({ map: textures.jungleTreeSide })  // back
        ]
      },
      jungleLeaves: {
        id: 12,
        geo: new THREE.SphereGeometry(),
        name: 'jungleLeaves',
        material: new THREE.MeshLambertMaterial({ map: textures.jungleLeaves })
      },
      cloud: {
        id: 13,
        geo: new THREE.BoxGeometry(),
        name: 'cloud',
        visible: true,
        material: new THREE.MeshBasicMaterial({ color: 0xf0f0f0 })
      },
      jungleGrass: {
        id: 14,
        geo: new THREE.BoxGeometry(),
        name: 'jungleGrass',
        material: [
          new THREE.MeshLambertMaterial({ color: 0x80c080, map: textures.grassSide }), // right
          new THREE.MeshLambertMaterial({ color: 0x80c080, map: textures.grassSide }), // left
          new THREE.MeshLambertMaterial({ color: 0x80c080, map: textures.grass }), // top
          new THREE.MeshLambertMaterial({ color: 0x80c080, map: textures.dirt }), // bottom
          new THREE.MeshLambertMaterial({ color: 0x80c080, map: textures.grassSide }), // front
          new THREE.MeshLambertMaterial({ color: 0x80c080, map: textures.grassSide })  // back
        ]
      },
      mud: {
        id: 15,
        geo: new THREE.BoxGeometry(),
        name: 'mud',
        visible: true,
        material: new THREE.MeshLambertMaterial({ map: textures.mud })
      },
      cactusG: {
        id: 16,
        geo: new THREE.BoxGeometry(),
        name: 'cactusG',
        material: [
          new THREE.MeshLambertMaterial({ map: textures.cactusSide }), // right
          new THREE.MeshLambertMaterial({ map: textures.cactusSide }), // left
          new THREE.MeshLambertMaterial({ map: textures.cactusTop }),  // top
          new THREE.MeshLambertMaterial({ map: textures.cactusTop }),  // bottom
          new THREE.MeshLambertMaterial({ map: textures.cactusSide }), // front
          new THREE.MeshLambertMaterial({ map: textures.cactusSide })  // back
        ]
      },
      jungleLeavesB: {
        id: 17,
        geo: new THREE.BoxGeometry(),
        name: 'jungleLeavesB',
        material: new THREE.MeshLambertMaterial({ map: textures.jungleLeaves })
      },
      sand: {
        id: 18,
        geo: new THREE.BoxGeometry(),
        name: 'sand',
        visible: true,
        material: new THREE.MeshLambertMaterial({ map: textures.sand })
      },
      snowT: {
        id: 19,
        geo: new THREE.TetrahedronGeometry(),
        name: 'snowT',
        visible: true,
        material: new THREE.MeshLambertMaterial({ map: textures.snow })
      },
      

}

export const resources = [
    blocks.stone,
    blocks.coalOre,
    blocks.ironOre
]

