function drawGameboard(player) {
    const gameboard = document.querySelector(`.${player.htmlTag}`);
    gameboard.innerHTML = '';
    for (let x = player.board.width - 1; x >= 0; x--) {
        for (let y = 0; y < player.board.height; y++) {
            const square = player.board.grid[y][x];
            console.log(square);
            let cell = document.createElement("div");
            cell.className = "cell";
            cell.style.width = (500 / player.board.width) + "px";
            cell.style.height = (500 / player.board.height) + "px";
            console.log("square.ship: " + square.ship);
            if (square.ship !== null && square.hasHit == false) {
                cell.style.backgroundColor = "blue";
            }
            if (square.ship == undefined && square.hasHit == true) {
                cell.style.backgroundColor = "lightpink";
            }
            if (square.ship !== null && square.hasHit == true) {
                cell.style.backgroundColor = "red";
            }
            gameboard.appendChild(cell);
            cell.addEventListener("click", (e) => {
                player.board.receiveAttack(y, x);
                drawGameboard(player);
            });
        }
    }
}

export { drawGameboard }
