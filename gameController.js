import { Ship } from "./ship.js";

function newGame(player1, player2, renderer = null) {
    function getValidCoordinates(board, shipLength, isHorizontal) {
        let x, y;
        do {
            x = Math.floor(Math.random() * (isHorizontal ? board.width - shipLength + 1 : board.width));
            y = Math.floor(Math.random() * (isHorizontal ? board.height : board.height - shipLength + 1));
        } while (!board.isValidPlacement(x, y, shipLength, isHorizontal));
        return [x, y];
    }

    function getRandomBoolean() {
        return Math.random() < 0.5;
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

    return {
        player1: player1,
        player2: player2,
        activePlayer: player1,
        renderer: renderer,
        roundCount: 1,
        swapActivePlayer: function () {
            if (this.activePlayer === this.player1) {
                this.activePlayer = this.player2;
            } else {
                this.activePlayer = this.player1;
            }
        },

        initialize: function () {
            placeDefaultShips(player1.board);
            placeDefaultShips(player2.board);

            renderer.drawGameboard(player1);
            renderer.drawGameboard(player2);

            this.renderer.setMessage(`Turn ${this.roundCount}: ${this.activePlayer.name}'s turn.`);
        },

        handleAttack(x, y, attackedPlayer) {
            if (attackedPlayer == this.activePlayer) {
                this.renderer.setMessage("Cannot attack own board.");
                throw new Error('Cannot attack own board.');
            }
            if (attackedPlayer.board.isValidAttack(x, y)) {
                // console.log("Going to receiveAttack.");
                attackedPlayer.board.receiveAttack(x, y);
            } else {
                this.renderer.setMessage("Attack is not valid.");
                throw new Error('Attack is not valid.');
            }
        },

        playTurn: async function (x, y, attackedPlayer) {
            if (this.activePlayer.name === "CPU") {
                this.renderer.setMessage(`Thinking...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.makeCPUMove(); // CPU attacks player1
                this.renderer.drawGameboard(player1); // Draw player1's board
                if (player1.board.isAllSunk()) {
                    this.renderer.endGame(player1);
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

            this.roundCount++;
            this.swapActivePlayer();
            this.renderer.setMessage(`Turn ${this.roundCount}: ${this.activePlayer.name}'s turn.`);

            // Trigger CPU's turn again if it's now the CPU's turn
            if (this.activePlayer.name === "CPU") {
                await this.playTurn(null, null, player1);
            }
        },

        makeCPUMove() {
            // console.log("Making CPU move.");
            let x = Math.floor(Math.random() * 10);
            let y = Math.floor(Math.random() * 10);

            while (!player1.board.isValidAttack(x, y)) {
                x = Math.floor(Math.random() * 10);
                y = Math.floor(Math.random() * 10);
            }
            this.handleAttack(x, y, player1);
        }
    };
}

export { newGame }