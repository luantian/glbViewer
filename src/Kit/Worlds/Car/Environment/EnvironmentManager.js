import EnvironmentMap from './EnvironmentMap.js'
import RoofRectAreaLight from "./RoofRectAreaLight.js";
import SunLight from "./SunLight.js";
import AmbientLight from "./AmbientLight.js";

export default class EnvironmentManager {
    constructor(context) {
        this.name = 'CarEnvironment';
        this.cnName = '环境管理器';
        this.context = context;
        this.ambientLight = new AmbientLight(this.context);
        // this.environmentMap = new EnvironmentMap(this.context);
        // this.sunLight = new SunLight(this.context);
        this.roofRectAreaLight = new RoofRectAreaLight(this.context);
        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);
        this.logger.important('初始化完成');
    }

    destroy() {
        if (this.roofRectAreaLight) {
            this.roofRectAreaLight.destroy();
        }
        if (this.environmentMap) {
            this.environmentMap.destroy();
        }
        if (this.sunLight) {
            this.sunLight.destroy();
        }
        if (this.ambientLight) {
            this.ambientLight.destroy();
        }
    }
}
