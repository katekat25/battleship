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
        return null;
    }

    //The CPU has three different attack modes: random mode, target mode, and pursuit mode.
    //Random mode attacks the board aimlessly. Target mode tries adjacent squares to 
    //determine the direction of the ship and terminates if all directions around the hit
    //square are blanks. Pursuit mode continues an attack in the direction determined in
    //target mode. It will also change directions if it reaches a blank and there are
    //possibly more squares left according to its stored knowledge of ships in play.

    getRandomAttack(defender) {
        return defender.board.getRandomValidAttackCoordinates();
    }

    getNextTargetModeMove(x, y, defender) {
        let result = this.getAdjacentSquare(x, y, defender);
        if (result === null) {
            this.recordSunkShip();
            this.reset();
            return this.getRandomAttack(defender);
        }
        return result;
    }

    getNextPursuitModeMove(x, y, defender) {
        if (!this.currentDirection) {
            this.currentDirection = this.calculateDirection(this.firstHit, this.lastAttack);
        }
        const tryMove = (x, y, directionName) => {
            const dir = CPU.DIRECTIONS[directionName];
            const targetX = x + dir.x;
            const targetY = y + dir.y;
            return defender.board.isValidAttack(targetX, targetY) ? { x: targetX, y: targetY } : null;
        };
        let move = tryMove(x, y, this.currentDirection);
        if (move) return move;
        const reverseDir = this.getReverseDirection(this.currentDirection);
        if (reverseDir) {
            move = tryMove(this.firstHit.x, this.firstHit.y, reverseDir);
            if (move) {
                this.currentDirection = reverseDir;
                return move;
            }
        }
        this.recordSunkShip();
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

   playCPUTurn(defender) {
        let x, y;
        if (this.lastAttack) {
            const lastX = this.lastAttack.x;
            const lastY = this.lastAttack.y;
            this.lastAttackWasHit = this.checkHit(lastX, lastY, defender);
            if (this.lastAttackWasHit) {
                this.shipSquaresHit++;
                const lastShip = defender.board.grid[lastX][lastY].ship;
                if (lastShip && lastShip.isSunk()) {
                    this.recordSunkShip();
                    this.reset();
                    ({ x, y } = this.getRandomAttack(defender));
                    this.lastAttack = { x, y };
                    return { x, y };
                }
                if (!this.firstHit) {
                    this.firstHit = { x: lastX, y: lastY };
                    ({ x, y } = this.getNextTargetModeMove(lastX, lastY, defender));
                }
                if (this.shipSquaresHit >= 2) {
                    ({ x, y } = this.getNextPursuitModeMove(lastX, lastY, defender));
                }
            }
            else {
                if (this.currentDirection !== null) {
                    ({ x, y } = this.getNextPursuitModeMove(this.firstHit.x, this.firstHit.y, defender));
                }
                else if (this.firstHit) {
                    ({ x, y } = this.getNextTargetModeMove(this.firstHit.x, this.firstHit.y, defender));
                }
                else {
                    ({ x, y } = this.getRandomAttack(defender));
                }
            }
        }
        else {
            ({ x, y } = this.getRandomAttack(defender));
        }
        this.lastAttack = { x, y };
        return { x, y };
    }
}

export { Player, CPU };