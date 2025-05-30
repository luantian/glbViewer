import * as THREE from "three";
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

export default class Floor {

    constructor(context) {
        this.name = 'CarFloor';
        this.cnName = '汽车镜面地板';
        this.context = context;
        this.scene = context.getScene();
        this.sizes = context.getSizes();
        this.debug = context.getDebug();
        this.resources = context.getResources();

        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);
        this.logger.important('初始化完成');

        this._setFloor();
        // this._setReflector();
        if (this.debug.active) {
            this._setDebugger();
        }

    }

    _setFloor() {
        const floorPlane = new THREE.PlaneGeometry(6.4, 6.4);
        this.floorMapTexture = this.resources.items.startroomLightTexture;
        this.floorMapTexture.repeat.set(0.9, 0.9);
        this.floorMapTexture.center.set(0.5, 0.5); // 让 rotation 围绕中心
        this.floorMapTexture.rotation = Math.PI * 0.5; // 让 rotation 围绕中心
        this.floorMapTexture.offset.set(-0.067, -0.068);

        this.floorAoMapTexture = this.resources.items.floorAoStartroomTexture;
        this.floorAoMapTexture.repeat.set(0.9, 0.9);
        this.floorAoMapTexture.center.set(0.5, 0.5); // 让 rotation 围绕中心
        this.floorAoMapTexture.rotation = Math.PI * 0.5; // 让 rotation 围绕中心
        this.floorAoMapTexture.offset.set(-0.067, -0.068);

        this.floorNormalTexture = this.resources.items.floorNormalTexture;
        this.floorNormalTexture.repeat.set(0.9, 0.9);
        this.floorNormalTexture.center.set(0.5, 0.5); // 让 rotation 围绕中心
        this.floorNormalTexture.rotation = Math.PI * 0.5; // 让 rotation 围绕中心
        this.floorNormalTexture.offset.set(-0.067, -0.068);

        // this.floorRoughnessTexture = this.resources.items.floorRoughnessTexture;


        this.floorMaterial = new THREE.MeshPhysicalMaterial({
            emissive: 0x000000,
            map: this.floorMapTexture,
            aoMap: this.floorAoMapTexture,
            alphaMap: this.floorAoMapTexture,
            normalMap: this.floorNormalTexture,
            // roughnessMap: this.floorRoughnessTexture,
            roughness: 0.53,
            metalness: 0.38,
            // transmission: 1.0,  // 模拟透明材质的透光性（如玻璃、水）。 需要配合 thickness 和 ior 使用。
            // thickness: 0.5,  // 定义材质的“厚度”，用于计算光线在透明物体内部的折射效果。
            // ior: 1.5,  // 折射率（Index of Refraction），控制光线穿过材质时的弯曲程度。 水约为 1.33，钻石约为 2.4。
            transparent: true,  // 需配合 transmission 或 opacity 使用。
            opacity: 0.75,
            // envMapIntensity: 1.0,
            // side: THREE.DoubleSide,
        });

        this.floor = new THREE.Mesh(floorPlane, this.floorMaterial);
        this.floor.name = this.name;
        this.floor.position.set(0, -0.153, 0);
        this.floor.rotation.x = -Math.PI / 2;

        this.scene.add(this.floor);
    }

    _setReflector() {

        const floorPlane = new THREE.PlaneGeometry(6, 6);
        this.reflectorOptions = {
            clipBias: 0.003,
            textureWidth: this.sizes.width * this.sizes.pixelRatio * 0.5,
            textureHeight: this.sizes.height * this.sizes.pixelRatio * 0.5,
            // side: THREE.DoubleSide,
        }

        this.reflectorFloor = new Reflector(floorPlane, this.reflectorOptions);
        this.reflectorFloor.position.set(0, -0.154, 0);
        this.reflectorFloor.rotation.x = -Math.PI / 2;

        this.scene.add(this.reflectorFloor);
    }

    _setDebugger() {
        this.folder = this.debug.ui.addFolder(this.cnName);

        this.ordinaryFolder = this.folder.addFolder('常规地板');
        this.ordinaryFolder.add(this.floor.position, 'x').min(-3).max(3).step(0.001).name('X');
        this.ordinaryFolder.add(this.floor.position, 'y').min(-3).max(3).step(0.001).name('Y');
        this.ordinaryFolder.add(this.floor.position, 'z').min(-3).max(3).step(0.001).name('Z');
        this.ordinaryFolder.addColor(this.floorMaterial, 'emissive').name('颜色(emissive)');
        this.ordinaryFolder.add(this.floorMaterial, 'metalness').min(0).max(1).step(0.01).name('金属度(metalness)');
        // this.ordinaryFolder.add(this.floorMaterial, 'aoMapIntensity').min(0).max(1).step(0.01).name('aoMap强度(aoMapIntensity)');
        this.ordinaryFolder.add(this.floorMaterial, 'roughness').min(0).max(1).step(0.01).name('粗糙度(roughness)');
        this.ordinaryFolder.add(this.floorMaterial, 'transmission').min(0).max(10).step(0.01).name('玻璃模糊度(transmission)');
        this.ordinaryFolder.add(this.floorMaterial, 'thickness').min(0).max(10).step(0.01).name('"厚度"(thickness)');
        this.ordinaryFolder.add(this.floorMaterial, 'ior').min(0).max(10).step(0.01).name('折射率(ior)');
        this.ordinaryFolder.add(this.floorMaterial, 'transparent').min(0).max(1).step(0.01).name('透明(transparent)');
        this.ordinaryFolder.add(this.floorMaterial, 'opacity').min(0).max(1).step(0.01).name('透明度(opacity)');

        this.textureFolder = this.folder.addFolder('纹理测试');
        this.textureFolder.add(this.floorMapTexture.repeat, 'x').min(-3).max(3).step(0.001).name('repeatX').onChange((value) => {
            this.floorAoMapTexture.repeat.x = value;
            this.floorNormalTexture.repeat.x = value;
        })
        this.textureFolder.add(this.floorMapTexture.repeat, 'y').min(-3).max(3).step(0.001).name('repeatY').onChange((value) => {
            this.floorAoMapTexture.repeat.y = value;
            this.floorNormalTexture.repeat.y = value;
        })
        this.textureFolder.add(this.floorMapTexture.offset, 'x').min(-3).max(3).step(0.001).name('offsetX').onChange((value) => {
            this.floorAoMapTexture.offset.x = value;
            this.floorNormalTexture.offset.x = value;
        })
        this.textureFolder.add(this.floorMapTexture.offset, 'y').min(-3).max(3).step(0.001).name('offsetY').onChange((value) => {
            this.floorAoMapTexture.offset.y = value;
            this.floorNormalTexture.offset.y = value;
        })
        this.textureFolder.add(this.floorMapTexture, 'rotation').min(0).max(360).step(0.01).name('旋转(rotation)')
        // this.textureFolder.add(this.floorStartroomLightTexture.rotation, 'y').min(0).max(Math.PI * 2).step(0.01).name('rotationY');




        /*this.reflectorFolder = this.folder.addFolder('reflectorFloor地板');
        this.reflectorFolder.add(this.reflectorFloor.position, 'x').min(-3).max(3).step(0.001).name('X');
        this.reflectorFolder.add(this.reflectorFloor.position, 'y').min(-3).max(3).step(0.001).name('Y');
        this.reflectorFolder.add(this.reflectorFloor.position, 'z').min(-3).max(3).step(0.001).name('Z');*/

        // this.folder.add(this.reflectorOptions, 'clipBias').min(-10).max(10).step(0.01).name('clipBias');
    }

    destroy() {

    }
}
