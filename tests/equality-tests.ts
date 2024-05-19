import Test from "../src/lib/Test";

export const test1 = new Test("Arrays", expect => {
    expect([1, 2, 3]).toBe([1, 2, 3]); // same array
    expect([1, 2, 3]).toNotBe([1, 2, 4]); // non-matching value

    // non-matching lengths
    expect([1, 2, 3]).toNotBe([1, 2]);
    expect([1, 2, 3]).toNotBe([1, 2, 3, 4]);
});

export const test2 = new Test("Other objects", expect => {
    expect({ a: 1, b: 2, c: 3 }).toBe({ a: 1, b: 2, c: 3 }); // same value
    expect({ a: 1, b: 2, c: 3 }).toNotBe({ a: 1, b: 4, c: 3 }); // non-matching value

    expect({ a: 1, b: 2, c: 3 } as Record<string,number>).toNotBe({ a: 1, b: 2, d: 3 }); // non-matching key
    expect({ a: 1, b: 2, c: 3 } as Record<string,number>).toNotBe({ a: 1, b: 2 }); // missing key
    expect({ a: 1, b: 2, c: 3 } as Record<string,number>).toNotBe({ a: 1, b: 2, c: 3, d: 4 }); // extra key
});