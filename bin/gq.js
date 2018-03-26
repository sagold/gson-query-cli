#! /usr/bin/env node
/* eslint no-process-exit: 0 */
const program = require("commander");
const chalk = require("chalk");
const { get } = require("gson-query");
const format = require("../lib/format");
const loadData = require("../lib/loadData");

const qStr = chalk.underline("query");
const gStr = chalk.bold("gq");
const pStr = chalk.bold("pattern");


program
    .usage("[options] query")
    .description(`${chalk.bold("DESCRIPTION")}
    The ${gStr} utility will apply the ${qStr} on the given json data and write
    any results to the standard output. Per default, each result is written per
    line.

    ${chalk.bold("query")}
    A basic ${qStr} describes a path from the root of a json object to the
    target destination, e.g. '/first/property'. To find multiple matches replace
    any property with a wildcard '*', e.g. '/first/*' wich will return any
    property from 'first'. To search independent of the depth of a target, use
    the glob-pattern '**', e.g. '/**/second' will return any property 'second'
    regardless of the depth within the json file.

    To further narrow down the search result, use a regular expression like
    '/**/{alf.*}' and/or add additional queries to the targets property
    structure with '/**?alf:!undefined&&alf:!true'. For further details goto
    https://github.com/sagold/gson-query

    ${chalk.bold("value formats")}
    Value formats can be modified with options
    -j  value as valid json value in one line (default for objects and arrays)
    -b  value as valid json format, multiple lines

    ${chalk.bold("output options")}
    Different output options may be specified. A per line output is set by
    default, but can be changed in the following order (highest option matches
    first)
    -a  prints all matches in one valid json array like [ %value ]
    -o  prints all matches in one valid json object like { %pointer: %value }
    -p  specifies a pattern for per line output
    -t  prints json-pointer of matches per line

    ${chalk.bold("pattern")}
    For customized output a ${pStr} may be given, which is a string containing
    variables (%name) which will be replaced by the specified contents.

    Example pattern: $ gq -p '%number/%total %pointer: %value'

    Valid variable names are:
    %value     - the matching value
    %key       - the property name of the match
    %parent    - the value of the parent (which contains the match)
    %pointer   - the json-pointer to the target
    %index     - the index of the match
    %position  - the position of the match (index starting at 1)
    %total     - the total number of matches

    ${chalk.bold("Examples")}
    $ gq -f demo.json '/nodes/*/services/*?state:!healthy'
    $ cat demo.json | gq '/nodes/*/services/*?state:!healthy'`)
    .option("-a, --array", `print ${chalk.bold("all")} matches as a valid json like [%match]. Overrides -o, -t, -p.`)
    .option("-b, --beautify", "pretty print the result in json format (multiple lines)")
    .option("-d, --debug", "show stack trace of errors")
    .option("-f, --filename <filename>", "reads the json data from the given file")
    .option("-j, --json", "print the result in json format (one-liner). Will always json-print objects and arrays")
    .option("-o, --object", `print ${chalk.bold("all")} matches as a valid json map {%pointer: %match}. Overrides -t -p.`)
    .option("-p, --pattern <pattern>", "print the result in the given pattern. @see pattern description")
    .option("-t, --target", "returns the json-pointer of each match (instead of its value)")
    .parse(process.argv);


function runQuery(data, cmd) {
    const [queryString] = cmd.args;
    let matches;

    if (cmd.array) {
        matches = get(data, queryString, get.VALUE);
        console.log(format(cmd, matches));
        return;
    }

    if (cmd.object) {
        matches = get(data, queryString, get.MAP);
        console.log(format(cmd, matches));
        return;
    }

    if (cmd.pattern) {
        matches = get(data, queryString, get.ALL);
        matches = matches.map((args, index) => {
            const [value, key, parent, pointer] = args;
            return cmd.pattern
                .replace(/%value/g, format(cmd, value))
                .replace(/%key/g, format(cmd, key))
                .replace(/%parent/g, format(cmd, parent))
                .replace(/%pointer/g, format(cmd, pointer))
                .replace(/%total/g, format(cmd, matches.length))
                .replace(/%position/g, format(cmd, index + 1))
                .replace(/%index/g, format(cmd, index));
        });

    } else {
        matches = get(data, queryString, program.target ? get.POINTER : get.VALUE);
        matches = matches.map((match) => format(program, match));
    }
    while (matches.length) {
        console.log(matches.shift());
    }
}

program.pipe = process.stdin.isTTY == null;

if (program.args.length === 0) {
    console.error("gq: required argument 'query' is not given");
    process.exit(1);
}

if (program.pattern && typeof program.pattern !== "string") {
    console.error("gq: option 'pattern' must be a string");
    process.exit(1);
}

loadData(program)
    .then((data) => {
        try {
            data = JSON.parse(data);
            return data;
        } catch (e) { // eslint-disable-line no-unused-vars
            throw new Error(`gq: '${program.args[0]}' is an invalid json format`);
        }
    })
    .then((data) => runQuery(data, program))
    .catch((error) => {
        console.log(error.message);
        program.debug && console.log(error);
    });
