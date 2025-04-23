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

test('If CPU successfully hits a square, it then hits an adjacent square', async () => {
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

test('CPU tries every square around a 1-length ship before giving up', async () => {
    let testerShip = new Ship(1, true);
    player1.board.placeShip(testerShip, 1, 1);

    cpu.lastAttack = { x: 1, y: 1 };
    const nextAttack = await cpu.playCPUTurn(player1);
    console.log("nextAttack: ");
    console.log(nextAttack);
    const nextAttack2 = await cpu.playCPUTurn(player1);
    console.log("nextAttack2: ");
    console.log(nextAttack2);
    const nextAttack3 = await cpu.playCPUTurn(player1);
    console.log("nextAttack3: ");
    console.log(nextAttack3);
    const nextAttack4 = await cpu.playCPUTurn(player1);
    console.log("nextAttack4: ");
    console.log(nextAttack4);
    const nextAttack5 = await cpu.playCPUTurn(player1);
    console.log("nextAttack5: ");
    console.log(nextAttack5);
})