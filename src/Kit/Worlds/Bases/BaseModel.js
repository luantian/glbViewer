import * as THREE from 'three';
import Animation from '../../Core/Animation.js';

export default class BaseModel {
    constructor(context, config = {}) {
        this.name = 'BaseModel';
        this.cnName = '模型处理基类';
        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);
        this.logger.important('初始化完成')
        this.context = context;
        this.scene = context.getScene();
        this.resources = context.getResources();
        this.time = context.getTime();
        this.debug = context.getDebug();

        this.resource = null;  // 模型对象

        // 配置项
        this.config = {
            name: 'model',
            scale: 1,
            defaultAnimation: null,
            castShadow: true,
            receiveShadow: false,
            isAutoAddScene: true,
            ...config
        };

        // 初始化
        this.init();
    }

    init() {
        this.resource = this.resources.items[this.config.name];

        if (!this.resource) {
            return this.logger.warn(`${this.config.name} resource not found.`);
        }

        this.model = this.resource.scene;

        console.log(this.model)

        // this.traverseModel();
        this._setScaleAndCenter();
        if (this.config.isAutoAddScene) {
            this.scene.add(this.model);
        }
        this.context.addUpdatable(this);

        if (this.debug.active) {
            this._setDebugger();
        }

    }

    _setScaleAndCenter() {
        // 1. 计算包围盒
        const box = new THREE.Box3().setFromObject(this.model);
        const size = new THREE.Vector3();
        box.getSize(size);
        // 2. 找到最大的边
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim === 0) return;
        // 3. 计算缩放因子
        const scale = this.config.scale / maxDim;
        // 4. 应用缩放
        this.model.scale.setScalar(scale);
        // 5. 可选：居中到原点
        const center = new THREE.Vector3();
        box.getCenter(center);
        this.model.position.sub(center.multiplyScalar(scale));
    }

    traverseModel() {
        // 遍历设置阴影
        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = this.config.castShadow;
                child.receiveShadow = this.config.receiveShadow;
            }
        });
    }

    setCenter() {
        const box = new THREE.Box3().setFromObject(this.model);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        this.model.position.sub(center);
    }

    /*
    * 材质转换
    * */
    convertPhysicalToStandardMaterial() {
        this.model.traverse((child) => {
            if (child.isMesh && child.material) {
                let mat = child.material;

                // 如果是 PhysicalMaterial，就换掉
                if (mat.isMeshPhysicalMaterial) {
                    const newMat = new THREE.MeshStandardMaterial({
                        color: mat.color,
                        map: mat.map || null,
                        normalMap: mat.normalMap || null,
                        metalness: mat.metalness ?? 0.5,
                        roughness: mat.roughness ?? 0.5,
                        transparent: mat.transparent,
                        opacity: mat.opacity,
                        envMap: mat.envMap || null,
                        side: mat.side || THREE.FrontSide,
                    });

                    child.material.dispose(); // 记得释放旧材质
                    child.material = newMat;
                }
            }
        });
    }

    setAnimation() {
        this.animation = new Animation(this.resource);

        // 优先使用配置的默认动画，否则使用第一个动画
        const animationName = this.config.defaultAnimation || this.animation.getFirstAnimationName();
        if (animationName) {
            this.animation.play(animationName);
        }
    }

    _setDebugger() {
        if (this.animation && this.animation.getCount() > 0) {
            const folder = this.debug.ui.addFolder(this.config.name);
            this.animation.setDebugger(folder);
        }
    }


    update() {
        if (this.animation) {
            this.animation.update(this.time.delta);
        }
    }

    destroy() {
        this.logger.warn('资源清理开始');
        // 从场景移除模型
        if (this.model) {
            this.scene.remove(this.model);

            // 清除几何体和材质
            this.model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.geometry?.dispose?.();

                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat?.dispose?.());
                    } else {
                        child.material?.dispose?.();
                    }
                }
            });
        }

        // 清除动画系统
        this.animation?.dispose?.();
        this.animation = null;

        // 从更新列表中移除
        this.context.removeUpdatable(this);

        // 清除调试器 UI（如果有）
        if (this.debug.active) {
            this.debug.clear();
        }

        // 清空引用
        this.model = null;
        this.resource = null;
        this.logger.warn('资源清理完成');
    }

}