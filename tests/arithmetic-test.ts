import Test from "../src/lib/Test";

export const test1 = new Test("Addition", expect => {
    expect(1 + 1).named("1 + 1 = 2").toBe(2);
    expect(2 + 2).named("2 + 2 = 4").toBe(4);
    expect(4 + 4).named("4 + 4 = 8").toBe(8);
    expect(8 + 8).named("8 + 8 = 16").toBe(16);

    expect(8 + -2).named("8 + -2 = 6").toBe(6);
    expect(8 + -2).named("8 + -2 ≠ 10").toNotBe(10);
});

export const test2 = new Test("Subtraction", expect => {
    expect(3 - 2).named("3 - 2 = 1").toBe(1);
    expect(3 - 2).named("3 - 2 ≠ 2").toNotBe(2);
});

export const test3 = new Test("Multiplication", expect => {
    expect(3 * 5).named("3 * 5 = 15").toBe(15);
    expect(3 * 5).named("3 * 5 ≠ 20").toNotBe(20);
});