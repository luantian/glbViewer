import * as THREE from 'three'

export default class SunLight {
    constructor(context) {

        this.name = 'SunLight';
        this.cnName = '汽车太阳光';
        this.context = context;
        this.scene = context.getScene();
        this.debug = context.getDebug();
        this.resources = context.getResources();

        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);
        this.logger.important('初始化完成');

        this.setSunLight();

        if (this.debug.active) {
            this.setDebugger();
        }

    }

    setSunLight() {
        const width = 0.5;
        const height = 1.2;
        const intensity = 4;
        const y = 0.5;
        const directionToDown = -Math.PI / 2;  // 让光朝下（默认朝-z方向）
        this.light = new THREE.DirectionalLight('#ffffff', 4);
        this.light.castShadow = true;
        this.light.shadow.camera.far = 15;
        this.light.shadow.mapSize.set(1024, 1024);
        this.light.shadow.normalBias = 0.05;
        this.light.position.y = y;
        this.light.lookAt( 0, 0, 0 );

        this.light.rotation.x = directionToDown;


        const planeGeometry = new THREE.PlaneGeometry(width, height, 1, 1);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            map: this.resources.items.startroomLightTexture,
            emissiveIntensity: 5,
            roughness: 0.1,
            metalness: 0.5,
            side: THREE.DoubleSide
        });

        this.lightPlane = new THREE.Mesh(planeGeometry, material);
        this.lightPlane.position.y = y;
        this.lightPlane.rotation.x = directionToDown; // 让光朝下（默认朝-z方向）

        this.scene.add(this.light);
        this.scene.add(this.lightPlane);

    }

    setDebugger() {
        this.folder = this.debug.ui.addFolder('Sun Light');
        this.folder.add(this.light, 'intensity').min(0).max(10).step(0.001).name('Intensity');
        this.folder.add(this.light.position, 'x').min(-5).max(5).step(0.001).name('Position X');
        this.folder.add(this.light.position, 'y').min(-5).max(5).step(0.001).name('Position Y');
        this.folder.add(this.light.position, 'z').min(-5).max(5).step(0.001).name('Position Z');
    }

    destroy() {
        this.scene.remove(this.light);
        this.light = null;
    }
}
