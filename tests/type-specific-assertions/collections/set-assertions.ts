import Test from "../../../src/lib/Test";

const s1 = new Set([1, 2, 3]);
const s2 = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

export const test1 = new Test("Containment assertions", expect => {
    expect(s1).named().toContain(1);
    expect(s1).named().toContainAllOf(3, 2, 1, 3);
    expect(s1).named().toContainSomeOf(4, 6, 2, 5, 2);
});

export const test2 = new Test("Assertions on elements", expect => {
    expect(s1).named().forAllElements(e => e.named().toBeAtMost(3));
    expect(s1).named().forSomeElements(e => e.named().toBeGreaterThan(2));
});

export const test3 = new Test("Other assertions", expect => {
    expect(s1).named().toBeOfSize(3);
});