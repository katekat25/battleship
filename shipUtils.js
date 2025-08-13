import { Ship } from "./ship.js";

function placeDefaultShips(board) {
    const shipConfigs = [
        { length: 1, count: 4 },
        { length: 2, count: 3 },
        { length: 3, count: 2 },
        { length: 4, count: 1 }
    ];

    shipConfigs.forEach(({ length, count }) => {
        for (let i = 0; i < count; i++) {
            let placed = false;
            let attempts = 0;
            const maxAttempts = 1000;
            while (!placed && attempts < maxAttempts) {
                const isHorizontal = Math.random() < 0.5;
                const x = Math.floor(Math.random() * (isHorizontal ? board.width - length + 1 : board.width));
                const y = Math.floor(Math.random() * (isHorizontal ? board.height : board.height - length + 1));
                if (board.isValidPlacement(x, y, length, isHorizontal)) {
                    const ship = new Ship(length, isHorizontal);
                    board.placeShip(ship, x, y);
                    placed = true;
                }
                attempts++;
            }
            if (!placed) {
                throw new Error(`Could not place ship of length ${length} after ${maxAttempts} attempts`);
            }
        }
    });
}

export { placeDefaultShips };