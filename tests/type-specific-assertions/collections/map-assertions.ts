import Test from "../../../src/lib/Test";

const map = new Map([['a', 1], ['b', 2], ['c', 3]]);

export const test1 = new Test("Key tests", expect => {
    expect(map).named().toHaveKey('a');
    expect(map).named().forAllKeys(k => k.toMatch(/[a-z]/g));
    expect(map).named().forSomeKeys(k => k.toBe("c"));
});

export const test2 = new Test("Value tests", expect => {
    expect(map).named().toHaveValue(1);
    expect(map).named().forAllValues(v => v.named().toBeAtLeast(0));
    expect(map).named().forSomeValues(v => v.named().toBePrime());
});

export const test3 = new Test("Entry tests", expect => {
    expect(map).named().toHaveEntry('a', 1);
    expect(map).named().toBeOfSize(3);
});