// PluginManager.js
import Cutting from './Cutting/Cutting.js';
import HeatMap from './HeatMap/HeatMap.js';
import ParticlesHeatMap from "./HeatMap/ParticlesHeatMap.js";
import Loading from './Loading/Loading.js'

export default class PluginManager {
    constructor(context) {
        this.name = 'PluginManager';
        this.cnName = '插件管理器';
        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);
        this.context = context;

        // 插件类注册表
        this.pluginConstructors = {
            Cutting,
            HeatMap,
            ParticlesHeatMap,
            Loading,
        };

        // 插件实例缓存
        this.plugins = {};
    }

    /**
     * 获取插件，若未激活则自动实例化
     * @param {string} name 插件名称
     * @param {Object} options 插件初始化参数
     * @returns 插件实例
     */
    getPlugin(name, options = {}) {
        // 已经激活了，直接返回
        if (this.plugins[name]) {
            return this.plugins[name];
        }

        // 获取插件类
        const PluginClass = this.pluginConstructors[name];
        if (!PluginClass) {
            this.logger.error(`插件 "${name}" 未注册`);
            return null;
        }

        // 实例化插件
        try {
            const instance = new PluginClass(this.context, options);
            this.plugins[name] = instance;

            // 可选钩子：插件可定义 onActivate 方法
            if (typeof instance.onActivate === 'function') {
                instance.onActivate();
            }

            this.logger.success(`插件 "${name}" 激活成功`);
            return instance;
        } catch (err) {
            this.logger.error(`插件 "${name}" 激活失败: ${err.message}`);
            return null;
        }
    }

    /**
     * 销毁所有插件
     */
    destroy() {
        for (const key in this.plugins) {
            const plugin = this.plugins[key];
            if (typeof plugin.destroy === 'function') {
                plugin.destroy();
            }
        }
        this.plugins = {};
    }
}
