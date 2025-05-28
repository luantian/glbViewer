import BoilerWorld from './BoilerWorld.js';
import BoilerStartUp from './BoilerStartUp.js';

export default function createBoilerScene(context) {
    const world = new BoilerWorld(context);
    const startup = new BoilerStartUp(context, world);
    return { world, startup };
}
