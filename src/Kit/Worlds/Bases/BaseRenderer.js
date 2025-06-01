import * as THREE from 'three'

export default class BaseRenderer
{
    constructor(context)
    {
        this.name = 'BaseRenderer';
        this.cnName = '渲染器基类'
        this.context = context;
        this.canvas = context.getCanvas();
        this.sizes = context.getSizes()
        this.scene = context.getScene()
        this.cameraInstance = context.getCameraInstance();
        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);
        this.logger.important('初始化完成')

        this.instance = null;   // 子类必须实现初始化


    }

    resize()
    {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.outputColorSpace = THREE.SRGBColorSpace; // 设置为 sRGB 颜色空间
        this.instance.setPixelRatio(this.sizes.pixelRatio)
    }

    update()
    {
        if (this.scene && this.cameraInstance && this.instance) {
            this.instance.render(this.scene, this.cameraInstance)
        } else {
            console.error('场景/相机/渲染器/不存在');
        }
    }

    destroy() {
        this.logger.warn('资源清理开始');

        // 清理 WebGLRenderer 本体
        if (this.instance) {
            this.instance.dispose?.();

            // 选做：WebGL 上下文清理（更彻底，慎用）
            /*const gl = this.instance.getContext?.();
            gl?.getExtension?.('WEBGL_lose_context')?.loseContext?.();*/
        }

        // 清除 context 引用（可选）
        this.context.setRenderer(null);
        this.context.setRendererInstance(null);

        // 清除自身引用
        this.instance = null;
        this.logger.warn('资源清理完成');
    }

}

