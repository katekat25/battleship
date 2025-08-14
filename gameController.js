import { CPU } from "./player.js";
import { placeDefaultShips } from "./shipUtils.js";
import { EventEmitter } from "./eventEmitter.js";

const emitter = new EventEmitter();

function newGame(player1, player2) {
    function queueNextCPUMove(game) {
        const nextDefender = game.player1 instanceof CPU ? game.player2 : game.player1;
        if (!game.pendingCPUMove) {
            game.pendingCPUMove = { x: null, y: null, defender: nextDefender, attacker: game.activePlayer, sessionAtStart: game.sessionId };
        }
    }
    let game = {
        player1,
        player2,
        activePlayer: player1,
        turnCount: 1,
        isBusy: false,
        started: false,
        sessionId: 0,
        pendingCPUMove: null,

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

            const result = defender.board.receiveAttack(x, y);
            emitter.emit("drawGameboard", defender);

            if (result.hit && result.sunk) {
                emitter.emit("message", "Sunk a ship!");
            } else if (result.hit) {
                emitter.emit("message", "Hit!");
            } else {
                emitter.emit("message", "Miss.");
            }

            if (defender.board.isAllSunk()) {
                emitter.emit("gameOver", defender);
                return true;
            }

            return false;
        },

        getReadableCoords(x, y) {
            const yToAlphabet = {
                0: "J",
                1: "I",
                2: "H",
                3: "G",
                4: "F",
                5: "E",
                6: "D",
                7: "C",
                8: "B",
                9: "A"
            };
            return yToAlphabet[y] + (x + 1);
        },

        async playTurn(x, y, defender, attacker = this.activePlayer, sessionAtStart = this.sessionId) {
            if (!(attacker instanceof CPU)) {
                emitter.emit("message", "Attacking at " + this.getReadableCoords(x, y));
            }
            if (this.isBusy && !(attacker instanceof CPU && this.pendingCPUMove)) {
                if (attacker instanceof CPU && !this.pendingCPUMove) {
                    this.pendingCPUMove = { x, y, defender, attacker, sessionAtStart };
                }
                return;
            }
            this.isBusy = true;

            if (sessionAtStart !== this.sessionId) {
                this.isBusy = false;
                return;
            }

            if (attacker instanceof CPU) {
                if (x == null && y == null) {
                    emitter.emit("toggleBoardClicking");
                    emitter.emit("message", `Turn ${this.turnCount}: ${attacker.name}'s turn.`);
                    emitter.emit("message", "__CPU_PAUSE__");
                    emitter.emit("message", "Thinking...");
                    emitter.emit("message", "__CPU_DRAW__");
                    return;
                } else {
                    return;
                }
            } else {
                try {
                    if (this.processAttack(attacker, defender, x, y)) {
                        return;
                    }
                } catch (err) {
                    this.isBusy = false;
                    return;
                }
            }

            this.turnCount++;
            this.swapActivePlayer();
            if (!(this.activePlayer instanceof CPU)) {
                emitter.emit("message", `Turn ${this.turnCount}: ${this.activePlayer.name}'s turn.`, { instant: true });
                emitter.emit("message", "__ENABLE_PLAYER_CLICK__");
            }
            if (!defender.board.isAllSunk() && this.activePlayer instanceof CPU) {
                const nextDefender = this.player1 instanceof CPU ? this.player2 : this.player1;
                if (!this.pendingCPUMove) {
                    this.pendingCPUMove = { x: null, y: null, defender: nextDefender, attacker: this.activePlayer, sessionAtStart: this.sessionId };
                }
            }
        }
    };

    emitter.on("cellClick", ({ x, y, player }) => {
        if (!game.started || game.isBusy) return;
        if (game.activePlayer instanceof CPU) return;
        game.playTurn(x, y, player, game.activePlayer, game.sessionId);
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
            if (game.activePlayer instanceof CPU) {
                game.playTurn(null, null, game.player2, game.activePlayer, game.sessionId);
            }
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
    emitter.on("messageQueueIdle", () => {
        if (game.pendingCPUMove) {
            game.isBusy = false;
            const move = game.pendingCPUMove;
            game.pendingCPUMove = null;
            game.playTurn(move.x, move.y, move.defender, move.attacker, move.sessionAtStart);
        } else {
            game.isBusy = false;
        }
    });
    emitter.on("cpuDrawAfterThinking", async () => {
        const cpu = game.activePlayer;
        const defender = game.player1 instanceof CPU ? game.player2 : game.player1;
        const coords = await cpu.playCPUTurn(defender);
        emitter.emit("message", "Attacking at " + game.getReadableCoords(coords.x, coords.y));
        if (game.processAttack(cpu, defender, coords.x, coords.y)) {
            return;
        }
        emitter.emit("toggleBoardClicking");
        game.turnCount++;
        game.swapActivePlayer();
        if (!(game.activePlayer instanceof CPU)) {
            emitter.emit("message", `Turn ${game.turnCount}: ${game.activePlayer.name}'s turn.`, { instant: true });
            emitter.emit("message", "__ENABLE_PLAYER_CLICK__");
        } else {
            queueNextCPUMove(game);
        }
    });
    emitter.on("enablePlayerClick", () => {
        emitter.emit("toggleBoardClicking");
    });

    return game;
}

export { newGame, emitter };
