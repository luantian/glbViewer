import * as THREE from "three";

export default class BaseWorld {
    constructor(context) {
        this.name = 'BaseWorld';
        this.cnName = '世界基类'
        this.context = context;
        this.scene = context.getScene();
        this.sizes = context.getSizes();
        this.time = context.getTime();
        this.debug = context.getDebug();
        this.logger = context.getLogger(`${ this.cnName }: ${ this.name }`);
        this.logger.important('初始化完成')

        this.orbitControls = context.getOrbitControls();
        this.cameraInstance = context.getCameraInstance();
        this.rendererInstance = context.getRendererInstance();
        this.updatables = context.getUpdatables();



        this.camera = null;
        this.renderer = null;

        this.setHelper();

        this.sizes.on('resize', () => this.resize());
        this.time.on('tick', () => this.update());

    }

    setHelper() {
        this.axesHelper = new THREE.AxesHelper(6);
        this.scene.add(this.axesHelper);
    }

    setRenderer(renderer) {
        this.renderer = renderer;
    }

    setCamera(camera) {
        this.camera = camera;
    }

    resize() {
        this.camera?.resize?.();
        this.renderer?.resize?.();
    }

    update() {
        this.camera?.update?.();
        for (const obj of this.updatables) {
            obj.update?.();
        }
        this.renderer?.update?.();
    }

    destroy() {
        this.logger.clear('开始');
        this.sizes.off('resize');
        this.time.off('tick');
        for (const obj of this.updatables) obj.destroy?.();

        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                // 销毁几何体
                child.geometry?.dispose?.();
                // 销毁材质（兼容数组）
                if (Array.isArray(child.material)) {
                    for (const mat of child.material) {
                        mat?.dispose?.();
                    }
                } else {
                    child.material?.dispose?.();
                }
            }
        });

        this.orbitControls?.dispose();
        this.rendererInstance?.dispose();
        this.camera.destroy();
        this.renderer.destroy();
        if (this.debug.active) {
            this.debug.clear();
        }

        this.logger.clear('完成');
    }

    addModel(model) {
        if (!model) return;
        if (model instanceof THREE.Object3D) {
            this.scene.add(model);
        } else if (model.object3D instanceof THREE.Object3D) {
            this.scene.add(model.object3D);
        } else {
            this.logger.warn('不支持的模型类型', model);
        }
    }
}
