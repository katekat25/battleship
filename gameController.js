function newGame(player1, player2, renderer = null) {
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
            //obviously automate this later

            player1.board.placeShip(4, 0, 0, 3, 0);
            player1.board.placeShip(3, 5, 9, 7, 9);
            player1.board.placeShip(2, 5, 0, 6, 0);
            player1.board.placeShip(2, 2, 5, 2, 6);
            player1.board.placeShip(2, 0, 5, 0, 6)
            player1.board.placeShip(1, 4, 6, 4, 6);
            player1.board.placeShip(1, 9, 0, 9, 0);
            player1.board.placeShip(1, 8, 4, 8, 4);
            player1.board.placeShip(1, 7, 7, 7, 7);
            player1.board.placeShip(3, 3, 3, 5, 3);
            player2.board.placeShip(4, 0, 0, 3, 0);
            player2.board.placeShip(3, 3, 3, 5, 3);
            player2.board.placeShip(3, 5, 9, 7, 9);
            player2.board.placeShip(2, 5, 0, 6, 0);
            player2.board.placeShip(2, 2, 5, 2, 6);
            player2.board.placeShip(2, 0, 5, 0, 6)
            player2.board.placeShip(1, 4, 6, 4, 6);
            player2.board.placeShip(1, 9, 0, 9, 0);
            player2.board.placeShip(1, 8, 4, 8, 4);
            player2.board.placeShip(1, 7, 7, 7, 7);

            renderer.drawGameboard(player1);
            renderer.drawGameboard(player2);

            this.setMessage(`Turn ${this.roundCount}: ${this.activePlayer.name}'s turn.`);
        },

        handleAttack(x, y, attackedPlayer) {
            if (attackedPlayer == this.activePlayer) {
                this.setMessage("Cannot attack own board.");
                throw new Error('Cannot attack own board.');
            }
            if (attackedPlayer.board.isValidAttack(x, y)) {
                console.log("Going to receiveAttack.");
                attackedPlayer.board.receiveAttack(x, y);
            } else {
                this.setMessage("Attack is not valid.");
                throw new Error('Attack is not valid.');
            }
            if (attackedPlayer.board.isAllSunk()) {
                console.log("Game ending")
                this.endGame(attackedPlayer);
                return;
            }
        },

        playTurn: async function (x, y, attackedPlayer) {
            this.handleAttack(x, y, attackedPlayer);
            this.roundCount++;
            this.swapActivePlayer();
            this.setMessage(`Turn ${this.roundCount}: ${this.activePlayer.name}'s turn.`);
            if (this.activePlayer.name === "CPU") {
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.makeCPUMove()
                // console.log("Moving on from setTimeout.");
                this.renderer.drawGameboard(player1);
                this.roundCount++;
                this.swapActivePlayer();
                this.setMessage(`Turn ${this.roundCount}: ${this.activePlayer.name}'s turn.`);
            }
        },

        setMessage(message) {
            let messageBox = document.querySelector(".notifications");
            messageBox.innerHTML = '';
            messageBox.textContent = message;
        },

        endGame(loser) {
            console.log("in endGame");
            this.setMessage(`Game over! All of ${loser.name}'s ships have been sunk.`);
        },

        makeCPUMove() {
            console.log("Making CPU move.");
            let x = Math.floor(Math.random() * 10);
            let y = Math.floor(Math.random() * 10);
            if (player1.board.isValidAttack(x, y)) {
                this.handleAttack(x, y, player1);
            } else this.makeCPUMove();
        }
    };
}

export { newGame }