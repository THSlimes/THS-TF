/** Template tag to format expressions in a human-readable way. */
function format(strings:TemplateStringsArray, ...exps:any[]):string {
    let out = "";
    for (let i = 0; i < strings.length; i++) out += strings[i] + (i < exps.length ? format.single(exps[i]) : "");
    return out;
}

namespace format {
    /**
     * Formats the single given value in a human-readable way.
     * @param val value
     * @returns formatted value
     */
    export function single(val:any):string {
        if (typeof val === "string") return `"${val}"`;
        else if (typeof val === "bigint") return `${val}n`;
        else if (typeof val === "object") {
            if (Array.isArray(val)) {
                return `[${val.map(v => format(v)).join(", ")}]`;
            }
            else if (val instanceof RegExp) return val.toString();
            else {
                const entries = Object.entries(val).map(([k, v]) => `${single(k)}: ${single(v)}`);
                return `{ ${entries.join(", ")} }`
            }
        }
        else return String(val);
    }
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
                { status: "fail", reason: format`expected value to be ${expected}, but was actually ${this.val}` }
        );
    }

    public toNotBe(notExpected:T) {
        this.addToResults(
            !ValueAssertion.deepEquals(this.val, notExpected) ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value not to be ${notExpected}, but it was` }
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


function isPrime(n:number|bigint):boolean|number {
    if (typeof n === "bigint") n = Number(n);

    if (n <= 1) return false;
    else {
        for (let i = 3; i <= n**.5; i += 2) {
            if (n % i === 0) return i; // is divisible by i, not prime
        }
        return true; // is prime
    }
}

class NumberValueAssertion extends ValueAssertion<number> {

    constructor(val:number, resultsPool:ValueAssertion.Result[]) {
        super(val, resultsPool);
    }

    public toBeLessThan(upperBound:number) {
        this.addToResults(
            this.val < upperBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value < ${upperBound}, but ${this.val} isn't` }
        );
    }

    public toBeAtMost(upperBound:number) {
        this.addToResults(
            this.val <= upperBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value <= ${upperBound}, but ${this.val} isn't` }
        );
    }

    public toBeGreaterThan(lowerBound:number) {
        this.addToResults(
            this.val > lowerBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value > ${lowerBound}, but ${this.val} isn't` }
        );
    }

    public toBeAtLeast(lowerBound:number) {
        this.addToResults(
            this.val >= lowerBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value >= ${lowerBound}, but ${this.val} isn't` }
        );
    }

    public toBeAnInteger() {
        this.addToResults(
            this.val % 1 === 0 ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to be an integer, but ${this.val} isn't` }
        );
    }

    public toBeDivisibleBy(divisor:number) {
        this.addToResults(
            this.val % divisor === 0 ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to be divisible by ${divisor}, but ${this.val} isn't` }
        );
    }

    public toDivide(dividend:number) {
        this.addToResults(
            dividend % this.val === 0 ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to divide ${dividend}, but ${this.val} doesn't` }
        );
    }

    public toBePrime() {
        const res = isPrime(this.val);
        this.addToResults(
            isPrime(this.val) === true ?
                { status: "pass" } :
                {
                    status: "fail",
                    reason: format`expected value to be prime, but ${this.val} isn't` + (typeof res === "number" ? `, because it is divisible by ${res}` : "")
                }
        );
    }

    public toBeComposite() {
        this.addToResults(
            isPrime(this.val) === true ?
                { status: "fail", reason: format`expected value to be composite, but ${this.val} is prime` } :
                { status: "pass" }
        );
    }

}

class BigintValueAssertion extends ValueAssertion<bigint> {

    constructor(val:bigint, resultsPool:ValueAssertion.Result[]) {
        super(val, resultsPool);
    }

    public toBeLessThan(upperBound:bigint) {
        this.addToResults(
            this.val < upperBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value < ${upperBound}, but ${this.val} isn't` }
        );
    }

    public toBeAtMost(upperBound:bigint) {
        this.addToResults(
            this.val <= upperBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value <= ${upperBound}, but ${this.val} isn't` }
        );
    }

    public toBeGreaterThan(lowerBound:bigint) {
        this.addToResults(
            this.val > lowerBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value > ${lowerBound}, but ${this.val} isn't` }
        );
    }

    public toBeAtLeast(lowerBound:bigint) {
        this.addToResults(
            this.val >= lowerBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value >= ${lowerBound}, but ${this.val} isn't` }
        );
    }

    public toBeDivisibleBy(divisor:bigint) {
        this.addToResults(
            this.val % divisor === 0n ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to be divisible by ${divisor}, but ${this.val} isn't` }
        );
    }

    public toDivide(dividend:bigint) {
        this.addToResults(
            dividend % this.val === 0n ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to divide ${dividend}, but ${this.val} doesn't` }
        );
    }

    public toBePrime() {
        const res = isPrime(this.val);
        this.addToResults(
            isPrime(this.val) === true ?
                { status: "pass" } :
                {
                    status: "fail",
                    reason: format`expected value to be prime, but ${this.val} isn't` + (typeof res === "number" ? `, because it is divisible by ${res}` : "")
                }
        );
    }

    public toBeComposite() {
        this.addToResults(
            isPrime(this.val) === true ?
                { status: "fail", reason: format`expected value to be composite, but ${this.val} is prime` } :
                { status: "pass" }
        );
    }

}


class StringValueAssertion extends ValueAssertion<string> {

    constructor(val:string, resultsPool:ValueAssertion.Result[]) {
        super(val, resultsPool);
    }

    public toComeBefore(upperBound:string) {
        this.addToResults(
            this.val < upperBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to come before ${upperBound}, but ${this.val} doesn't` }
        );
    }

    public toComeAfter(lowerBound:string) {
        this.addToResults(
            this.val > lowerBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to come after ${lowerBound}, but ${this.val} doesn't` }
        );
    }

    public toBePalindromic() {
        let rev = "";
        for (let i = this.val.length - 1; i >= 0; i--) rev += this.val[i];

        this.addToResults(
            this.val === rev ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value ${this.val} be palindromic, but it isn't` }
        );
    }

    public toContain(substring:string) {
        this.addToResults(
            this.val.includes(substring) ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to contain ${substring}, but ${this.val} doesn't` }
        );
    }

    public toBeNumeric() {
        this.addToResults(
            Number.isNaN(Number.parseFloat(this.val)) ?
                { status: "fail", reason: format`expected value to be numeric, but ${this.val} isn't` } :
                { status: "pass" }
        );
    }

    public toMatch(regExp:RegExp) {
        this.addToResults(
            regExp.test(this.val) ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to match ${regExp}, but ${this.val} doesn't` }
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

    export type For<T> =
        T extends number ? NumberValueAssertion :
        T extends bigint ? BigintValueAssertion :
        T extends string ? StringValueAssertion :
            ValueAssertion<T>;

}

export type ExpectFunction = <T>(val:T)=>ValueAssertion.For<T>;
export namespace ExpectFunction {
    export function get():[ExpectFunction,ValueAssertion.Result[]] {
        const pool:ValueAssertion.Result[] = [];
        return [
            <T>(val:T) => (
                typeof val === "number" ? new NumberValueAssertion(val, pool) :
                typeof val === "bigint" ? new BigintValueAssertion(val, pool) :
                typeof val === "string" ? new StringValueAssertion(val, pool) :
                new ValueAssertion(val, pool)
            ) as ValueAssertion.For<T>,
            pool
        ];
    }
}
