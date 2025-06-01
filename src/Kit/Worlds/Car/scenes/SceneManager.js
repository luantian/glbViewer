import Scene1 from "./Scene1.js";
import ModelManager from "../models/ModelManager.js";
import EnvironmentManager from "../environments/EnvironmentManager.js";
import UiManager from "../ui/UiManager.js";

export default class SceneManager {
    constructor(context) {

        this.context = context;
        this.current = null;
        this.modelManager = new ModelManager(this.context);
        this.environmentManager = new EnvironmentManager(this.context);
        this.uiManager = new UiManager(this.context);

        const options = {
            uiManager: this.uiManager,
            modelManager: this.modelManager,
            environmentManager: this.environmentManager,
        }

        this.scenes = [new Scene1(context, options)];

        this.context.on('ColorPickerSelect', (color) => {
            this.modelManager.carModel.onSetCarModelColor(color);
        });

        this.context.on('wheel:up', (activeIndex) => {
            console.log('wheel:up', activeIndex);
        });

        this.context.on('wheel:down', (activeIndex) => {
            console.log('wheel:down', activeIndex);
        });
    }

    switchTo(name) {
        if (this.current) {
            this.current.exit();
        }
        this.current = this.scenes[name];
        this.current.enter();
    }

}
