import Test from "../../src/lib/Test";

export const test1 = new Test("Non-argument function", expect => {
    expect(() => 1).toReturn(1);
});

export const test2 = new Test("Argument function", expect => {
    expect((arg:any) => arg).withArgs(1).toReturn(1);
    expect((n:number) => n**2).withArgs(2).toReturn(4);
});

export const test3 = new Test("Timing tests", expect => {
    expect(() => {}).toTakeAtMost(10, "μs");
    expect(() => {
        let n = 0;
        for (let i = 0; i < 1e6; i ++) n += i;
        return n;
    }).toTakeAtMost(2, "ms");
});

function throwIfNeg(n:number):void {
    if (n < 0) throw new RangeError("n is negative", { cause: n });
}

export const test4 = new Test("Throw detection", expect => {
    expect(throwIfNeg).withArgs(-1).toThrow(Error); // error throw
    expect(throwIfNeg).withArgs(-1).toThrow(RangeError); // match error type
    expect(throwIfNeg).withArgs(-1).toThrow(Error, "n is negative"); // match message to literal
    expect(throwIfNeg).withArgs(-1).toThrow(Error, /negative/g); // match message to regex
    expect(throwIfNeg).withArgs(-1).toThrow(Error, undefined, -1); // match cause
    expect(throwIfNeg).withArgs(-1).toThrow(Error, /is negative/g, -1); // match both
});