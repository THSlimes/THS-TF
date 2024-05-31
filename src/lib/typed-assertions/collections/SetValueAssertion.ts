import exp from "constants";
import Test from "../../Test";
import { format } from "../../util-functions";
import ValueAssertion from "../../ValueAssertion";

export default class SetValueAssertion<T> extends ValueAssertion<Set<T>> {

    constructor(val: Set<T>, resultsPool: ValueAssertion.ResultPool) {
        super(val, resultsPool);
    }

    public toContain(elem: T) {
        this.autoName = format`given set contains ${elem}`;
        return this.addToResults(
            [...this.val].some(e => SetValueAssertion.deepEquals(e, elem)) ?
                { status: "pass" } :
                { status: "fail", reason: format`expected set to contain ${elem}, but ${this.val} doesn't` }
        );
    }

    public toContainAllOf(...elements: T[]) {
        // remove duplicates
        elements = elements.filter((e1, i) => i >= elements.findLastIndex(e2 => SetValueAssertion.deepEquals(e1, e2)));

        this.autoName = `given set contains ${format.sequence(elements)}`;
        const values = [...this.val];
        const nonContained = elements.filter(e => !values.some(v => SetValueAssertion.deepEquals(e, v)));
        return this.addToResults(
            nonContained.length === 0 ?
                { status: "pass" } :
                { status: "fail", reason: `set doesn't contain ${format.sequence(nonContained), ',', "and"}` }
        );
    }


    public forAllElements(assertion: (e: Test.ValueAssertionFor<T>, set: Set<T>) => boolean) {
        const [expect, pool] = Test.ExpectFunction.get();

        const values = [...this.val];

        values.forEach((v, i, arr) => assertion(expect(v), this.val));
        this.autoName = pool.every(res => res.name !== undefined && res.name === pool[0].name) ? `for all elements: ${pool[0].name}` : `all elements match assertion`;

        const firstFailIndex = pool.findIndex(res => res.status === "fail");
        
        if (firstFailIndex === -1) return this.addToResults({ status: "pass" });
        else {
            const failureCase = pool[firstFailIndex] as ValueAssertion.Result.Failure;
            return this.addToResults({
                status: "fail",
                reason: format`element ${values[firstFailIndex]} failed: ${failureCase.reason}`
            });
        }
    }

    public toContainSomeOf(...elements: T[]) {
        // remove duplicates
        elements = elements.filter((e1, i) => i >= elements.findLastIndex(e2 => SetValueAssertion.deepEquals(e1, e2)));

        this.autoName = `given set contains ${format.sequence(elements, undefined, " or ")}`;
        const values = [...this.val];
        return this.addToResults(
            elements.some(e => values.some(v => SetValueAssertion.deepEquals(e, v))) ?
                { status: "pass" } :
                { status: "fail", reason: `set does not contain ${format.sequence(elements, undefined, " nor ")}` }
        );
    }

    public forSomeElements(assertion: (e: Test.ValueAssertionFor<T>, set: Set<T>) => boolean) {
        const [expect, pool] = Test.ExpectFunction.get();

        const values = [...this.val];
        values.forEach((v, i, arr) => assertion(expect(v), this.val));
        this.autoName = pool.every(res => res.name !== undefined && res.name === pool[0].name) ? `for some elements: ${pool[0].name}` : `some elements match assertion`;

        return this.addToResults(
            pool.some(res => res.status === "pass") ?
                { status: "pass" } :
                { status: "fail", reason: "assertion failed for all elements" }
        );
    }

    public toBeOfSize(expectedSize: number) {
        this.autoName = `set has size ${expectedSize}`;

        return this.addToResults(
            this.val.size === expectedSize ?
                { status: "pass" } :
                { status: "fail", reason: format`set is of size ${this.val.size}, not ${expectedSize}` }
        );
    }

}