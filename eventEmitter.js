class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    off(event, listener) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(fn => fn !== listener);
    }

    emit(event, ...args) {
        if (!this.events[event]) return;
        this.events[event].forEach(fn => fn(...args));
    }
}

export { EventEmitter };
