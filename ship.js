class Ship {
    constructor(length) {
        this.length = length;
        this.timesHit = 0;
        this.sunk = false;
    }

    hit() {
        this.timesHit++;
    }

    isSunk() {
        if (this.timesHit === this.length) {
            this.sunk = true;
            return true;
        } else return false;
    }
}

export { Ship }