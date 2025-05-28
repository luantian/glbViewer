import * as THREE from "three";

export default class Tunnel {

    constructor(context) {
        this.name = 'CarTunnel';
        this.cnName = '汽车隧道';
        this.context = context;
        this.scene = context.getScene();
        this.sizes = context.getSizes();
        this.debug = context.getDebug();
        this.resources = context.getResources();

        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);
        this.logger.important('初始化完成');

        this._setTunnel();
        if (this.debug.active) {
            this._setDebugger();
        }

    }

    _setTunnel() {

        this.tunnelParams = {
            radiusTop: 0.2,
            radiusBottom: 3.5,
            height: 10,
            radialSegments: 32,
            heightSegments: 1,
            openEnded: false
        }


        const geometry = new THREE.CylinderGeometry(
            this.tunnelParams.radiusTop,
            this.tunnelParams.radiusBottom,
            this.tunnelParams.height,
            this.tunnelParams.radialSegments,
            this.tunnelParams.heightSegments,
            this.tunnelParams.openEnded
        );
        const material = new THREE.MeshStandardMaterial({
            color: 0x000000,
            side: THREE.DoubleSide
        });

        this.tunnel = new THREE.Mesh(geometry, material);
        this.tunnel.rotateX(Math.PI * 0.5);

        this.scene.add(this.tunnel);

    }

    tick() {
        console.log('tick');
    }

    _setDebugger() {
        this.folder = this.debug.ui.addFolder(this.cnName);
        this.folder.add(this.tunnel.rotation, 'x').min(0).max(Math.PI * 2).step(0.1).name('rotationX');
        this.folder.add(this.tunnel.rotation, 'y').min(0).max(Math.PI * 2).step(0.1).name('rotationY');
        this.folder.add(this.tunnel.rotation, 'z').min(0).max(Math.PI * 2).step(0.1).name('rotationZ');
    }
}
