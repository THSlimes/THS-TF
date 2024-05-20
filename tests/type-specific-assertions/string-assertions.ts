import Test from "../../src/lib/Test";

export const test1 = new Test("Comparing strings", expect => {
    expect("aaa").named("aaa come before zzz").toComeBefore("zzz");
    expect("zzz").named("zzz comes after aaa").toComeAfter("aaa");
});

export const test2 = new Test("String formats", expect => {
    expect("123").named(`"123" is numeric`).toBeNumeric();
    expect("123.456").named(`"123.456" is numeric`).toBeNumeric();

    expect("Hello").named(`"Hello" contains "ello"`).toContain("ello");
    expect("girafarig").named(`"girafarig" is a palindrome`).toBePalindromic();

    expect("ABC").named(`"ABC" is uppercase alphabetical`).toMatch(/[A-Z]+/g);
});