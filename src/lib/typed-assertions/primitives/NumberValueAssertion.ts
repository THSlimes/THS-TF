import ValueAssertion from "../../ValueAssertion";
import { format } from "../../util-functions";
import { isPrime } from "../../util-functions";

export default class NumberValueAssertion extends ValueAssertion<number> {

    constructor(val: number, resultsPool: ValueAssertion.ResultPool) {
        super(val, resultsPool);
    }

    public toBeLessThan(upperBound: number) {
        this.autoName = format`x < ${upperBound}`;
        return this.addToResults(
            this.val < upperBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value < ${upperBound}, but ${this.val} isn't` }
        );
    }

    public toBeAtMost(upperBound: number) {
        this.autoName = format`x ≤ ${upperBound}`;
        return this.addToResults(
            this.val <= upperBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value <= ${upperBound}, but ${this.val} isn't` }
        );
    }

    public toBeGreaterThan(lowerBound: number) {
        this.autoName = format`x > ${lowerBound}`;
        return this.addToResults(
            this.val > lowerBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value > ${lowerBound}, but ${this.val} isn't` }
        );
    }

    public toBeAtLeast(lowerBound: number) {
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

    public toBeDivisibleBy(divisor: number) {
        this.autoName = format`${divisor} divides x`;
        return this.addToResults(
            this.val % divisor === 0 ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to be divisible by ${divisor}, but ${this.val} isn't` }
        );
    }

    public toDivide(dividend: number) {
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
