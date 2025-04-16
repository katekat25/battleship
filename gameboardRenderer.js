import { CPU } from "./player.js";

function createRenderer() {
    let game = null;

    function setGame(g) {
        game = g;
    }

    function setMessage(message) {
        const messageBox = document.querySelector(".notifications");
        messageBox.textContent = message;
    }

    function endGame(loser) {
        setMessage(`Game over! All of ${loser.name}'s ships have been sunk.`);
        document.querySelector(".gameboard-container").style.pointerEvents = "none";
    }

    function createCell(square, player, x, y) {
        const cell = document.createElement("div");
        cell.className = "cell";
        const cellSize = 500 / player.board.width;
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;

        // CPU board (hidden ships)
        if (player instanceof CPU) {
            cell.style.backgroundColor = "lightgrey";
        }

        // Ship present and not hit
        else if (square.ship && !square.hasHit) {
            cell.style.backgroundColor = "blue";
        }

        // Miss
        if (!square.ship && square.hasHit) {
            cell.style.backgroundColor = "lightpink";
        }

        // Hit
        if (square.ship && square.hasHit) {
            cell.style.backgroundColor = "red";
        }

        cell.addEventListener("click", () => {
            game.playTurn(y, x, player);
        });

        return cell;
    }

    function drawGameboard(player) {
        const gameboard = document.querySelector(`.${player.htmlTag}`);
        gameboard.innerHTML = '';

        for (let x = player.board.width - 1; x >= 0; x--) {
            for (let y = 0; y < player.board.height; y++) {
                const square = player.board.grid[y][x];
                const cell = createCell(square, player, x, y);
                gameboard.appendChild(cell);
            }
        }
    }

    return { setGame, drawGameboard, setMessage, endGame }
}


export { createRenderer }
