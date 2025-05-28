import * as THREE from 'three'

export default class SunLight {
    constructor(context) {
        this.scene = context.getScene();
        this.debug = context.getDebug();

        this.setSunLight();

        if (this.debug.active) {
            this.setDebugger();
        }
    }

    setSunLight() {
        this.sunLight = new THREE.DirectionalLight('#ffffff', 4);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.camera.far = 15;
        this.sunLight.shadow.mapSize.set(1024, 1024);
        this.sunLight.shadow.normalBias = 0.05;
        this.sunLight.position.set(3.5, 2, -1.25);
        this.scene.add(this.sunLight);
    }

    setDebugger() {
        this.folder = this.debug.ui.addFolder('Sun Light');
        this.folder.add(this.sunLight, 'intensity').min(0).max(10).step(0.001).name('Intensity');
        this.folder.add(this.sunLight.position, 'x').min(-5).max(5).step(0.001).name('Position X');
        this.folder.add(this.sunLight.position, 'y').min(-5).max(5).step(0.001).name('Position Y');
        this.folder.add(this.sunLight.position, 'z').min(-5).max(5).step(0.001).name('Position Z');
    }

    destroy() {
        this.scene.remove(this.sunLight);
        this.sunLight = null;

        if (this.folder?.destroy) {
            this.folder.destroy();
        }
    }

}
