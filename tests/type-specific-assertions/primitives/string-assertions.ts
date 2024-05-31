import Test from "../../../src/lib/Test";

export const test1 = new Test("Comparing strings", expect => {
    expect("aaa").named().toComeBefore("zzz");
    expect("zzz").named().toComeAfter("aaa");
});

export const test2 = new Test("String formats", expect => {
    expect("123").named().toBeNumeric();
    expect("123.456").named().toBeNumeric();
    expect("123456789ABCDEF").named().toBeNumeric(16);

    expect("Hello").named().toContain("ello");
    expect("girafarig").named().toBePalindromic();

    expect("ABC").named().toMatch(/[A-Z]+/g);
});