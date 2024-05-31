import Test from "../../../../src/lib/Test";

const arr1 = new Float64Array([1, 2, 3]);
const arr2 = new Float64Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

export const test1 = new Test("Containment assertions", expect => {
    expect(arr1).named().toContain(1);
    expect(arr1).named().toContainAllOf(3, 2, 1, 3);
    expect(arr1).named().toContainSomeOf(4, 6, 2, 5, 2);
    expect(arr2).named().toContainSequence([5, 6, 7]);
});

export const test2 = new Test("Assertions on elements", expect => {
    expect(arr1).named().forAllElements(e => e.named().toBeAtMost(3));
    expect(arr1).named().forSomeElements(e => e.named().toBeGreaterThan(2));
});

export const test3 = new Test("Other assertions", expect => {
    expect(arr1).named().toBeOfLength(3);
});