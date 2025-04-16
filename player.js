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

    getSurroundingCoordinates(board, lastAttackX, lastAttackY) {
        console.log("In getSurroundingCoordinates.")
        if (lastAttackY + 1 < board.height && board.grid[lastAttackX][lastAttackY + 1].hasHit == false) {
            console.log("Can attack above.");
            console.log("Returning " + [lastAttackX, lastAttackY + 1]);
            return [lastAttackX, lastAttackY + 1];
        } else {
            console.log("Cannot attack above. Getting random coordinates instead.");
            this.getRandomValidAttackCoordinates(board);
        }
        //have we tried to attack above?
        //have we tried to attack below?
        //have we tried to attack to the left?
        //have we tried to attack to the right?
    }

    async cpuTurn(defender) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    
        let cpuX, cpuY;
    
        const lastCoords = this.lastAttackCoords[0];
        if (lastCoords !== -1) {
            const [lastX, lastY] = lastCoords;
            console.log("CPU last X:", lastX);
            console.log("CPU last Y:", lastY);
    
            const lastCell = defender.board.grid[lastX][lastY];
            if (lastCell.hasHit && lastCell.ship !== null) {
                console.log("Last CPU attack was a hit.");
                [cpuX, cpuY] = this.getSurroundingCoordinates(defender.board, lastX, lastY);
            } else {
                [cpuX, cpuY] = this.getRandomValidAttackCoordinates(defender.board);
            }
        } else {
            [cpuX, cpuY] = this.getRandomValidAttackCoordinates(defender.board);
        }

        return [cpuX, cpuY];
    }
}

export { Player, CPU }