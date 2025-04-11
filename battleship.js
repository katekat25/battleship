// import { Ship } from "./ship.js";
import { Gameboard } from "./gameboard.js";
import { Player } from "./player.js";
import { drawGameboard } from "./gameboardRenderer.js";

console.log("Hi");
let player = new Player(new Gameboard(10, 10));
let cpu = new Player(new Gameboard(10, 10));
player.gameboard.placeShip(4, 0, 0, 3, 0);
player.gameboard.placeShip(3, 3, 3, 5, 3);
player.gameboard.placeShip(3, 5, 9, 7, 9);
player.gameboard.placeShip(2, 4, 0, 5, 0);
// player.gameboard.placeShip(2)
// player.gameboard.placeShip(2)
// player.gameboard.placeShip(1)
// player.gameboard.placeShip(1)
// player.gameboard.placeShip(1)
// player.gameboard.placeShip(1)
drawGameboard(player.gameboard, "player");
drawGameboard(cpu.gameboard, "cpu");

player.gameboard.placeShip(4, 0, 0, 3, 0);
