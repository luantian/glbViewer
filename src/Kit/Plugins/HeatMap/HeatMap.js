import * as THREE from "three";

export default class HeatMap {
    constructor(context, options) {
        this.name = 'HeatMap';
        this.cnName = '热力图插件'
        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);
        this.logger.info('开始实例化')

        this.context = context;
        this.data = options?.data || [];
        this.init();
        this.logger.info('实例化成功')

        this.init();

    }

    init() {

    }

    update(data = []) {
        this.logger.info('数据开始更新', this.data)
    }

    destroy() {
        this.logger.warn('开始注销');
    }


}