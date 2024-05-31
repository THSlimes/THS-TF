import Test from "../../../src/lib/Test";

export const test1 = new Test("Less than (or equal to)", expect => {
    expect(1n).named().toBeLessThan(2n);
    expect(1n).named().toBeAtMost(2n);
    expect(1n).named().toBeAtMost(2n);
});

export const test2 = new Test("Greater than (or equal to)", expect => {
    expect(2n).named().toBeGreaterThan(1n);
    expect(2n).named().toBeAtLeast(1n);
    expect(1n).named().toBeAtLeast(1n);
});

export const test3 = new Test("Divisibility", expect => {
    expect(111n).named().toBeDivisibleBy(37n);
    expect(37n).named().toDivide(111n);
    expect(37n).named().toBePrime();
    expect(39n).named().toBeComposite();
});