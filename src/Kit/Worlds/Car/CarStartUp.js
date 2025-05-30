import CarModel from './models/CarModel.js';
import EnvironmentManager from './Environment/EnvironmentManager.js';
import BaseStartUp from "../Bases/BaseStartUp.js";
import sources from "./sources.js";
import Floor from "./models/Floor.js";
import UiManager from "./ui/UiManager.js";
import Tunnel from "./models/Tunnel.js";
import ModelManager from "./models/ModelManager.js";

export default class CarStartUp extends BaseStartUp {
    constructor(context, world) {
        super(context, world, sources);
        this.name = 'CarStartUp';
        this.cnName = '汽车启动器';
        this.context = context;
        this.scene = context.getScene();
        this.world = world;
        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);


    }

    onLoad() {

        this.environmentManager = new EnvironmentManager(this.context);
        this.modelManager = new ModelManager(this.context);
        this.uiManager = new UiManager(this.context);

    }

    onProgress(value) {
        const loadingEl = document.querySelector('.loading-value');
        const loadingWrapper = document.querySelector('.loading-wrapper');
        if (loadingEl) {
            loadingEl.innerHTML = Math.ceil(value * 100)  + '%';
            if (value === 1) {
                // loadingEl.style.opacity = 0;
                loadingWrapper.setAttribute('class', 'loading-wrapper end');
            }
        }
    }


    destroy() {
        this.logger.clear('开始');
        this.environmentManager.destroy();
        this.modelManager.destroy();
        this.uiManager.destroy();
        super.destroy();
        this.logger.clear('结束');
    }
}
