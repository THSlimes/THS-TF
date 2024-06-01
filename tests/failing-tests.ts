import Test from "../src/lib/Test";

export const test1 = new Test("Failing test", expect => {
    expect(true).toBe(false);
    expect(1).toBe(2);
    expect(true).toBe(false);
    expect(1).toBe(2);
    expect(true).toBe(false);
    expect(1).toBe(2);
    expect(true).toBe(false);
    expect(1).toBe(2);
});