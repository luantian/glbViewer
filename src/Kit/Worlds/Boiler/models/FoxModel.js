import BaseModel from "../../Bases/BaseModel.js";

export default class FoxModel extends BaseModel {
    constructor(context) {
        super(context, {
            name: 'foxModel',
            scale: 0.02,
            defaultAnimation: 'Run'
        });

        // 狐狸模型特有的逻辑可以在这里添加
    }
}