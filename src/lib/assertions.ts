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
                return `[${val.map(v => format.single(v)).join(", ")}]`;
            }
            else if (val instanceof RegExp) return val.toString();
            else {
                const entries = Object.entries(val).map(([k, v]) => `${single(k)}: ${single(v)}`);
                return `{ ${entries.join(", ")} }`
            }
        }
        else return String(val);
    }

    /**
     * Formats a sequence of values in a human-readable way.
     * @param arr array of values
     * @param delimiter normal delimiter for formatted array elements
     * @param lastDelimiter delimiter between the last pair of values (e.g. 1, 2, 3 **and** 4)
     * @returns `arr` formatted as a sequence
     */
    export function sequence(arr:any[], delimiter=", ", lastDelimiter=" and "):string {
        const formatted = arr.map(single);
        if (formatted.length === 0) return "";
        else if (formatted.length === 1) return formatted[0];
        else return formatted.slice(0, formatted.length - 1).join(delimiter) + lastDelimiter + formatted.at(-1);
    }
}

type ToStringable = { toString():string };
/**
 * `ValueAssertion` is a base class that handles checking certain properties of their value.
 * @param T type of value to check
 */
export class ValueAssertion<T> {

    protected readonly val:T;
    private readonly resultsPool:ValueAssertion.ResultPool;
    protected addToResults(res:ValueAssertion.Result):boolean {
        const name = this.name?.toString() ?? this.autoName?.toString();
        if (name) res.name = name;
        this.resultsPool.push(res);

        return res.status === "pass";
    }

    private name?:ToStringable;
    /** Automatically generated name */
    protected autoName?:ToStringable;
    private _doAutoName = false;
    /**
     * Assigns a new to this assertion.
     * @param name name of assertion (if left blank, a name is automatically generated)
     */
    public named(name?:ToStringable) {
        if (name === undefined) this._doAutoName = true;
        else this.name = name;
        return this as Omit<this, "named">;
    }

    public constructor(val:T, resultsPool:ValueAssertion.ResultPool) {
        this.val = val;
        this.resultsPool = resultsPool;
    }

