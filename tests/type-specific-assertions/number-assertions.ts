import Test from "../../src/lib/Test";

export const test1 = new Test("Less than (or equal to)", expect => {
    expect(1).named().toBeLessThan(2);
    expect(1).named().toBeAtMost(2);
    expect(1).named().toBeAtMost(2);
});

export const test2 = new Test("Greater than (or equal to)", expect => {
    expect(2).named().toBeGreaterThan(1);
    expect(2).named().toBeAtLeast(1);
    expect(1).named().toBeAtLeast(1);
});

export const test3 = new Test("Divisibility", expect => {
    expect(3).named().toBeAnInteger();
    expect(111).named().toBeDivisibleBy(37);
    expect(37).named().toDivide(111);
    expect(37).named().toBePrime();
    expect(39).named().toBeComposite();
});