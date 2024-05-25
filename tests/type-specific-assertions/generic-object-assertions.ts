import Test from "../../src/lib/Test";

const obj:Record<string,number> = { a:1, b:2, c:3 };

export const test1 = new Test("Key tests", expect => {
    expect(obj).named().toHaveKey('a');
    expect(obj).named().forAllKeys(k => k.toMatch(/[a-z]/g));
    expect(obj).named().forSomeKeys(k => k.toBe("c"));
});

export const test2 = new Test("Value tests", expect => {
    expect(obj).named().toHaveValue(1);
    expect(obj).named().forAllValues(v => v.named().toBeAtLeast(0));
    expect(obj).named().forSomeValues(v => v.named().toBePrime());
});

export const test3 = new Test("Entry tests", expect => {
    expect(obj).named().toHaveEntry('a', 1);
    expect(obj).named().toBeOfSize(3);
});