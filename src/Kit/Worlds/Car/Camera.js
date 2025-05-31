import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import BaseCamera from "../Bases/BaseCamera.js";
import gsap from "gsap";

export default class Camera extends BaseCamera
{
    constructor(context)
    {
        super(context);
        this.context = context;
        this.sizes = context.getSizes();
        this.scene = context.getScene();
        this.canvas = context.getCanvas();

        this.fov = 35

        this._zoomTween = null;
        this._zoomInOptions = {
            duration: 1.2,
            ease: "power2.out",
        }
        this._zoomOutOptions = {
            duration: 1.2,
            ease: "power2.out",
        }

        this.setInstance()
        this.setControls()
    }

    setInstance()
    {
        this.instance = new THREE.PerspectiveCamera(this.fov, this.sizes.width / this.sizes.height, 0.1, 100);
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

    zoomStartAnimation() {
        if (this._zoomTween) {
            this._zoomTween.kill()
        }
        this._zoomTween = gsap.to(this.instance, {
            fov: this.fov + 5,
            ...this._zoomInOptions,
            onUpdate: () => {
                this.instance.updateProjectionMatrix();
            }
        });
    }

    zoomStopAnimation() {
        if (this._zoomTween) {
            this._zoomTween.kill()
        }
        this._zoomTween = gsap.to(this.instance, {
            fov: this.fov,
            ...this._zoomOutOptions,
            onUpdate: () => {
                this.instance.updateProjectionMatrix();
            }
        });
    }

    destroy() {
        super.destroy()
    }
}