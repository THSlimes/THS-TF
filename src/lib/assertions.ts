function format(val:any):string {
    if (typeof val === "string") return `"${val}"`;
    else if (typeof val === "object") {
        if (Array.isArray(val)) {
            return `[${val.map(v => format(v)).join(", ")}]`;
        }
        else {
            const entries = Object.entries(val).map(([k, v]) => `${format(k)}: ${format(v)}`);
            return `{ ${entries.join(", ")} }`
        }
    }
    else return String(val);
}

abstract class ValueAssertion<T extends ValueAssertion.Assertable> {


    protected readonly val:T;
    private readonly resultsPool:ValueAssertion.Result[];
    protected addToResults(res:ValueAssertion.Result) {
        if (this.name) res.name = this.name;
        this.resultsPool.push(res);
    }

    private name?:string;
    /** Assigns a name to this assertion. */
    public named(name:string) {
        this.name = name;
        return this as Omit<this, "named">;
    }

    public constructor(val:T, resultsPool:ValueAssertion.Result[]) {
        this.val = val;
        this.resultsPool = resultsPool;
    }

    protected abstract checkEq(expected:T):boolean;

    public toBe(expected:T):void {
        this.addToResults(this.checkEq(expected) ? {
            status: "pass",
        } : {
            status: "fail",
            reason: `expected value to be ${format(expected)}, but was actually ${format(this.val)}`
        });
    }

    public toNotBe(notExpected:T) {
        this.addToResults(!this.checkEq(notExpected) ? {
            status: "pass",
        } : {
            status: "fail",
            reason: `expected value not to be ${format(notExpected)}, but it was`
        });
    }

}

type Primitive = string|number|bigint|boolean|undefined|symbol|null;
class PrimitiveValueAssertion<P extends Primitive> extends ValueAssertion<P> {

    public constructor(val:P, resultsPool:ValueAssertion.Result[]) {
        super(val, resultsPool);
    }

    protected override checkEq(expected:P):boolean {
        return this.val === expected;
    }
    
}

function deepEquals(val:any, expected:any):boolean {
    if (val === expected) return true; // shortcut
    else if (typeof val !== typeof expected) return false; // types must match
    else if (typeof val === "object" && typeof expected === "object") {
        if (Array.isArray(val)) {
            return Array.isArray(expected)
                && val.length === expected.length
                && val.every((e, i) => deepEquals(e, expected[i]));
        }
        else if (val instanceof Date) {
            return expected instanceof Date
                && val.getTime() == expected.getTime();
        }
        else {
            const valKeys = Object.keys(val);
            const expectedKeys = Object.keys(expected);

            return valKeys.length === expectedKeys.length // same number of properties
                && valKeys.every(k => k in expected) // keys match
                && valKeys.every(k => deepEquals(val[k], expected[k])); // values of keys match
        }
    }
    else return false;
}

class ObjectValueAssertion<O extends object> extends ValueAssertion<O> {

    public constructor(val:O, resultsPool:ValueAssertion.Result[]) {
        super(val, resultsPool);
    }

    protected override checkEq(expected:O):boolean {
        return deepEquals(this.val, expected);
    }

}

export namespace ValueAssertion {

    export type Assertable = Primitive | object;

    export type Result = {
        status:"pass",
        name?:string
    } | {
        status:"fail",
        name?:string,
        reason:string
    };

    export type For<T extends Assertable> = T extends Primitive ?
        PrimitiveValueAssertion<T> :
        T extends object ?
            ObjectValueAssertion<T> :
            never;

}

export type ExpectFunction = <T extends ValueAssertion.Assertable>(val:T)=>ValueAssertion.For<T>;
export namespace ExpectFunction {
    export function get():[ExpectFunction,ValueAssertion.Result[]] {
        const pool:ValueAssertion.Result[] = [];
        return [<T extends ValueAssertion.Assertable>(val:T) => {
            if (typeof val === "bigint") return new PrimitiveValueAssertion(val, pool) as ValueAssertion.For<T>;
            else if (typeof val === "boolean") return new PrimitiveValueAssertion(val, pool) as ValueAssertion.For<T>;
            else if (typeof val === "number") return new PrimitiveValueAssertion(val, pool) as ValueAssertion.For<T>;
            else if (typeof val === "string") return new PrimitiveValueAssertion(val, pool) as ValueAssertion.For<T>;
            else if (typeof val === "symbol") return new PrimitiveValueAssertion(val, pool) as ValueAssertion.For<T>;
            else if (typeof val === "undefined") return new PrimitiveValueAssertion(val, pool) as ValueAssertion.For<T>;
            else if (val == null) return new PrimitiveValueAssertion<null>(val, pool) as ValueAssertion.For<T>;
            else if (typeof val === "object") return new ObjectValueAssertion(val, pool) as ValueAssertion.For<T>;
            else throw new Error(`no value assertion type found for ${String(val)}`); // failsafe
        }, pool];
    }
}
