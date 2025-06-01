import BaseModel from "../../Bases/BaseModel.js";
import * as THREE from "three";
import gsap from "gsap";
import MaterialUtils from "../../../Utils/MaterialUtils.js";
import CarAnimationController from "./CarAnimationController.js";

export default class CarModel extends BaseModel {
    constructor(context) {
        super(context, {
            name: 'carModel',
            isAutoAddScene: true
        });

        this.context = context;
        this.scene = context.getScene();
        this.rendererInstance = context.getRendererInstance();

        // === 模型资源 ===
        this.carModel = context.resources.items.carModel;
        this.model = this.carModel?.scene;

        if (!this.model) {
            console.error("[CarModel] model is undefined");
            return;
        }

        // === 初始位置 ===
        this.modelPosition = this.model.position.clone();

        // === 改色相关 ===
        this.disColorPartNames = [
            'Object_301', 'Object_202', 'Object_217', 'Object_124', 'Object_241',
            'Object_85', 'Object_142', 'Object_151', 'Object_184', 'Object_172', 'Object_367'
        ];
        this.disColorParts = [];

        // === 反射部件 ===
        this.reflectorModelNames = [
            'Object_301', 'Object_217', 'Object_367', 'Object_184', 'Object_241', 'Object_124',
            'Object_202', 'Object_172', 'Object_142', 'Object_598', 'Object_792',
            'Object_686', 'Object_489', 'Object_53', 'Object_22'
        ];
        this.reflectorModels = [];

        // === 初始化 ===
        this._setupMaterials();
        this._setupDisColorParts();
        this._setupEnvReflection();
        this._setupReflectors();

        // ✅ 创建动画控制器（model必须在它前面初始化）
        this.animationController = new CarAnimationController(this.model, this.context);
    }

    _setupMaterials() {
        MaterialUtils.convertPhysicalToStandard(this.model);
    }

    _setupDisColorParts() {
        this.model.traverse(child => {
            if (child instanceof THREE.Mesh && this.disColorPartNames.includes(child.name)) {
                this.disColorParts.push(child);
            }
        });
    }

    _setupReflectors() {
        this.reflectorModels = this.reflectorModelNames
            .map(name => {
                const obj = this.model.getObjectByName(name);
                console.log('this.cubeRenderTarget?.texture', this.cubeRenderTarget);
                if (obj?.material) obj.material.envMap = this.cubeRenderTarget?.texture;
                return obj;
            })
            .filter(Boolean);
    }

    _setupEnvReflection() {
        this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
            format: THREE.RGBAFormat,
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter
        });
        this.cubeCamera = new THREE.CubeCamera(0.1, 100, this.cubeRenderTarget);
        this.scene.add(this.cubeCamera);
    }

    // === 改色 ===
    onSetCarModelColor(color) {
        this.disColorParts.forEach(part => {
            part.material.metalness = 0.1;
            gsap.to(part.material.color, {
                r: color.r, g: color.g, b: color.b, duration: 0.4
            });
        });
    }

    // === 动画接口 ===
    play(name) {
        this.animationController?.play(name);
    }

    stop(name) {
        this.animationController?.stop(name);
    }

    // === 每帧更新 ===
    tick({ delta, elapsed }) {
        this.animationController?.tick(delta);
        if (this.model) {
            this.model.visible = false;
            this.cubeCamera.position.copy(this.model.position);
            this.cubeCamera.update(this.rendererInstance, this.scene);
            this.model.visible = true;
        }

        super.tick({ delta, elapsed });
    }
}
