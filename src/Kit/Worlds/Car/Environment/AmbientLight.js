import * as THREE from "three";

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

        this._setAmbientLight();

        if (this.debug.active) {
            this._setDebugger();
        }
    }

    _setAmbientLight() {
        this.light = new THREE.AmbientLight({
            color: 0xffffff,
        });
        this.scene.add(this.light);
    }
    _setDebugger() {

    }
}