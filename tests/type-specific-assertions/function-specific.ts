import Test from "../../src/lib/Test";

export const test1 = new Test("Non-argument function", expect => {
    expect(() => 1).named().toReturn(1);
});

export const test2 = new Test("Argument function", expect => {
    expect((arg:any) => arg).withArgs(1).named().toReturn(1);
    expect((n:number) => n**2).withArgs(2).named().toReturn(4);
});

export const test3 = new Test("Timing tests", expect => {
    expect(() => {}).named().toTakeAtMost(10, "μs");
    expect(() => {
        let n = 0;
        for (let i = 0; i < 1e6; i ++) n += i;
        return n;
    }).named().toTakeAtMost(2, "ms");
});

function throwIfNeg(n:number):void {
    if (n < 0) throw new RangeError("n is negative", { cause: n });
}

export const test4 = new Test("Throw detection", expect => {
    expect(throwIfNeg).withArgs(-1).named().toThrow(Error); // error throw
    expect(throwIfNeg).withArgs(-1).named().toThrow(RangeError); // match error type
    expect(throwIfNeg).withArgs(-1).named().toThrow(Error, "n is negative"); // match message to literal
    expect(throwIfNeg).withArgs(-1).named().toThrow(Error, /negative/g); // match message to regex
    expect(throwIfNeg).withArgs(-1).named().toThrow(Error, undefined, -1); // match cause
    expect(throwIfNeg).withArgs(-1).named().toThrow(Error, /is negative/g, -1); // match both
});