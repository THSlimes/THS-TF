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
        else if (typeof val === "object" && val !== null) {
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

type ToStringable = { toString():string };
/**
 * `ValueAssertion` is a base class that handles checking certain properties of their value.
 * @param T type of value to check
 */
export class ValueAssertion<T> {

    protected readonly val:T;
    private readonly resultsPool:ValueAssertion.Result[];
    protected addToResults(res:ValueAssertion.Result) {
        const name = this.name?.toString() ?? this.autoName?.toString();
        if (name) res.name = name;
        this.resultsPool.push(res);
    }

    private name?:ToStringable;
    /** Automatically generated name */
    protected autoName?:ToStringable;
    private _doAutoName = false;
    /** Assigns a name to this assertion. */
    public named(name?:ToStringable) {
        if (name === undefined) this._doAutoName = true;
        else this.name = name;
        return this as Omit<this, "named">;
    }

    public constructor(val:T, resultsPool:ValueAssertion.Result[]) {
        this.val = val;
        this.resultsPool = resultsPool;
    }

    public toBe(expected:T):void {
        this.autoName = format`value === ${expected}`;
        this.addToResults(
            ValueAssertion.deepEquals(this.val, expected) ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to be ${expected}, but was actually ${this.val}` }
        );
    }

    public toNotBe(notExpected:T) {
        this.autoName = format`value !== ${notExpected}`;
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
                    && val.every((e, i) => ValueAssertion.deepEquals(e, expected[i]));
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


function isPrime(n:number|bigint):true|number {
    if (typeof n === "bigint") n = Number(n);

    if (n <= 1) return -1;
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
        this.autoName = format`value < ${upperBound}`;
        this.addToResults(
            this.val < upperBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value < ${upperBound}, but ${this.val} isn't` }
        );
    }

    public toBeAtMost(upperBound:number) {
        this.autoName = format`value <= ${upperBound}`;
        this.addToResults(
            this.val <= upperBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value <= ${upperBound}, but ${this.val} isn't` }
        );
    }

    public toBeGreaterThan(lowerBound:number) {
        this.autoName = format`value > ${lowerBound}`;
        this.addToResults(
            this.val > lowerBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value > ${lowerBound}, but ${this.val} isn't` }
        );
    }

    public toBeAtLeast(lowerBound:number) {
        this.autoName = format`value >= ${lowerBound}`;
        this.addToResults(
            this.val >= lowerBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value >= ${lowerBound}, but ${this.val} isn't` }
        );
    }

    public toBeAnInteger() {
        this.autoName = format`value is an integer`;
        this.addToResults(
            this.val % 1 === 0 ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to be an integer, but ${this.val} isn't` }
        );
    }

    public toBeDivisibleBy(divisor:number) {
        this.autoName = format`${divisor} divides value`;
        this.addToResults(
            this.val % divisor === 0 ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to be divisible by ${divisor}, but ${this.val} isn't` }
        );
    }

    public toDivide(dividend:number) {
        this.autoName = format`value divides ${dividend}`;
        this.addToResults(
            dividend % this.val === 0 ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to divide ${dividend}, but ${this.val} doesn't` }
        );
    }

    public toBePrime() {
        this.autoName = format`value is prime`;
        const res = isPrime(this.val);
        this.addToResults(
            isPrime(this.val) === true ?
                { status: "pass" } :
                {
                    status: "fail",
                    reason: format`expected value to be prime, but ${this.val} isn't because it is divisible by ${res}`
                }
        );
    }

    public toBeComposite() {
        this.autoName = format`value is composite`;
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
        this.autoName = format`value < ${upperBound}`;
        this.addToResults(
            this.val < upperBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value < ${upperBound}, but ${this.val} isn't` }
        );
    }

    public toBeAtMost(upperBound:bigint) {
        this.autoName = format`value <= ${upperBound}`;
        this.addToResults(
            this.val <= upperBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value <= ${upperBound}, but ${this.val} isn't` }
        );
    }

    public toBeGreaterThan(lowerBound:bigint) {
        this.autoName = format`value > ${lowerBound}`;
        this.addToResults(
            this.val > lowerBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value > ${lowerBound}, but ${this.val} isn't` }
        );
    }

    public toBeAtLeast(lowerBound:bigint) {
        this.autoName = format`value >= ${lowerBound}`;
        this.addToResults(
            this.val >= lowerBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value >= ${lowerBound}, but ${this.val} isn't` }
        );
    }

    public toBeDivisibleBy(divisor:bigint) {
        this.autoName = format`${divisor} divides value`;
        this.addToResults(
            this.val % divisor === 0n ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to be divisible by ${divisor}, but ${this.val} isn't` }
        );
    }

    public toDivide(dividend:bigint) {
        this.autoName = format`value divides ${dividend}`;
        this.addToResults(
            dividend % this.val === 0n ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to divide ${dividend}, but ${this.val} doesn't` }
        );
    }

    public toBePrime() {
        this.autoName = format`value is prime`;
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
        this.autoName = format`value is composite`;
        this.addToResults(
            isPrime(this.val) === true ?
                { status: "fail", reason: format`expected value to be composite, but ${this.val} is prime` } :
                { status: "pass" }
        );
    }

}

