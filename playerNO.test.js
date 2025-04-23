import { Player, CPU } from "./player.js";
import { Gameboard } from "./gameboard.js";
import { newGame } from "./gameController.js";
// import { createRenderer } from "./gameboardRenderer.js";
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
    cpu.resetAll();
});

test.skip('Player class exists', () => {
    expect(new Player()).toBeInstanceOf(Player);
});

test.skip('CPU class exists', () => {
    expect(new CPU()).toBeInstanceOf(Player);
});

test.skip('CPUTurn attack registers on defender board', async () => {
    let testerShip = new Ship(4, true);
    player1.board.placeShip(testerShip, 0, 0);
    await game.playTurn(null, null, player1, cpu, 0, 0);
    expect(player1.board.grid[0][0].hasHit).toBeTruthy();
})

test.skip('CPUTurn attacks an adjacent square on a horizontal ship after a successful hit', async () => {
    // ----- Horizontal Ship Test -----
    const horizontalShip = new Ship(4, true); // occupies (0,0) → (0,3)
    player1.board.placeShip(horizontalShip, 0, 0);

    // CPU hits ship at (0,0)
    await game.playTurn(null, null, player1, cpu, 0, 0);
    // console.log(cpu);

    // Expect next CPU attack to be adjacent
    const [x, y] = await cpu.playCPUTurn(player1);
    // console.log("Second CPU attack (horizontal case):", [secondX, secondY]);
    expect([[0, 1], [1, 0]]).toContainEqual([x, y]);
});

test.skip('CPUTurn attacks an adjacent square on a vertical ship after a successful hit', async () => {
    const verticalShip = new Ship(3, false); // occupies (0,3), (1,3), (2,3)
    player1.board.placeShip(verticalShip, 0, 3);

    // CPU hits ship at (0,3)
    await game.playTurn(null, null, player1, cpu, 0, 3);

    // Expect next CPU attack to be adjacent vertically or horizontally
    const [x, y] = await cpu.playCPUTurn(player1);
    // console.log("Second CPU attack (vertical case):", [vertSecondX, vertSecondY]);
    expect([[0, 2], [1, 3], [0, 4]]).toContainEqual([x, y]);
})

test.skip('CPUTurn attacks all four adjacent squares on a 1-length ship and then gives up', async () => {
    
})

test.skip('After two successful hits, CPUTurn keeps attacking in same direction (horizontal)', async () => {
    const ship = new Ship(4, true);
    player1.board.placeShip(ship, 1, 1);
    await game.playTurn(null, null, player1, cpu, 1, 1);
    await game.playTurn(null, null, player1, cpu, 2, 1);
    //force the direction here so the cpu doesn't get confused
    cpu.targetingKnowledge.currentDirection = [1, 0];
    const [x, y] = await cpu.playCPUTurn(player1);
    expect(x).toBe(3) && expect(y).toBe(1);
})

test.skip('After two successful hits, CPUTurn keeps attacking in same direction (vertical)', async () => {
    const ship = new Ship(4, false);
    player1.board.placeShip(ship, 1, 1);
    await game.playTurn(null, null, player1, cpu, 1, 1);
    await game.playTurn(null, null, player1, cpu, 1, 2);

    //force CPU logic to comply
    cpu.nextPlannedAttackCoord = null;
    cpu.lastAttackCoord = [1, 2];
    cpu.targetingKnowledge.currentDirection = [0, 1];

    const [x, y] = await cpu.playCPUTurn(player1);
    expect(x).toBe(1) && expect(y).toBe(3);
})

test.skip("After two successful hits and a miss, CPUTurn returns to original attack point and reverses direction", async () => {
    const ship = new Ship(4, true);
    player1.board.placeShip(ship, 1, 1); //from 1,1 to 4,1
    await game.playTurn(null, null, player1, cpu, 3, 1); //hits
    await game.playTurn(null, null, player1, cpu, 4, 1); //hits
    await game.playTurn(null, null, player1, cpu, 5, 1); //misses

    //force CPU logic to comply
    cpu.nextPlannedAttackCoord = null;
    cpu.lastAttackCoord = [1, 2];
    cpu.targetingKnowledge.currentDirection = [1, 0];
    cpu.lastSuccessfulHitCoord = [4, 1];

    const [x, y] = await cpu.playCPUTurn(player1);
    expect(x).toBe(2) && expect(y).toBe(1);
})
