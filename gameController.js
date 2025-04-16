import { Ship } from "./ship.js";
import { CPU } from "./player.js";

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

        processAttack(attacker, defender, x, y) {
            attacker.handleAttack(x, y, defender);
            attacker.renderer.drawGameboard(defender);
            if (defender.board.isAllSunk()) {
                attacker.renderer.endGame(defender);
                return true;
            }
            return false;
        },

        async playTurn(x, y, attackedPlayer) {
            const attacker = this.activePlayer;
            const defender = attacker === this.player1 ? this.player2 : this.player1;
        
            if (attacker instanceof CPU) {
                this.renderer.setMessage(`Turn ${this.turnCount}: Thinking...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                const [cpuX, cpuY] = attacker.getRandomValidAttackCoordinates(defender.board);
                if (this.processAttack(this, defender, cpuX, cpuY)) return;
            } else {
                if (this.processAttack(this, attackedPlayer, x, y)) return;
            }
        
            this.turnCount++;
            this.swapActivePlayer();
            this.renderer.setMessage(`Turn ${this.turnCount}: ${this.activePlayer.name}'s turn.`);
        
            if (this.activePlayer instanceof CPU) {
                await this.playTurn(null, null, this.player1);
            }
        },
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

    return game;
}

export { newGame };
