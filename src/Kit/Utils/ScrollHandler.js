export default class ScrollHandler {
    constructor(options) {
        this.listeners = { up: [], down: [] };
        this.lastScrollTime = 0;
        this.throttle = options.throttle || 500;

        this.touchStartY = 0;
        this.touchEndY = 0;

        // 绑定事件
        this.handleWheel = this.handleWheel.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);

        window.addEventListener('wheel', this.handleWheel, { passive: true });
        window.addEventListener('touchstart', this.handleTouchStart, { passive: true });
        window.addEventListener('touchend', this.handleTouchEnd, { passive: true });
    }

    handleWheel(event) {
        if (this.isThrottled()) return;

        const direction = event.deltaY > 0 ? 'down' : 'up';
        this.trigger(direction, event);
    }

    handleTouchStart(event) {
        this.touchStartY = event.changedTouches[0].clientY;
    }

    handleTouchEnd(event) {
        if (this.isThrottled()) return;

        this.touchEndY = event.changedTouches[0].clientY;
        const diffY = this.touchStartY - this.touchEndY;

        if (Math.abs(diffY) > 30) {
            const direction = diffY > 0 ? 'down' : 'up';
            this.trigger(direction, event);
        }
    }

    isThrottled() {
        const now = Date.now();
        if (now - this.lastScrollTime < this.throttle) return true;
        this.lastScrollTime = now;
        return false;
    }

    trigger(direction, event) {
        this.listeners[direction].forEach((cb) => cb(event));
    }

    on(direction, callback) {
        if (this.listeners[direction]) {
            this.listeners[direction].push(callback);
        }
    }

    off(direction, callback) {
        if (this.listeners[direction]) {
            this.listeners[direction] = this.listeners[direction].filter(cb => cb !== callback);
        }
    }

    destroy() {
        window.removeEventListener('wheel', this.handleWheel);
        window.removeEventListener('touchstart', this.handleTouchStart);
        window.removeEventListener('touchend', this.handleTouchEnd);
        this.listeners = { up: [], down: [] };
    }
}
