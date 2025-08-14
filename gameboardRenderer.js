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
                shuffleButton.disabled = false;
                startButton.disabled = false;
                if (boardContainer) boardContainer.style.pointerEvents = "auto";
                setMessage("Ready to start a new game!");
            } catch (e) {
                console.error("Error resetting game:", e);
            }
        });

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

    function setMessage(message, options = {}) {
        messageQueue.push({ message, instant: options.instant });
        if (!processingQueue) processQueue();
    }

    function setTestMode(val) {
        testMode = val;
    }

    const CONTROL_MESSAGES = new Set(["__CPU_DRAW__", "__ENABLE_PLAYER_CLICK__", "__CPU_PAUSE__"]);

    function getMessageDelay(message, instant, testMode) {
        if (instant || testMode) return 0;
        if (message === "__CPU_PAUSE__") return 250;
        if (CONTROL_MESSAGES.has(message)) return 0;
        return 1000;
    }

    async function processQueue() {
        processingQueue = true;
        while (messageQueue.length > 0) {
            const { message, instant } = messageQueue.shift();
            if (!CONTROL_MESSAGES.has(message)) {
                messageLog.push(message);
                const messageBox = document.querySelector(".notifications");
                messageBox.innerHTML = messageLog.join("<br>");
            }
            const delay = getMessageDelay(message, instant, testMode);
            if (delay > 0) await new Promise(resolve => setTimeout(resolve, delay));
            if (message === "__CPU_DRAW__") emitter.emit("cpuDrawAfterThinking");
            if (message === "__ENABLE_PLAYER_CLICK__") {
                const boardContainer = document.querySelector(".container");
                if (boardContainer && boardContainer.style.pointerEvents !== "auto") {
                    boardContainer.style.pointerEvents = "auto";
                }
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
        const cellSize = 400 / player.board.width; //400 = whatever height and width the board is in px
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
        const gameboard = document.querySelector(`.${player.htmlTag}`);
        if (!gameboard) {
            return;
        }

        gameboard.innerHTML = '';

        try {
            for (let x = player.board.width - 1; x >= 0; x--) {
                for (let y = 0; y < player.board.height; y++) {
                    const square = player.board.grid[y]?.[x];
                    if (!square) {
                        continue;
                    }

                    const cell = createCell(square, player, x, y);
                    gameboard.appendChild(cell);
                }
            }
        } catch (e) {
            setMessage("Error rendering gameboard. See console for details.");
        }
    }

    return { initialize, drawGameboard, setMessage, endGame, toggleBoardClicking, setTestMode }
}


export { createRenderer }
