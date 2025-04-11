function drawGameboard(board, player) {
    const gameboard = document.querySelector(`.${player}`);
    console.log(`.${player} .gameboard`);
    console.log(gameboard);
    for (let x = board.width - 1; x >= 0; x--) {
        for (let y = 0; y < board.height; y++) {
            const square = board.grid[y][x];
            console.log(square);
            let cell = document.createElement("div");
            cell.className = "cell";
            cell.style.width = (500 / board.width) + "px";
            cell.style.height = (500 / board.height) + "px";
            if (square.ship != null) {
                cell.style.backgroundColor = "blue";
            }
            gameboard.appendChild(cell);
            cell.addEventListener("click", (e) => {
                console.log(square);
            });
        }
    }
}

export { drawGameboard }
