import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AnimationMixer } from "three";

export class ModelLoader {
  constructor() {
    this.loader = new GLTFLoader();
    this.models = {
      pickaxe: { mesh: undefined, animations: undefined, mixer: undefined },
      snow_goat: { mesh: undefined, animations: undefined, mixer: undefined },
      dragon: { mesh: undefined, animations: undefined, mixer: undefined },
      fish: { mesh: undefined, animations: undefined, mixer: undefined },
      warden: { mesh: undefined, animations: undefined, mixer: undefined },
      penguin_ballon: { mesh: undefined, animations: undefined, mixer: undefined },
      bee: { mesh: undefined, animations: undefined, mixer: undefined },
      sun: { mesh: undefined, animations: undefined, mixer: undefined },
      dumbo: { mesh: undefined, animations: undefined, mixer: undefined },
      kijiaden: { mesh: undefined, animations: undefined, mixer: undefined },
      tiger: { mesh: undefined, animations: undefined, mixer: undefined },
    };
  }

  loadModels(modelName, onLoad) {
    let modelPath = '';
    let modelKey = '';
    
    // Xác định đường dẫn và khóa mô hình dựa trên ID
    if (modelName.id === 0) {
      modelPath = '/models/pickaxe.glb';
      modelKey = 'pickaxe';
    } else if (modelName.id === 1) {
      modelPath = '/models/goat_minecraft.glb';
      modelKey = 'snow_goat';
    } else if (modelName.id === 2) {
      modelPath = '/models/dragon.glb';
      modelKey = 'dragon';
    } else if (modelName.id === 3) {
      modelPath = '/models/fish.glb';
      modelKey = 'fish';
    } else if (modelName.id === 4) {
      modelPath = '/models/warden.glb';
      modelKey = 'warden';
    } else if (modelName.id === 5) {
      modelPath = '/models/penguin_ballon.glb';
      modelKey = 'penguin_ballon';
    } else if (modelName.id === 6) {
      modelPath = '/models/bee.glb';
      modelKey = 'bee';
    } else if (modelName.id === 7) {
      modelPath = '/models/sun.glb';
      modelKey = 'sun';
    } else if (modelName.id === 8) {
      modelPath = '/models/dumbo.glb';
      modelKey = 'dumbo';
    } else if (modelName.id === 9) {
      modelPath = '/models/kijiaden.glb';
      modelKey = 'kijiaden';
    } else if (modelName.id === 10) {
      modelPath = '/models/tiger.glb';
      modelKey = 'tiger';
    }

    this.loader.load(modelPath, (gltf) => {
      const mesh = gltf.scene;
      const animations = gltf.animations;
      const mixer = new AnimationMixer(mesh);
      
      // Lưu trữ lưới, hoạt ảnh và mixer trong đối tượng mô hình tương ứng
      this.models[modelKey].mesh = mesh;
      if (modelKey === 'dragon'|| modelKey === 'fish' || 'bee' || 'sun' || 'kijiaden' || 'tiger') {
        this.models[modelKey].animations = animations;
        this.models[modelKey].mixer = mixer;
      }

      onLoad(this.models);
    });
  }

  update(deltaTime) {
    // Cập nhật mixer cho từng mô hình nếu chúng có hoạt ảnh
    for (let key in this.models) {
      if (this.models[key].mixer) {
        this.models[key].mixer.update(deltaTime);
      }
    }
  }
}
