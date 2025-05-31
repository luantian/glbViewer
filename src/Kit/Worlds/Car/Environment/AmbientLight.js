import * as THREE from "three";
import gsap from "gsap";

export default class AmbientLight {
    constructor(context) {
        this.name = 'AmbientLight';
        this.cnName = '汽车环境光';
        this.context = context;
        this.scene = context.getScene();
        this.debug = context.getDebug();
        this.resources = context.getResources();

        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);
        this.logger.important('初始化完成');

        this.intensity = 1;

        this._setAmbientLight();

        this._zoomTween = null;
        this._zoomInOptions = {
            duration: 1.2,
            ease: "power2.out",
        }
        this._zoomOutOptions = {
            duration: 1.2,
            ease: "power2.out",
        }

        if (this.debug.active) {
            this._setDebugger();
        }
    }

    _setAmbientLight() {
        this.light = new THREE.AmbientLight({
            color: 0xffffff,
            intensity: this.intensity,
        });
        this.light.name = this.name;
        this.scene.add(this.light);
    }

    zoomStartAnimation() {
        if (this._zoomTween) this._zoomTween.kill();
        this._zoomTween = gsap.to(this.light, {
            intensity: 0.1,
            ...this._zoomInOptions,
        })
    }

    zoomStopAnimation() {
        if (this._zoomTween) this._zoomTween.kill();
        this._zoomTween = gsap.to(this.light, {
            intensity: this.intensity,
            ...this._zoomInOptions,
        })
    }

    _setDebugger() {

    }


    destroy() {

        if (this.light) {
            this.scene.remove(this.light);
            this.light.dispose();
            this.light = null;
        }
    }
}