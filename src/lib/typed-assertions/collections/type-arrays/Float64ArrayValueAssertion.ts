import Test from "../../../Test";
import { format } from "../../../util-functions";
import ValueAssertion from "../../../ValueAssertion";

export default class Float64ArrayValueAssertion extends ValueAssertion<Float64Array> {

    constructor(val: Float64Array, resultsPool: ValueAssertion.ResultPool) {
        super(val, resultsPool);
    }

    public toContain(elem: number) {
        this.autoName = format`given Float64Array contains ${elem}`;
        return this.addToResults(
            this.val.some(e => Float64ArrayValueAssertion.deepEquals(e, elem)) ?
                { status: "pass" } :
                { status: "fail", reason: format`expected Float64Array to contain ${elem}, but ${this.val} doesn't` }
        );
    }

    public toContainAllOf(...elements: number[]) {
        // remove duplicates
        elements = elements.filter((e1, i) => i >= elements.findLastIndex(e2 => Float64ArrayValueAssertion.deepEquals(e1, e2)));

        this.autoName = `given Float64Array contains ${format.sequence(elements)}`;
        const nonContained = elements.filter(e => !this.val.some(v => Float64ArrayValueAssertion.deepEquals(e, v)));
        return this.addToResults(
            nonContained.length === 0 ?
                { status: "pass" } :
                { status: "fail", reason: `Float64Array doesn't contain ${format.sequence(nonContained, ',', "and")}` }
        );
    }


    public forAllElements(assertion: (e: Test.ValueAssertionFor<number>, i: number, arr: Float64Array) => boolean) {
        const [expect, pool] = Test.ExpectFunction.get();

        this.val.forEach((v, i, arr) => assertion(expect(v), i, arr));
        this.autoName = pool.every(res => res.name !== undefined && res.name === pool[0].name) ? `for all entries: ${pool[0].name}` : `all entries match assertion`;

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

    public toContainSomeOf(...elements: number[]) {
        // remove duplicates
        elements = elements.filter((e1, i) => i >= elements.findLastIndex(e2 => Float64ArrayValueAssertion.deepEquals(e1, e2)));

        this.autoName = `given Float64Array contains ${format.sequence(elements, undefined, " or ")}`;
        return this.addToResults(
            elements.some(e => this.val.some(v => Float64ArrayValueAssertion.deepEquals(e, v))) ?
                { status: "pass" } :
                { status: "fail", reason: `Float64Array does not contain ${format.sequence(elements, undefined, " nor ")}` }
        );
    }

    public forSomeElements(assertion: (e: Test.ValueAssertionFor<number>, i: number, arr: Float64Array) => boolean) {
        const [expect, pool] = Test.ExpectFunction.get();

        this.val.forEach((v, i, arr) => assertion(expect(v), i, arr));
        this.autoName = pool.every(res => res.name !== undefined && res.name === pool[0].name) ? `for some entries: ${pool[0].name}` : `some entries match assertion`;

        return this.addToResults(
            pool.some(res => res.status === "pass") ?
                { status: "pass" } :
                { status: "fail", reason: format`assertion failed for all entries` }
        );
    }

    public toBeOfLength(expectedLength: number) {
        if (expectedLength < 0) throw new TypeError(format`expected length ${expectedLength} is not allowed to be negative`);
        else if (expectedLength % 1 !== 0) throw new TypeError(format`expected length ${expectedLength} must be an integer`);

        this.autoName = format`given Float64Array is of length ${expectedLength}`;
        return this.addToResults(
            this.val.length === expectedLength ?
                { status: "pass" } :
                { status: "fail", reason: format`expected Float64Array to be of length ${expectedLength}, but ${this.val} has ${this.val.length}` }
        );
    }

    public toContainSequence(sequence: number[]) {
        this.autoName = `given Float64Array contains ${format.sequence(sequence, ',', ',')}`;
        if (sequence.length === 0) {
            this.autoName = `given Float64Array contains empty sequence`;
            return this.addToResults({status: "pass", note: "sequence is empty"});
        }
        else if (sequence.length === this.val.length) {
            return this.addToResults(
                Float64ArrayValueAssertion.deepEquals(sequence, this.val) ?
                    { status: "pass", note: "Float64Array is sequence" } :
                    { status: "fail", reason: "Float64Array does not contain sequence" }
            );
        }
        else if (sequence.length > this.val.length) return this.addToResults({
            status: "fail",
            reason: format`Float64Array of length ${this.val.length} can not contain sequence of length ${sequence.length}`
        });

        for (let i = 0; i < this.val.length - sequence.length; i ++) { // try to find sequence
            if (Float64ArrayValueAssertion.deepEquals(this.val.slice(i, i + sequence.length), sequence)) return this.addToResults({
                status: "pass",
                note: format`sequence is at indices ${i}-${i+sequence.length-1}`
            });
        }
        
        // sequence wasn't found
        return this.addToResults({ status: "fail", reason: "Float64Array does not contain sequence" });
    }

}
