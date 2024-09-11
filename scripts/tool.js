import * as THREE from 'three';

export class Tool extends THREE.Group{
    animate = false;
    //Amptitude of the tool animation
    animationAmplitude = 0.5;
    //duration of the animation
    animationDuration = 500;
    //start time for the animation
    animationStart = 0;
    // Speed of the tool animation in rad/s
    animationSpeed = 0.025;
    //currently active animation
    animation = undefined;
    //the 3D mesh of the actual tool
    toolMesh = undefined;

    get animationTime() {
        return performance.now() - this.animationStart;
    }

    startAnimation() {
        if (this.animate) return;
        this.animate = true;
        this.animationStart = performance.now();

        //stop existing animate
        clearTimeout(this.animate);

        this.animation = setTimeout(() => {
            this.animate = false;
            this.toolMesh.rotation.y
        }, this.animationDuration);
    }

    update() {
        if (this.animate && this.toolMesh) {
            this.toolMesh.rotation.y = this.animationAmplitude * Math.sin(this.animationTime * this.animationSpeed);
        }
    }

    setMesh(mesh, x = 0.6, y = -0.3, z = -0.5, scl = 0.5,key = 0) {
        this.clear();

        this.toolMesh = mesh;
        this.add(this.toolMesh);
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        this.position.set(x, y, z);
        this.scale.set(scl, scl, scl);
        if (key===0) {
            this.rotation.z = Math.PI / 2;
            this.rotation.y = Math.PI + 0.2;
        }
    }
}