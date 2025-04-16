function createRenderer() {
    let game = null;

    function setGame(g) {
        game = g;
    }

    function drawGameboard(player) {
        const gameboard = document.querySelector(`.${player.htmlTag}`);
        gameboard.innerHTML = '';
        for (let x = player.board.width - 1; x >= 0; x--) {
            for (let y = 0; y < player.board.height; y++) {
                const square = player.board.grid[y][x];
                let cell = document.createElement("div");
                cell.className = "cell";
                cell.style.width = (500 / player.board.width) + "px";
                cell.style.height = (500 / player.board.height) + "px";
                if (player.name !== "CPU") {
                    if (square.ship !== null && square.hasHit == false) {
                        cell.style.backgroundColor = "blue";
                    }
                } else cell.style.backgroundColor = "lightgrey";
                if (square.ship == undefined && square.hasHit == true) {
                    cell.style.backgroundColor = "lightpink";
                }
                if (square.ship !== null && square.hasHit == true) {
                    cell.style.backgroundColor = "red";
                }
                gameboard.appendChild(cell);
                cell.addEventListener("click", (e) => {
                    game.playTurn(y, x, player);
                });
            }
        }
    }

    function setMessage(message) {
        let messageBox = document.querySelector(".notifications");
        messageBox.innerHTML = '';
        messageBox.textContent = message;
    }

    function endGame(loser) {
        // console.log("in endGame");
       setMessage(`Game over! All of ${loser.name}'s ships have been sunk.`);
        let gameboardContainer = document.querySelector(".gameboard-container");
        gameboardContainer.style.pointerEvents("none");
    }

    return { setGame, drawGameboard, setMessage, endGame }
}


export { createRenderer }
