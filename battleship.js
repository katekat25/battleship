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
player.gameboard.placeShip(2, 5, 0, 6, 0);
player.gameboard.placeShip(2, 2, 5, 2, 6);
player.gameboard.placeShip(2, 0, 5, 0, 6)
player.gameboard.placeShip(1, 4, 6, 4, 6);
player.gameboard.placeShip(1, 9, 0, 9, 0);
player.gameboard.placeShip(1, 8, 4, 8, 4);
player.gameboard.placeShip(1, 7, 7, 7, 7);

cpu.gameboard.placeShip(4, 0, 0, 3, 0);
cpu.gameboard.placeShip(3, 3, 3, 5, 3);
cpu.gameboard.placeShip(3, 5, 9, 7, 9);
cpu.gameboard.placeShip(2, 5, 0, 6, 0);
cpu.gameboard.placeShip(2, 2, 5, 2, 6);
cpu.gameboard.placeShip(2, 0, 5, 0, 6)
cpu.gameboard.placeShip(1, 4, 6, 4, 6);
cpu.gameboard.placeShip(1, 9, 0, 9, 0);
cpu.gameboard.placeShip(1, 8, 4, 8, 4);
cpu.gameboard.placeShip(1, 7, 7, 7, 7);
drawGameboard(player.gameboard, "player");
drawGameboard(cpu.gameboard, "cpu");

player.gameboard.placeShip(4, 0, 0, 3, 0);
