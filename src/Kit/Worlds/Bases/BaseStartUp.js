import Resources from '../../Core/Resources.js';

export default class BaseStartUp {
    constructor(context, world, sources = []) {
        this.context = context;
        this.world = world;
        this.plugins = context.getPluginManager?.();

        this.name = 'BaseStartUp';
        this.cnName = '启动器基类';
        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);
        this.logger.important('初始化完成')

        this.resources = new Resources(sources);
        this.context.setResources(this.resources)// 公开给系统使用

        this._loaded = false;

        this.setupResourceListeners();
        this.checkResourceState();

    }

    setupResourceListeners() {
        this.resources.onReady(this.onResourcesReady.bind(this));
        this.resources.onProgress(this.onProgress.bind(this));
        this.resources.onError(this.onError.bind(this));
    }

    checkResourceState() {
        if (this.resources.isReady()) {
            this.onResourcesReady();
        }
    }

    onResourcesReady() {
        if (this._loaded) return;
        this._loaded = true;

        this.logger.success?.('所有资源加载完成');

        try {
            this.onLoad?.(); // ✅ 必须由子类实现
        } catch (e) {
            this.logger.error('资源加载后执行失败: 可能子StartUp类没有定义onLoad方法', e);
        }
    }

    onProgress(value) {
        this.logger.info('资源加载进度:', value);
    }

    onError({ source, error }) {
        this.logger.error(`资源加载失败: ${source?.name}`, error);
    }

    destroy() {
        this.logger.warn('资源清理开始');

        this.resources.off('ready');
        this.resources.off('progress');
        this.resources.off('error');

        this.plugins?.destroy?.();
        this.logger.warn('资源清理完成');

    }
}
