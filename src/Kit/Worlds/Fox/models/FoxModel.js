// FoxModel.js
import BaseModel from "../../Bases/BaseModel.js";

export default class FoxModel extends BaseModel {
    constructor(context) {
        super(context, {
            name: 'foxModel',
            scale: 0.02,
            defaultAnimation: 'Run'
        });

    }
}