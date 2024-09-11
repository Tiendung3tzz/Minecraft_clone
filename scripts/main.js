import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Player } from './player';
import { Physics } from './physics';
import { setupUI } from './ui';
import { World } from './world';
import { blocks } from './blocks';
import { ModelLoader } from './modelLoader';
import { modelName } from './modelName';
// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x80a0e0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap
document.body.appendChild(renderer.domElement);

//camera setup
const orbitCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
orbitCamera.position.set(-20, 20, -20);
orbitCamera.layers.enable(1);
orbitCamera.layers.enable(2);
orbitCamera.layers.enable(3);


const controls = new OrbitControls(orbitCamera, renderer.domElement);
controls.target.set(16, 16, 16);
controls.update();

//scene setup
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x80a0e0, 50, 100);
const world = new World();
world.generate();
scene.add(world);


const player = new Player(scene);
const physics = new Physics(scene);

const modelLoader = new ModelLoader();
modelLoader.loadModels(modelName.pickaxe, (models) => {
    player.tool.setMesh(models.pickaxe.mesh);
})

function animateSun(sun) {
    // Cập nhật mixer với deltaTime
    const deltaTime = sun.clock.getDelta();
    sun.mixer.update(deltaTime);

    // Yêu cầu khung hình tiếp theo
    requestAnimationFrame(animateSun.bind(null, sun)); // Đúng cách để bind hàm animateSun với sun
}

// Khởi tạo DirectionalLight và cấu hình của nó
const sun = new THREE.DirectionalLight();
function setupLight() {
    sun.clock = new THREE.Clock();
    sun.intensity = 3;
    sun.position.set(60, 60, 60);
    sun.castShadow = true;

    sun.shadow.camera.left = -50;
    sun.shadow.camera.right = 50;
    sun.shadow.camera.bottom = -50;
    sun.shadow.camera.top = 50;
    sun.shadow.camera.near = 0.1;
    sun.shadow.camera.far = 200;
    sun.shadow.bias = -0.0001;
    sun.shadow.mapSize = new THREE.Vector2(2048, 2048);
    
    // const shadowHelper = new THREE.CameraHelper(sun.shadow.camera);
    // scene.add(shadowHelper);
    scene.add(sun);
    scene.add(sun.target);

    // Tải mô hình mặt trời và thiết lập AnimationMixer và AnimationAction
    modelLoader.loadModels(modelName.sun, (models) => {
        if (models.sun && models.sun.mesh) {
            sun.mesh = models.sun.mesh;

            // Đặt mô hình vào vị trí của ánh sáng mặt trời
            sun.mesh.position.copy(sun.position);
            sun.mesh.scale.set(0.3, 0.3, 0.3);

            // Tạo AnimationMixer cho mô hình
            sun.mixer = new THREE.AnimationMixer(sun.mesh);

            // Kiểm tra xem mô hình có chứa animations không
            if (models.sun.animations && models.sun.animations.length > 0) {
                const animationClip = models.sun.animations[0]; // Lấy animation đầu tiên
                sun.action = sun.mixer.clipAction(animationClip); // Tạo hành động từ animation clip

                // Bắt đầu phát hành động
                sun.action.play();

                // Bắt đầu vòng lặp hoạt ảnh
                animateSun(sun);
            } 

            // Thêm mô hình mặt trời vào cảnh
            sun.mesh.layers.set(2);
            sun.mesh.traverse((child) => {
                child.layers.set(2);
            });
            scene.add(sun.mesh);

            // Đặt `layers` cho mô hình mặt trời và các child của nó
        }
    });
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32); // Bán kính 1, chi tiết 32 x 32
    const sunGeometry1 = new THREE.SphereGeometry(10, 32, 32); // Bán kính 1, chi tiết 32 x 32
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xff8000,opacity: 0.4 ,transparent: true}); // Vật liệu màu vàng
    const sunMaterial1 = new THREE.MeshBasicMaterial({ color: 0xffff00,opacity: 0.2 ,transparent: true}); // Vật liệu màu vàng
    
    const sunSphere = new THREE.Mesh(sunGeometry, sunMaterial);
    const sunSphere1 = new THREE.Mesh(sunGeometry1, sunMaterial1);

    // Đặt vị trí của hình cầu trùng với vị trí của ánh sáng mặt trời
    sunSphere.position.copy(sun.position);
    sunSphere1.position.copy(sun.position);

    // Thêm hình cầu vào cảnh
    scene.add(sunSphere);
    scene.add(sunSphere1);

    // Thiết lập ánh sáng môi trường
    const ambient = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambient);
}

function onMouseDown(event) {
    if (player.controls.isLocked && player.selectedCoords) {
        if (player.activeBlockId !== String(blocks.empty.id)) {
            world.addBlock(
                player.selectedCoords.x,
                player.selectedCoords.y,
                player.selectedCoords.z,
                player.activeBlockId
            )
                
        } else {
            world.removeBlock(
                player.selectedCoords.x,
                player.selectedCoords.y,
                player.selectedCoords.z,
            );
            player.tool.startAnimation();
        }
    }

}
document.addEventListener('mousedown', onMouseDown);

// Events
window.addEventListener('resize', () => {

    orbitCamera.aspect = window.innerWidth / window.innerHeight;
    orbitCamera.updateProjectionMatrix();
    player.camera.aspect = window.innerWidth / window.innerHeight;
    player.camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});

// UI Setup
const stats = new Stats();
document.body.appendChild(stats.dom);

//renderer loop
let previousTime = performance.now();
function animate() {
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const dt = (currentTime - previousTime) / 1000;

    if (player.controls.isLocked) {
        player.update(world);
        physics.update(dt, player, world);
        world.update(player);

        sun.position.copy(player.position);
        sun.position.sub(new THREE.Vector3(-50, -50, -50));
        sun.target.position.copy(player.position);
    }
    renderer.render(scene, player.controls.isLocked ? player.camera : orbitCamera);
    stats.update();

    previousTime = currentTime;
}

setupUI(world, player, physics, scene);
setupLight();
animate();