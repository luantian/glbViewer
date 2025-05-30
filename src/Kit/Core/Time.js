import * as THREE from 'three'
import EventEmitter from './EventEmitter.js'
import Stats from 'stats.js'

var stats = new Stats();
stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

export default class Time extends EventEmitter {
    constructor() {
        super()

        this.clock = new THREE.Clock()
        this.elapsed = 0
        this.delta = 0

        this.isRunning = false
        this.rafId = null

        this.tick = this.tick.bind(this)
        this.start()
    }

    start() {
        this.isRunning = true
        this.clock.start()
        this.rafId = window.requestAnimationFrame(this.tick)
    }

    tick() {
        stats.begin();

        if (!this.isRunning) return


        this.delta = this.clock.getDelta();
        this.elapsed = this.clock.elapsedTime

        this.trigger('tick', this.delta, this.elapsed)

        stats.end();

        this.rafId = window.requestAnimationFrame(this.tick)
    }

    pause() {
        this.isRunning = false
        window.cancelAnimationFrame(this.rafId)
    }

    resume() {
        if (!this.isRunning) {
            this.isRunning = true
            this.clock.getDelta() // 清除大间隔
            this.rafId = window.requestAnimationFrame(this.tick)
        }
    }

}
