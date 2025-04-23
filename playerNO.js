//WHERE WE LEFT OFF:
//The problem is that tried directions are being stored incorrectly between attacks. Look into how tried directions are being updated.

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
        this.lastAttackCoord = [-1, -1];
        this.isTargetingShip = false;
        this.nextPlannedAttackCoord = null;

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
        this.targetingKnowledge = {
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

    //fisher-yates shuffle, for unbiased direction sorting
    #shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    #getValidNextCoordinateInDirection(defender, x, y, direction) {

        // console.log("in getValidNextCoordinateInDirection.");
        const newX = x + direction[0];
        const newY = y + direction[1];

        console.log("Getting next coord from:", x, y, "in direction:", direction);
        console.log("Cell at new location:", defender.board.grid[newX][newY]);
        console.log("hasHit?", defender.board.grid[newX][newY].hasHit);

        // Check bounds before accessing grid
        if (
            newX >= 0 && newX < defender.board.width &&
            newY >= 0 && newY < defender.board.height
        ) {
            const cell = defender.board.grid[newX][newY];
            if (!cell.hasHit) {
                return [newX, newY];
            }
        }

        return null;
    }

    #getUntriedDirections() {
        // console.log("Getting untried directions.");
        const all = [
            [0, 1], [0, -1], [1, 0], [-1, 0]
        ];
        return all.filter(dir =>
            !this.targetingKnowledge.triedDirections.some(tried =>
                tried[0] === dir[0] && tried[1] === dir[1]
            )
        );
    }

    directionsInclude(array, dir) {
        return array.some(d => d[0] === dir[0] && d[1] === dir[1]);
    }

    #generateNewDirection() {
        // console.log("Generating new direction.");
        // console.log("Tried directions: " + this.targetingKnowledge.triedDirections);
        let untriedDirections = this.#getUntriedDirections();
        // console.log("Untried directions: " + untriedDirections);
        let randomNum = Math.floor(Math.random() * untriedDirections.length);
        let directionToTry = untriedDirections[randomNum];
        return directionToTry;
    }

    resetTargeting() {
        this.isTargetingShip = false;

        this.targetingKnowledge = {
            startingAttackCoord: [],
            isHorizontal: null,
            isSunk: false,
            length: null,
            totalShipSquaresAttacked: 0,
            currentDirection: null,
            triedDirections: [],
            lastSuccessfulHitCoord: []
        };
    }

    resetAll() {
        // console.log("Resetting all CPU knowledge.");
        this.resetTargeting();

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
        this.lastAttackCoord = [-1, -1];
        this.nextPlannedAttackCoord = null;
    }

    #handleFailedDirection(defender) {
        // console.log("Handling a failed direction: " + this.targetingKnowledge.currentDirection);
        const [firstHitX, firstHitY] = this.targetingKnowledge.startingAttackCoord;

        //Add current failed direction to tried list
        this.targetingKnowledge.triedDirections.push(this.targetingKnowledge.currentDirection);
        // console.log("Adding failed direction to list. Updated list of failed directions: " + this.targetingKnowledge.triedDirections);

        while (this.targetingKnowledge.triedDirections.length < 4) {
            let newDirection = this.#generateNewDirection();

            const coord = this.#getValidNextCoordinateInDirection(defender, firstHitX, firstHitY, newDirection);
            // console.log("Attempting new coord in direction: " + newDirection);
            // console.log("Attempted new coord: " + coord);
            if (coord) {
                // console.log("That coord is valid.");
                return { coord, newDirection };
            } else {
                this.targetingKnowledge.triedDirections.push(newDirection);
            }
        }

        //fallback if still invalid
        // console.log("Have tried all four directions.");
        this.resetTargeting();
        return { coord: defender.board.getRandomValidAttackCoordinates, newDirection: null };
    }

    attackWithStrategy(defender, lastX, lastY) {
        console.log("Current Direction at start of strategy:", this.targetingKnowledge.currentDirection);
        console.log("Trying from lastX, lastY:", lastX, lastY);
        console.log("Tried directions so far:", this.targetingKnowledge.triedDirections);

        // console.log("Attempting to attack with strategy.")

        //if just started targeting and no direction yet
        if (this.targetingKnowledge.currentDirection == null) {
            const directions = this.#getUntriedDirections();
            const shuffled = this.#shuffleArray(directions.slice());
            console.log("Trying these directions:", shuffled);

            // console.log("Shuffled untried directions:", shuffled);

            for (const direction of shuffled) {
                console.log("Testing direction:", direction);
                const coord = this.#getValidNextCoordinateInDirection(defender, lastX, lastY, direction);
                console.log("Resulting coord:", coord);


                // console.log("Got coord: " + coord);

                if (coord) {
                    // console.log("Coord successful. Returning modified coordinate.");
                    this.targetingKnowledge.currentDirection = direction;
                    return { coord, newDirection: direction };
                } else {
                    // console.log("Coord failed. Trying another.")
                    this.targetingKnowledge.triedDirections.push(direction);
                }
            }

            //All directions tried and failed, fallback
            // console.log("No surrounding valid attacks. No longer targeting. Getting random attack coordinates.");
            this.resetTargeting();
            return { coord: defender.board.getRandomValidAttackCoordinates(), newDirection: null };
        }

        const coord = this.#getValidNextCoordinateInDirection(defender, lastX, lastY, this.targetingKnowledge.currentDirection);

        if (coord) {
            return { coord, newDirection: this.targetingKnowledge.currentDirection };
        }

        //direction failed
        return { coord: null, newDirection: null };
    }

    initializeStrategy(lastX, lastY) {
        // console.log("Initializing strategy.");
        this.isTargetingShip = true;
        this.targetingKnowledge.startingAttackCoord = [lastX, lastY];
    }

    async playCPUTurn(defender, testX = null, testY = null) {
        console.log("Playing CPU turn.");
        console.log("Current targeting knowledge at start: ");
        console.log(this.targetingKnowledge);
        console.log("Next planned attack at start: " + this.nextPlannedAttackCoord);

        // await new Promise(resolve => setTimeout(resolve, 1000));

        let x, y;

        //1: manual/test override
        if (testX !== null) {
            // console.log("testX exists. Clearing nextPlannedAttackCoord.");
            this.nextPlannedAttackCoord = null;
            this.currentDirection = null;
            x = testX;
            y = testY;
        }
        //2: use planned attack if available
        else if (this.nextPlannedAttackCoord && testX == null) {
            // console.log("Using next planned attack coordinates.");
            [x, y] = this.nextPlannedAttackCoord;
            this.nextPlannedAttackCoord = null;
            //currentDirection was already set
        }
        //3: get new coordinates based on current strategy
        else {
            let result;
            if (this.lastAttackCoord[0] !== -1 && this.isTargetingShip) {
                result = this.attackWithStrategy(defender, ...this.lastAttackCoord);
            } else {
                result = {
                    coord: defender.board.getRandomValidAttackCoordinates(),
                    newDirection: null
                };
            }

            [x, y] = result.coord;

            if (result.newDirection !== null) {
                this.targetingKnowledge.currentDirection = result.newDirection;
            }

            //i think this will not fix the problem
            if (this.isTargetingShip && result.coord) {
                this.nextPlannedAttackCoord = result.coord;
            }
        }

        // console.log("Back in playCPUTurn. Got coordinates: " + [x, y]);

        // evaluate attack result before returning

        this.lastAttackCoord = [x, y];
        const cell = defender.board.grid[x][y];
        const successfulHit = cell.ship !== null;

        if (successfulHit) {
            // console.log("That was a successful hit.");
            if (!this.isTargetingShip) {
                // console.log("Not currently targeting. Now going to initialize targeting.");
                this.initializeStrategy(x, y);
            }

            // console.log("Updating stats.");
            //update stats
            this.targetingKnowledge.totalShipSquaresAttacked++;
            this.targetingKnowledge.lastSuccessfulHitCoord = [x, y];

            if (this.targetingKnowledge.totalShipSquaresAttacked === 2) {
                console.log("Looks like two squares have been hit.");
                //if its attacked two consecutive squares and they both hit, remove non-opposite directions from options
                //then we can get rid of the reverse option below!
                const isHorizontalShip = this.targetingKnowledge.lastSuccessfulHitCoord[0] - this.targetingKnowledge.startingAttackCoord[0] !== 0;
                const isVerticalShip = this.targetingKnowledge.lastSuccessfulHitCoord[1] - this.targetingKnowledge.startingAttackCoord[1] !== 0;

                // console.log("isHorizontalShip: " + isHorizontalShip);
                // console.log(this.targetingKnowledge.lastSuccessfulHitCoord[0]);
                // console.log(this.targetingKnowledge.startingAttackCoord[0]);
                // console.log("isVerticalShip: " + isVerticalShip);
                // console.log(this.targetingKnowledge.lastSuccessfulHitCoord[1]);
                // console.log(this.targetingKnowledge.startingAttackCoord[1]);

                if (isHorizontalShip) {
                    //take vertical directions out of the running
                    // console.log("After two hits we know it's a horizontal ship. Removing unnecessary directions.")
                    if (!this.directionsInclude(this.targetingKnowledge.triedDirections, [0, 1])) {
                        this.targetingKnowledge.triedDirections.push([0, 1]);
                    } else if (!this.directionsInclude(this.targetingKnowledge.triedDirections, [0, -1])) {
                        this.targetingKnowledge.triedDirections.push([0, -1]);
                    }
                    // console.log("New list of tried directions: ");
                    // console.log(this.targetingKnowledge.triedDirections);
                }
                else if (isVerticalShip) {
                    // console.log("After two hits we know it's a vertical ship. Removing unnecessary directions.")
                    //take horizontal directions out of the running
                    if (!directionsInclude(this.targetingKnowledge.triedDirections, [1, 0])) {
                        this.targetingKnowledge.triedDirections.push([1, 0]);
                    } else if (!directionsInclude(this.targetingKnowledge.triedDirections, [-1, 0])) {
                        this.targetingKnowledge.triedDirections.push([-1, 0]);
                    }
                    // console.log("New list of tried directions: ");
                    // console.log(this.targetingKnowledge.triedDirections);
                }
            }

            console.log("Before calling strategy after hit: ");
            console.log("currentDirection:", this.targetingKnowledge.currentDirection);
            console.log("lastSuccessfulHitCoord:", this.targetingKnowledge.lastSuccessfulHitCoord);
            console.log("nextPlannedAttackCoord before:", this.nextPlannedAttackCoord);

            //plan next move
            const nextResult = this.attackWithStrategy(defender, x, y);
            // console.log("Planned next attack will be at " + nextResult.coord);
            this.nextPlannedAttackCoord = nextResult.coord;
            if (nextResult.newDirection !== null) {
                console.log("Continuing in current direction from:", this.targetingKnowledge.lastSuccessfulHitCoord);
                console.log("Current direction:", this.targetingKnowledge.currentDirection);
                // console.log("New attacking direction is " + nextResult.newDirection);
                this.targetingKnowledge.currentDirection = nextResult.newDirection;
            }

        } else if (this.isTargetingShip) {
            // console.log("Currently targeting, but that attack missed.");
            // Handle a miss in targeting mode

            // console.log("Trying a new direction.");
            // Try a new direction from the first hit
            const result = this.#handleFailedDirection(defender);

            if (result.newDirection !== null) {
                this.targetingKnowledge.currentDirection = result.newDirection;
            }

            // console.log("Next attack will be at coordinate: " + result.coord);
            this.nextPlannedAttackCoord = result.coord;

            // console.log("CPUTurn is returning " + [x, y]);
            return result.coord;
        }

        console.log("Targeting knowledge at end:");
        console.log(this.targetingKnowledge);
        console.log("Next planned attack coord at end:");
        console.log(this.nextPlannedAttackCoord);
        console.log("CPUTurn is returning " + [x, y]);
        return [x, y];
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