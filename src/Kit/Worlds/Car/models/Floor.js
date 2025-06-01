import * as THREE from "three";
import gsap from "gsap";
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import vertexShader from '../shaders/floor/vertex.glsl'
import fragmentShader from '../shaders/floor/fragment.glsl'

export default class Floor {

    constructor(context) {
        this.name = 'CarFloor';
        this.cnName = '汽车镜面地板';
        this.context = context;
        this.scene = context.getScene();
        this.sizes = context.getSizes();
        this.debug = context.getDebug();
        this.resources = context.getResources();
        this.rendererInstance = context.getRendererInstance();
        this.cameraInstance = context.getCameraInstance();

        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);
        this.logger.important('初始化完成');

        this.tween = null;

        // this._setFloor();
        this._setReflector();
        // this._setReflectorFloor();
        this.context.addUpdatable(this);

        if (this.debug.active) {
            this._setDebugger();
        }

    }

    _setFloor() {
        this.planeWidth = 6.4;
        this.planeHeight = 100;
        const floorPlane = new THREE.PlaneGeometry(this.planeWidth, this.planeHeight);


        this.floorMapColorTexture = this.resources.items.floorMapColor;
        // this.floorMapColorTexture.wrapS = THREE.RepeatWrapping;
        // this.floorMapColorTexture.wrapT = THREE.RepeatWrapping;
        // this.floorMapColorTexture.center.set(0.5, 0.5); // 让 rotation 围绕中心
        // this.floorMapColorTexture.rotation = Math.PI * 0.5;
        // this.floorMapColorTexture.repeat.set(0.9, 0.9);
        // this.floorMapColorTexture.offset.set(-0.067, -0.068);

        this.floorAoMapTexture = this.resources.items.floorAoStartroomTexture;
        this.floorAoMapTexture.wrapS = THREE.RepeatWrapping;
        this.floorAoMapTexture.wrapT = THREE.RepeatWrapping;
        // this.floorAoMapTexture.repeat.set(0.9, 0.9);
        // this.floorAoMapTexture.center.set(0.5, 0.5); // 让 rotation 围绕中心
        // this.floorAoMapTexture.rotation = Math.PI * 0.5; // 让 rotation 围绕中心
        // this.floorAoMapTexture.offset.set(-0.067, -0.068);
        //
        this.floorNormalTexture = this.resources.items.floorNormalTexture;
        // this.floorNormalTexture.repeat.set(0.9, 0.9);
        // this.floorNormalTexture.center.set(0.5, 0.5); // 让 rotation 围绕中心
        // this.floorNormalTexture.rotation = Math.PI * 0.5; // 让 rotation 围绕中心
        // this.floorNormalTexture.offset.set(-0.067, -0.068);

        this.floorAlphaTexture = this.resources.items.roadAlphaTexture;
        this.floorAlphaTexture.wrapS = THREE.RepeatWrapping;
        this.floorAlphaTexture.wrapT = THREE.RepeatWrapping;


        this.floorRoughnessTexture = this.resources.items.floorRoughnessTexture;
        this.tScarMatcapTexture = this.resources.items.tScarMatcapTexture;

        this.floorMaterial = new THREE.MeshPhysicalMaterial({
            // color: 0x000000,
            // emissive: 0x000000,
            map: this.floorMapColorTexture,
            aoMap: this.floorAoMapTexture,
            // alphaMap: this.floorAlphaTexture,
            // normalMap: this.floorNormalTexture,
            // roughnessMap: this.floorRoughnessTexture,
            // roughness: 0.53,
            // metalness: 0.38,
            // transmission: 1.0,  // 模拟透明材质的透光性（如玻璃、水）。 需要配合 thickness 和 ior 使用。
            // thickness: 1.0,  // 定义材质的“厚度”，用于计算光线在透明物体内部的折射效果。
            // ior: 1.5,  // 折射率（Index of Refraction），控制光线穿过材质时的弯曲程度。 水约为 1.33，钻石约为 2.4。
            transparent: true,  // 需配合 transmission 或 opacity 使用。
            opacity: 0.4,
            // envMapIntensity: 1.0
            // side: THREE.DoubleSide,
        });

  /*      this.floorMaterial = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uRoughnessTexture: new THREE.Uniform(this.floorRoughnessTexture)
            },
            transparent: true,

        })
*/
        this.floor = new THREE.Mesh(floorPlane, this.floorMaterial);
        this.floor.name = this.name;
        this.floor.position.set(0, -0.153, 0);
        this.floor.rotation.x = -Math.PI / 2;

        this.scene.add(this.floor);
    }

    _setReflector() {

        const floorPlane = new THREE.PlaneGeometry(4, 100);
        this.reflectorOptions = {
            clipBias: 0.003,
            textureWidth: this.sizes.width * this.sizes.pixelRatio,
            textureHeight: this.sizes.height * this.sizes.pixelRatio,
            // side: THREE.DoubleSide,
        }

        this.reflectorFloor = new Reflector(floorPlane, this.reflectorOptions);
        this.reflectorFloor.material = new THREE.MeshStandardMaterial({
            roughness: 0.1,             // 控制反射清晰度（0=镜面，1=模糊）
            metalness: 0.9,             // 增强反射效果
            transparent: true,          // 如果需要透明度
            opacity: 0.8,               // 调整透明度
            // envMap: reflector.getRenderTarget().texture, // 绑定反射贴图
        });
        this.reflectorFloor.material.map = this.floorMapColorTexture;
        this.reflectorFloor.material.needsUpdate = true;

        this.reflectorFloor.position.set(0, -0.154, 0);
        this.reflectorFloor.rotation.x = -Math.PI / 2;
        this.scene.add(this.reflectorFloor);
    }

    _setDebugger() {
        this.folder = this.debug.ui.addFolder(this.cnName);

   /*     resolution: 1024,
            blur: [512, 128],
            mixBlur: 2.5,
            mixContrast: 1.5,
            mirror: 1*/
        /*this.folder.add(this.reflectorFloorParams, 'resolution').min(0).max(2048).step(1).name('resolution').onChange(() => {
            this.plane.material.update()
        });
        this.folder.add(this.reflectorFloorParams, 'mixBlur').min(0).max(10).step(0.01).name('mixBlur').onChange(() => {
            this.plane.material.update()
        });
        this.folder.add(this.reflectorFloorParams, 'mixContrast').min(1).max(10).step(0.01).name('mixContrast').onChange(() => {
            this.plane.material.update()
        });
        this.folder.add(this.reflectorFloorParams, 'mirror').min(0).max(10).step(0.01).name('mirror').onChange(() => {
            this.plane.material.update()
        });*/



       /* this.ordinaryFolder = this.folder.addFolder('常规地板');
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
        this.ordinaryFolder.add(this.floorMaterial, 'opacity').min(0).max(1).step(0.01).name('透明度(opacity)');*/

       /* this.textureFolder = this.folder.addFolder('纹理测试');
        this.textureFolder.add(this.floorMapColorTexture.repeat, 'x').min(-20).max(20).step(0.01).name('repeatX').onChange((value) => {
            this.floorAoMapTexture.repeat.x = value;
            this.floorNormalTexture.repeat.x = value;
        })
        this.textureFolder.add(this.floorMapColorTexture.repeat, 'y').min(-20).max(20).step(0.01).name('repeatY').onChange((value) => {
            this.floorAoMapTexture.repeat.y = value;
            this.floorNormalTexture.repeat.y = value;
        })
        this.textureFolder.add(this.floorMapColorTexture.offset, 'x').min(-3).max(3).step(0.01).name('offsetX').onChange((value) => {
            this.floorAoMapTexture.offset.x = value;
            this.floorNormalTexture.offset.x = value;
        })
        this.textureFolder.add(this.floorMapColorTexture.offset, 'y').min(-3).max(3).step(0.01).name('offsetY').onChange((value) => {
            this.floorAoMapTexture.offset.y = value;
            this.floorNormalTexture.offset.y = value;
        })
        this.textureFolder.add(this.floorMapColorTexture, 'rotation').min(0).max(360).step(0.01).name('旋转(rotation)')*/


        /*this.reflectorFolder = this.folder.addFolder('reflectorFloor地板');
        this.reflectorFolder.add(this.reflectorFloor.position, 'x').min(-3).max(3).step(0.001).name('X');
        this.reflectorFolder.add(this.reflectorFloor.position, 'y').min(-3).max(3).step(0.001).name('Y');
        this.reflectorFolder.add(this.reflectorFloor.position, 'z').min(-3).max(3).step(0.001).name('Z');
*/
        // this.folder.add(this.reflectorOptions, 'clipBias').min(-10).max(10).step(0.01).name('clipBias');
    }

    show() {
        if (this.tween) { this.tween.kill() }
        // this.tween = gsap.to(this.floorMaterial, {
        //     opacity: 1,
        //     duration: 3,
        //     ease: "power4.out",
        // })
    }

    hide() {
        if (this.tween) { this.tween.kill() }
        // this.tween = gsap.to(this.floorMaterial, {
        //     opacity: 0,
        //     duration: 3,
        //     ease: "power2.in",
        // })
    }

    tick({ delta, elapsed }) {
    }

    destroy() {

    }
}
