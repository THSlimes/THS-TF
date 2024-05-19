/**
 * Formats the given value in a human-readable way.
 * @param val value
 * @returns formatted value
 */
function format(val:any):string {
    if (typeof val === "string") return `"${val}"`;
    else if (typeof val === "object") {
        if (Array.isArray(val)) {
            return `[${val.map(v => format(v)).join(", ")}]`;
        }
        else {
            const entries = Object.entries(val).map(([k, v]) => `${format(k)}: ${format(v)}`);
            return `{ ${entries.join(", ")} }`
        }
    }
    else return String(val);
}

/**
 * `ValueAssertion` is a base class that handles checking certain properties of their value.
 * @param T type of value to check
 */
export class ValueAssertion<T> {

    protected readonly val:T;
    private readonly resultsPool:ValueAssertion.Result[];
    protected addToResults(res:ValueAssertion.Result) {
        if (this.name) res.name = this.name;
        this.resultsPool.push(res);
    }

    private name?:string;
    /** Assigns a name to this assertion. */
    public named(name:string) {
        this.name = name;
        return this as Omit<this, "named">;
    }

    public constructor(val:T, resultsPool:ValueAssertion.Result[]) {
        this.val = val;
        this.resultsPool = resultsPool;
    }

    public toBe(expected:T):void {
        this.addToResults(
            ValueAssertion.deepEquals(this.val, expected) ?
                { status: "pass" } :
                { status: "fail", reason: `expected value to be ${format(expected)}, but was actually ${format(this.val)}` }
            );
    }

    public toNotBe(notExpected:T) {
        this.addToResults(
            !ValueAssertion.deepEquals(this.val, notExpected) ?
                { status: "pass" } :
                { status: "fail", reason: `expected value not to be ${format(notExpected)}, but it was` }
        );
    }

    /** Check whether the two given values are equal (including their elements/properties). */
    protected static deepEquals(val:any, expected:any):boolean {
        if (val === expected) return true; // shortcut
        else if (typeof val !== typeof expected) return false; // types must match
        else if (typeof val === "object" && typeof expected === "object") {
            if (Array.isArray(val)) {
                return Array.isArray(expected)
                    && val.length === expected.length
                    && val.every((e, i) => this.deepEquals(e, expected[i]));
            }
            else if (val instanceof Date) {
                return expected instanceof Date && val.getTime() == expected.getTime();
            }
            else {
                const valKeys = Object.keys(val);
                const expectedKeys = Object.keys(expected);

                return valKeys.length === expectedKeys.length // same number of properties
                    && valKeys.every(k => k in expected) // keys match
                    && valKeys.every(k => this.deepEquals(val[k], expected[k])); // values of keys match
            }
        }
        else return false;
    }
}


function isPrime(n:number):boolean|number {
    if (n <= 1) return false;
    else {
        for (let i = 3; i <= n**.5; i += 2) {            
            if (n % i === 0) return i; // is divisible by i, not prime
        }
        return true; // is prime
    }
}

class NumberValueAssertions extends ValueAssertion<number> {

    constructor(val:number, resultsPool:ValueAssertion.Result[]) {
        super(val, resultsPool);
    }

    public toBeLessThan(upperBound:number) {
        this.addToResults(
            this.val < upperBound ?
                { status: "pass" } :
                { status: "fail", reason: `expected value < ${upperBound}, but ${this.val} isn't` }
            );
    }

    public toBeLessThanOrEqualTo(upperBound:number) {
        this.addToResults(
            this.val <= upperBound ?
                { status: "pass" } :
                { status: "fail", reason: `expected value <= ${upperBound}, but ${this.val} isn't` }
            );
    }

    public toBeGreaterThan(lowerBound:number) {
        this.addToResults(
            this.val > lowerBound ?
                { status: "pass" } :
                { status: "fail", reason: `expected value > ${lowerBound}, but ${this.val} isn't` }
            );
    }

    public toBeGreaterThanOrEqualTo(lowerBound:number) {
        this.addToResults(
            this.val >= lowerBound ?
                { status: "pass" } :
                { status: "fail", reason: `expected value >= ${lowerBound}, but ${this.val} isn't` }
            );
    }

    public toBeAnInteger() {
        this.addToResults(
            this.val % 1 === 0 ?
                { status: "pass" } :
                { status: "fail", reason: `expected value to be an integer, but ${this.val} isn't` }
            );
    }

    public toBeDivisibleBy(divisor:number) {
        this.addToResults(
            this.val % divisor === 0 ?
                { status: "pass" } :
                { status: "fail", reason: `expected value to be divisible by ${divisor}, but ${this.val} isn't` }
            );
    }

    public toDivide(dividend:number) {
        this.addToResults(
            dividend % this.val === 0 ?
                { status: "pass" } :
                { status: "fail", reason: `expected value to divide ${dividend}, but ${this.val} doesn't` }
            );
    }

    public toBePrime() {
        const res = isPrime(this.val);
        this.addToResults(
            isPrime(this.val) === true ?
                { status: "pass" } :
                {
                    status: "fail",
                    reason: `expected value to be prime, but ${this.val} isn't` + (typeof res === "number" ? `, because it is divisible by ${res}` : "")
                }
            );
    }

    public toBeComposite() {
        this.addToResults(
            isPrime(this.val) === true ?
                { status: "fail", reason: `expected value to be composite, but ${this.val} is prime` } :
                { status: "pass" }
            );
    }

}

export namespace ValueAssertion {

    export type Result = {
        status:"pass",
        name?:string
    } | {
        status:"fail",
        name?:string,
        reason:string
    };

    export type For<T> = T extends number ? NumberValueAssertions : ValueAssertion<T>;

}

export type ExpectFunction = <T>(val:T)=>ValueAssertion.For<T>;
export namespace ExpectFunction {
    export function get():[ExpectFunction,ValueAssertion.Result[]] {
        const pool:ValueAssertion.Result[] = [];
        return [
            <T>(val:T) => typeof val === "number" ?
                new NumberValueAssertions(val,pool) as ValueAssertion.For<T> :
                new ValueAssertion(val, pool) as ValueAssertion.For<T>,
            pool
        ];
    }
}
