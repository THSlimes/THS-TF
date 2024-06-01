import * as fs from "node:fs"
import Config, { FilePrinter, StyledOutputLogger } from "./lib/Config";
import Test from "./lib/Test";
import ValueAssertion from "./lib/ValueAssertion";
import console from "node:console";
import path from "node:path";

const KNOWN_CMD_ARGS = new Set(["--dir", "-d", "--verbose", "-v", "--strict", "-s", "--outfile", "-o"]);

/**
 * Gets the named command line arguments of the current process.
 * @returns arg name -> arg value mapping (value is `""` is no associated value is provided)
 */
function getNamedCommandLineArguments():Record<string,string> {
    const args = process.argv;
    const out:Record<string,string> = {};

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('-') || arg.startsWith("--")) { // is argument name
            const argVal = args[i+1];
            if (argVal === undefined || argVal.startsWith('-') || argVal.startsWith("--")) out[arg] = "";
            else {
                out[arg] = argVal;
                i++;
            }
        }
    }

    return out;
}

type TestDir = { [k:string]:TestDir|Test[] };
/**
 * Extracts all `Test` objects from the given directory.
 * @param dirPath path to directory (if relative, it is interpreted relative to the CWD)
 * @returns Promise that resolves with the extracted tests
 */
function findTests(settings:Config.Settings):Promise<TestDir> {
    let dirPath = settings.testDir;
    if (!path.isAbsolute(dirPath)) dirPath = path.normalize(`${process.cwd()}/${dirPath}`);

    return Promise.all(fs.readdirSync(dirPath).map(filename => {
        const filepath = `${dirPath}/${filename}`;

        const stat = fs.statSync(filepath);
        if (stat.isDirectory()) return findTests({...settings, testDir: filepath})
            .then(tests => [`/${filename}`, tests] as [string,TestDir]);
        else if (stat.isFile() && filename.endsWith(".ts") || filename.endsWith(".js")) {
            return import(filepath)
                .then(res => {
                    const tests:Test[] = [];
                    for (const exp of Object.values(res)) {
                        if (exp instanceof Test) tests.push(exp);
                    }
                    return [`/${filename}`, tests] as [string,Test[]];
                });
        }
        else return Promise.resolve([`/${filename}`, []] as [string,Test[]]); // not TS file, has no tests
    }))
    .then(res => {
        const out:TestDir = {};
        for (const item of res) {
            if (Object.values(item[1]).length !== 0) out[item[0]] = item[1];
        }

        return out;
    });
}


type TestResults = { [name:string]:TestResults|ValueAssertion.ResultPool|Test.ExecutionError };
function runTests(testDir:TestDir|Test[], settings:Config.Settings, prefix=""):Promise<TestResults> {
    if (Array.isArray(testDir)) {
        return Promise.all(testDir.map(test => test.run().catch(err => err instanceof Test.ExecutionError ? err : new Test.ExecutionError(-1, err))))
            .then(results => {
                const out:TestResults = {};
                for (let i = 0; i < results.length; i++) out[testDir[i].name] = results[i];
                return out;
            });
    }
    else {
        const entries = Object.entries(testDir);
        return Promise.all(entries.map(entry => runTests(entry[1], settings)))
            .then(results => {
                const out:TestResults = {};
                for (let i= 0; i < results.length; i++) out[entries[i][0]] = results[i];
                return out;
            });
    }
}

function getResultStatus(results:TestResults|ValueAssertion.ResultPool|Test.ExecutionError):Test.Result {
    if (Array.isArray(results)) return results.some(res => res.status === "fail") ? "fail" : "pass";
    else if (results instanceof Test.ExecutionError) return "error";
    else {
        const values = Object.values(results);
        if (values.some(v => getResultStatus(v) === "error")) return "error";
        else if (values.some(v => getResultStatus(v) === "fail")) return "fail";
        else return "pass";
    }
}


function logTestResults(results:TestResults|ValueAssertion.ResultPool|Test.ExecutionError, settings:Config.Settings, prefix=""):void {
    const logger = settings.logger;
    if (Array.isArray(results)) { // is list of assertion results
        if (results.length === 0) logger.warning(prefix, "- ! No assertions found", "warning");
        else results.forEach((res, i) => { // is result from single test
            const point = results.length === 1 ? "-" : `${i+1}.`;
            if (res.status === "pass") {
                if (settings.outputSettings.verbose) { // only log passes when verbose
                    let str = `${point} ✓`;
                    if (res.name) str += ` (${res.name})`;
                    if (res.note) str += ` : ${res.note}`;
                    logger.pass(prefix, str);
                }
            }
            else logger.fail(
                prefix,
                res.name ?
                    `${point} ✗ (${res.name}) : ${res.reason}` :
                    `${point} ✗ : ${res.reason}`
            );
        });
    }
    else if (results instanceof Test.ExecutionError) { // test encountered unexpected error
        logger.error(prefix, `- ⛔ Stopped at assertion #${results.assertionIndex + 1} (${results.message})`);
    }
    else for (const name in results) { // is object with nested results
        const val = results[name];
        const status = getResultStatus(val);

        if (settings.outputSettings.verbose || status !== "pass") { // log everything
            logger.log(getResultStatus(val), prefix, name);
            logTestResults(val, settings, prefix + "    ");
        }
        else {
            if (status === "pass") logger.pass(prefix, name);
            else logger.log(status, prefix, name);
        }

    }
}

function doTests(settings:Config.Settings):Promise<void> {
    const unknownArgNames = Object.keys(CMD_ARGS).filter(n => !KNOWN_CMD_ARGS.has(n));
    if (unknownArgNames.length !== 0) { // warn of unknown CMD arguments
        settings.logger.warning(`Unknown command line argument(s): ${unknownArgNames.join(", ")}`);
    }

    if (!fs.existsSync(settings.testDir)) throw new Error(`path "${settings.testDir}" does not exist.`);
    else if (!fs.statSync(settings.testDir).isDirectory) throw new Error(`path "${settings.testDir}" exists, but is not a directory.`);
    
    return findTests(settings)
    .then(tests => runTests(tests, settings))
    .then(result => logTestResults(result, settings));
}



/** Mapping of named command line arguments to their value. */
const CMD_ARGS = getNamedCommandLineArguments();

const outFilePath = CMD_ARGS["-o"] ?? CMD_ARGS["--outfile"];

/** Output settings extrapolated from the given command line arguments. */
const OUTPUT_SETTINGS:Config.OutputSettings = {
    printer: outFilePath === undefined ? console : new FilePrinter(outFilePath || "out.txt", true),
    verbose: "--verbose" in CMD_ARGS || "-v" in CMD_ARGS,
    strict: "--strict" in CMD_ARGS || "-s" in CMD_ARGS
};

/** Settings extrapolated from the given command line arguments. */
const TEST_SETTINGS:Config.Settings = {
    testDir: CMD_ARGS["--dir"] ?? CMD_ARGS["-d"] ?? "./tests",
    outputSettings: OUTPUT_SETTINGS,
    logger: new StyledOutputLogger(OUTPUT_SETTINGS.printer, OUTPUT_SETTINGS)
};

doTests(TEST_SETTINGS);