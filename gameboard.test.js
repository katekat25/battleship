import { Gameboard } from "./gameboard";

test('Gameboard class exists', () => {
    expect(new Gameboard()).toBeInstanceOf(Gameboard);
});

test('Gameboard places ships at correct location', () => {
    let game = new Gameboard();
    game.placeShip(4, 0, 0, 3, 0);
    expect(game.grid[0][0].ship).not.toBeNull();
    expect(game.grid[1][0].ship).not.toBeNull();
    expect(game.grid[2][0].ship).not.toBeNull();
    expect(game.grid[3][0].ship).not.toBeNull();
    expect(game.grid[4][0].ship).toBeNull();

    //Cannot place ships where a ship has already been placed
    expect(() => game.placeShip(1, 0, 0, 0, 0)).toThrow();

    //Cannot place ships whose length differs from their coordinates
    expect(() => game.placeShip(2, 8, 8, 8, 8)).toThrow();
    expect(() => game.placeShip(2, 4, 4, 7, 7)).toThrow();

    //Cannot place ships that are out of bounds
    expect(() => game.placeShip(3, 20, 0, 22, 0)).toThrow();
});

// test('Gameboard tracks missed attacks accurately', () => {

// })

test('Gameboard reports if all ships have been sunk', () => {
    let game = new Gameboard();
    game.placeShip(1, 0, 0, 0, 0);
    game.placeShip(1, 3, 3, 3, 3);
    game.grid[0][0].ship.hit();
    expect(game.isAllSunk()).toBeFalsy();
    game.grid[3][3].ship.hit();
    expect(game.isAllSunk()).toBeTruthy();
})