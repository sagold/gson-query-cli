# gson query cli

> Query and transform your json data using an extended glob-pattern. This is a really helpful tool to quickly
>
> - fuzzy search json-data matching some search properties
> - transform data with consistent structures
> - extract information from json-data
>
> This is the cli to [gson-query](https://github.com/sagold/gson-query)

`npm install gson-query-cli -g`


# Usage

`cat some.json | gq query`

Example `cat package.json | gq '/keywords/*'` will print all keywords

```
cli
query
json
json-pointer
glob-pattern
library
```

or read a file directly `gq -f package.json '/keywords/*'`


# Query



# Options

For further details and options type `$ gq -h`.

```
Usage: gq [options] query

DESCRIPTION
The gq utility will apply the query on the given json data and write
any results to the standard output. Per default, each result is written per
line.

query
A basic query describes a path from the root of a json object to the
target destination, e.g. '/first/property'. To find multiple matches replace
any property with a wildcard '*', e.g. '/first/*' wich will return any
property from 'first'. To search independent of the depth of a target, use
the glob-pattern '**', e.g. '/**/second' will return any property 'second'
regardless of the depth within the json file.

To further narrow down the search result, use a regular expression like
'/**/{alf.*}' and/or add additional queries to the targets property
structure with '/**?alf:!undefined&&alf:!true'. For further details goto
https://github.com/sagold/gson-query

value formats
Value formats can be modified with options
-j  value as valid json value in one line (default for objects and arrays)
-b  value as valid json format, multiple lines

output options
Different output options may be specified. A per line output is set by default,
but can be changed in the following order (highest option matches first)
-a  prints all matches in one valid json array like [ %value ]
-o  prints all matches in one valid json object like { %pointer: %value }
-p  specifies a pattern for per line output
-t  prints json-pointer of matches per line

pattern
For customized output a pattern may be given, which is a string containing
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

Examples
$ gq -f demo.json '/nodes/*/services/*?state:!healthy'
$ cat demo.json | gq '/nodes/*/services/*?state:!healthy'

Options:

-a, --array                print all matches as a valid json like [%match]. Overrides -o, -t, -p.
-b, --beautify             pretty print the result in json format (multiple lines)
-d, --debug                show stack trace of errors
-f, --filename <filename>  reads the json data from the given file
-j, --json                 print the result in json format (one-liner). Will always json-print objects and arrays
-o, --object               print all matches as a valid json map {%pointer: %match}. Overrides -t -p.
-p, --pattern <pattern>    print the result in the given pattern. @see pattern description
-t, --target               returns the json-pointer of each match (instead of its value)
-h, --help                 output usage information
```
