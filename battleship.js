import { Gameboard } from "./gameboard.js";
import { Player, CPU } from "./player.js";
import { newGame } from "./gameController.js";
import { createRenderer } from "./gameboardRenderer.js";

function initializeGame() {
    let player1 = new Player("Player 1", "player-1");
    player1.board = new Gameboard(player1, 10, 10);
    let player2 = new CPU("CPU", "player-2");
    player2.board = new Gameboard(player2, 10, 10);
    //needs this roundabout way because renderer and game need immediate access to each other
    const renderer = createRenderer();
    let game = newGame(player1, player2, renderer);
    renderer.initialize(game);
    game.initialize();    
}

initializeGame();




