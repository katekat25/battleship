//pursuit mode seems to be working, but write more varied test cases.
//additional things to add: 
//-have it maintain knowledge of the ships in play, their lengths, what length ships its sunk, so that it wont try for a 4 if, say, a 4 has already been sunk.
//-have it avoid attacking buffer squares around a ship it knows is sunk

import { Player, CPU } from "./player.js";
import { Gameboard } from "./gameboard.js";
import { newGame } from "./gameController.js";
import { Ship } from "./ship.js";

const fakeRenderer = {
    setGame: () => { },
    drawGameboard: () => { },
    createCell: () => { },
    toggleBoardClicking: () => { },
    setMessage: () => { }
}

let player1 = new Player("Player 1", "player-1");
player1.board = new Gameboard(player1);
let cpu = new CPU("CPU", "cpu");
cpu.board = new Gameboard(cpu);
let game = newGame(player1, cpu, fakeRenderer);
game.testMode = true;
fakeRenderer.setGame(game);

afterEach(() => {
    player1.board.clearBoard();
    cpu.board.clearBoard();
    cpu.reset();
});

test.skip('Player class exists', () => {
    expect(new Player()).toBeInstanceOf(Player);
});

test.skip('CPU class exists', () => {
    expect(new CPU()).toBeInstanceOf(Player);
});

test.skip('CPU can attack randomly', () => {
    const result = cpu.getRandomAttack(player1);
    console.log(result);
    expect(player1.board.isValidAttack(result.x, result.y)).toBeTruthy();
})

test.skip('If CPU successfully hits a square, it then hits an adjacent square', async () => {
    let testerShip = new Ship(1, true);
    player1.board.placeShip(testerShip, 1, 1);

    cpu.lastAttack = { x: 1, y: 1 };
    const nextAttack = await cpu.playCPUTurn(player1);

    const expectedCoords = [
        { x: 0, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 0 },
        { x: 1, y: 2 },
    ];

    expect(expectedCoords).toContainEqual(nextAttack);
})

test.skip('CPU tries every square around a 1-length ship before giving up', async () => {
    let testerShip = new Ship(1, true);
    player1.board.placeShip(testerShip, 1, 1);

    const expectedCoords = [
        { x: 0, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 0 },
        { x: 1, y: 2 },
    ];

    cpu.lastAttack = { x: 1, y: 1 };
    await cpu.playCPUTurn(player1);
    await cpu.playCPUTurn(player1);
    await cpu.playCPUTurn(player1);
    const fourthAttack = await cpu.playCPUTurn(player1);
    expect(expectedCoords).toContainEqual(fourthAttack);
    const fifthAttack = await cpu.playCPUTurn(player1);
    expect(expectedCoords).not.toContainEqual(fifthAttack);
})

test('If CPU gets two hits in a given direction, attack a third time in that direction', async () => {
    let testerShip = new Ship(4, true);
    player1.board.placeShip(testerShip, 5, 0);

    cpu.lastAttack = { x: 7, y: 0 };
    await cpu.playCPUTurn(player1);
    await cpu.playCPUTurn(player1);
    await cpu.playCPUTurn(player1);
    await cpu.playCPUTurn(player1);
    await cpu.playCPUTurn(player1);
    await cpu.playCPUTurn(player1);
    await cpu.playCPUTurn(player1);
})