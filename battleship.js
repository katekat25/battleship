import { Ship } from "./ship.js";
import { Gameboard } from "./gameboard.js";
import { Player } from "./player.js";
import { drawGameboard } from "./gameboardRenderer.js";

console.log("Hi");
let player = new Player(new Gameboard(20, 20));
console.log(player.gameboard.height);
drawGameboard(player.gameboard);

player.gameboard.placeShip(4, 0, 0, 3, 0);
