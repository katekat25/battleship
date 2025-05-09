import { Ship } from "./ship.js";
import { CPU } from "./player.js";

function newGame(player1, player2, renderer = null) {
    const game = {
        player1,
        player2,
        activePlayer: player1,
        renderer,
        turnCount: 1,
        isBusy: false,

        swapActivePlayer() {
            this.activePlayer = this.activePlayer === this.player1 ? this.player2 : this.player1;
        },

        initialize() {
            console.log("In initialize()");
            
            console.log("Placing ships for Player 1");
            placeDefaultShips(this.player1.board);
            console.log("Placing ships for Player 2");
            placeDefaultShips(this.player2.board);
            
            console.log("Drawing Player 1's board");
            this.renderer.drawGameboard(this.player1);
            console.log("Drawing Player 2's board");
            this.renderer.drawGameboard(this.player2);
            
            console.log("Exiting initialize");
        },
        

        processAttack(attacker, defender, x, y) {
            console.log("Handling attack at (" + x + ", " + y + ")");

            if (defender === attacker) {
                this.renderer.setMessage("Cannot attack own board.");
                throw new Error("Cannot attack own board.");
            }

            if (!defender.board.isValidAttack(x, y)) {
                this.renderer.setMessage("Attack is not valid.");
                throw new Error("Attack is not valid.");
            }

            defender.board.receiveAttack(x, y);

            this.renderer.drawGameboard(defender);

            if (defender.board.isAllSunk()) {
                this.renderer.endGame(defender);
                return true;
            }

            return false;
        },

        async playTurn(x, y, defender, attacker = this.activePlayer) {
            if (this.isBusy) return; // Prevent overlapping turns
            this.isBusy = true;

            if (attacker instanceof CPU) {
                this.renderer.toggleBoardClicking();
                this.renderer.setMessage(`Turn ${this.turnCount}: Thinking...`);
                const coords = await attacker.playCPUTurn(defender);
                console.log(coords);
                console.log(coords.x);
                console.log(coords.y);

                if (this.processAttack(attacker, defender, coords.x, coords.y)) {
                    this.isBusy = false;
                    return;
                }

                this.renderer.toggleBoardClicking();

            } else {
                // console.log("Player making move.");
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
            this.renderer.setMessage(`Turn ${this.turnCount}: ${this.activePlayer.name}'s turn.`);

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
    console.log("Placing default ships.")
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
    console.log("Resetting game.");

    // reset game state
    game.turnCount = 1;
    game.activePlayer = game.player1;

    // clear boards
    game.player1.board.clearBoard();
    game.player2.board.clearBoard();

    // re-initialize and update ui
    console.log("Initializing game.");
    game.initialize();
    game.renderer.setMessage("");

    // reset ui
    const shuffleButton = document.querySelector(".shuffle");
    const startButton = document.querySelector(".play");
    shuffleButton.disabled = false;
    startButton.disabled = false;

    game.renderer.toggleBoardClicking();
}



export { newGame, placeDefaultShips, resetGame };
