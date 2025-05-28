import EnvironmentMap from './EnvironmentMap.js'
import RoofPointLight from "./RoofRectAreaLight.js";
import SunLight from "./SunLight.js";
import AmbientLight from "./AmbientLight.js";

export default class Environment {
    constructor(context) {
        this.name = 'CarEnvironment';
        this.cnName = '汽车环境';
        this.context = context;
        this.ambientLight = new AmbientLight(this.context);
        this.roofLight = new RoofPointLight(this.context);
        // this.environmentMap = new EnvironmentMap(this.context);
        // this.sunLight = new SunLight(this.context);
        // this.roofRectAreaLight = new RoofPointLight(this.context);
        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);
        this.logger.important('初始化完成');
    }

    destroy() {
        // this.roofRectAreaLight.destroy();
        this.environmentMap.destroy();
    }
}
