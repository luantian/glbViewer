import Floor from "./Floor.js";
import CarModel from "./CarModel.js";
import Tunnel from "./Tunnel.js";


export default class ModelManager {

    constructor(context) {
        this.name = 'ModelManager';
        this.cnName = '模型管理器';
        this.context = context;
        this.scene = context.getScene();

        this.carModel = new CarModel(this.context);
        this.floor = new Floor(this.context);
        this.tunnel = new Tunnel(this.context);
        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);

    }

    destroy() {
        this.carModel.destroy();
        this.floor.destroy();
        this.tunnel.destroy()
    }

}