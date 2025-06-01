import * as THREE from "three";
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import gsap from "gsap";


export default class RoofRectAreaLight {

    constructor(context) {
        this.name = 'RoofRectAreaLight';
        this.cnName = '汽车顶光';
        this.context = context;
        this.scene = context.getScene();
        this.debug = context.getDebug();
        this.resources = context.getResources();

        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);
        this.logger.important('初始化完成');

        this._zoomInOptions = {
            duration: 1.2,
            ease: "power2.out",
        }
        this._zoomOutOptions = {
            duration: 1.2,
            ease: "power2.out",
        }


        RectAreaLightUniformsLib.init();
        this.setLight();

        if (this.debug.active) {
            this._setDebugger();
        }
    }

    setLight() {
        const width = 0.5;
        const height = 1.2;
        this.intensity = 4;
        const y = 0.5;
        const directionToDown = -Math.PI / 2;  // 让光朝下（默认朝-z方向）
        this.light = new THREE.RectAreaLight( 0xffffff, this.intensity,  width, height );
        this.light.name = this.name;
        this.light.position.y = y;
        this.light.lookAt( 0, 0, 0 );

        this.light.rotation.x = directionToDown;

        this._zoomTween = null;

        this.planeGeometry = new THREE.PlaneGeometry(width, height, 1, 1);

        this.material = new THREE.MeshStandardMaterial({
            color: 'red',
            emissive: 0xffffff,
            // alphaMap: this.lightTexture,
            emissiveIntensity: 5,
            roughness: 0.1,
            metalness: 0.5,
            transparent: true,
            side: THREE.DoubleSide
        });

        this.lightPlane = new THREE.Mesh(this.planeGeometry, this.material);
        this.lightPlane.name = this.name + 'Plane'
        this.lightPlane.position.y = y;
        this.lightPlane.rotation.x = directionToDown; // 让光朝下（默认朝-z方向）


        this.scene.add(this.light);
        this.scene.add(this.lightPlane);

    }

    zoomStartAnimation() {

        this._zoomTween = gsap.to(this.light, {
            intensity: 1,
            ...this._zoomInOptions,
        })

        this._zoomTween = gsap.to(this.lightPlane.material, {
            opacity: 0,
            ...this._zoomInOptions,
        })
    }

    zoomStopAnimation() {
        this._zoomTween = gsap.to(this.light, {
            intensity: this.intensity,
            ...this._zoomOutOptions,
        })
        this._zoomTween = gsap.to(this.lightPlane.material, {
            opacity: 1,
            ...this._zoomOutOptions,
        })


    }


    _setDebugger() {
        this.folder = this.debug.ui.addFolder('汽车顶光');
        this.folder.addColor(this.light, 'color').name('灯光颜色');
        this.folder.add(this.light, 'intensity').min(0.0).max(20).step(0.1).name('光照强度(Intensity)');
        this.folder.add(this.light.position, 'x').min(-3).max(3).step(0.01).name('X').onChange(value => {
            this.lightPlane.position.x = value - 0.02;
        });
        this.folder.add(this.light.position, 'y').min(0).max(10).step(0.01).name('Y').onChange(value => {
            this.lightPlane.position.y = value - 0.02;
        });
        this.folder.add(this.light.position, 'z').min(-3).max(3).step(0.01).name('Z').onChange(value => {
            this.lightPlane.position.z = value - 0.02;
        });

        /*this.planeFolder = this.folder.addFolder('汽车顶光白板');
        this.planeFolder.add(this.lightTexture.offset, 'x').min(-10).max(10).step(0.001).name('offsetX');
        this.planeFolder.add(this.lightTexture.offset, 'y').min(-10).max(10).step(0.001).name('offsetY');
        this.planeFolder.add(this.lightTexture.repeat, 'x').min(-10).max(10).step(0.001).name('repeatX');
        this.planeFolder.add(this.lightTexture.repeat, 'y').min(-10).max(10).step(0.001).name('repeatY');*/

    }

    destroy() {
        this.scene.remove(this.light);
        this.light = null;

        if (this.folder?.destroy) {
            this.folder.destroy();
        }
    }



}