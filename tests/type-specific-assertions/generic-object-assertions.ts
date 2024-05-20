import Test from "../../src/lib/Test";

export const test1 = new Test("Object tests", expect => {
    const obj:Record<string,number> = { a:1, b:2, c:3 };
    expect(obj).named().toHaveKey('a');
    expect(obj).named().toHaveValue(1);
    expect(obj).named().toHaveEntry('a', 1);
    expect(obj).named().toBeOfSize(3);
});