    public toBe(expected:T) {
        this.autoName = format`value = ${expected}`;
        return this.addToResults(
            ValueAssertion.deepEquals(this.val, expected) ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to be ${expected}, but was actually ${this.val}` }
        );
    }

    public toNotBe(notExpected:T) {
        this.autoName = format`value ≠ ${notExpected}`;
        return this.addToResults(
            !ValueAssertion.deepEquals(this.val, notExpected) ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value not to be ${notExpected}, but it was` }
        );
    }

    public toSatisfy(predicate:(val:T)=>boolean) {
        this.autoName = format`value matches predicate`;
        return this.addToResults(
            predicate(this.val) ?
                { status: "pass" } :
                { status: "fail", reason: "value did not match the predicate" }
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

    constructor(val:number, resultsPool:ValueAssertion.ResultPool) {
        super(val, resultsPool);
    }

    public toBeLessThan(upperBound:number) {
        this.autoName = format`x < ${upperBound}`;
        return this.addToResults(
            this.val < upperBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value < ${upperBound}, but ${this.val} isn't` }
        );
    }

    public toBeAtMost(upperBound:number) {
        this.autoName = format`x ≤ ${upperBound}`;
        return this.addToResults(
            this.val <= upperBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value <= ${upperBound}, but ${this.val} isn't` }
        );
    }

    public toBeGreaterThan(lowerBound:number) {
        this.autoName = format`x > ${lowerBound}`;
        return this.addToResults(
            this.val > lowerBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value > ${lowerBound}, but ${this.val} isn't` }
        );
    }

    public toBeAtLeast(lowerBound:number) {
        this.autoName = format`x ≥ ${lowerBound}`;
        return this.addToResults(
            this.val >= lowerBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value >= ${lowerBound}, but ${this.val} isn't` }
        );
    }

    public toBeAnInteger() {
        this.autoName = format`x is an integer`;
        return this.addToResults(
            this.val % 1 === 0 ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to be an integer, but ${this.val} isn't` }
        );
    }

    public toBeDivisibleBy(divisor:number) {
        this.autoName = format`${divisor} divides x`;
        return this.addToResults(
            this.val % divisor === 0 ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to be divisible by ${divisor}, but ${this.val} isn't` }
        );
    }

    public toDivide(dividend:number) {
        this.autoName = format`value divides ${dividend}`;
        return this.addToResults(
            dividend % this.val === 0 ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to divide ${dividend}, but ${this.val} doesn't` }
        );
    }

    public toBePrime() {
        this.autoName = format`x is prime`;
        const res = isPrime(this.val);
        return this.addToResults(
            isPrime(this.val) === true ?
                { status: "pass" } :
                {
                    status: "fail",
                    reason: format`expected value to be prime, but ${this.val} isn't because it is divisible by ${res}`
                }
        );
    }

    public toBeComposite() {
        this.autoName = format`x is composite`;
        return this.addToResults(
            isPrime(this.val) === true ?
                { status: "fail", reason: format`expected value to be composite, but ${this.val} is prime` } :
                { status: "pass" }
        );
    }

}

class BigintValueAssertion extends ValueAssertion<bigint> {

    constructor(val:bigint, resultsPool:ValueAssertion.ResultPool) {
        super(val, resultsPool);
    }

    public toBeLessThan(upperBound:bigint) {
        this.autoName = format`n < ${upperBound}`;
        return this.addToResults(
            this.val < upperBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value < ${upperBound}, but ${this.val} isn't` }
        );
    }

    public toBeAtMost(upperBound:bigint) {
        this.autoName = format`n ≤ ${upperBound}`;
        return this.addToResults(
            this.val <= upperBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value <= ${upperBound}, but ${this.val} isn't` }
        );
    }

    public toBeGreaterThan(lowerBound:bigint) {
        this.autoName = format`n > ${lowerBound}`;
        return this.addToResults(
            this.val > lowerBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value > ${lowerBound}, but ${this.val} isn't` }
        );
    }

    public toBeAtLeast(lowerBound:bigint) {
        this.autoName = format`n ≥ ${lowerBound}`;
        return this.addToResults(
            this.val >= lowerBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value >= ${lowerBound}, but ${this.val} isn't` }
        );
    }

    public toBeDivisibleBy(divisor:bigint) {
        this.autoName = format`${divisor} divides n`;
        return this.addToResults(
            this.val % divisor === 0n ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to be divisible by ${divisor}, but ${this.val} isn't` }
        );
    }

    public toDivide(dividend:bigint) {
        this.autoName = format`n divides ${dividend}`;
        return this.addToResults(
            dividend % this.val === 0n ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to divide ${dividend}, but ${this.val} doesn't` }
        );
    }

    public toBePrime() {
        this.autoName = format`n is prime`;
        const res = isPrime(this.val);
        return this.addToResults(
            isPrime(this.val) === true ?
                { status: "pass" } :
                {
                    status: "fail",
                    reason: format`expected value to be prime, but ${this.val} isn't` + (typeof res === "number" ? `, because it is divisible by ${res}` : "")
                }
        );
    }

    public toBeComposite() {
        this.autoName = format`n is composite`;
        return this.addToResults(
            isPrime(this.val) === true ?
                { status: "fail", reason: format`expected value to be composite, but ${this.val} is prime` } :
                { status: "pass" }
        );
    }

}

type ParseIntRadix = 2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32;
class StringValueAssertion extends ValueAssertion<string> {

    constructor(val:string, resultsPool:ValueAssertion.ResultPool) {
        super(val, resultsPool);
    }

    public toComeBefore(upperBound:string) {
        this.autoName = format`given string comes before ${upperBound}`;
        return this.addToResults(
            this.val < upperBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to come before ${upperBound}, but ${this.val} doesn't` }
        );
    }

    public toComeAfter(lowerBound:string) {
        this.autoName = format`given string comes after ${lowerBound}`;
        return this.addToResults(
            this.val > lowerBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to come after ${lowerBound}, but ${this.val} doesn't` }
        );
    }

    public toBePalindromic() {
        this.autoName = format`given string is palindromic`;

        let rev = ""; // compute reversed string
        for (let i = this.val.length - 1; i >= 0; i--) rev += this.val[i];

        return this.addToResults(
            this.val === rev ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value ${this.val} be palindromic, but it isn't` }
        );
    }

    public toContain(substring:string) {
        this.autoName = format`given string contains ${substring}`;
        return this.addToResults(
            this.val.includes(substring) ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to contain ${substring}, but ${this.val} doesn't` }
        );
    }

    public toBeNumeric(radix?:ParseIntRadix) {
        if (radix === undefined) {
            this.autoName = format`given string is numeric`;
            return this.addToResults( // generic parsing
                Number.isNaN(Number.parseFloat(this.val)) ?
                    { status: "fail", reason: format`expected value to be numeric, but ${this.val} isn't` } :
                    { status: "pass" }
            );
        }
        else {
            this.autoName = format`given string is base-${radix} numeric `;
            const unrecognizedChar = this.val.split("").find(c => Number.isNaN(Number.parseInt(c, radix)));
            return this.addToResults( // integer parsing base `radix`
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
        this.autoName = format`given string matches ${regExp}`;
        return this.addToResults(
            regExp.test(this.val) ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to match ${regExp}, but ${this.val} doesn't` }
        );
    }
}


class ObjectValueAssertion<O extends object> extends ValueAssertion<O> {

    constructor(val:O, resultsPool:ValueAssertion.ResultPool) {
        super(val, resultsPool);
    }

    public toHaveKey(key:keyof O) {
        this.autoName = format`given object has key ${key}`;
        return this.addToResults(
            key in this.val ?
                { status: "pass" } :
                { status: "fail", reason: format`expected object to have key ${key}, but ${this.val} doesn't` }
        );
    }

    public toHaveValue(value:O[keyof O]) {
        this.autoName = format`given object has value ${value}`;
        return this.addToResults(
            Object.values(this.val).some(v => ObjectValueAssertion.deepEquals(v, value)) ?
                { status: "pass" } :
                { status: "fail", reason: format`expected object to have value ${value}, but ${this.val} doesn't` }
        );
    }

    public toHaveEntry(key:keyof O, value:O[keyof O]) {
        this.autoName = format`given object has ${key} -> ${value}`;
        return this.addToResults(
            key in this.val ?
                ObjectValueAssertion.deepEquals(this.val[key], value) ?
                    { status: "pass" } :
                    { status: "fail", reason: format`object does have key ${key}, but it does not map to ${value}` } : // value mismatch
                { status: "fail", reason: format`object does not have key ${key}` } // missing key
        );
    }

    public toBeOfSize(numEntries:number) {
        if (numEntries < 0) throw new TypeError(format`expected size ${numEntries} is not allowed to be negative`);
        else if (numEntries % 1 !== 0) throw new TypeError(format`expected size ${numEntries} must be an integer`);

        this.autoName = format`given object has ${numEntries} entries`;
        const valSize = Object.keys(this.val).length;
        return this.addToResults(
            valSize === numEntries ?
                { status: "pass" } :
                { status: "fail", reason: format`expected object to have ${numEntries} entries, but ${this.val} has ${valSize}` }
        );
    }

}


class ArrayValueAssertion<T> extends ValueAssertion<T[]> {

    constructor(val:T[], resultsPool:ValueAssertion.ResultPool) {
        super(val, resultsPool);
    }

    public toContain(elem:T) {
        this.autoName = format`given array contains ${elem}`;
        return this.addToResults(
            this.val.some(e => ArrayValueAssertion.deepEquals(e, elem)) ?
                { status: "pass" } :
                { status: "fail", reason: format`expected array to contain ${elem}, but ${this.val} doesn't` }
        );
    }

    public toContainAllOf(...elements:T[]) {
        // remove duplicates
        elements = elements.filter((e1, i) => i >= elements.findLastIndex(e2 => ArrayValueAssertion.deepEquals(e1,e2)));

        this.autoName = `given array contains ${format.sequence(elements)}`;
        const nonContained = elements.filter(e => !this.val.some(v => ArrayValueAssertion.deepEquals(e, v)));
        return this.addToResults(
            nonContained.length === 0 ?
                { status: "pass" } :
                { status: "fail", reason: `array doesn't contain ${format.sequence(nonContained)}` }
        );
    }

    public toContainSomeOf(...elements:T[]) {
        // remove duplicates
        elements = elements.filter((e1, i) => i >= elements.findLastIndex(e2 => ArrayValueAssertion.deepEquals(e1,e2)));
        
        this.autoName = `given array contains ${format.sequence(elements, undefined, " or ")}`;
        return this.addToResults(
            elements.some(e => this.val.some(v => ArrayValueAssertion.deepEquals(e, v))) ?
                { status: "pass" } :
                { status: "fail", reason: `array does not contain ${format.sequence(elements, undefined, " nor ")}` }
        );
    }

    public forAllElements(assertion:(e:ValueAssertion.For<T>,i:number,arr:T[])=>boolean) {
        const [expect, pool] = ExpectFunction.get();

        this.val.forEach((v, i, arr) => assertion(expect(v), i, arr));
        this.autoName = pool.every(res => res.name === pool[0].name) ? `for all elements: ${pool[0].name}` : `assertion matches for all elements`;

        const firstFailIndex = pool.findIndex(res => res.status === "fail");
        const failureCase = pool[firstFailIndex] as ValueAssertion.Result.Failure;

        return this.addToResults(
            firstFailIndex === -1 ?
                { status: "pass" } :
                { status: "fail", reason: format`element #${firstFailIndex + 1} (${this.val[firstFailIndex]}) failed: ${failureCase.reason}` }
        );
    }

    public forSomeElements(assertion:(e:ValueAssertion.For<T>,i:number,arr:T[])=>boolean) {
        const [expect, pool] = ExpectFunction.get();

        this.val.forEach((v, i, arr) => assertion(expect(v), i, arr));
        this.autoName = pool.every(res => res.name === pool[0].name) ? `for some elements: ${pool[0].name}` : `assertion matches for some elements`;

        return this.addToResults(
            pool.some(res => res.status === "pass") ?
                { status: "pass" } :
                { status: "fail", reason: format`assertion failed for all elements` }
        );
    }

    public toBeOfLength(expectedLength:number) {
        if (expectedLength < 0) throw new TypeError(format`expected length ${expectedLength} is not allowed to be negative`);
        else if (expectedLength % 1 !== 0) throw new TypeError(format`expected length ${expectedLength} must be an integer`);

        this.autoName = format`given array is of length ${expectedLength}`;
        return this.addToResults(
            this.val.length === expectedLength ?
                { status: "pass" } :
                { status: "fail", reason: format`expected array to be of length ${expectedLength}, but ${this.val} has ${this.val.length}` }
        );
    }

}

export namespace ValueAssertion {

    export type Result = Result.Pass | Result.Failure;
    export namespace Result {
        export type Pass = { status:"pass", name?:string };
        export type Failure = { status:"fail", name?:string, reason:string };
    }

    export type ResultPool = Result[];

    export type For<T> =
        T extends boolean ? ValueAssertion<boolean> :
        T extends number ? NumberValueAssertion :
        T extends bigint ? BigintValueAssertion :
        T extends string ? StringValueAssertion :
        T extends Array<infer E> ? ArrayValueAssertion<E> :
        T extends object ? ObjectValueAssertion<T> :
            ValueAssertion<T>;

}

export type ExpectFunction = <T>(val:T)=>ValueAssertion.For<T>;
export namespace ExpectFunction {

    /** Creates an [ExpectFunction,ValueAssertion.ResultPool] pair */
    export function get():[ExpectFunction,ValueAssertion.ResultPool] {
        const pool:ValueAssertion.ResultPool = [];
        return [
            <T>(val:T) => (
                typeof val === "number" ? new NumberValueAssertion(val, pool) :
                typeof val === "bigint" ? new BigintValueAssertion(val, pool) :
                typeof val === "string" ? new StringValueAssertion(val, pool) :
                Array.isArray(val) ? new ArrayValueAssertion(val, pool) :
                typeof val === "object" && val !== null ? new ObjectValueAssertion(val, pool) :
                new ValueAssertion(val, pool)
            ) as ValueAssertion.For<T>,
            pool
        ];
    }

}
