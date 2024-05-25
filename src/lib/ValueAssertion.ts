import ArrayValueAssertion from "./typed-assertions/ArrayValueAssertion";
import BigintValueAssertion from "./typed-assertions/BigintValueAssertion";
import NumberValueAssertion from "./typed-assertions/NumberValueAssertion";
import ObjectValueAssertion from "./typed-assertions/ObjectValueAssertion";
import StringValueAssertion from "./typed-assertions/StringValueAssertion";
import { ArgumentFunctionValueAssertion } from "./typed-assertions/FunctionValueAssertion";
import { NoArgumentFunctionValueAssertion } from "./typed-assertions/FunctionValueAssertion";
import { format } from "./util-functions";

type ToStringable = { toString():string };
/**
 * `ValueAssertion` is a base class that handles checking certain properties of their value.
 * @param T type of value to check
 */
class ValueAssertion<T> {

    protected readonly val:T;
    private readonly resultsPool:ValueAssertion.ResultPool;
    protected addToResults(res:ValueAssertion.Result):boolean {
        let name = this.name?.toString();
        if (this._doAutoName) name ??= this.autoName?.toString();
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

namespace ValueAssertion {

    export type Result = Result.Pass | Result.Failure;
    export namespace Result {
        export type Pass = { status:"pass", name?:string, note?:string };
        export type Failure = { status:"fail", name?:string, reason:string };
    }

    export type ResultPool = Result[];
}

export default ValueAssertion;