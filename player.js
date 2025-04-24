class Player {
    constructor(name, htmlTag, board = null) {
        this.name = name;
        this.htmlTag = htmlTag;
        this.board = board;
    }
}

class CPU extends Player {
    constructor(name, htmlTag, board = null) {
        super(name, htmlTag, board);
        this.lastAttack = null;
        this.lastAttackWasHit = null;
        this.triedDirections = [];
        this.firstHit = null;
        this.shipSquaresHit = 0;
        this.currentDirection = null;
    }

    static DIRECTIONS = {
        UP: { x: 0, y: -1 },
        DOWN: { x: 0, y: 1 },
        LEFT: { x: -1, y: 0 },
        RIGHT: { x: 1, y: 0 },
    }

    reset() {
        this.lastAttack = null;
        this.lastAttackWasHit = null;
        this.triedDirections = [];
        this.firstHit = null;
        this.shipSquaresHit = 0;
        this.currentDirection = null;
    }

    getRandomAttack(defender) {
        return defender.board.getRandomValidAttackCoordinates();
    }

    getRandomDirection() {
        const directionsArray = Object.values(CPU.DIRECTIONS);
        const availableDirections = directionsArray.filter(
            dir => !this.triedDirections.some(tried => tried.x === dir.x && tried.y === dir.y)
        );

        if (availableDirections.length === 0) {
            return null; // or handle however you need
        }

        const randomDirection = availableDirections[Math.floor(Math.random() * availableDirections.length)];
        this.triedDirections.push(randomDirection);
        return randomDirection;
    }

    checkHit(x, y, defender) {
        return (defender.board.grid[x][y].ship !== null);
    }

    getAdjacentSquare(x, y, defender) {
        for (let i = 0; i < Object.keys(CPU.DIRECTIONS).length; i++) {
            let direction = this.getRandomDirection();
            if (!direction) {
                return null;
            }
            let testX = x + direction.x;
            let testY = y + direction.y;
            if (defender.board.isValidAttack(testX, testY)) {
                return { x: testX, y: testY };
            }
        }
        //All surrounding directions failed.
        return null;
    }

    getNextTargetModeMove(x, y, defender) {
        console.log("Getting next target mode move.");
        let result = this.getAdjacentSquare(x, y, defender);
        if (result === null) {
            this.reset(); // Optional, depending on logic
            return this.getRandomAttack(defender);
        }
        return result;
    }

    calculateDirection(from, to) {
        const inferredX = to.x - from.x;
        const inferredY = to.y - from.y;
        return { x: inferredX, y: inferredY }
    }

    reverseDirection(direction) {
        return { x: -direction.x, y: -direction.y }
    }

    getNextPursuitModeMove(x, y, defender) {
        console.log("Getting next pursuit mode move.");
        if (!this.currentDirection) {
            console.log("No current direction set.");
            const inferredDirection = this.calculateDirection(this.firstHit, this.lastAttack);
            this.currentDirection = inferredDirection;
            console.log("Current direction set to: ")
            console.log(this.currentDirection);
        }

        let xInDirection = x + this.currentDirection.x;
        let yInDirection = y + this.currentDirection.y;

        if (defender.board.isValidAttack(xInDirection, yInDirection)) {
            console.log("Continuing attack in current direction.");
            return { x: xInDirection, y: yInDirection };
        }
        else {
            console.log("Reversing direction.");
            this.currentDirection = this.reverseDirection(this.currentDirection);
            console.log("New current direction is: ")
            console.log(this.currentDirection);

            xInDirection = x + this.currentDirection.x;
            yInDirection = y + this.currentDirection.y;

            console.log("Trying coordinate: " + xInDirection + ", " + yInDirection);
            if (defender.board.isValidAttack(xInDirection, yInDirection)) {
                return { x: xInDirection, y: yInDirection };
            }
        }

        console.log("Resetting currentdirection and returning null.");
        this.currentDirection = null;
        return null;
    }

    async playCPUTurn(defender) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        let x, y;

        //if there's a previous attack stored
        if (this.lastAttack) {
            const lastX = this.lastAttack.x;
            const lastY = this.lastAttack.y;

            this.lastAttackWasHit = this.checkHit(lastX, lastY, defender);
            //if last attack hit
            if (this.lastAttackWasHit) {
                this.shipSquaresHit++

                //check if it sunk a ship
                if (defender.board.grid[lastX][lastY].ship.sunk == true) {
                    console.log("Ship has been sunk — resetting target mode.");
                    this.reset();
                    ({ x, y } = this.getRandomAttack(defender));
                }

                //if no previous firstHit set,
                else if (!this.firstHit) {
                    // that successful attack is now firstHit
                    this.firstHit = { x: lastX, y: lastY };

                    //choose next move from that successful attack coordinate
                    console.log("Just set that last successful move as first hit. Getting a targeted move.");
                    ({ x, y } = this.getNextTargetModeMove(lastX, lastY, defender));
                }

                //if it has been set and there's more than two hits
                if (this.shipSquaresHit >= 2) {
                    ({ x, y } = this.getNextPursuitModeMove(lastX, lastY, defender));
                }

            }

            //if last hit was a miss
            else {
                //if in pursuit mode
                if (this.currentDirection !== null) {
                    console.log("Trying another direction from firstHit in PURSUIT MODE after last attack missed.");
                    ({ x, y } = this.getNextPursuitModeMove(this.firstHit.x, this.firstHit.y, defender));
                }

                //if a firstHit has been stored, try another direction from there
                else if (this.firstHit) {
                    console.log("Trying another direction from firstHit after last attack missed.");
                    ({ x, y } = this.getNextTargetModeMove(this.firstHit.x, this.firstHit.y, defender));
                }

                //if no firstHit has been stored, keep attacking randomly
                else {
                    ({ x, y } = this.getRandomAttack(defender));
                }

            }
        }

        //if no previous attack is stored
        else {
            ({ x, y } = this.getRandomAttack(defender));
        }

        this.lastAttack = { x, y };

        console.log("Returning " + x + ", " + y)
        return { x, y };
    }
}

export { Player, CPU }