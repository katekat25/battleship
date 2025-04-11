function drawGameboard(gameboard) {
    const gameboardContainer = document.querySelector(".gameboard-container");
    console.log(gameboardContainer);
    gameboard.grid.forEach((row, rowIndex) => {
        row.forEach((square, colIndex) => {
            console.log(square);
            let cell = document.createElement("div");
            cell.className = "cell";
            cell.style.width = (600 / gameboard.width) + "px";
            cell.style.height = (600 / gameboard.height) + "px";
            gameboardContainer.appendChild(cell);
            cell.addEventListener("click", (e) => {
                console.log(square);
            })
        })
    });
}

export { drawGameboard }
