import gsap from "gsap";
import * as THREE from "three";
import { CustomWiggle } from 'gsap/CustomWiggle';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);
gsap.registerPlugin(CustomWiggle);
// 创建自定义 wiggle
CustomWiggle.create("carBump", {
    wiggles: 30,
    type: "random", // 或 "random", "uniform"
    amplitudeEase: "power2.inOut"
});

export default class SceneAnimation1 {
    constructor(context) {
        this.name = "SceneAnimation1";
        this.cnName = "场景动画1";
        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);
        this.scene = context.getScene();
        this.resources = context.getResources();
        this.time = context.getTime();
        this.canvas = context.getCanvas();
        this.model = this.resources.items.carModel.scene;
        this.cameraInstance = context.getCameraInstance();
        this.cameraFov = this.cameraInstance.fov
        this.modelPosition = this.model.position.clone();


        this.wheelNames = [
            '3DWheel_Front_L_265',
            '3DWheel_Front_R_330',
            '3DWheel_Rear_L_397',
            '3DWheel_Rear_R_462'
        ];

        this.wheels = [];
        this._zoomTween = null;
        this._zoomInOptions = {
            duration: 1.2,
            ease: "power2.out",
        }
        this._zoomOutOptions = {
            duration: 1.2,
            ease: "power2.out",
        }
        this._rotationTween = null;
        this._rotationInOptions = {
            duration: 3,
            ease: "power2.in",
        }
        this._rotationOutOptions = {
            duration: 3,
            ease: "power4.out",
        }
        this._carFrontTween = null;
        this._carFrontInOptions = {
            duration: 4,
            ease: "carBump",
            yoyo: true,
            repeat: -1,
        }
        this._carFrontOutOptions = {
            duration: 0.4,
            ease: "power4.out",
        }

        this.state = {
            speed: 0,
            maxSpeed: 80,
            accel: 0.4,
            minSpeedThreshold: 0.001,
            direction: false,
            velocityFactor: 0,
            rotationSpeed: 0
        };

        this._mouseDown = this._mouseDown.bind(this);
        this._mouseUp = this._mouseUp.bind(this);
        this._tick = this._tick.bind(this);

        this._traverse();
        this._bindEvents();
        this.time.on('tick', this._tick);

    }

    _traverse() {
        this.wheels = this.wheelNames
            .map(name => this.model.getObjectByName(name))
            .filter(Boolean);
    }

    _bindEvents() {
        window.addEventListener('pointerdown', this._mouseDown);
        window.addEventListener('pointerup', this._mouseUp);
    }

    _mouseDown() {
        this._zoomStartAnimation();
        this._weelStartAnimation();
    }


    _mouseUp() {
        this._zoomStopAnimation();
        this._weelStopAnimation();
    }

    _zoomStartAnimation() {
        this.state.direction = true;
        if (this._zoomTween) {
            this._zoomTween.kill();
        }

        this._zoomTween = gsap.to(this.cameraInstance, {
            fov: this.cameraFov + 5,
            ...this._zoomInOptions,
            onUpdate: () => {
                this.cameraInstance.updateProjectionMatrix();
            }
        });
        const roofRectAreaLightPlane = this.scene.getObjectByName('RoofRectAreaLightPlane');
        if (!roofRectAreaLightPlane.material.transparent) {
            roofRectAreaLightPlane.material.transparent = true;
        }
        this._zoomTween = gsap.to(roofRectAreaLightPlane.material, {
            opacity: 0,
            ...this._zoomInOptions,
            onComplete: () => {
                this._carFrontStartAnimation();
            }
        })
    }

    _zoomStopAnimation() {
        this.state.direction = false;
        if (this._zoomTween) this._zoomTween.kill();
        this._zoomTween = gsap.to(this.cameraInstance, {
            fov: this.cameraFov,
            ...this._zoomOutOptions,
            onUpdate: () => {
                this.cameraInstance.updateProjectionMatrix();
            }
        });
        const roofRectAreaLightPlane = this.scene.getObjectByName('RoofRectAreaLightPlane');
        this._zoomTween = gsap.to(roofRectAreaLightPlane.material, {
            opacity: 1,
            ...this._zoomOutOptions,
        })
        this._carFrontStopAnimation();
    }

    _carFrontStartAnimation() {
        this.state.direction = true;
        if (this._carFrontTween) this._carFrontTween.kill();
        this._carFrontTween = gsap.timeline({ repeat: -1 });
        this._carFrontTween.to(this.model.position, {
            x: this.modelPosition.x + 0.003,
            y: this.modelPosition.y + 0.004,
            z: this.modelPosition.z + 0.004,
            ...this._carFrontInOptions
        })

    }

    _carFrontStopAnimation() {
        this.state.direction = false;
        if (this._carFrontTween) this._carFrontTween.kill();
        this._carFrontTween = gsap.timeline();
        this._carFrontTween.to(this.model.position, {
            x: this.modelPosition.x,
            y: this.modelPosition.y,
            z: this.modelPosition.z,
            ...this._carFrontOutOptions
        })
    }

    _weelStartAnimation() {
        if (this._rotationTween) this._rotationTween.kill();
        // tween 从当前值 -> 匀速值（例如 10）
        this._rotationTween = gsap.to(this.state, {
            rotationSpeed: 800,
            ...this._rotationInOptions,
            onUpdate: (v) => {
                console.log('v1', this.state.rotationSpeed);
            }
        })
    }

    _weelStopAnimation() {
        if (this._rotationTween) this._rotationTween.kill();
        // tween 从当前速度 -> 0
        this._rotationTween = gsap.to(this.state, {
            rotationSpeed: 0,
            ...this._rotationOutOptions,
            onUpdate: (v) => {
                console.log('v2', this.state.rotationSpeed);
            }
        });
    }

    _tick(delta) {
        const rotAmount = this.state.rotationSpeed * delta;
        this.wheels.forEach(wheel => {
            wheel.rotation.x += rotAmount;
        });
    }



    destroy() {
        window.removeEventListener('pointerdown', this._mouseDown);
        window.removeEventListener('pointerup', this._mouseUp);
        this.time.off('tick', this._tick);
    }
}

