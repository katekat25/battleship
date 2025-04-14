function newGame(player1, player2) {
    return {
        player1: player1,
        player2: player2,
        activePlayer: player1,
        swapActivePlayer: function() {
            if (this.activePlayer === this.player1) {
                this.activePlayer = this.player2;
            } else {
                this.activePlayer = this.player1;
            }
        }
    };
}

export { newGame }