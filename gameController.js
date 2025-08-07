import { Ship } from "./ship.js";
import { CPU } from "./player.js";
import { EventEmitter } from "./eventEmitter.js";

const emitter = new EventEmitter();

function newGame(player1, player2) {
    const game = {
        player1,
        player2,
        activePlayer: player1,
        turnCount: 1,
        isBusy: false,

        swapActivePlayer() {
            this.activePlayer = this.activePlayer === this.player1 ? this.player2 : this.player1;
        },

        initialize() {
            placeDefaultShips(this.player1.board);
            placeDefaultShips(this.player2.board);
            emitter.emit("drawGameboard", this.player1);
            emitter.emit("drawGameboard", this.player2);
        },
        

        processAttack(attacker, defender, x, y) {
            if (defender === attacker) {
                emitter.emit("message", "Cannot attack own board.");
                throw new Error("Cannot attack own board.");
            }

            if (!defender.board.isValidAttack(x, y)) {
                emitter.emit("message", "Attack is not valid.");
                throw new Error("Attack is not valid.");
            }

            defender.board.receiveAttack(x, y);
            emitter.emit("drawGameboard", defender);

            if (defender.board.isAllSunk()) {
                emitter.emit("gameOver", defender);
                return true;
            }

            return false;
        },

        async playTurn(x, y, defender, attacker = this.activePlayer) {
            if (this.isBusy) return; // Prevent overlapping turns
            this.isBusy = true;

            if (attacker instanceof CPU) {
                emitter.emit("toggleBoardClicking");
                emitter.emit("message", `Turn ${this.turnCount}: Thinking...`);
                const coords = await attacker.playCPUTurn(defender);

                if (this.processAttack(attacker, defender, coords.x, coords.y)) {
                    this.isBusy = false;
                    return;
                }

                emitter.emit("toggleBoardClicking");

            } else {
                try {
                    if (this.processAttack(attacker, defender, x, y)) {
                        this.isBusy = false;
                        return;
                    }
                } catch (err) {
                    this.isBusy = false;
                    return;
                }
            }

            this.turnCount++;
            this.swapActivePlayer();
            emitter.emit("message", `Turn ${this.turnCount}: ${this.activePlayer.name}'s turn.`);

            this.isBusy = false;

            if (!defender.board.isAllSunk() && this.activePlayer instanceof CPU) {
                await this.playTurn(null, null, this.player1);
            }
        }

    };

    return game;
}

function getValidPlacement(board, shipLength, isHorizontal) {
    let x, y;
    do {
        x = Math.floor(Math.random() * (isHorizontal ? board.width - shipLength + 1 : board.width));
        y = Math.floor(Math.random() * (isHorizontal ? board.height : board.height - shipLength + 1));
    } while (!board.isValidPlacement(x, y, shipLength, isHorizontal));
    return [x, y];
}

function placeDefaultShips(board) {
    const shipConfigs = [
        { length: 1, count: 4 },
        { length: 2, count: 3 },
        { length: 3, count: 2 },
        { length: 4, count: 1 }
    ];

    shipConfigs.forEach(({ length, count }) => {
        for (let i = 0; i < count; i++) {
            const isHorizontal = Math.random() < 0.5;
            const [x, y] = getValidPlacement(board, length, isHorizontal);
            const ship = new Ship(length, isHorizontal);
            board.placeShip(ship, x, y);
        }
    });
}

function resetGame(game) {
    // reset game state
    game.turnCount = 1;
    game.activePlayer = game.player1;

    // clear boards
    game.player1.board.clearBoard();
    game.player2.board.clearBoard();

    // re-initialize and update ui
    game.initialize();
    emitter.emit("message", "");

    // reset ui
    const shuffleButton = document.querySelector(".shuffle");
    const startButton = document.querySelector(".play");
    shuffleButton.disabled = false;
    startButton.disabled = false;

    emitter.emit("toggleBoardClicking");
}



export { newGame, placeDefaultShips, resetGame, emitter };
