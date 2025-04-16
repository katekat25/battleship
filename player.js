class Player {
    constructor(name, htmlTag, board = null) {
        this.name = name;
        this.htmlTag = htmlTag;
        this.board = board;
    }
}

class CPU extends Player {
    constructor(name, htmlTag, board = null) {
        super(name);
        super(htmlTag);
        super(board);
    }

    placeRandomShips() {
        
    }
}

export { Player, CPU }