import { Ship } from "./ship.js";

class Square {
    constructor(x, y, ship = null) {
        this.x = x;
        this.y = y;
        this.ship = ship;
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

    #validateCoordinates(startX, startY, endX, endY, isHorizontal) {
        const coordinates = [];
        const start = isHorizontal ? startX : startY;
        const end = isHorizontal ? endX : endY;

        for (let i = start; i <= end; i++) {
            const x = isHorizontal ? i : startX;
            const y = isHorizontal ? startY : i;

            if (!this.isValidPlacement(x, y)) {
                throw new Error(`Invalid placement at (${x}, ${y}).`);
            }

            coordinates.push([x, y]);
        }

        return coordinates;
    }

    isValidPlacement(x, y) {
        if (x >= 0 && y >= 0 && x < this.width && y < this.height && this.grid[x][y].ship == null) {
            return true;
        } else return false;
        //this was throw new Error before, will this cause problems? hee hee hee
    }

    isValidAttack(x, y) {
        if (x >= 0 && y >= 0 && x < this.width && y < this.height && this.grid[x][y].hasHit == false) {
            return true;
        } else return false;
        //this was throw new Error before, will this cause problems? hee hee hee
    }

    placeShip(length, startX, startY, endX, endY) {
        //Check if horizontal or vertical
        const isHorizontal = startY === endY;
        const isVertical = startX === endX;
        if (!isHorizontal && !isVertical) {
            throw new Error("Error: invalid placement.");
        }

        //If starting coordinate is greater than end coordinate, flip them
        if (isHorizontal && startX > endX) {
            [startX, endX] = [endX, startX];
        } else if (isVertical && startY > endY) {
            [startY, endY] = [endY, startY];
        }

        if (isHorizontal && (endX - startX + 1) != length
            || isVertical && (endY - startY + 1) != length) {
            throw new Error("Error: length differs from coordinates.")
        }

        const coordinates = this.#validateCoordinates(startX, startY, endX, endY, isHorizontal);

        //After validating, create and place the new ship
        const newShip = new Ship(length);
        this.shipList.push(newShip);
        coordinates.forEach(([x, y]) => {
            this.grid[x][y].ship = newShip;
        })
    }

    receiveAttack(x, y) {
        // console.log(this.grid[x][y].hasHit);
        if (this.grid[x][y].hasHit === true) {
            throw new Error("Error: Attack has already been placed at this square.");
        }
        //is there a ship there?
        if (this.grid[x][y].ship != null) {
            //is that ship already sunken?
            if (this.grid[x][y].ship.isSunk() == false) {
                this.grid[x][y].ship.hit();
            } else throw new Error("Error: Ship has already been sunk.")
        }
        this.grid[x][y].hasHit = true;
        // console.log(this.grid[x][y].hasHit);
    }

    isAllSunk() {
        return this.shipList.every((ship) => ship.isSunk() === true);
    }
}

export { Gameboard }