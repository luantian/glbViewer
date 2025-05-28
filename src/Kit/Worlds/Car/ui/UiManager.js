import ColorPicker from "./ColorPicker.js";
import StateTable from "./StateTable.js";

export default class UiManager {

    constructor(context) {

        this.colorPicker = new ColorPicker(context);

        this.stateTable = new StateTable(context);

    }


}