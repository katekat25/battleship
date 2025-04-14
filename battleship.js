// import { Ship } from "./ship.js";
import { Gameboard } from "./gameboard.js";
import { Player } from "./player.js";
import { drawGameboard } from "./gameboardRenderer.js";
import { newGame } from "./gameController.js";

console.log("Hi");
let player = new Player("Player 1", "player-1", new Gameboard(10, 10));
let cpu = new Player("CPU", "player-2", new Gameboard(10, 10));
let game = newGame(player, cpu);

player.board.placeShip(4, 0, 0, 3, 0);
player.board.placeShip(3, 5, 9, 7, 9);
player.board.placeShip(2, 5, 0, 6, 0);
player.board.placeShip(2, 2, 5, 2, 6);
player.board.placeShip(2, 0, 5, 0, 6)
player.board.placeShip(1, 4, 6, 4, 6);
player.board.placeShip(1, 9, 0, 9, 0);
player.board.placeShip(1, 8, 4, 8, 4);
player.board.placeShip(1, 7, 7, 7, 7);
player.board.placeShip(3, 3, 3, 5, 3);

cpu.board.placeShip(4, 0, 0, 3, 0);
cpu.board.placeShip(3, 3, 3, 5, 3);
cpu.board.placeShip(3, 5, 9, 7, 9);
cpu.board.placeShip(2, 5, 0, 6, 0);
cpu.board.placeShip(2, 2, 5, 2, 6);
cpu.board.placeShip(2, 0, 5, 0, 6)
cpu.board.placeShip(1, 4, 6, 4, 6);
cpu.board.placeShip(1, 9, 0, 9, 0);
cpu.board.placeShip(1, 8, 4, 8, 4);
cpu.board.placeShip(1, 7, 7, 7, 7);
drawGameboard(player);
drawGameboard(cpu);


