import { CPU } from "./player.js";
import { emitter } from "./gameController.js";
import { placeDefaultShips } from "./shipUtils.js";

function createRenderer() {
    let messageLog = [];
    let messageQueue = [];
    let processingQueue = false;
    let testMode = false;

    function initialize(game) {
        const shuffleButton = document.querySelector(".shuffle");
        const startButton = document.querySelector(".play");
        const newGameButton = document.querySelector(".play-again");
        const boardContainer = document.querySelector(".container");

        shuffleButton.disabled = false;
        startButton.disabled = false;
        if (boardContainer) boardContainer.style.pointerEvents = "auto";

        shuffleButton.addEventListener("click", () => {
            emitter.emit("shufflePlayerBoard");
        });
        startButton.addEventListener("click", () => {
            emitter.emit("startGame");
            shuffleButton.disabled = true;
            startButton.disabled = true;
        });
        newGameButton.addEventListener("click", () => {
            try {
                emitter.emit("resetGame");
                // Re-enable buttons and pointer events after reset
                shuffleButton.disabled = false;
                startButton.disabled = false;
                if (boardContainer) boardContainer.style.pointerEvents = "auto";
                setMessage("Ready to start a new game!");
            } catch (e) {
                // Prevent crash on reset
                console.error("Error resetting game:", e);
            }
        });

        // Place default ships for player board on initial load
        if (game && game.player1 && game.player1.board) {
            placeDefaultShips(game.player1.board);
            emitter.emit("drawGameboard", game.player1);
        }

        emitter.on("drawGameboard", drawGameboard);
        emitter.on("message", setMessage);
        emitter.on("gameOver", endGame);
        emitter.on("toggleBoardClicking", toggleBoardClicking);

        setMessage("Ready to start a new game!")
    }

    function setMessage(message) {
        messageQueue.push(message);
        if (!processingQueue) processQueue();
    }

    function setTestMode(val) {
        testMode = val;
    }

    async function processQueue() {
        processingQueue = true;
        while (messageQueue.length > 0) {
            const message = messageQueue.shift();
            messageLog.push(message);
            const messageBox = document.querySelector(".notifications");
            messageBox.innerHTML = messageLog.join("<br>");
            if (!testMode) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        processingQueue = false;
        emitter.emit("messageQueueIdle");
    }

    function endGame(loser) {
        setMessage(`Game over! All of ${loser.name}'s ships have been sunk.`);
    }

    function toggleBoardClicking() {
        const boardContainer = document.querySelector(".container");
        const isDisabled = boardContainer.style.pointerEvents === "none";
        boardContainer.style.pointerEvents = isDisabled ? "auto" : "none";
    }

    function createCell(square, player, x, y) {
        const cell = document.createElement("div");
        cell.className = "cell";
        const cellSize = 400 / player.board.width; //400 = height of the board set in the css
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;

        cell.style.backgroundColor = "rgba(211, 211, 211, 0.4)";

        // ship present and not hit
        if (!(player instanceof CPU) && square.ship && !square.hasHit) {
            cell.style.backgroundColor = "#003300";
        }

        // miss
        if (!square.ship && square.hasHit) {
            const missMark = document.createElement("span");
            missMark.textContent = "X"
            missMark.className = "cell-miss";
            cell.appendChild(missMark);
        }

        // hit
        if (square.ship && square.hasHit) {
            cell.style.backgroundColor = "#4AF626";
            // sunk
            if (square.ship.isSunk()) {
                const fire = document.createElement("img");
                fire.src = "assets/fire.gif";
                fire.className = "cell-fire";
                cell.appendChild(fire);
            }
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

        try {
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
        } catch (e) {
            console.error("Error during grid integrity check or rendering:", e);
            setMessage("Error rendering gameboard. See console for details.");
        }
    }

    return { initialize, drawGameboard, setMessage, endGame, toggleBoardClicking, setTestMode }
}


export { createRenderer }
