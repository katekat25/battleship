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
    }
    
    getRandomValidAttackCoordinates(board) {
        let x, y;
        do {
            x = Math.floor(Math.random() * board.width);
            y = Math.floor(Math.random() * board.height);
        } while (!board.isValidAttack(x, y));
        return [x, y];
    }

    checkSurroundingSquares() {

    }
}

export { Player, CPU }