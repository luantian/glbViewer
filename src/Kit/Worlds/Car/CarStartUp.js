import EnvironmentManager from './Environment/EnvironmentManager.js';
import BaseStartUp from "../Bases/BaseStartUp.js";
import sources from "./sources.js";
import UiManager from "./ui/UiManager.js";
import ModelManager from "./models/ModelManager.js";
import SceneAnimation1 from "./SceneAnimations/SceneAnimation1.js";

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

        this.modelManager = new ModelManager(this.context);
        this.environmentManager = new EnvironmentManager(this.context);
        this.uiManager = new UiManager(this.context);

        this.context.on('ColorPickerSelect', (color) => {
            this.modelManager.carModel.onSetCarModelColor(color);
        });

        this.sceneAnimation1 = new SceneAnimation1(this.context, {
            uiManager: this.uiManager,
            modelManager: this.modelManager,
            environmentManager: this.environmentManager,
        });

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
