import BaseWorld from '../Bases/BaseWorld.js';
import Camera from './Camera.js';
import Renderer from './Renderer.js';

export default class BoilerWorld extends BaseWorld {
    constructor(context) {
        super(context);
        const camera = new Camera(context);
        const renderer = new Renderer(context);
        this.setCamera(camera);
        this.setRenderer(renderer);
    }

}
