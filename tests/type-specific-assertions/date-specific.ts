import Test from "../../src/lib/Test";

export const test1 = new Test("Comparing Dates", expect => {
    const date = new Date("2024-5-26");
    expect(date).named().toBeAfter(new Date(2024, 4, 25, 12, 35, 1, 50));
    expect(date).named().toBeBefore(new Date(2024, 4, 27, 15, 15, 15, 15));
});

export const test2 = new Test("Validity test", expect => {
    const valid = new Date();
    expect(valid).named().toBeValid();
    const invalid = new Date("qwerty");
    expect(invalid).named().toBeInvalid();
});

const YEAR = new Date().getFullYear();
const VALENTINES = new Date(YEAR, 1, 14);
const PI_DAY = new Date(YEAR, 2, 14);
const CHRISTMAS = new Date(YEAR, 11, 25);
export const test3 = new Test("Date test", expect => {
    expect(VALENTINES).named().toBeOn(undefined, 2, 14);
    expect([VALENTINES, PI_DAY]).named().forAllElements(d => d.named().toBeOn(undefined, undefined, 14));
    expect(CHRISTMAS).named().toBeOn(YEAR, 12, 25);
});

const NOON = new Date(1970, 0, 1, 12, 0, 0, 0);
const HALF_PAST_THREE = new Date(1970, 0, 1, 15, 30, 0, 0);
const QUARTER_TO_FOUR = new Date(1970, 0, 1, 15, 45, 0, 0);
export const test4 = new Test("Time test", expect => {
    expect(NOON).named().toBeAt(12, 0, 0, 0);
    expect(HALF_PAST_THREE).named().toBeAt(15, 30);
    expect([HALF_PAST_THREE, QUARTER_TO_FOUR]).named().forAllElements(d => d.named().toBeAt(15));
});