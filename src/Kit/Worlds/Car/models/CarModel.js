import BaseModel from "../../Bases/BaseModel.js";
import * as THREE from "three";
import gsap from "gsap";

export default class CarModel extends BaseModel {
    constructor(context) {
        super(context, {
            name: 'carModel',
            isAutoAddScene: true
        });

        this.context = context;

        this.scene = context.getScene();
        this.rendererInstance = context.getRendererInstance();
        this.carModel = this.resources.items.carModel;
        this.model = this.carModel.scene;
        this.time = context.getTime();

        this.cubeRenderTarget = null;


        //'Object_355', 'Object_331'
        this.disColorPartNames = [
            'Object_301', 'Object_202', 'Object_217', 'Object_124', 'Object_241', 'Object_85', 'Object_142', 'Object_151', 'Object_184', 'Object_172',
            'Object_367'
        ];  // 需要手动添加了

        this.disColorParts = [];

        this.modelPosition = this.model.position.clone();

        this.cubeCamera = null;

        this.wheelNames = [
            '3DWheel_Front_L_265',
            '3DWheel_Front_R_330',
            '3DWheel_Rear_L_397',
            '3DWheel_Rear_R_462'
        ];
        this.wheels = [];

        this.reflectorModelNames = [
            'Object_301', 'Object_217', 'Object_367', 'Object_184', 'Object_241', 'Object_124', 'Object_202', 'Object_172',
            'Object_142', 'Object_598', 'Object_792', 'Object_686', 'Object_489', 'Object_53', 'Object_22'
        ]

        this.reflectorModels = [];

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
            animationActive: false,
            velocityFactor: 0,
            rotationSpeed: 0
        };

        this.makeCubeRender();

        this.setAnimation();

        this.convertPhysicalToStandardMaterial();

        this._queryDisColorParts();

        this._traverse();
        this.time.on('tick', this._tick.bind(this));


    }


    _queryDisColorParts() {
        this.carModel.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (this.disColorPartNames.includes(child.name)) {
                    this.disColorParts.push(child);
                }
            }
        });
    }

    onSetCarModelColor(color) {
        this.disColorParts.forEach(item => {
            item.material.metalness = 0.1;
            // 动画过渡颜色
            gsap.to(item.material.color, {
                r: color.r,
                g: color.g,
                b: color.b,
                duration: 0.4
            });
        })
    }

    carFrontStartAnimation() {
        if (this._carFrontTween) this._carFrontTween.kill();
        this._carFrontTween = gsap.timeline({ repeat: -1 });
        this._carFrontTween.to(this.model.position, {
            x: this.modelPosition.x + 0.003,
            y: this.modelPosition.y + 0.004,
            z: this.modelPosition.z + 0.004,
            ...this._carFrontInOptions
        })

    }

    carFrontStopAnimation() {
        if (this._carFrontTween) this._carFrontTween.kill();
        this._carFrontTween = gsap.timeline();
        this._carFrontTween.to(this.model.position, {
            x: this.modelPosition.x,
            y: this.modelPosition.y,
            z: this.modelPosition.z,
            ...this._carFrontOutOptions
        })
    }

    wheelStartAnimation() {
        if (this._rotationTween) this._rotationTween.kill();
        this.state.animationActive = true;
        // tween 从当前值 -> 匀速值（例如 10）
        this._rotationTween = gsap.to(this.state, {
            rotationSpeed: 300,
            ...this._rotationInOptions,
            onUpdate: () => {
                this.context.trigger('Tunnel:rotationSpeed', this.state.rotationSpeed);
            }
        })
    }

    wheelStopAnimation() {
        if (this._rotationTween) this._rotationTween.kill();

        // tween 从当前速度 -> 0
        this._rotationTween = gsap.to(this.state, {
            rotationSpeed: 0,
            ...this._rotationOutOptions,
            onUpdate: () => {
                this.context.trigger('Tunnel:rotationSpeed', this.state.rotationSpeed);
            },
            onComplete: () => {
                this.state.animationActive = false;
            }
        });
    }

    makeCubeRender() {
        // 创建 cube camera 和 render target
        this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
            format: THREE.RGBAFormat,
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter
        });
        this.cubeCamera = new THREE.CubeCamera(0.1, 100, this.cubeRenderTarget);
        this.scene.add(this.cubeCamera);
    }

    _traverse() {
        this.wheels = this.wheelNames
            .map(name => this.model.getObjectByName(name))
            .filter(Boolean);

        this.reflectorModels = this.reflectorModelNames
            .map(name => {
                const item = this.model.getObjectByName(name)
                // item.material.color = new THREE.Color('orange');
                item.material.envMap = this.cubeRenderTarget.texture;
            })
            .filter(Boolean);
    }

    _tick(delta) {
        if (!this.state.animationActive) return;
        const rotAmount = this.state.rotationSpeed * delta;
        this.wheels.forEach(wheel => {
            wheel.rotation.x += rotAmount;
        });
        if (this.model) {
            this.model.visible = false; // 隐藏自己避免反射自己
            this.cubeCamera.position.copy(this.model.position);
            this.cubeCamera.update(this.rendererInstance, this.scene);
            this.model.visible = true; // 隐藏自己避免反射自己
        }
    }

}