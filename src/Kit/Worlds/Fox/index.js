import FoxWorld from './FoxWorld.js';
import FoxStartUp from './FoxStartUp.js';

export default function createFoxScene(context) {
    const world = new FoxWorld(context);
    const startup = new FoxStartUp(context, world);
    return { world, startup };
}
