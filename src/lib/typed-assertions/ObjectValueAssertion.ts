import Test from "../Test";
import ValueAssertion from "../ValueAssertion";
import { format } from "../util-functions";

type ValueOf<O extends object> = O[keyof O];
type EntryOf<O extends object> = [keyof O, ValueOf<O>];

export default class ObjectValueAssertion<O extends object> extends ValueAssertion<O> {

    constructor(val: O, resultsPool: ValueAssertion.ResultPool) {
        super(val, resultsPool);
    }

    public toHaveKey(key: keyof O) {
        this.autoName = format`given object has key ${key}`;
        return this.addToResults(
            key in this.val ?
                { status: "pass" } :
                { status: "fail", reason: format`expected object to have key ${key}, but ${this.val} doesn't` }
        );
    }

    public forAllKeys(assertion: (k: Test.ValueAssertionFor<keyof O>, obj: O) => boolean) {
        const [expect, pool] = Test.ExpectFunction.get();

        const keys = Object.keys(this.val) as (keyof O)[];
        keys.forEach(k => assertion(expect(k), this.val));
        this.autoName = pool.every(res => res.name === pool[0].name) ? `for all keys: ${pool[0].name}` : `all keys match assertion`;

        const firstFailIndex = pool.findIndex(res => res.status === "fail");
        
        if (firstFailIndex === -1) return this.addToResults({ status: "pass" });
        else {
            const failureCase = pool[firstFailIndex] as ValueAssertion.Result.Failure;
            return this.addToResults({
                status: "fail",
                reason: `key ${format.single(keys[firstFailIndex])} failed: ${failureCase.reason}`
            });
        }
    }

    public forSomeKeys(assertion: (k: Test.ValueAssertionFor<keyof O>, obj: O) => boolean) {
        const [expect, pool] = Test.ExpectFunction.get();

        const keys = Object.keys(this.val) as (keyof O)[];
        keys.forEach(k => assertion(expect(k), this.val));
        this.autoName = pool.every(res => res.name === pool[0].name) ? `for some keys: ${pool[0].name}` : `some keys match assertion`;

        return this.addToResults(
            pool.some(res => res.status === "pass") ?
                { status: "pass" } :
                { status: "fail", reason: format`assertion failed for all elements` }
        );
    }

    public toHaveValue(value: ValueOf<O>) {
        this.autoName = format`given object has value ${value}`;
        return this.addToResults(
            Object.values(this.val).some(v => ObjectValueAssertion.deepEquals(v, value)) ?
                { status: "pass" } :
                { status: "fail", reason: format`expected object to have value ${value}, but ${this.val} doesn't` }
        );
    }

    public forAllValues(assertion: (v: Test.ValueAssertionFor<ValueOf<O>>, obj: O) => boolean) {
        const [expect, pool] = Test.ExpectFunction.get();

        const values = Object.values(this.val) as ValueOf<O>[];
        values.forEach(v => assertion(expect(v), this.val));
        this.autoName = pool.every(res => res.name !== undefined && res.name === pool[0].name) ? `for all values: ${pool[0].name}` : `all values match assertion`;

        const firstFailIndex = pool.findIndex(res => res.status === "fail");
        
        if (firstFailIndex === -1) return this.addToResults({ status: "pass" });
        else {
            const failureCase = pool[firstFailIndex] as ValueAssertion.Result.Failure;
            return this.addToResults({
                status: "fail",
                reason: `key ${format.single(values[firstFailIndex])} failed: ${failureCase.reason}`
            });
        }
    }

    public forSomeValues(assertion: (v: Test.ValueAssertionFor<ValueOf<O>>, obj: O) => boolean) {
        const [expect, pool] = Test.ExpectFunction.get();

        const values = Object.values(this.val) as ValueOf<O>[];
        values.forEach(v => assertion(expect(v), this.val));
        
        this.autoName = pool.every(res => res.name !== undefined && res.name === pool[0].name) ? `for some values: ${pool[0].name}` : `some values match assertion`;

        return this.addToResults(
            pool.some(res => res.status === "pass") ?
                { status: "pass" } :
                { status: "fail", reason: format`assertion failed for all elements` }
        );
    }

    public toHaveEntry(key: keyof O, value: ValueOf<O>) {
        this.autoName = format`given object has ${key} -> ${value}`;
        return this.addToResults(
            key in this.val ?
                ObjectValueAssertion.deepEquals(this.val[key], value) ?
                    { status: "pass" } :
                    { status: "fail", reason: format`object does have key ${key}, but it does not map to ${value}` } : // value mismatch
                { status: "fail", reason: format`object does not have key ${key}` } // missing key
        );
    }

    public toBeOfSize(numEntries: number) {
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
