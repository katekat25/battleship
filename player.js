//WHERE WE LEFT OFF: Just implementing boundary conditions in search. Also, there's a known bug where under certain cases a ship will not be recorded as sunk even though it is. It happened in a corner.

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

        this.totalShipKnowledge = {
            fourLengthShipsInPlay: 1,
            threeLengthShipsInPlay: 2,
            twoLengthShipsInPlay: 3,
            oneLengthShipsInPlay: 4,

            maxFourLengthShips: 1,
            maxThreeLengthShips: 2,
            maxTwoLengthShips: 3,
            maxOneLengthShips: 4
        }
    }

    static DIRECTIONS = {
        UP: { name: "UP", x: 0, y: -1 },
        DOWN: { name: "DOWN", x: 0, y: 1 },
        LEFT: { name: "LEFT", x: -1, y: 0 },
        RIGHT: { name: "RIGHT", x: 1, y: 0 },
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
        const availableDirections = Object.values(CPU.DIRECTIONS).filter(
            dir => !this.triedDirections.includes(dir.name)
        );

        if (availableDirections.length === 0) {
            return null;
        }

        const randomDirection = availableDirections[Math.floor(Math.random() * availableDirections.length)];
        this.triedDirections.push(randomDirection.name);
        return randomDirection;
    }

    checkHit(x, y, defender) {
        return (defender.board.grid[x][y].ship !== null);
    }

    calculateDirection(from, to) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const match = Object.values(CPU.DIRECTIONS).find(dir => dir.x === dx && dir.y === dy);
        return match ? match.name : null;
    }

    getReverseDirection(directionName) {
        const dir = CPU.DIRECTIONS[directionName];
        const reverse = Object.values(CPU.DIRECTIONS).find(d => d.x === -dir.x && d.y === -dir.y);
        if (reverse && !this.triedDirections.includes(reverse.name)) {
            this.triedDirections.push(reverse.name);
            return reverse.name;
        }
        return null;
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
        // console.log("Getting next target mode move.");
        let result = this.getAdjacentSquare(x, y, defender);
        if (result === null) {
            // console.log("No more valid moves. Ship is sunk. Attacking randomly.")
            this.recordSunkShip();
            this.reset();
            return this.getRandomAttack(defender);
        }
        return result;
    }

    getNextPursuitModeMove(x, y, defender) {
        // console.log("Getting next pursuit mode move at coordiates: ");
        // console.log(x + ", " + y);
        if (!this.currentDirection) {
            // console.log("No current direction set.");
            const inferredDirection = this.calculateDirection(this.firstHit, this.lastAttack);
            this.currentDirection = inferredDirection;
            // console.log("Current direction set to: ")
            // console.log(this.currentDirection);
        }

        const dir = CPU.DIRECTIONS[this.currentDirection];
        let xInDirection = x + dir.x;
        let yInDirection = y + dir.y;

        if (defender.board.isValidAttack(xInDirection, yInDirection)) {
            // console.log("Continuing attack in current direction.");
            return { x: xInDirection, y: yInDirection };
        }
        else {
            // console.log("Reversing direction.");
            this.currentDirection = this.getReverseDirection(this.currentDirection);
            if (this.currentDirection == null) {
                // console.log("Already reversed. Ship is sunk.");
                // console.log("Resetting and returning a random coordinate.");
                this.recordSunkShip();
                this.reset();
                return this.getRandomAttack(defender);
            }
            // console.log("New current direction is: ")
            // console.log(this.currentDirection);

            const newDir = CPU.DIRECTIONS[this.currentDirection];
            xInDirection = this.firstHit.x + newDir.x;
            yInDirection = this.firstHit.y + newDir.y;


            // console.log("Trying coordinate: " + xInDirection + ", " + yInDirection);
            if (defender.board.isValidAttack(xInDirection, yInDirection)) {
                return { x: xInDirection, y: yInDirection };
            }
        }

        // console.log("Resetting and returning a random coordinate.");
        this.reset();
        return this.getRandomAttack(defender);
    }

    recordSunkShip() {
        switch (this.shipSquaresHit) {
            case 4:
                if (this.totalShipKnowledge.fourLengthShipsInPlay > 0) {
                    this.totalShipKnowledge.fourLengthShipsInPlay--;
                }
                break;
            case 3:
                if (this.totalShipKnowledge.threeLengthShipsInPlay > 0) {
                    this.totalShipKnowledge.threeLengthShipsInPlay--;
                }
                break;
            case 2:
                if (this.totalShipKnowledge.twoLengthShipsInPlay > 0) {
                    this.totalShipKnowledge.twoLengthShipsInPlay--;
                }
                break;
            case 1:
                if (this.totalShipKnowledge.oneLengthShipsInPlay > 0) {
                    this.totalShipKnowledge.oneLengthShipsInPlay--;
                }
                break;
            default:
                console.warn(`Unexpected ship length hit: ${this.shipSquaresHit}`);
                break;
        }
        console.log(this.totalShipKnowledge);
    }

    checkMaxHits() {
        const hit = this.shipSquaresHit;
    
        if (hit === 4) {
            this.recordSunkShip();
            this.reset();
            return true;
        }
    
        if (hit === 3 && this.totalShipKnowledge.fourLengthShipsInPlay === 0) {
            this.recordSunkShip();
            this.reset();
            return true;
        }
    
        if (hit === 2 &&
            this.totalShipKnowledge.fourLengthShipsInPlay === 0 &&
            this.totalShipKnowledge.threeLengthShipsInPlay === 0) {
            this.recordSunkShip();
            this.reset();
            return true;
        }
    
        if (hit === 1 &&
            this.totalShipKnowledge.fourLengthShipsInPlay === 0 &&
            this.totalShipKnowledge.threeLengthShipsInPlay === 0 &&
            this.totalShipKnowledge.twoLengthShipsInPlay === 0) {
            this.recordSunkShip();
            this.reset();
            return true;
        }
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
                this.shipSquaresHit++;
                if (this.checkMaxHits() === true) {
                    // Skip any further pursuit logic since we're abandoning this attack chain
                    ({ x, y } = this.getRandomAttack(defender));
                    this.lastAttack = { x, y };
                    return { x, y };
                }

                //if no previous firstHit set,
                if (!this.firstHit) {
                    // that successful attack is now firstHit
                    this.firstHit = { x: lastX, y: lastY };

                    //choose next move from that successful attack coordinate
                    // console.log("Just set that last successful move as first hit. Getting a targeted move.");
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
                    // console.log("Trying another direction from firstHit in PURSUIT MODE after last attack missed.");
                    ({ x, y } = this.getNextPursuitModeMove(this.firstHit.x, this.firstHit.y, defender));
                }

                //if a firstHit has been stored, try another direction from there
                else if (this.firstHit) {
                    // console.log("Trying another direction from firstHit after last attack missed.");
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

        // console.log("Returning " + x + ", " + y)
        return { x, y };
    }
}

export { Player, CPU }