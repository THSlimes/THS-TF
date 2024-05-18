import Test from "../src/lib/Test";

export const test1 = new Test("Addition", expect => {
    expect(1 + 1).toBe(2);
    expect(2 + 2).toBe(4);
    expect(4 + 4).toBe(8);
    expect(8 + 8).toBe(16);
    expect(8 + - 2).toBe(10);
});

export const test2 = new Test("Subtraction", expect => {
    expect(3 - 2).toBe(1);
});

export const test3 = new Test("Multiplication", expect => {
    expect(3 * 5).toBe(14);
});