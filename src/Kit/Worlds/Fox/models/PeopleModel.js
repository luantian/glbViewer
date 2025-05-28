// PeopleModel.js
import BaseModel from "../../Bases/BaseModel.js";

export default class PeopleModel extends BaseModel {
    constructor(context) {
        super(context, {
            name: 'peopleModel',
            defaultAnimation: 'Dance'
        });
    }
}