import Test from "../src/lib/Test";

export const test1 = new Test("Objects", expect => {
    expect({ a: 1, b: 2, c: 3 }).named("Equal objects").toBe({ a: 1, b: 2, c: 3 }); // same value
    expect({ a: 1, b: 2, c: 3 }).named("Unequal value").toNotBe({ a: 1, b: 4, c: 3 }); // non-matching value

    expect<Record<string,number>>({ a: 1, b: 2, c: 3 }).named("Different key").toNotBe({ a: 1, b: 2, d: 3 }); // non-matching key
    expect<Record<string,number>>({ a: 1, b: 2, d: 3 }).named("Different key (swapped)").toNotBe({ a: 1, b: 2, c: 3 }); // non-matching key

    expect<Record<string,number>>({ a: 1, b: 2, c: 3 }).named("Missing key").toNotBe({ a: 1, b: 2 }); // missing key
    expect<Record<string,number>>({ a: 1, b: 2 }).named("Missing key (swapped)").toNotBe({ a: 1, b: 2, c: 3 }); // missing key

    expect<Record<string,number>>({ a: 1, b: 2, c: 3 }).named("Additional key").toNotBe({ a: 1, b: 2, c: 3, d: 4 }); // extra key
    expect<Record<string,number>>({ a: 1, b: 2, c: 3, d: 4 }).named("Additional key (swapped)").toNotBe({ a: 1, b: 2, c: 3 }); // extra key
});

export const test2 = new Test("Arrays", expect => {
    expect([1, 2, 3]).named("Equal arrays").toBe([1, 2, 3]); // same array
    expect([1, 2, 3]).named("Unequal arrays").toNotBe([1, 2, 4]); // non-matching value

    // non-matching lengths
    expect([1, 2, 3]).named("Fewer entries").toNotBe([1, 2]);
    expect([1, 2, 3]).named("Extra entry").toNotBe([1, 2, 3, 4]);
});

export const test3 = new Test("Primitives", expect => {
    expect(1).named("Equal numbers").toBe(1);
    expect<number>(1).named("Unequal numbers").toNotBe(2);
    
    expect("hi").named("Equal strings").toBe("hi");
    expect<string>("hi").named("Unequal strings").toNotBe("hello");
    
    expect(null).named("2 x null").toBe(null);
    expect<undefined>(undefined).named("2 x undefined").toBe(undefined);
});