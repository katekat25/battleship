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
            placeDefaultShips(this.player1.board);
            placeDefaultShips(this.player2.board);

            this.renderer.drawGameboard(this.player1);
            this.renderer.drawGameboard(this.player2);

            this.renderer.setMessage(`Turn ${this.turnCount}: ${this.activePlayer.name}'s turn.`);
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

            if (attacker instanceof CPU) {
                console.log("Setting lastAttackCords: " + x + ", " + y);
                attacker.lastAttackCoords = [x, y];
            }

            this.renderer.drawGameboard(defender);

            if (defender.board.isAllSunk()) {
                this.renderer.endGame(defender);
                return true;
            }

            return false;
        },

        async playTurn(x, y, defender) {
            if (this.isBusy) return; // Prevent overlapping turns
            this.isBusy = true;
        
            const attacker = this.activePlayer;
        
            if (attacker instanceof CPU) {
                this.renderer.toggleBoardClicking();
                this.renderer.setMessage(`Turn ${this.turnCount}: Thinking...`);
                const coords = await attacker.cpuTurn(defender);
        
                if (this.processAttack(attacker, defender, coords[0], coords[1])) {
                    this.isBusy = false;
                    return;
                }
                this.renderer.toggleBoardClicking();
            } else {
                console.log("Player making move.");
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
        
            if (this.activePlayer instanceof CPU) {
                await this.playTurn(null, null, this.player1);
            }
        }        
        
    };

    function getValidCoordinates(board, shipLength, isHorizontal) {
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
                const [x, y] = getValidCoordinates(board, length, isHorizontal);
                const ship = new Ship(length, isHorizontal);
                board.placeShip(ship, x, y);
            }
        });
    }

    return game;
}

export { newGame };
