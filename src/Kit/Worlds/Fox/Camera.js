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
        this.instance = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.1, 1000);
        this.instance.position.set(6, 4, 8)
        this.scene.add(this.instance)
        this.context.setCamera(this);
        this.context.setCameraInstance(this.instance);
    }

    setControls()
    {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true;
        this.context.setOrbitControls(this.controls);
    }

    destroy() {
        super.destroy()
    }
}