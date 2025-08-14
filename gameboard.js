import { emitter } from "./gameController.js";

class Square {
    constructor(x, y, ship = null) {
        this.x = x;
        this.y = y;
        this.ship = ship;
        this.hasBuffer = false;
        this.hasHit = false;
    }
}

class Gameboard {
    constructor(owner, height = 10, width = 10) {
        this.owner = owner;
        this.height = height;
        this.width = width;
        this.grid = Array.from({ length: width }, (_, x) =>
            Array.from({ length: height }, (_, y) => new Square(x, y))
        );
        this.shipList = [];
        this.allSunk = false;
        this.maxShipCount = 10;
    }

    #isInBounds(x, y) {
        return x >= 0 && y >= 0 && x < this.width && y < this.height;
    }

    #validatePlacement(startX, startY, endX, endY, isHorizontal) {
        const coords = [];
        for (let i = 0; i <= (isHorizontal ? endX - startX : endY - startY); i++) {
            const x = isHorizontal ? startX + i : startX;
            const y = isHorizontal ? startY : startY + i;
            if (!this.isValidPlacement(x, y)) {
                throw new Error(`Invalid placement at (${x}, ${y})`);
            }
            coords.push([x, y]);
        }
        return coords;
    }

    #markBuffer(x, y) {
        if (this.#isInBounds(x, y)) {
            this.grid[x][y].hasBuffer = true;
        }
    }

    #setBufferZone(startX, startY, endX, endY, isHorizontal) {
        const adjacents = [];
        if (isHorizontal) {
            for (let x = startX; x <= endX; x++) {
                adjacents.push([x, startY - 1], [x, startY + 1]);
            }
            adjacents.push(
                [startX - 1, startY], [startX - 1, startY - 1], [startX - 1, startY + 1],
                [endX + 1, startY], [endX + 1, startY - 1], [endX + 1, startY + 1]
            );
        } else {
            for (let y = startY; y <= endY; y++) {
                adjacents.push([startX - 1, y], [startX + 1, y]);
            }
            adjacents.push(
                [startX, startY - 1], [startX - 1, startY - 1], [startX + 1, startY - 1],
                [startX, endY + 1], [startX - 1, endY + 1], [startX + 1, endY + 1]
            );
        }
        adjacents.forEach(([x, y]) => this.#markBuffer(x, y));
    }

    isValidAttack(x, y) {
        return this.#isInBounds(x, y) && !this.grid[x][y].hasHit;
    }

    isValidPlacement(x, y, length = 1, isHorizontal = true) {
        for (let i = 0; i < length; i++) {
            const newX = isHorizontal ? x + i : x;
            const newY = isHorizontal ? y : y + i;
            const square = this.#isInBounds(newX, newY) ? this.grid[newX][newY] : null;
            if (!square || square.ship || square.hasBuffer) return false;
        }
        return true;
    }

    placeShip(ship, startX, startY) {
        const endX = ship.isHorizontal ? startX + ship.length - 1 : startX;
        const endY = ship.isHorizontal ? startY : startY + ship.length - 1;
        const coords = this.#validatePlacement(startX, startY, endX, endY, ship.isHorizontal);
        coords.forEach(([x, y]) => this.grid[x][y].ship = ship);
        this.shipList.push(ship);
        this.#setBufferZone(startX, startY, endX, endY, ship.isHorizontal);
    }

    receiveAttack(x, y) {
        const square = this.grid[x][y];
        if (square.hasHit) throw new Error("Attack has already been placed at this square.");

        let result = { hit: false, sunk: false, ship: null };

        if (square.ship) {
            if (!square.ship.isSunk()) {
                square.ship.hit();
                result.hit = true;
                result.ship = square.ship;
                result.sunk = square.ship.isSunk();
            } else {
                throw new Error("Ship has already been sunk.")
            }
        }
        square.hasHit = true;
        return result;
    }

    getRandomValidAttackCoordinates() {
        const valid = [];
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.isValidAttack(x, y)) valid.push({ x, y });
            }
        }
        if (valid.length === 0) throw new Error("No valid attack coordinates left");
        return valid[Math.floor(Math.random() * valid.length)];
    }

    isAllSunk() {
        return this.shipList.every((ship) => ship.isSunk());
    }

    clearBoard() {
        this.shipList = [];
        this.allSunk = false;
        this.grid.forEach(column => {
            column.forEach(square => {
                square.ship = null;
                square.hasBuffer = false;
                square.hasHit = false;
            })
        })
    }
}

export { Gameboard };