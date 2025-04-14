import { Gameboard } from "./gameboard.js";
import { Player } from "./player.js";
import { newGame } from "./gameController.js";
import { createRenderer } from "./gameboardRenderer.js";

let player = new Player("Player 1", "player-1");
player.board = new Gameboard(player, 10, 10);
let cpu = new Player("CPU", "player-2");
cpu.board = new Gameboard(cpu, 10, 10);
//needs this roundabout way because renderer and game need immediate access to each other
const renderer = createRenderer();
let game = newGame(player, cpu, renderer);
renderer.setGame(game);
game.initialize();



