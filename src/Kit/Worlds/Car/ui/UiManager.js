import ColorPicker from "./ColorPicker.js";
import StateTable from "./StateTable.js";
import SceneAnimation1 from "./SceneAnimation1.js";
import TopInfo from "./TopInfo.js";

export default class UiManager {

    constructor(context) {

        this.logo = new TopInfo(context);

        this.colorPicker = new ColorPicker(context);

        this.stateTable = new StateTable(context);

        this.sceneAnimation1 = new SceneAnimation1(context);

    }

    destroy() {
        this.colorPicker.destroy()
        this.stateTable.destroy()
        this.sceneAnimation1.destroy()
    }

}