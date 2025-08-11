import { CPU } from "./player.js";
import { emitter } from "./gameController.js";

function createRenderer() {
    function initialize() {
        const shuffleButton = document.querySelector(".shuffle");
        shuffleButton.disabled = false;
        shuffleButton.addEventListener("click", () => {
            emitter.emit("shufflePlayerBoard");
        });
        const startButton = document.querySelector(".play");
        startButton.disabled = false;
        startButton.addEventListener("click", () => {
            emitter.emit("startGame");
            shuffleButton.disabled = true;
            startButton.disabled = true;
        });
        const newGameButton = document.querySelector(".play-again");
        newGameButton.addEventListener("click", () => {
            emitter.emit("resetGame");
        });

        emitter.on("drawGameboard", drawGameboard);
        emitter.on("message", setMessage);
        emitter.on("gameOver", endGame);
        emitter.on("toggleBoardClicking", toggleBoardClicking);
    }

    function setMessage(message) {
        const messageBox = document.querySelector(".notifications");
        messageBox.textContent = message;
    }

    function endGame(loser) {
        setMessage(`Game over! All of ${loser.name}'s ships have been sunk.`);
    }

    function toggleBoardClicking() {
        const boardContainer = document.querySelector(".gameboard-container");
        const isDisabled = boardContainer.style.pointerEvents === "none";
        boardContainer.style.pointerEvents = isDisabled ? "auto" : "none";
    }

    function createCell(square, player, x, y) {
        const cell = document.createElement("div");
        cell.className = "cell";
        const cellSize = 500 / player.board.width;
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;

        // CPU board with ships hidden
        if (player instanceof CPU) {
            cell.style.backgroundColor = "lightgrey";
        }

        // ship present and not hit
        else if (square.ship && !square.hasHit) {
            cell.style.backgroundColor = "blue";
        }

        // miss
        if (!square.ship && square.hasHit) {
            cell.style.backgroundColor = "lightpink";
        }

        // hit
        if (square.ship && square.hasHit) {
            cell.style.backgroundColor = "blue";
            const fire = document.createElement("img");
            fire.src = "assets/fire.gif";
            fire.className = "cell-fire";
            cell.appendChild(fire);
        }

        cell.addEventListener("click", () => {
            emitter.emit("cellClick", { x: y, y: x, player });
        });


        return cell;
    }

    function drawGameboard(player) {
        console.log("Drawing gameboard.");
        const gameboard = document.querySelector(`.${player.htmlTag}`);
        if (!gameboard) {
            console.error(`No gameboard found for selector .${player.htmlTag}`);
            return;
        }

        gameboard.innerHTML = '';

        console.log("Checking grid integrity.");
        for (let x = player.board.width - 1; x >= 0; x--) {
            for (let y = 0; y < player.board.height; y++) {
                const square = player.board.grid[y]?.[x];
                if (!square) {
                    console.warn(`Invalid square at (${x}, ${y})`);
                    continue;
                }

                const cell = createCell(square, player, x, y);
                gameboard.appendChild(cell);
            }
        }
    }

    return { initialize, drawGameboard, setMessage, endGame, toggleBoardClicking }
}


export { createRenderer }
