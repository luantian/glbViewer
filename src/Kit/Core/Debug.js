import GUI from 'lil-gui'

export default class Debug
{
    constructor()
    {
        this.active = window.location.hash === '#debug'

        if(this.active)
        {
            this.ui = new GUI()
        }
    }

    getLights(scene) {
        const lights = [];

        scene.traverse((obj) => {
            if (obj.isLight) lights.push(obj);
        });
        return lights;
    }

    getCameras(scene) {
        const cameras = [];

        scene.traverse((obj) => {
            if (obj.isCamera) cameras.push(obj);
        });
        return cameras;
    }

    clear() {
        this.ui.controllers.slice().forEach(controller  => controller.destroy());
        this.ui.folders.slice().forEach(folder => folder.destroy());
    }
}