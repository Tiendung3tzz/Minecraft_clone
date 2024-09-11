import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { World } from './world';
import { blocks } from './blocks';
import { Tool } from './tool';
import { ModelLoader } from './modelLoader';
import { modelName } from './modelName';

const CENTER_SCREEN = new THREE.Vector2();

export class Player {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    cameraHelper = new THREE.CameraHelper(this.camera);
    controls = new PointerLockControls(this.camera, document.body);

    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(), 0, 3);
    selectedCoords = null;
    activeBlockId = String(blocks.empty.id);
    Mkey = '';


    height = 1.75;
    radius = 0.5;
    maxSpeed = 5;
    jumpSpeed = 10;
    onGround = false;
    velocity = new THREE.Vector3();
    #worldVelocity = new THREE.Vector3();
    input = new THREE.Vector3();

    tool = new Tool();

    constructor(scene) {
        this.position.set(16, 16, 16);
        this.camera.layers.enable(1);
        this.camera.layers.enable(2);
        scene.add(this.camera);
        // scene.add(this.cameraHelper);

        this.camera.add(this.tool);


        this.cameraHelper.visible = false;

        // Wireframe mesh visualizing the player's bounding cylinder
        this.boundsHelper = new THREE.Mesh(
            new THREE.CylinderGeometry(this.radius, this.radius, this.height, 16),
            new THREE.MeshBasicMaterial({ wireframe: true })
            );
        this.boundsHelper.visible = false;
        scene.add(this.boundsHelper);

        const selectionMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.3,
            color: 0xffffaa
        });
        const selectionGeometry = new THREE.BoxGeometry(1.01, 1.01, 1.01);
        this.selectionHelper = new THREE.Mesh(selectionGeometry, selectionMaterial);
        scene.add(this.selectionHelper);

        this.raycaster.layers.set(0);
        this.loadWardenModel(scene);
        // Add event listeners for keyboard/mouse events
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        
    }

    loadWardenModel(scene) {
        const modelLoader = new ModelLoader();
        modelLoader.loadModels(modelName.penguin_ballon, (models) => {
            this.penguin_ballon = models.penguin_ballon.mesh;

            // Đặt warden vào vị trí của player
            this.penguin_ballon.position.set(this.position.x,this.position.y - 1 ,this.position.z);
            this.penguin_ballon.scale.set(2, 2, 2);
            // Thêm warden vào player để nó di chuyển cùng player
            scene.add(this.penguin_ballon);
            this.penguin_ballon.layers.set(3)
            this.penguin_ballon.traverse((child) => {
                child.layers.set(3);
            });
            console.log(this.penguin_ballon)
        });
    }

    /**
     * Updates the player state
     * @param {World} world 
     */
    update(world) {
        this.updateBoundsHelper();
        this.updateRaycaster(world);
        this.tool.update();
        if (this.penguin_ballon) {
            // Di chuyển warden tới vị trí của player
            this.penguin_ballon.position.set(this.position.x,this.position.y - 1,this.position.z - 1.25);
        }
    }

    /**
    * Updates the state of the player based on the current user inputs
    * @param {Number} dt 
    */
    applyInputs(dt) {
        if (this.controls.isLocked === true) {
            this.velocity.x = this.input.x;
            this.velocity.z = this.input.z;
            this.controls.moveRight(this.velocity.x * dt);
            this.controls.moveForward(this.velocity.z * dt);
            this.position.y += this.velocity.y * dt;
        }

        document.getElementById('info-player-position').innerHTML = this.toString();
    }

    /**
     * Updates the position of the player's bounding cylinder helper
     */
    updateBoundsHelper() {
        this.boundsHelper.position.copy(this.camera.position);
        this.boundsHelper.position.y -= this.height / 2;
    }

    /**
     * Returns the current world position of the player
     * @returns {THREE.Vector3}
     */
    get position() {
        return this.camera.position;
    }

    /**
     * Returns the velocity of the player in world coordinates
     * @returns {THREE.Vector3}
     */
    get worldVelocity() {
        this.#worldVelocity.copy(this.velocity);
        this.#worldVelocity.applyEuler(new THREE.Euler(0, this.camera.rotation.y, 0));
        return this.#worldVelocity;
    }

    /**
     * Update the raycaster use for picking blocks
     * @param {World} world 
     */
    updateRaycaster(world) {
        this.raycaster.setFromCamera(CENTER_SCREEN, this.camera);
        const intersections = this.raycaster.intersectObject(world, true);

        if (intersections.length > 0) {
            const intersection = intersections[0];

            const chunk = intersection.object.parent;

            const blockMatrick = new THREE.Matrix4();
            intersection.object.getMatrixAt(intersection.instanceId, blockMatrick);
            
            this.selectedCoords = chunk.position.clone()
            this.selectedCoords.applyMatrix4(blockMatrick);
            
            if (this.activeBlockId !== String(blocks.empty.id)) {
                this.selectedCoords.add(intersection.normal);
            }
            this.selectionHelper.position.copy(this.selectedCoords);
            this.selectionHelper.visible = true;
        } else {
            this.selectedCoords = null;
            this.selectionHelper.visible = false;
        }
    }

    /**
     * Applies a change in velocity 'dv' that is specified in the world frame
     * @param {THREE.Vector3} dv 
     */
    applyWorldDeltaVelocity(dv) {
        dv.applyEuler(new THREE.Euler(0, -this.camera.rotation.y, 0));
        this.velocity.add(dv);
    }

    /**
     * Event handler for 'keyup' event
     * @param {KeyboardEvent} event 
     */
    onKeyUp(event) {
        switch (event.code) {
            case 'Escape':
                if (event.repeat) break;
                if (this.controls.isLocked) {
                console.log('unlocking controls');
                this.controls.unlock();
                } else {
                console.log('locking controls');
                this.controls.lock();
                }
                break;
            case 'KeyW':
                this.input.z = 0;
                break;
            case 'KeyA':
                this.input.x = 0;
                break;
            case 'KeyS':
                this.input.z = 0;
                break;
            case 'KeyD':
                this.input.x = 0;
                break;
        }
    }

    /**
     * Event handler for 'keyup' event
     * @param {KeyboardEvent} event 
     */
    onKeyDown(event) {
        switch (event.code) {
            case 'Digit0':
            case 'Digit1':
            case 'Digit2':
            case 'Digit3':
            case 'Digit4':
            case 'Digit5':
            case 'Digit6':
            case 'Digit7':
            case 'Digit8':
            case 'Digit9':
            case 'KeyM':
            case 'KeyN':
            case 'KeyB':
            case 'KeyV':
                document.getElementById(`toolbar-${this.activeBlockId}`).classList.remove('selected');
                this.activeBlockId = String(event.key);
                document.getElementById(`toolbar-${this.activeBlockId}`).classList.add('selected');
                console.log(event.key)
                this.tool.visible = (this.activeBlockId === '0');
                
            //   this.activeBlockId = Number(event.key);
            //   console.log(`activeBlockId = ${event.key}`)
              break;
            case 'KeyW':
                this.input.z = this.maxSpeed;
                break;
            case 'KeyA':
                this.input.x = -this.maxSpeed;
                break;
            case 'KeyS':
                this.input.z = -this.maxSpeed;
                break;
            case 'KeyD':
                this.input.x = this.maxSpeed;
                break;
            case 'KeyR':
                if (this.repeat) break;
                this.position.set(32, 10, 32);
                this.velocity.set(0, 0, 0);
                break;
            case 'Space':
                if (this.onGround) {
                this.velocity.y += this.jumpSpeed;
                }
                break;
        }
    }
    /**
     * Returns player position in a readable string form
     * @returns {string}
     */
    toString() {
        let str = '';
        str += `X: ${this.position.x.toFixed(3)} `;
        str += `Y: ${this.position.y.toFixed(3)} `;
        str += `Z: ${this.position.z.toFixed(3)}`;
        return str;
    }
}