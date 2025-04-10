import { Ship } from "./ship";

test('Ship class exists', () => {
    expect(new Ship()).toBeInstanceOf(Ship);
});

test('Hit() increases number of hits on ship', () => {
    const ship = new Ship(1);
    ship.hit();
    expect(ship.timesHit).toBe(1);
})

test('isSunk() reports sinkage accurately', () => {
    const ship = new Ship(4);
    expect(ship.isSunk()).toBeFalsy();
    ship.hit();
    ship.hit();
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBeTruthy();
})
