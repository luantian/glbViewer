import SunLight from './SunLight.js'
import EnvironmentMap from './EnvironmentMap.js'

export default class Environment {
    constructor(context) {
        this.name = 'FoxEnvironment';
        this.cnName = '狐狸环境';

        this.context = context;
        this.sunLight = new SunLight(this.context);
        this.environmentMap = new EnvironmentMap(this.context);

        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);
        this.logger.important('初始化完成');
    }

    destroy() {
        this.sunLight.destroy();
        this.environmentMap.destroy();
    }
}
