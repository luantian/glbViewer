import CarModel from './models/CarModel.js';
import Environment from './Environment/Environment.js';
import BaseStartUp from "../Bases/BaseStartUp.js";
import sources from "./sources.js";
import Floor from "./models/Floor.js";
import UiManager from "./ui/UiManager.js";
import Tunnel from "./models/Tunnel.js";

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


        this.carModel = new CarModel(this.context);
        this.environment = new Environment(this.context);
        this.floor = new Floor(this.context);
        this.Tunnel = new Tunnel(this.context);

        this.uiManager = new UiManager(this.context);
        this.context.setUiManager(this.uiManager);

    }

    onProgress(value) {
        const loadingEl = document.querySelector('.loading-value');
        const loadingWrapper = document.querySelector('.loading-wrapper');
        if (loadingEl) {
            loadingEl.innerHTML = Math.ceil(value * 100)  + '%';
            if (value == 1) {
                // loadingEl.style.opacity = 0;
                loadingWrapper.setAttribute('class', 'loading-wrapper end');
            }
        }
    }


    destroy() {
        this.logger.clear('开始');
        this.carModel.destroy();
        this.environment.destroy();
        this.scrollHandler.destroy();
        super.destroy();
        this.logger.clear('结束');
    }
}
