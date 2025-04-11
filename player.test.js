import { Player } from "./player";

test('Player class exists', () => {
    expect(new Player()).toBeInstanceOf(Player);
});