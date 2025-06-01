import Camera from './Camera.js'
import Renderer from './Renderer.js'
import BaseWorld from "../Bases/BaseWorld.js";
import * as THREE from "three";

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

export default class CarWorld extends BaseWorld {
    constructor(context) {
        super(context);

        this.name = "CarWorld";
        this.cnName = "汽车世界"

        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);
        this.logger.important('初始化完成')

        this.context = context;

        this.scene = context.getScene();
        this.scene.fog = new THREE.FogExp2(0xff0000, 0.02);

        // 初始化相机与渲染器
        this.camera = new Camera(context);
        this.renderer = new Renderer(context);
        this.cameraInstance = context.getCameraInstance();
        this.rendererInstance = context.getRendererInstance();
        this.orbitControls = context.getOrbitControls();
        this.sizes = context.getSizes();
        this.canvas = context.getCanvas();

        this.rootEl = document.querySelector('#root');

        this.sizes.enabledResize = false;

        this.resize();

        this.setCamera(this.camera);
        this.setRenderer(this.renderer);


        // this._setBloomPass();

        if (this.debug.active) {
            this._setDebugger();
        }

    }

    update() {
        super.update();
        if (this.composer) {
            this.composer.render()
        }
    }

    _setBloomPass() {
        this.bloomPassParams = {
            xy: new THREE.Vector2(this.sizes.width, this.sizes.height),
            strength: 0.08,
            radius: 0.1,
            threshold: 0.85
        };

        const fxaaPass = new ShaderPass(FXAAShader);
        fxaaPass.material.uniforms['resolution'].value.set(1 / this.sizes.width, 1 / this.sizes.height);
        // 设置后处理
        this.composer = new EffectComposer(this.rendererInstance);
        this.composer.addPass(new RenderPass(this.scene, this.cameraInstance));
        this.composer.addPass(fxaaPass);
        this.bloomPass = new UnrealBloomPass(
            this.bloomPassParams.xy,
            this.bloomPassParams.strength,
            this.bloomPassParams.radius,
            this.bloomPassParams.threshold
        );
        this.composer.addPass(this.bloomPass);
    }

    _setDebugger() {
        if (this.bloomPass) {
            this.folder = this.debug.ui.addFolder('汽车顶光光晕配置');
            this.folder.add(this.bloomPass, 'strength').min(0).max(3).step(0.01).name('strength')
            this.folder.add(this.bloomPass, 'radius').min(0).max(3).step(0.01).name('strength')
            this.folder.add(this.bloomPass, 'threshold').min(0).max(3).step(0.01).name('threshold')
        }
    }


    resize() {

        if (!this.rootEl) {
            this.rootEl = document.querySelector('#root');
        }

        this.orientation = this.sizes.getOrientation();

        if (this.orientation) {
            this.rootEl.style.width = window.innerWidth + 'px';
            this.rootEl.style.height = window.innerHeight + 'px';
            this.rootEl.style.margin = '0 auto';
            this.rootEl.style.transform = 'rotate(0)';
            this.sizes.width = window.innerWidth;
            this.sizes.height = window.innerHeight;
        } else {
            this.rootEl.style.width = window.innerHeight + 'px';
            this.rootEl.style.height = window.innerWidth + 'px';
            this.rootEl.style.margin = '0px 0px 0px ' + window.innerWidth + 'px';
            this.rootEl.style.transform = 'rotate(90deg)';
            this.rootEl.style['transform-origin'] = '0px 0px 0px';
            this.sizes.height = window.innerWidth;
            this.sizes.width = window.innerHeight;

            const rot90 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
            this.cameraInstance.quaternion.premultiply(rot90);
        }
        super.resize()

    }

}
