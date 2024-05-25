export function isPrime(n: number | bigint): true | number {
    if (typeof n === "bigint") n = Number(n);

    if (n <= 1) return -1;
    else {
        for (let i = 3; i <= n ** 0.5; i += 2) {
            if (n % i === 0) return i; // is divisible by i, not prime
        }
        return true; // is prime
    }
}

/** Template tag to format expressions in a human-readable way. */
export function format(strings: TemplateStringsArray, ...exps: any[]): string {
    let out = "";
    for (let i = 0; i < strings.length; i++) out += strings[i] + (i < exps.length ? format.single(exps[i]) : "");
    return out;
}

export namespace format {
    /**
     * Formats the single given value in a human-readable way.
     * @param val value
     * @returns formatted value
     */
    export function single(val: any): string {
        if (typeof val === "string") return val.length === 1 ? `'${val}'` : `"${val}"`;
        else if (typeof val === "bigint") return `${val}n`;
        else if (typeof val === "object" && val !== null) {
            if (Array.isArray(val)) {
                return `[${val.map(v => format.single(v)).join(", ")}]`;
            }
            else if (val instanceof RegExp) return val.toString();
            else {
                const entries = Object.entries(val).map(([k, v]) => `${single(k)}: ${single(v)}`);
                return `{ ${entries.join(", ")} }`;
            }
        }
        else return String(val);
    }

    /**
     * Formats a sequence of values in a human-readable way.
     * @param arr array of values
     * @param delimiter normal delimiter for formatted array elements
     * @param lastDelimiter delimiter between the last pair of values (e.g. 1, 2, 3 **and** 4)
     * @returns `arr` formatted as a sequence
     */
    export function sequence(arr: any[], delimiter = ", ", lastDelimiter = " and "): string {
        const formatted = arr.map(single);
        if (formatted.length === 0) return "";
        else if (formatted.length === 1) return formatted[0];
        else return formatted.slice(0, formatted.length - 1).join(delimiter) + lastDelimiter + formatted.at(-1);
    }
}

export function isNoArgumentFunction(f: any): f is () => any { return typeof f === "function" && f.length === 0; }
export function isArgumentFunction(f: any): f is (...args: any[]) => any { return typeof f === "function" && f.length !== 0; }