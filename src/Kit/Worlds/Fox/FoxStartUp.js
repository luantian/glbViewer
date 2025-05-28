import Floor from './models/Floor.js';
import FoxModel from './models/FoxModel.js';
import Environment from './Environment/Environment.js';
import BaseStartUp from "../Bases/BaseStartUp.js";
import sources from "./sources.js";

export default class FoxStartUp extends BaseStartUp{
    constructor(context, world) {
        super(context, world, sources);
        this.name = 'FoxStartUp';
        this.cnName = '狐狸启动器';
        this.context = context;
        this.world = world;
        this.logger = context.getLogger(`${this.cnName}: ${this.name}`);


    }

    onLoad() {
        this.floor = new Floor(this.context);
        this.foxModel = new FoxModel(this.context);
        this.environment = new Environment(this.context);
    }

    destroy() {
        this.floor.destroy();
        this.environment.destroy();
        super.destroy();
    }
}
