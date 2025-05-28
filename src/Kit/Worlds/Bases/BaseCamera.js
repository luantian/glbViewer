import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class BaseCamera
{
    constructor(context)
    {
        this.name = 'BaseCamera';
        this.cnName = '相机基类'

        this.context = context;
        this.sizes = context.getSizes();
        this.scene = context.getScene();
        this.canvas = context.getCanvas();

        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);
        this.logger.important('初始化完成')

        this.instance = null;   // 此属性必须在子类中实例化
        this.controls = null;   // 此属性必须在子类中实例化
    }

    resize()
    {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update()
    {
        if (this.controls) {
            this.controls.update()
        }
    }

    destroy() {
        this.logger.warn('资源清理开始');
        if (this.instance) {
            this.scene.remove(this.instance);
        }

        this.controls?.dispose();

        this.context.setCamera(null);
        this.context.setCameraInstance(null);
        this.context.setOrbitControls(null);

        this.instance = null;
        this.controls = null;

        this.logger.warn('资源清理完成');
    }
}