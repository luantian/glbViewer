import ColorPicker from "./ColorPicker.js";
import StateTable from "./StateTable.js";
import TopInfo from "./TopInfo.js";

export default class UiManager {

    constructor(context) {

        this.context = context;

        this.resources = context.getResources();

        this.topInfo = new TopInfo(context);

        this.colorPicker = new ColorPicker(context);

        this.stateTable = new StateTable(context);


    }


    destroy() {
        this.colorPicker.destroy()
        this.stateTable.destroy()

    }

}