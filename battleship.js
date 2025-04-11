import { Ship } from "./ship";
import { Gameboard } from "./gameboard";
import { Player } from "./player";

console.log("Hi");
let player = new Player(new Gameboard());

player.gameboard.placeShip(4, 0, 0, 3, 0);
