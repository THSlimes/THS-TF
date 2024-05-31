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

export function dateIsValid(d:Date):boolean {
    return !isNaN(d.getTime());
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export function getMonthName(n:number|Date) {
    if (n instanceof Date) n = n.getMonth() + 1;

    if (n < 1 || n > MONTH_NAMES.length) throw new RangeError(`month number must be in [1, ${MONTH_NAMES.length}]`);
    else if (n % 1 !== 0) throw new TypeError("month number must be an integer");
    else return MONTH_NAMES[n - 1];
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
            if (Array.isArray(val)) return `[${val.map(format.single).join(", ")}]`;
            else if (val instanceof Set) return `{${[...val.values()].map(format.single).join(", ")}}`;
            else if (val instanceof Map) {
                const entries = [...val.entries()].map(([k, v]) => `${single(k)}: ${single(v)}`);
                return `Map{${entries.join(", ")}}`;
            }
            else if (val instanceof RegExp) return val.toString();
            else if (val instanceof Date) {
                if (!dateIsValid(val)) return "<Invalid Date>";

                let out = `${getMonthName(val)} ${format.nth(val.getDate())} ${val.getFullYear()}`;

                const [h, m, s, ms] = [val.getHours(), val.getMinutes(), val.getSeconds(), val.getMilliseconds()];
                if (h || m || s || ms) {
                    out += ` ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                    if (s || ms) {
                        out += `:${s.toString().padStart(2, '0')}`;
                        if (ms) out += `.${ms.toString().padStart(3, '0')}`;
                    }
                }

                const tzo = -val.getTimezoneOffset();
                if (tzo !== 0) {
                    const tzoMinutes = tzo % 60;
                    const tzoHours = (tzo - tzoMinutes)/60;
                    out += ` UTC${tzo > 0 ? '+' : '-'}${Math.abs(tzoHours).toString().padStart(2, '0')}:${tzoMinutes.toString().padStart(2, '0')}`;
                }

                return out;
            }
            else {
                const entries = Object.entries(val).map(([k, v]) => `${single(k)}: ${single(v)}`);
                return `{${entries.join(", ")}}`;
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

    export function nth(n:number): string {
        const lastNum = Math.floor(n).toString().slice(-1);

        switch (lastNum) {
            case '1': return `${n}st`;
            case '2': return `${n}nd`;
            case '3': return `${n}rd`;
            default: return `${n}th`;
        }
    }
}

export function isNoArgumentFunction(f: any): f is () => any { return typeof f === "function" && f.length === 0; }
export function isArgumentFunction(f: any): f is (...args: any[]) => any { return typeof f === "function" && f.length !== 0; }