import Test from "../../Test";
import { format } from "../../util-functions";
import ValueAssertion from "../../ValueAssertion";

export default class MapValueAssertion<K,V> extends ValueAssertion<Map<K,V>> {

    constructor(val: Map<K,V>, resultsPool: ValueAssertion.ResultPool) {
        super(val, resultsPool);
    }

    public toHaveKey(key: K) {
        this.autoName = format`given map has key ${key}`;
        return this.addToResults(
            this.val.has(key) ?
                { status: "pass" } :
                { status: "fail", reason: format`expected map to have key ${key}, but ${this.val} doesn't` }
        );
    }

    public forAllKeys(assertion: (k: Test.ValueAssertionFor<K>, map: Map<K,V>) => boolean) {
        const [expect, pool] = Test.ExpectFunction.get();

        const keys = [...this.val.keys()];
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

    public forSomeKeys(assertion: (k: Test.ValueAssertionFor<K>, map: Map<K,V>) => boolean) {
        const [expect, pool] = Test.ExpectFunction.get();

        const keys = [...this.val.keys()];
        keys.forEach(k => assertion(expect(k), this.val));
        this.autoName = pool.every(res => res.name === pool[0].name) ? `for some keys: ${pool[0].name}` : `some keys match assertion`;

        return this.addToResults(
            pool.some(res => res.status === "pass") ?
                { status: "pass" } :
                { status: "fail", reason: format`assertion failed for all elements` }
        );
    }

    public toHaveValue(value: V) {
        this.autoName = format`given map has value ${value}`;
        return this.addToResults(
            [...this.val.values()].some(v => MapValueAssertion.deepEquals(v, value)) ?
                { status: "pass" } :
                { status: "fail", reason: format`expected map to have value ${value}, but ${this.val} doesn't` }
        );
    }

    public forAllValues(assertion: (v: Test.ValueAssertionFor<V>, map: Map<K,V>) => boolean) {
        const [expect, pool] = Test.ExpectFunction.get();

        const values = [...this.val.values()];
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

    public forSomeValues(assertion: (v: Test.ValueAssertionFor<V>, map: Map<K,V>) => boolean) {
        const [expect, pool] = Test.ExpectFunction.get();

        const values = [...this.val.values()];
        values.forEach(v => assertion(expect(v), this.val));
        
        this.autoName = pool.every(res => res.name !== undefined && res.name === pool[0].name) ? `for some values: ${pool[0].name}` : `some values match assertion`;

        return this.addToResults(
            pool.some(res => res.status === "pass") ?
                { status: "pass" } :
                { status: "fail", reason: format`assertion failed for all elements` }
        );
    }

    public toHaveEntry(key: K, value: V) {
        this.autoName = format`given map has ${key} -> ${value}`;
        return this.addToResults(
            this.val.has(key) ?
                MapValueAssertion.deepEquals(this.val.get(key)!, value) ?
                    { status: "pass" } :
                    { status: "fail", reason: format`map does have key ${key}, but it does not map to ${value}` } : // value mismatch
                { status: "fail", reason: format`map does not have key ${key}` } // missing key
        );
    }

    public toBeOfSize(numEntries: number) {
        if (numEntries < 0) throw new TypeError(format`expected size ${numEntries} is not allowed to be negative`);
        else if (numEntries % 1 !== 0) throw new TypeError(format`expected size ${numEntries} must be an integer`);

        this.autoName = format`given map has ${numEntries} entries`;
        const valSize = this.val.size;
        return this.addToResults(
            valSize === numEntries ?
                { status: "pass" } :
                { status: "fail", reason: format`expected map to have ${numEntries} entries, but ${this.val} has ${valSize}` }
        );
    }


}