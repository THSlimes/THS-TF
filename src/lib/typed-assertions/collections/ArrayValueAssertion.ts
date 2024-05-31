import ValueAssertion from "../../ValueAssertion";
import Test from "../../Test";
import { format } from "../../util-functions";

export default class ArrayValueAssertion<T> extends ValueAssertion<T[]> {

    constructor(val: T[], resultsPool: ValueAssertion.ResultPool) {
        super(val, resultsPool);
    }

    public toContain(elem: T) {
        this.autoName = format`given array contains ${elem}`;
        return this.addToResults(
            this.val.some(e => ArrayValueAssertion.deepEquals(e, elem)) ?
                { status: "pass" } :
                { status: "fail", reason: format`expected array to contain ${elem}, but ${this.val} doesn't` }
        );
    }

    public toContainAllOf(...elements: T[]) {
        // remove duplicates
        elements = elements.filter((e1, i) => i >= elements.findLastIndex(e2 => ArrayValueAssertion.deepEquals(e1, e2)));

        this.autoName = `given array contains ${format.sequence(elements)}`;
        const nonContained = elements.filter(e => !this.val.some(v => ArrayValueAssertion.deepEquals(e, v)));
        return this.addToResults(
            nonContained.length === 0 ?
                { status: "pass" } :
                { status: "fail", reason: `array doesn't contain ${format.sequence(nonContained, ',', "and")}` }
        );
    }


    public forAllElements(assertion: (e: Test.ValueAssertionFor<T>, i: number, arr: T[]) => boolean) {
        const [expect, pool] = Test.ExpectFunction.get();

        this.val.forEach((v, i, arr) => assertion(expect(v), i, arr));
        this.autoName = pool.every(res => res.name !== undefined && res.name === pool[0].name) ? `for all elements: ${pool[0].name}` : `all elements match assertion`;

        const firstFailIndex = pool.findIndex(res => res.status === "fail");
        
        if (firstFailIndex === -1) return this.addToResults({ status: "pass" });
        else {
            const failureCase = pool[firstFailIndex] as ValueAssertion.Result.Failure;
            return this.addToResults({
                status: "fail",
                reason: format`element #${firstFailIndex + 1} (${this.val[firstFailIndex]}) failed: ${failureCase.reason}`
            });
        }
    }

    public toContainSomeOf(...elements: T[]) {
        // remove duplicates
        elements = elements.filter((e1, i) => i >= elements.findLastIndex(e2 => ArrayValueAssertion.deepEquals(e1, e2)));

        this.autoName = `given array contains ${format.sequence(elements, undefined, " or ")}`;
        return this.addToResults(
            elements.some(e => this.val.some(v => ArrayValueAssertion.deepEquals(e, v))) ?
                { status: "pass" } :
                { status: "fail", reason: `array does not contain ${format.sequence(elements, undefined, " nor ")}` }
        );
    }

    public forSomeElements(assertion: (e: Test.ValueAssertionFor<T>, i: number, arr: T[]) => boolean) {
        const [expect, pool] = Test.ExpectFunction.get();

        this.val.forEach((v, i, arr) => assertion(expect(v), i, arr));
        this.autoName = pool.every(res => res.name !== undefined && res.name === pool[0].name) ? `for some elements: ${pool[0].name}` : `some elements match assertion`;

        return this.addToResults(
            pool.some(res => res.status === "pass") ?
                { status: "pass" } :
                { status: "fail", reason: format`assertion failed for all elements` }
        );
    }

    public toBeOfLength(expectedLength: number) {
        if (expectedLength < 0) throw new TypeError(format`expected length ${expectedLength} is not allowed to be negative`);
        else if (expectedLength % 1 !== 0) throw new TypeError(format`expected length ${expectedLength} must be an integer`);

        this.autoName = format`given array is of length ${expectedLength}`;
        return this.addToResults(
            this.val.length === expectedLength ?
                { status: "pass" } :
                { status: "fail", reason: format`expected array to be of length ${expectedLength}, but ${this.val} has ${this.val.length}` }
        );
    }

    public toContainSequence(sequence: T[]) {
        this.autoName = `given array contains ${format.sequence(sequence, ',', ',')}`;
        if (sequence.length === 0) {
            this.autoName = `given array contains empty sequence`;
            return this.addToResults({status: "pass", note: "sequence is empty"});
        }
        else if (sequence.length === this.val.length) {
            return this.addToResults(
                ArrayValueAssertion.deepEquals(sequence, this.val) ?
                    { status: "pass", note: "array is sequence" } :
                    { status: "fail", reason: "array does not contain sequence" }
            );
        }
        else if (sequence.length > this.val.length) return this.addToResults({
            status: "fail",
            reason: format`array of length ${this.val.length} can not contain sequence of length ${sequence.length}`
        });

        for (let i = 0; i < this.val.length - sequence.length; i ++) { // try to find sequence
            if (ArrayValueAssertion.deepEquals(this.val.slice(i, i + sequence.length), sequence)) return this.addToResults({
                status: "pass",
                note: format`sequence is at indices ${i}-${i+sequence.length-1}`
            });
        }
        
        // sequence wasn't found
        return this.addToResults({ status: "fail", reason: "array does not contain sequence" });
    }

}
