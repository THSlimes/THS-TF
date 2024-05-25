import ValueAssertion from "../ValueAssertion";
import { format } from "../util-functions";

type ParseIntRadix = 2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32;

export default class StringValueAssertion extends ValueAssertion<string> {

    constructor(val: string, resultsPool: ValueAssertion.ResultPool) {
        super(val, resultsPool);
    }

    public toComeBefore(upperBound: string) {
        this.autoName = format`given string comes before ${upperBound}`;
        return this.addToResults(
            this.val < upperBound ?
                { status: "pass" } :
                { status: "fail", reason: format`expected value to come before ${upperBound}, but ${this.val} doesn't` }
        );
    }

    public toComeAfter(lowerBound: string) {
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
                { status: "fail", reason: format`expected string ${this.val} be palindromic, but it isn't` }
        );
    }

    public toContain(substring: string) {
        this.autoName = format`given string contains ${substring}`;
        return this.addToResults(
            this.val.includes(substring) ?
                { status: "pass" } :
                { status: "fail", reason: format`expected string to contain ${substring}, but ${this.val} doesn't` }
        );
    }

    public toBeNumeric(radix?: ParseIntRadix) {
        if (radix === undefined) {
            this.autoName = format`given string is numeric`;
            return this.addToResults(
                Number.isNaN(Number.parseFloat(this.val)) ?
                    { status: "fail", reason: format`expected string to be numeric, but ${this.val} isn't` } :
                    { status: "pass" }
            );
        }
        else {
            this.autoName = format`given string is base-${radix} numeric `;
            const unrecognizedChar = this.val.split("").find(c => Number.isNaN(Number.parseInt(c, radix)));
            return this.addToResults(
                unrecognizedChar === undefined ?
                    { status: "pass" } :
                    {
                        status: "fail",
                        reason: format`${this.val} isn't numeric in base ${radix}, since it contains ${unrecognizedChar}`
                    }
            );
        }
    }

    public toMatch(regExp: RegExp) {
        this.autoName = format`given string matches ${regExp}`;
        return this.addToResults(
            regExp.test(this.val) ?
                { status: "pass" } :
                { status: "fail", reason: format`expected string to match ${regExp}, but ${this.val} doesn't` }
        );
    }
}
