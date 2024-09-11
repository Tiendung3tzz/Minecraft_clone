import * as THREE from 'three';

export class Animal extends THREE.Group {
    constructor() {
        super();
        this.animate = false;
        this.animationAmplitude = 4; // Khoảng cách di chuyển mỗi bước là 4 đơn vị
        this.animationSpeed = [0.01, 0.003, 0.2]; // Tốc độ di chuyển (đơn vị: pixel/frame)
        this.animationStart = 0;
        this.animation = undefined;
        this.toolMesh = undefined;
        this.targetPositions = []; // Lưu các vị trí mục tiêu
        this.currentTargetIndex = 0; // Chỉ số của vị trí mục tiêu hiện tại
        this.direction = 1; // Hướng di chuyển: 1 là đi tới, -1 là quay lại
        this.time = 0;
        this.mixer = undefined; // Animation mixer cho các hoạt ảnh GLTF
        this.action = undefined; // Hoạt ảnh đang phát
        this.clock = new THREE.Clock();
    }

    startAnimation() {
        if (this.animate) return;
        this.animate = true;

        // Bắt đầu hoạt ảnh GLTF nếu có
        if (this.mixer && this.action) {
            this.action.play();
        }

        this.animateDragon(); // Bắt đầu animation theo khung hình
    }

    stopAnimation() {
        this.animate = false;
    }

    animateGoat() {
        this.animate = true;
        if (!this.animate) return;

        // Vị trí mục tiêu hiện tại
        const targetPosition = this.targetPositions[this.currentTargetIndex];
        // Tính toán khoảng cách đến vị trí mục tiêu theo chiều z
        const deltaZ = targetPosition.z - this.position.z;

        // Nếu đã đến gần vị trí mục tiêu thì chuyển sang mục tiêu tiếp theo
        if (Math.abs(deltaZ) < 0.01) {
            // Xoay đối tượng 180 độ khi đạt tới mục tiêu
            this.rotation.y += Math.PI;

            // Chuyển sang vị trí mục tiêu tiếp theo
            this.currentTargetIndex += this.direction;

            // Nếu đã đến vị trí cuối cùng trong một hướng thì đổi hướng
            if (this.currentTargetIndex >= this.targetPositions.length || this.currentTargetIndex < 0) {
                this.direction *= -1; // Đảo ngược hướng
                this.currentTargetIndex += this.direction; // Điều chỉnh lại chỉ số mục tiêu
                this.rotation.y += Math.PI;
            }
        } else {
            // Di chuyển tới vị trí mục tiêu với tốc độ cố định
            this.position.z += Math.sign(deltaZ) * this.animationSpeed[0];
        }

        // Tiếp tục gọi animateFunction để tạo hiệu ứng di chuyển liên tục
        requestAnimationFrame(this.animateGoat.bind(this));
    }

    animateDragon() {
        this.animate = true;

        // Bắt đầu hoạt ảnh GLTF nếu có
        if (this.mixer && this.action) {
            this.action.play();
        }
        if (!this.animate) return;

        // Cập nhật mixer nếu có
        if (this.mixer) {
            const deltaTime = this.clock.getDelta();
            this.mixer.update(deltaTime);
        }
        // Cập nhật vị trí theo hình số 8
        const a = 12; // Bán kính lớn
        const b = 8; // Bán kính nhỏ

        this.time += this.animationSpeed[1];
        const t = this.time;

        const x = a * Math.sin(t);
        const z = b * Math.sin(2 * t);

        // Tính toán góc xoay dựa trên hướng di chuyển hiện tại
        const dx = a * Math.cos(t);
        const dz = 2 * b * Math.cos(1.5 * t);

        const angle = Math.atan2(dz, dx);

        // Cập nhật vị trí và xoay đối tượng
        this.position.set(this.initialPosition.x + x, this.initialPosition.y, this.initialPosition.z + z);
        this.rotation.y = angle;

        // Yêu cầu khung hình tiếp theo
        requestAnimationFrame(this.animateDragon.bind(this));
    }

