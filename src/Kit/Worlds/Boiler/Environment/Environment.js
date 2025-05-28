import SunLight from './SunLight.js'
import EnvironmentMap from './EnvironmentMap.js'

export default class Environment {
    constructor(context) {

        this.name = '油罐环境';
        this.cnName = 'Environment'
        this.context = context;
        this.sunLight = new SunLight(this.context);
        this.environmentMap = new EnvironmentMap(this.context);
        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);
    }

    destroy() {
        this.logger.warn('资源清理开始');
        this.sunLight.destroy();
        this.environmentMap.destroy();
        this.logger.warn('资源清理完成');
    }

}
