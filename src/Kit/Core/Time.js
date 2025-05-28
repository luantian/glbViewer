import * as THREE from 'three'
import EventEmitter from './EventEmitter.js'

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
        if (!this.isRunning) return

        this.delta = this.clock.getDelta();
        this.elapsed = this.clock.elapsedTime

        this.trigger('tick')

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