type ParseIntRadix = 2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32;
class StringValueAssertion extends ValueAssertion<string> {

    constructor(val:string, resultsPool:ValueAssertion.Result[]) {
        super(val, resultsPool);
    }

    public toComeBefore(upperBound:string) {
        this.autoName = format`value comes before ${upperBound}`;
        this.addToResults(
            this.val < upperBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to come before ${upperBound}, but ${this.val} doesn't` }
        );
    }

    public toComeAfter(lowerBound:string) {
        this.autoName = format`value comes after ${lowerBound}`;
        this.addToResults(
            this.val > lowerBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to come after ${lowerBound}, but ${this.val} doesn't` }
        );
    }

    public toBePalindromic() {
        this.autoName = format`value is palindromic`;

        let rev = ""; // compute reversed string
        for (let i = this.val.length - 1; i >= 0; i--) rev += this.val[i];

        this.addToResults(
            this.val === rev ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value ${this.val} be palindromic, but it isn't` }
        );
    }

    public toContain(substring:string) {
        this.autoName = format`value contains ${substring}`;
        this.addToResults(
            this.val.includes(substring) ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to contain ${substring}, but ${this.val} doesn't` }
        );
    }

    public toBeNumeric(radix?:ParseIntRadix) {
        if (radix === undefined) {
            this.autoName = format`value is numeric`;
            this.addToResults( // generic parsing
                Number.isNaN(Number.parseFloat(this.val)) ?
                    { status: "fail", reason: format`expected value to be numeric, but ${this.val} isn't` } :
                    { status: "pass" }
            );
        }
        else {
            this.autoName = format`value is base-${radix} numeric `;
            const unrecognizedChar = this.val.split("").find(c => Number.isNaN(Number.parseInt(c, radix)));
            this.addToResults( // integer parsing base `radix`
                unrecognizedChar === undefined ?
                    { status: "pass" } :
                    {
                        status: "fail",
                        reason: format`${this.val} isn't numeric in base ${radix}, since it contains ${unrecognizedChar}`
                    }
            );
        }
    }

    public toMatch(regExp:RegExp) {
        this.autoName = format`value matches ${regExp}`;
        this.addToResults(
            regExp.test(this.val) ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to match ${regExp}, but ${this.val} doesn't` }
        );
    }
}

class ObjectValueAssertion<O extends object> extends ValueAssertion<O> {

    constructor(val:O, resultsPool:ValueAssertion.Result[]) {
        super(val, resultsPool);
    }

    public toHaveKey(key:keyof O) {
        this.autoName = format`object has key ${key}`;
        this.addToResults(
            key in this.val ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to have key ${key}, but ${this.val} doesn't` }
        );
    }

    public toHaveValue(value:O[keyof O]) {
        this.autoName = format`object has value ${value}`;
        this.addToResults(
            Object.values(this.val).some(v => ObjectValueAssertion.deepEquals(v, value)) ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to have value ${value}, but ${this.val} doesn't` }
        );
    }

    public toHaveEntry(key:keyof O, value:O[keyof O]) {
        this.autoName = format`object has ${key} -> ${value}`;
        this.addToResults(
            key in this.val ?
                ObjectValueAssertion.deepEquals(this.val[key], value) ?
                    { status: "pass" } :
                    { status: "fail", reason: format`value does have key ${key}, but it does not map to ${value}` } : // value mismatch
                { status: "fail", reason: format`value does not have key ${key}` } // missing key
        );
    }

    public toBeOfSize(numEntries:number) {
        if (numEntries < 0) throw new TypeError(format`expected size ${numEntries} is not allowed to be negative`);
        else if (numEntries % 1 !== 0) throw new TypeError(format`expected size ${numEntries} must be an integer`);

        this.autoName = format`object has ${numEntries} entries`;
        const valSize = Object.keys(this.val).length;
        this.addToResults(
            valSize === numEntries ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to have ${numEntries} entries, but ${this.val} has ${valSize}` }
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
        T extends object ? ObjectValueAssertion<T> :
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
                typeof val === "object" && val !== null ? new ObjectValueAssertion(val, pool) :
                new ValueAssertion(val, pool)
            ) as ValueAssertion.For<T>,
            pool
        ];
    }
}
