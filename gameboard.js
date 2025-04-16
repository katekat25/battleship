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

    validateCoordinates(startX, startY, endX, endY, isHorizontal) {
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

    #isInBounds(x, y) {
        return x >= 0 && y >= 0 && x < this.width && y < this.height;
    }

    isValidPlacement(x, y, length = 1, isHorizontal = true) {
        for (let i = 0; i < length; i++) {
            const newX = isHorizontal ? x + i : x;
            const newY = isHorizontal ? y : y + i;
            if (!this.#isInBounds(newX, newY) || this.grid[newX][newY].ship !== null ||this.grid[newX][newY].hasBuffer == true) {
                return false;
            }
        }
        return true;
    }

    isValidAttack(x, y) {
        if (!this.#isInBounds(x, y)) return false;
        return this.grid[x][y].hasHit === false;
    }

    #setBufferZone(startX, startY, endX, endY, isHorizontal) {
        if (isHorizontal) {
            for (let x = startX; x <= endX; x++) {
                // Above
                if (startY < this.height - 1) {
                    this.grid[x][startY + 1].hasBuffer = true;
                }
                // Below
                if (startY > 0) {
                    this.grid[x][startY - 1].hasBuffer = true;
                }
            }
    
            // Left end
            if (startX > 0) {
                if (startY < this.height) {
                    this.grid[startX - 1][startY].hasBuffer = true;
                }
                if (startY < this.height - 1) {
                    this.grid[startX - 1][startY + 1].hasBuffer = true;
                }
                if (startY > 0) {
                    this.grid[startX - 1][startY - 1].hasBuffer = true;
                }
            }
    
            // Right end
            if (endX < this.width - 1) {
                if (startY < this.height) {
                    this.grid[endX + 1][startY].hasBuffer = true;
                }
                if (startY < this.height - 1) {
                    this.grid[endX + 1][startY + 1].hasBuffer = true;
                }
                if (startY > 0) {
                    this.grid[endX + 1][startY - 1].hasBuffer = true;
                }
            }
        } else {
            for (let y = startY; y <= endY; y++) {
                // Left
                if (startX > 0) {
                    this.grid[startX - 1][y].hasBuffer = true;
                }
                // Right
                if (startX < this.width - 1) {
                    this.grid[startX + 1][y].hasBuffer = true;
                }
            }
    
            // Top end
            if (startY > 0) {
                if (startX < this.width) {
                    this.grid[startX][startY - 1].hasBuffer = true;
                }
                if (startX > 0) {
                    this.grid[startX - 1][startY - 1].hasBuffer = true;
                }
                if (startX < this.width - 1) {
                    this.grid[startX + 1][startY - 1].hasBuffer = true;
                }
            }
    
            // Bottom end
            if (endY < this.height - 1) {
                if (startX < this.width) {
                    this.grid[startX][endY + 1].hasBuffer = true;
                }
                if (startX > 0) {
                    this.grid[startX - 1][endY + 1].hasBuffer = true;
                }
                if (startX < this.width - 1) {
                    this.grid[startX + 1][endY + 1].hasBuffer = true;
                }
            }
        }
    }
      

    placeShip(ship, startX, startY) {
        console.log("In placeShip.");
        let endX, endY;

        if (ship.isHorizontal) {
            endX = startX + ship.length - 1;
            endY = startY;
        } else {
            endX = startX;
            endY = startY + ship.length - 1;
        }

        const coordinates = this.validateCoordinates(startX, startY, endX, endY, ship.isHorizontal);

        this.shipList.push(ship);
        coordinates.forEach(([x, y]) => {
            this.grid[x][y].ship = ship;
        })
        console.log("Placed ship of length " + ship.length + " at start coordinates (" + startX + ", " + startY + ")");

        this.#setBufferZone(startX, startY, endX, endY, ship.isHorizontal);
    }

    receiveAttack(x, y) {
        let square = this.grid[x][y];
        if (square.hasHit === true) {
            throw new Error("Error: Attack has already been placed at this square.");
        }
        //is there a ship there?
        if (square.ship != null) {
            //is that ship already sunken?
            if (!square.ship.isSunk()) {
                square.ship.hit();
            } else throw new Error("Error: Ship has already been sunk.")
        }
        square.hasHit = true;
    }

    isAllSunk() {
        return this.shipList.every((ship) => ship.isSunk() === true);
    }
}

export { Gameboard }