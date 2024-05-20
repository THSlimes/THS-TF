import Test from "../../src/lib/Test";

export const test1 = new Test("Less than (or equal to)", expect => {
    expect(1).named("1 < 2").toBeLessThan(2);
    expect(1).named("1 <= 2").toBeAtMost(2);
    expect(1).named("1 <= 1").toBeAtMost(2);
});

export const test2 = new Test("Greater than (or equal to)", expect => {
    expect(2).named("2 > 1").toBeGreaterThan(1);
    expect(2).named("2 >= 1").toBeAtLeast(1);
    expect(1).named("1 >= 1").toBeAtLeast(1);
});

export const test3 = new Test("Divisibility", expect => {
    expect(3).named("3 is an integer").toBeAnInteger();
    expect(111).named("111 is divisible by 37").toBeDivisibleBy(37);
    expect(37).named("37 divides 111").toDivide(111);
    expect(37).named("37 is prime").toBePrime();
    expect(39).named("39 isn't prime").toBeComposite();
});