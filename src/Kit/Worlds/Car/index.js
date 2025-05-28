import CarWorld from './CarWorld.js';
import CarStartUp from './CarStartUp.js';

export default function createCarScene(context) {
    const world = new CarWorld(context);
    const startup = new CarStartUp(context, world);
    return { world, startup };
}
