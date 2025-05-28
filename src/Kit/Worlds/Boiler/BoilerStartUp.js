import sources from './sources.js';
import BaseStartUp from '../Bases/BaseStartUp.js';
import FengdongModel from './models/FengdongModel.js';
import Environment from './Environment/Environment.js';
import Mock from '../../Utils/Mock.js';

export default class BoilerStartUp extends BaseStartUp {
    constructor(context, world) {
        super(context, world, sources);
        this.name = 'BoilerStartUp';
        this.cnName = '油罐启动器';
        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);

        this.heatMapData = Mock.generateBatchWaterData(100);
        this._heatMapClickHandler = this.handleHeatMapClick.bind(this);
    }

    onLoad() {
        this.environment = new Environment(this.context);
        this.fengdongModel = new FengdongModel(this.context);

        this.cutting = this.plugins.getPlugin('Cutting');
        this.heatMap = this.plugins.getPlugin('ParticlesHeatMap', {
            data: this.heatMapData,
            tooltipFormatter: this.formatTooltip,
        });

        this.heatMap.on('pointerdown', this._heatMapClickHandler);

    }

    destroy() {
        this.logger.info('释放资源__开始');
        super.destroy();
        this.environment?.destroy?.();
        this.fengdongModel?.destroy?.();
        this.cutting.destroy();
        this.heatMap?.off?.('pointerdown', this._heatMapClickHandler);
        this.logger.info('释放资源__结束');
    }

    handleHeatMapClick({ index, data, position }) {
        const params = { ...data, worldPosition: position };
        this.logger.info(`点击了第 ${index} 个粒子`, params);
    }

    formatTooltip(data) {
        return `
            <div class="__particles_heat_map">
                <div class="__particles_label">${data.label}</div>
                <div class="__particles_value">温度：${data.temperature.toFixed(1)} ${data.unit}</div>
                <div class="__particles_value">状态：${['危险', '警告', '安全'][data.status]}</div>
                <div class="__particles_value">危险阈值：${data.dangerThreshold} ${data.unit}</div>
            </div>
        `;
    }
}