    animateFish() {
        this.animate = true;

        // Bắt đầu hoạt ảnh GLTF nếu có
        if (this.mixer && this.action) {
            this.action.play();
        }
        if (!this.animate) return;

        // Cập nhật mixer nếu có
        if (this.mixer) {
            const deltaTime = this.clock.getDelta();
            this.mixer.update(deltaTime);
        }
        // Cập nhật vị trí theo hình số 8
        // Vị trí mục tiêu hiện tại
        const targetPosition = this.targetPositions[this.currentTargetIndex];
        // Tính toán khoảng cách đến vị trí mục tiêu
        const deltaX = targetPosition.x - this.position.x;
        const deltaZ = targetPosition.z - this.position.z;

        // Nếu đã đến gần vị trí mục tiêu thì chuyển sang mục tiêu tiếp theo
        if (Math.abs(deltaX) < 0.01 && Math.abs(deltaZ) < 0.01) {
            // Xoay đối tượng 180 độ khi đạt tới mục tiêu nếu không phải điểm cuối cùng
            if (this.currentTargetIndex < this.targetPositions.length - 1) {
                this.rotation.y += Math.PI / (Math.round(Math.random() * 3)+1);
            }

            // Chuyển sang vị trí mục tiêu tiếp theo
            this.currentTargetIndex += this.direction;

            // Nếu đã đến vị trí cuối cùng trong một hướng thì đổi hướng
            if (this.currentTargetIndex >= this.targetPositions.length) {
                this.currentTargetIndex = 0; // Quay về vị trí ban đầu
            }
        } else {
            // Di chuyển tới vị trí mục tiêu với tốc độ cố định
            this.position.x += Math.sign(deltaX) * this.animationSpeed[0] ;
            this.position.z += Math.sign(deltaZ) * this.animationSpeed[0] ;
        }

        // Yêu cầu khung hình tiếp theo
        requestAnimationFrame(this.animateFish.bind(this));
    }
    animateKijiaden() {
        this.animate = true;

        // Bắt đầu hoạt ảnh GLTF nếu có
        if (this.mixer && this.action) {
            this.action.play();
        }
        if (!this.animate) return;

        // Cập nhật mixer nếu có
        if (this.mixer) {
            const deltaTime = this.clock.getDelta();
            this.mixer.update(deltaTime);
        }

        // Vị trí mục tiêu hiện tại
        const targetPosition = this.targetPositions[this.currentTargetIndex];
        // Tính toán khoảng cách đến vị trí mục tiêu theo chiều z
        const deltaZ = targetPosition.z - this.position.z;

        // Nếu đã đến gần vị trí mục tiêu thì chuyển sang mục tiêu tiếp theo
        if (Math.abs(deltaZ) < 0.01) {
            // Xoay đối tượng 180 độ khi đạt tới mục tiêu
            this.rotation.y += Math.PI;

            // Chuyển sang vị trí mục tiêu tiếp theo
            this.currentTargetIndex += this.direction;

            // Nếu đã đến vị trí cuối cùng trong một hướng thì đổi hướng
            if (this.currentTargetIndex >= this.targetPositions.length || this.currentTargetIndex < 0) {
                this.direction *= -1; // Đảo ngược hướng
                this.currentTargetIndex += this.direction; // Điều chỉnh lại chỉ số mục tiêu
                this.rotation.y += Math.PI;
            }
        } else {
            // Di chuyển tới vị trí mục tiêu với tốc độ cố định
            this.position.z += Math.sign(deltaZ) * this.animationSpeed[0];
        }

        // Tiếp tục gọi animateFunction để tạo hiệu ứng di chuyển liên tục
        requestAnimationFrame(this.animateKijiaden.bind(this));
    }

    animateTiger() {
        this.animate = true;

        // Bắt đầu hoạt ảnh GLTF nếu có
        if (this.mixer && this.action) {
            this.action.play();
        }
        if (!this.animate) return;

        // Cập nhật mixer nếu có
        if (this.mixer) {
            const deltaTime = this.clock.getDelta();
            this.mixer.update(deltaTime);
        }

        // Tiếp tục gọi animateFunction để tạo hiệu ứng di chuyển liên tục
        requestAnimationFrame(this.animateTiger.bind(this));
    }


