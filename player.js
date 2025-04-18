//WHERE WE LEFT OFF:
//currently working on CPU "AI" logic. It currently tries a square above if the last attack stored was a hit. It bugs out if an attack has already been done on the above square. 

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
        this.lastAttackCoords = [-1, -1];
        this.isTargetingShip = false;

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
        this.attackingShipKnowledge = {
            startingAttackCoord: [],
            isHorizontal: null,
            isSunk: false,
            length: null,
            totalShipSquaresAttacked: 0,
            currentDirection: null,
            triedDirections: [],
            lastSuccessfulHitCoord: []
        }
    }

    getRandomValidAttackCoordinates(board) {
        console.log("In getRandomValidAttackCoordinates.");
        let x, y;
        do {
            x = Math.floor(Math.random() * board.width);
            y = Math.floor(Math.random() * board.height);
        } while (!board.isValidAttack(x, y));
        return [x, y];
    }

    getSurroundingCoordinates(board, oldX, oldY, direction) {
        console.log("Getting surrounding coordinates.");

        const newX = oldX + direction[0];
        const newY = oldY + direction[1];
        console.log("Seeing if " + [newX, newY] + " is viable.");

        if (
            newX >= 0 && newX < board.width &&
            newY >= 0 && newY < board.height &&
            !board.grid[newX][newY].hasHit
        ) {
            console.log(`Can attack. Returning ${newX}, ${newY}`);
            return [newX, newY];
        }
        else return false;

        // if all surrounding squares have been attacked or are invalid
        console.log("No surrounding valid attacks. No longer targeting. Getting random attack coordinates.");
        this.isTargetingShip = false;
        return this.getRandomValidAttackCoordinates(board);
    }

    #updateSquaresAttacked() {
        this.attackingShipKnowledge.totalShipSquaresAttacked++;
        console.log("Total squares of this ship hit: " + this.attackingShipKnowledge.totalShipSquaresAttacked);
    }

    #getNextCoordinateInDirection(x, y, direction) {
        return [x + direction[0], y + direction[1]];
    }
    
    #getOppositeDirection(direction) {
        return [-direction[0], -direction[1]];
    }
    
    #getUntriedDirections() {
        const all = [
            [0, 1], [0, -1], [1, 0], [-1, 0]
        ];
        return all.filter(dir =>
            !this.attackingShipKnowledge.triedDirections.some(tried =>
                tried[0] === dir[0] && tried[1] === dir[1]
            )
        );
    }    

    initializeTargetingStrategy(defender, lastX, lastY) {
        console.log("Starting targeting strategy.");

        this.isTargetingShip = true;
        this.attackingShipKnowledge.startingAttackCoord = [lastX, lastY];
        let cpuX, cpuY;

        let untriedDirections = this.#getUntriedDirections();
        let foundValid = false;

        for (let dir of untriedDirections) {
            let result = this.getSurroundingCoordinates(defender.board, lastX, lastY, dir)
            if (result !== false) {
                [cpuX, cpuY] = result;
                console.log(result);
                console.log([cpuX, cpuY]);
                this.attackingShipKnowledge.currentDirection = dir;
                this.attackingShipKnowledge.triedDirections.push(dir);
                foundValid = true;
                this.#updateSquaresAttacked();
                break;
            } else {
                this.attackingShipKnowledge.triedDirections.push(dir);
            }
        }

        if (!foundValid) {
            console.log("No valid direction found. Attacking randomly.")
            this.isTargetingShip = false;
            [cpuX, cpuY] = this.getRandomValidAttackCoordinates(defender.board)
        }

        return [cpuX, cpuY];
    }

    async cpuTurn(defender) {
        console.log("CPU making turn.")
        await new Promise(resolve => setTimeout(resolve, 1000));

        let cpuX, cpuY;

        //if this isn't the first attack of the game
        if (this.lastAttackCoords[0] !== -1) {
            const [lastX, lastY] = this.lastAttackCoords;
            let lastSquareAttacked = defender.board.grid[lastX][lastY];

            //if targeting
            if (this.isTargetingShip) {

                //if last attack hit a ship
                if (lastSquareAttacked.hasHit && lastSquareAttacked.ship) {
                    console.log("Continuing to target ship.");
                    [cpuX, cpuY] = this.getSurroundingCoordinates(defender.board, lastX, lastY, this.attackingShipKnowledge.currentDirection);
                    this.#updateSquaresAttacked();

                //if last attack did not hit a ship
                } else {
                    console.log("Last attack did not hit a ship.");
                    console.log("startingAttackCoord " + this.attackingShipKnowledge.startingAttackCoord);
                    [cpuX, cpuY] = this.getSurroundingCoordinates(defender.board, this.attackingShipKnowledge.startingAttackCoord[0], this.startingAttackCoord[1], );
                }

            }
            //if not targeting
            else {
                //If last attack was a hit AND there is at least one 1+ length ship left in play, commence strategy
                if (lastSquareAttacked.hasHit && lastSquareAttacked.ship &&
                    this.totalShipKnowledge.fourLengthShipsInPlay > 0 &&
                    this.totalShipKnowledge.threeLengthShipsInPlay > 0 &&
                    this.totalShipKnowledge.twoLengthShipsInPlay > 0) {

                    [cpuX, cpuY] = this.initializeTargetingStrategy(defender, lastX, lastY);
                }
                //else attack randomly
                else {
                    [cpuX, cpuY] = this.getRandomValidAttackCoordinates(defender.board);
                }
            }
            //if no attack has been played before this, attack randomly
        } else {
            [cpuX, cpuY] = this.getRandomValidAttackCoordinates(defender.board);
        }

        return [cpuX, cpuY];
    }
}

export { Player, CPU }

//AI LOGIC:
//i hit a square.I know theres 1 4, 2 3, and 3 2 length ships. Are there any 4, 3, or 2 length ships left that i know of?
//  There is a 4 length left. I'll try randomly attacking the top, bottom, right, and left.
//I got a hit to the right. that means it's a horizontal boat. Or the top and bottom, that means it's vertical. I'll remember that.
//I'm going to plan to hit to the right of it again on the next turn.
//I hit it to the right and it missed. I'm going to go back to the first square i hit and go to the left instead.
//I got another hit to the left. I'm going to try one more time.
//It missed. That was three hits. That means there's one fewer possible three length ship. I'll keep that in mind.