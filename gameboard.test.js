import { Gameboard } from "./gameboard";

test('Gameboard class exists', () => {
    expect(new Gameboard()).toBeInstanceOf(Gameboard);
});

test('Gameboard places ships at correct location', () => {
    let game = new Gameboard();
    game.placeShip(4, 0, 0, 3, 0);
    for (let i = 0; i < 4; i++) {
        expect(game.grid[i][0].ship).not.toBeNull();
    }
    expect(game.grid[4][0].ship).toBeNull();
});

test('Gameboard does not allow placing of ships where a ship has already been placed', () => {
    let game = new Gameboard();
    game.placeShip(4, 0, 0, 3, 0);
    expect(() => game.placeShip(1, 0, 0, 0, 0)).toThrow();
})

test('Gameboard does not allow placing of ships whose length differs from their coordinates', () => {
    let game = new Gameboard();
    expect(() => game.placeShip(2, 8, 8, 8, 8)).toThrow();
    expect(() => game.placeShip(2, 4, 4, 7, 7)).toThrow();
})

test('Gameboard does nt allow placing of ships out of bounds', () => {
    let game = new Gameboard();
    expect(() => game.placeShip(3, 20, 0, 22, 0)).toThrow();
})

test('Gameboard tracks missed attacks accurately', () => {
    let game = new Gameboard();
    game.placeShip(1, 0, 0, 0, 0);
    game.placeShip(1, 3, 3, 3, 3);
    game.receiveAttack(1, 1);
    expect(game.grid[1][1].hasMiss).toBeTruthy();
})

test('Gameboard reports if all ships have been sunk', () => {
    let game = new Gameboard();
    game.placeShip(1, 0, 0, 0, 0);
    game.placeShip(1, 3, 3, 3, 3);
    game.receiveAttack(0, 0);
    expect(game.isAllSunk()).toBeFalsy();
    game.receiveAttack(3, 3);
    expect(game.isAllSunk()).toBeTruthy();
})