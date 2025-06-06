import * as THREE from "three";

import vertexShader from '../shaders/tunnel/vertex.glsl'
import fragmentShader from '../shaders/tunnel/fragment.glsl'


export default class Tunnel {

    constructor(context) {
        this.name = 'CarTunnel';
        this.cnName = '汽车隧道';
        this.context = context;
        this.scene = context.getScene();
        this.sizes = context.getSizes();
        this.debug = context.getDebug();
        this.resources = context.getResources();
        this.time = context.getTime();

        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);
        this.logger.important('初始化完成');

        this.speed = 0;
        this.offset = 0;
        this.alpha = 0;
        this._setTunnel();
        if (this.debug.active) {
            this._setDebugger();
        }


        this.context.on('Tunnel:rotationSpeed', (speed) => {
            this.speed = speed
        });

        this.context.addUpdatable(this);

    }

    _setTunnel() {

        this.tunnelParams = {
            radiusTop: 2,
            radiusBottom: 2,
            height: 100,
            radialSegments: 64,
            heightSegments: 1,
            openEnded: true
        }


        const geometry = new THREE.CylinderGeometry(
            this.tunnelParams.radiusTop,
            this.tunnelParams.radiusBottom,
            this.tunnelParams.height,
            this.tunnelParams.radialSegments,
            this.tunnelParams.heightSegments,
            this.tunnelParams.openEnded
        );

        // const geometry = new THREE.CapsuleGeometry(1, 100, 2, 4)

        this.flyLightTexture = this.resources.items.flyLightTexture;
        // this.flyLightTexture.rotation = Math.PI / 2;
        // // this.flyLightTexture.center.set(0.5, 0.5); // 设置中心点为中间，否则会绕左下角旋转
        // this.flyLightTexture.wrapS = THREE.RepeatWrapping;
        // this.flyLightTexture.wrapT = THREE.RepeatWrapping;
        // this.flyLightTexture.repeat.set(1, 1); // 在高度方向重复5次
        /*this.material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: this.flyLightTexture,
            side: THREE.BackSide,
            transparent: true,
            alphaTest: 0.5,
        });*/

        this.material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                uResolution: new THREE.Uniform(new THREE.Vector2(this.sizes.width * this.sizes.pixelRatio, this.sizes.height * this.sizes.pixelRatio)),
                uTime: new THREE.Uniform(0),
                uOffset: new THREE.Uniform(0),
                uTexture: new THREE.Uniform(this.flyLightTexture),
                uAlpha: new THREE.Uniform(0),
                fogColor: { value: new THREE.Color(0xffff00) },
            },
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false, // optional，避免透明层互相遮挡
        })

        this.tunnel = new THREE.Mesh(geometry, this.material);
        this.tunnel.rotateX(Math.PI * 0.5);

        this.scene.add(this.tunnel);

    }

    showStartAnimation() {

    }

    hideStartAnimation() {

    }

    tick({ delta, elapsed }) {
        if (!this.speed) this.speed = 0;
        this.offset += delta * this.speed * 0.006;
        this.material.uniforms.uTime.value = delta;
        this.material.uniforms.uOffset.value = this.offset;
        this.material.uniforms.uAlpha.value = this.speed / 300;
        // this.flyLightTexture.offset.x = this.offset;
    }

    _setDebugger() {
        this.folder = this.debug.ui.addFolder(this.cnName);
        this.folder.add(this.tunnel.rotation, 'x').min(0).max(Math.PI * 2).step(0.1).name('rotationX');
        this.folder.add(this.tunnel.rotation, 'y').min(0).max(Math.PI * 2).step(0.1).name('rotationY');
        this.folder.add(this.tunnel.rotation, 'z').min(0).max(Math.PI * 2).step(0.1).name('rotationZ');
    }

    destroy() {

    }
}
