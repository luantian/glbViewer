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

    clear() {
        this.ui.controllers.slice().forEach(controller  => controller.destroy());
        this.ui.folders.slice().forEach(folder => folder.destroy());
    }
}