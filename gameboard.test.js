import { Gameboard } from "./gameboard.js";
import { Ship } from "./ship.js"
import { Player } from "./player.js";

test('Gameboard class exists', () => {
    expect(new Gameboard()).toBeInstanceOf(Gameboard);
});

test('Gameboard places ships at correct location', () => {
    let game = new Gameboard();
    let ship = new Ship(4, true);
    game.placeShip(ship, 0, 0);
    for (let i = 0; i < ship.length; i++) {
        expect(game.grid[i][0].ship).not.toBeNull();
    }
    expect(game.grid[4][0].ship).toBeNull();
});

test('Gameboard does not allow placing of ships where a ship has already been placed', () => {
    let game = new Gameboard();
    let ship = new Ship(4, true);
    game.placeShip(ship, 0, 0);
    let ship2 = new Ship(1, true);
    expect(() => game.placeShip(ship2, 0, 0)).toThrow();
})

test('Gameboard does not allow placing of ships out of bounds', () => {
    let game = new Gameboard();
    let ship = new Ship(4, true);
    expect(() => game.placeShip(ship, 11, 11)).toThrow();
})

test('Gameboard tracks missed attacks accurately', () => {
    let player1 = new Player();
    let game = new Gameboard(player1);
    let ship = new Ship(4, true);
    game.placeShip(ship, 0, 0);
    game.receiveAttack(1, 1);
    expect(game.grid[1][1].hasHit).toBeTruthy();
})

test('Gameboard reports if all ships have been sunk', () => {
    let game = new Gameboard();
    let ship1 = new Ship(1, true);
    let ship2 = new Ship(1, true);
    game.placeShip(ship1, 0, 0);
    game.placeShip(ship2, 2, 2);
    game.receiveAttack(0, 0);
    expect(game.isAllSunk()).toBeFalsy();
    game.receiveAttack(2, 2);
    expect(game.isAllSunk()).toBeTruthy();
})