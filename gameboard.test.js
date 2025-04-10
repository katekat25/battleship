import { Gameboard } from "./gameboard";
import { Ship } from "./ship";

test('Gameboard class exists', () => {
    expect(new Gameboard()).toBeInstanceOf(Gameboard);
});

test('Gameboard places ships at correct location', () => {
    let game = new Gameboard();
    game.placeShip(4, 0, 0, 3, 0);
    expect(game.grid[0, 0].ship).not.toBeNull();
    expect(game.grid[1, 0].ship).not.toBeNull();
    expect(game.grid[2, 0].ship).not.toBeNull();
    expect(game.grid[3, 0].ship).not.toBeNull();
    expect(game.grid[4, 0].ship).toBeUndefined();
})