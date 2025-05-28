import EventEmitter from './EventEmitter.js'

export default class Sizes extends EventEmitter
{
    constructor()
    {
        super()

        this.width = window.innerWidth
        this.height = window.innerHeight
        this.pixelRatio = Math.min(window.devicePixelRatio, 2)

        this.orientation = this.getOrientation();

        this.enabledResize = true;


        // Resize event
        window.addEventListener('resize', () =>
        {

            if (this.enabledResize) {
                console.log('width', this.width);
                console.log('height', this.height);
                this.width = window.innerWidth
                this.height = window.innerHeight
            }

            this.pixelRatio = Math.min(window.devicePixelRatio, 2)
            this.trigger('resize');
        })
    }

    /**
     * false => 竖屏    true => 横屏
     * @returns {boolean}
     */
    getOrientation() {
        return window.innerWidth >= window.innerHeight;
    }

}