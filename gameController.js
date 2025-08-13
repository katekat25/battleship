import { CPU } from "./player.js";
import { placeDefaultShips } from "./shipUtils.js";
import { EventEmitter } from "./eventEmitter.js";

const emitter = new EventEmitter();

function newGame(player1, player2) {
    let game = {
        player1,
        player2,
        activePlayer: player1,
        turnCount: 1,
        isBusy: false,
        started: false,
        sessionId: 0, 

        swapActivePlayer() {
            this.activePlayer = this.activePlayer === this.player1 ? this.player2 : this.player1;
        },

        initialize() {
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

        async playTurn(x, y, defender, attacker = this.activePlayer, sessionAtStart = this.sessionId) {
            if (this.isBusy) return;
            this.isBusy = true;

            // abort if session has changed (e.g. reset during CPU turn)
            if (sessionAtStart !== this.sessionId) {
                this.isBusy = false;
                return;
            }

            if (attacker instanceof CPU) {
                emitter.emit("toggleBoardClicking");
                emitter.emit("message", `Turn ${this.turnCount}: Thinking...`);
                const coords = await attacker.playCPUTurn(defender);

                // abort if session has changed after async
                if (sessionAtStart !== this.sessionId) {
                    this.isBusy = false;
                    return;
                }

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
                await this.playTurn(null, null, this.player1, this.sessionId);
            }
        }
    };

    emitter.on("cellClick", ({ x, y, player }) => {
        if (!game.started || game.isBusy) return;
        if (game.activePlayer instanceof CPU) return;
        game.playTurn(x, y, player);
    });
    emitter.on("shufflePlayerBoard", () => {
        if (!game.started) {
            game.player1.board.clearBoard();
            placeDefaultShips(game.player1.board);
            emitter.emit("drawGameboard", game.player1);
        }
    });
    emitter.on("startGame", () => {
        if (!game.started) {
            game.started = true;
            emitter.emit("message", `Turn ${game.turnCount}: ${game.activePlayer.name}'s turn.`);
        }
    });
    emitter.on("resetGame", () => {
        game.sessionId++;
        game.turnCount = 1;
        game.activePlayer = game.player1;
        game.player1.board.clearBoard();
        game.player2.board.clearBoard();
        placeDefaultShips(game.player1.board);
        placeDefaultShips(game.player2.board);
        emitter.emit("drawGameboard", game.player1);
        emitter.emit("drawGameboard", game.player2);
        game.started = false;
        emitter.emit("message", "");
        emitter.emit("toggleBoardClicking");
    });

    return game;
}

export { newGame, emitter };