    animateKijiaden() {
        this.animate = true;

        if (this.mixer && this.action) {
            this.action.play();
        }
        if (!this.animate) return;

        if (this.mixer) {
            const deltaTime = this.clock.getDelta();
            this.mixer.update(deltaTime);
        }
        requestAnimationFrame(this.animateGoat.bind(this));
    }
    setMesh(mesh, x, y, z, modelName) {
        this.clear(); // Xóa các thành phần hiện có trong nhóm

        this.toolMesh = mesh; // Thiết lập mesh mới
        this.add(this.toolMesh); // Thêm mesh vào nhóm
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        // Đặt vị trí ban đầu

        if (modelName.name === 'snow_goat') {
            this.position.set(x, y - 0.5, z);
            this.scale.set(1, 1, 1);
    
            // Lưu vị trí ban đầu và định nghĩa các vị trí mục tiêu theo chiều z (từ z đến z + 4)
            
            this.targetPositions = [
                new THREE.Vector3(x, y - 0.5, z),         // Vị trí ban đầu (z)
                new THREE.Vector3(x, y - 0.5, z + 4)      // Di chuyển đến z + 4
            ];
            this.currentTargetIndex = 0; // Đặt chỉ số mục tiêu ban đầu
            this.direction = 1; // Đặt hướng ban đầu là đi tới
    
            // Bắt đầu animation ngay lập tức
            this.animateGoat();
        } else if (modelName.name === 'dragon') {
            this.position.set(x, y, z);
            this.scale.set((Math.round(Math.random() * 3)+1), (Math.round(Math.random() * 3)+1), (Math.round(Math.random() * 3)+1));

            this.initialPosition = new THREE.Vector3(x, y, z);
            if (modelName.animations && modelName.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(mesh);
                this.action = this.mixer.clipAction(modelName.animations[0]);
            }

            // Bắt đầu animation ngay lập tức
            this.animateDragon();
        } else if (modelName.name === 'fish' || modelName.name === 'bee') {
            this.position.set(x, y, z);
            if (modelName.name === 'fish' ) {
                this.scale.set((Math.round(Math.random() * 2)+1), (Math.round(Math.random() * 2)+1), (Math.round(Math.random() * 2)+1));
            } else {
                this.scale.set(((Math.random() * 1)+0.01), ((Math.random() * 1)+0.01), ((Math.random() * 1)+0.01));
            }

            // this.initialPosition = new THREE.Vector3(x, y, z);
            if (modelName.animations && modelName.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(mesh);
                this.action = this.mixer.clipAction(modelName.animations[0]);
            }
            this.targetPositions = [new THREE.Vector3(x, y, z)]; // Bắt đầu từ điểm hiện tại

            for (let i = 0; i < 5; i++) {
                // Tạo vị trí ngẫu nhiên trong khoảng ±5 đơn vị xung quanh điểm xuất phát
                const randomX = x + (Math.round(Math.random() * 3)+2);
                const randomZ = z + (Math.round(Math.random() * 3)+2);
                this.targetPositions.push(new THREE.Vector3(randomX, y, randomZ));
            }

            // Thêm điểm quay về vị trí ban đầu
            this.targetPositions.push(new THREE.Vector3(x, y, z));

            this.currentTargetIndex = 1; // Bắt đầu từ điểm ngẫu nhiên đầu tiên
            this.direction = 1; // Đặt hướng ban đầu là đi tới

            // Bắt đầu animation ngay lập tức

            // Bắt đầu animation ngay lập tức
            this.animateFish();
        } else if (modelName.name === 'sun' ) {
            this.position.set(x, y, z);
        } else if (modelName.name === 'dumbo') {
            this.position.set(x, y + 0.5, z);
            this.scale.set(0.5,0.5,0.5)
        } else if (modelName.name === 'kijiaden') {
            this.position.set(x, y, z);
            this.scale.set(1,1,1);
            if (modelName.animations && modelName.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(mesh);
                this.action = this.mixer.clipAction(modelName.animations[0]);
            }
            this.targetPositions = [
                new THREE.Vector3(x, y - 0.5, z),         // Vị trí ban đầu (z)
                new THREE.Vector3(x, y - 0.5, z + 4)      // Di chuyển đến z + 4
            ];
            this.currentTargetIndex = 0; // Đặt chỉ số mục tiêu ban đầu
            this.direction = 1;
            this.animateKijiaden();
        } else if (modelName.name === 'tiger') {
            this.position.set(x, y - 0.5, z);
            this.scale.set(1,1,1);
            if (modelName.animations && modelName.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(mesh);
                this.action = this.mixer.clipAction(modelName.animations[0]);
            }
            this.animateTiger();
        }
    } 
}
