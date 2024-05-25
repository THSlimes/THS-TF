import ValueAssertion from "../ValueAssertion";
import { format } from "../util-functions";
import { isPrime } from "../util-functions";

export default class BigintValueAssertion extends ValueAssertion<bigint> {

    constructor(val: bigint, resultsPool: ValueAssertion.ResultPool) {
        super(val, resultsPool);
    }

    public toBeLessThan(upperBound: bigint) {
        this.autoName = format`n < ${upperBound}`;
        return this.addToResults(
            this.val < upperBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value < ${upperBound}, but ${this.val} isn't` }
        );
    }

    public toBeAtMost(upperBound: bigint) {
        this.autoName = format`n ≤ ${upperBound}`;
        return this.addToResults(
            this.val <= upperBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value <= ${upperBound}, but ${this.val} isn't` }
        );
    }

    public toBeGreaterThan(lowerBound: bigint) {
        this.autoName = format`n > ${lowerBound}`;
        return this.addToResults(
            this.val > lowerBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value > ${lowerBound}, but ${this.val} isn't` }
        );
    }

    public toBeAtLeast(lowerBound: bigint) {
        this.autoName = format`n ≥ ${lowerBound}`;
        return this.addToResults(
            this.val >= lowerBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value >= ${lowerBound}, but ${this.val} isn't` }
        );
    }

    public toBeDivisibleBy(divisor: bigint) {
        this.autoName = format`${divisor} divides n`;
        return this.addToResults(
            this.val % divisor === 0n ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to be divisible by ${divisor}, but ${this.val} isn't` }
        );
    }

    public toDivide(dividend: bigint) {
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
