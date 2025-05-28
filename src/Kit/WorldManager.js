// src/WorldManager.js
import Context from './Core/Context.js';
import createFoxScene from './Worlds/Fox/index.js';
import createBoilerScene from './Worlds/Boiler/index.js';
import createCarScene from './Worlds/Car/index.js';

export default class WorldManager {
    constructor() {
        const canvas = document.querySelector('canvas.webgl');
        this.context = new Context({ canvas });

        this.currentWorld = null;
        this.currentStartUp = null;

        this.name = 'WorldManager';
        this.cnName = '世界管理器';
        this.logger = this.context.getLogger(`${this.cnName}: ${this.name}`);

        this.switchTo(createCarScene);
        // this.switchTo(createFoxScene);
        // this.switchTo(createBoilerScene);
    }

    switchTo(createSceneFn) {
        this.logger.update('切换世界');

        this.currentStartUp?.destroy?.();
        this.currentWorld?.destroy?.();

        const { world, startup } = createSceneFn(this.context);
        this.currentWorld = world;
        this.currentStartUp = startup;
    }

    onText() {
        const btn1 = document.querySelector('.btn1');
        const btn2 = document.querySelector('.btn2');
        const btn3 = document.querySelector('.btn3');
        btn1.onclick = () => this.switchTo(createFoxScene);
        btn2.onclick = () => this.switchTo(createCarScene);
        btn3.onclick = () => this.switchTo(createBoilerScene);
    }
}
