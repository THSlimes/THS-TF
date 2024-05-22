import Test from "../../src/lib/Test";

export const test1 = new Test("Containment assertions", expect => {

    expect([1, 2, 3]).named().toContain(1);
    expect([1, 2, 3]).named().toContainAllOf(3, 2, 1, 3);
    expect([1, 2, 3]).named().toContainSomeOf(4, 6, 2, 5, 2);

});

export const test2 = new Test("Assertions on elements", expect => {
    expect([1, 2, 3]).forAllElements(e => e.toBeAtMost(3));
    expect([1, 2, 3]).forSomeElements(e => e.toBeGreaterThan(2));
});

export const test3 = new Test("Other assertions", expect => {
    expect([1, 2, 3]).toBeOfLength(3);
});