import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import BaseCamera from "../Bases/BaseCamera.js";

export default class Camera extends BaseCamera
{
    constructor(context)
    {
        super(context);
        this.context = context;
        this.sizes = context.getSizes();
        this.scene = context.getScene();
        this.canvas = context.getCanvas();

        this.setInstance()
        this.setControls()
    }

    setInstance()
    {
        this.instance = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.1, 100);
        this.instance.position.set(1.6, 0, 0);
        this.instance.lookAt(new THREE.Vector3(0, 0, 0));

        this.scene.add(this.instance)
        this.context.setCamera(this);
        this.context.setCameraInstance(this.instance);
    }

    setControls()
    {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;  // 阻尼系数（默认 0.05，值越小越平滑）
        /*this.controls.minPolarAngle = Math.PI / 2.4;      // 30°（限制最低视角）
        this.controls.maxPolarAngle = Math.PI / 2; // 150°（限制最高视角）*/
        this.controls.rotateSpeed = 0.6;
        this.controls.enablePan = false;
        this.controls.enableZoom = true;
        // this.controls.screenSpacePanning = false;
        this.context.setOrbitControls(this.controls);
    }

    destroy() {
        super.destroy()
    }
}