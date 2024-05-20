import Test from "../../src/lib/Test";

export const test1 = new Test("Less than (or equal to)", expect => {
    expect(1n).named("1n < 2n").toBeLessThan(2n);
    expect(1n).named("1n <= 2n").toBeAtMost(2n);
    expect(1n).named("1n <= 1n").toBeAtMost(2n);
});

export const test2 = new Test("Greater than (or equal to)", expect => {
    expect(2n).named("2n > 1n").toBeGreaterThan(1n);
    expect(2n).named("2n >= 1n").toBeAtLeast(1n);
    expect(1n).named("1n >= 1n").toBeAtLeast(1n);
});

export const test3 = new Test("Divisibility", expect => {
    expect(111n).named("111n is divisible by 37n").toBeDivisibleBy(37n);
    expect(37n).named("37n divides 111").toDivide(111n);
    expect(37n).named("37n is prime").toBePrime();
    expect(39n).named("39n isn't prime").toBeComposite();
});