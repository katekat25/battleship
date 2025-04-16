import { Ship } from "./ship.js";

function newGame(player1, player2, renderer = null) {
    const game = {
        player1,
        player2,
        activePlayer: player1,
        renderer,
        turnCount: 1,

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

        handleAttack(x, y, attackedPlayer) {
            if (attackedPlayer === this.activePlayer) {
                this.renderer.setMessage("Cannot attack own board.");
                throw new Error('Cannot attack own board.');
            }
            if (attackedPlayer.board.isValidAttack(x, y)) {
                attackedPlayer.board.receiveAttack(x, y);
            } else {
                this.renderer.setMessage("Attack is not valid.");
                throw new Error('Attack is not valid.');
            }
        },

        async playTurn(x, y, attackedPlayer) {
            if (this.activePlayer.name === "CPU") {
                this.renderer.setMessage(`Turn ${this.turnCount}: Thinking...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.makeCPUMove(); // CPU attacks player1
                this.renderer.drawGameboard(this.player1); // Draw player1's board
                if (this.player1.board.isAllSunk()) {
                    this.renderer.endGame(this.player1);
                    return;
                }
            } else {
                this.handleAttack(x, y, attackedPlayer); // Human attacks CPU
                this.renderer.drawGameboard(attackedPlayer); // Draw CPU's board
                if (attackedPlayer.board.isAllSunk()) {
                    this.renderer.endGame(attackedPlayer);
                    return;
                }
            }

            this.turnCount++;
            this.swapActivePlayer();
            this.renderer.setMessage(`Turn ${this.turnCount}: ${this.activePlayer.name}'s turn.`);

            // Trigger CPU's turn again if it's now the CPU's turn
            if (this.activePlayer.name === "CPU") {
                await this.playTurn(null, null, this.player1);
            }
        },

        makeCPUMove() {
            const [x, y] = getRandomValidAttackCoordinates(this.player1.board);
            this.handleAttack(x, y, this.player1);
        }
    };

    // Helper function to get valid coordinates for ship placement
    function getValidCoordinates(board, shipLength, isHorizontal) {
        let x, y;
        do {
            x = Math.floor(Math.random() * (isHorizontal ? board.width - shipLength + 1 : board.width));
            y = Math.floor(Math.random() * (isHorizontal ? board.height : board.height - shipLength + 1));
        } while (!board.isValidPlacement(x, y, shipLength, isHorizontal));
        return [x, y];
    }

    // Helper function to place default ships on the board
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

    // Helper function to get random valid attack coordinates
    function getRandomValidAttackCoordinates(board) {
        let x, y;
        do {
            x = Math.floor(Math.random() * board.width);
            y = Math.floor(Math.random() * board.height);
        } while (!board.isValidAttack(x, y));
        return [x, y];
    }

    return game;
}

export { newGame };
