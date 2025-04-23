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

    async playCPUTurn(defender) {
        //await new Promise(resolve => setTimeout(resolve, 1000));
        let x, y;

        //if there's a previous attack stored
        if (this.lastAttack) {
            const lastX = this.lastAttack.x;
            const lastY = this.lastAttack.y;

            this.lastAttackWasHit = this.checkHit(lastX, lastY, defender);
            //if last attack hit
            if (this.lastAttackWasHit) {

                if (!this.firstHit) {
                    this.firstHit = { x: lastX, y: lastY };
                }
                // Try an adjacent square
                let result = this.getAdjacentSquare(lastX, lastY, defender);
                // If no adjacent squares work
                if (result === null) {
                    //reset?
                    ({ x, y } = this.getRandomAttack(defender));
                } else {
                    ({ x, y } = result);
                }
            } 
            //if last attack was miss
            else {
                //go back to first hit if it exists
                if (this.firstHit) {
                    let result = this.getAdjacentSquare(this.firstHit.x, this.firstHit.y, defender);
                    if (result === null) {
                        this.reset();
                        ({ x, y } = this.getRandomAttack(defender));
                    } else {
                        ({ x, y } = result);
                    }
                }
                //if it doesn't exist, attack randomly again 
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
        return { x, y };
    }
}

export { Player, CPU }