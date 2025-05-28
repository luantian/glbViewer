import BaseModel from "../../Bases/BaseModel.js";

export default class CarModel extends BaseModel {
    constructor(context) {
        super(context, {
            name: 'carModel',
            isAutoAddScene: true
        });
    }
}