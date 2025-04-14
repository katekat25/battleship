import { Gameboard } from "./gameboard.js";

class Player {
    constructor(name, htmlTag, board) {
        this.name = name;
        this.htmlTag = htmlTag;
        this.board = board;
    }
}

export { Player }