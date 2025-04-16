class Ship {
    constructor(length, isHorizontal) {
        this.length = length;
        this.isHorizontal = isHorizontal;
        this.timesHit = 0;
        this.sunk = false;
    }

    hit() {
        this.timesHit++;
        if (this.isSunk()) {
            this.sunk = true;
        }
    }

    isSunk() {
        if (this.timesHit === this.length) {
            return true;
        } else return false;
    }
}

export { Ship }