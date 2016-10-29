# JPipe [![npm][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/jpipe.svg?style=flat
[npm-url]: https://npmjs.org/package/jpipe

> stream editor using javascript

## Installation

Run `npm install -g jpipe`, and then use the `jp` command
as described:

```
  Usage: jp [options] <expression>

  A stream editor in javascript. Evaluates <expression> for each
  line of STDIN, where:

       _ = the current line
   _line = the current line number (starting at 0)
   _prev = the previous result of the expression
           (starts as '' or as [value] if --initial is set)

   chalk = the 'chalk' module.

   other modules are included with the -m flag. For example,
   '-m "module-name"' assigns 'require("module-name")' to
   'moduleName'.

  Options:

    -h, --help             output usage information
    -V, --version          output the version number
    -m, --module [module]  include a module in your expression
    -r, --reduce           print only the last value computed
    -i, --initial [value]  set the inital value of "_prev"
    -s, --swallow          swallow errors
    -t, --trim             trim whitespace from output
    -n, --nonewline        don't add newline (as `echo -n`)
    -f, --falsey           don't remove any falsy values
```

## Usage

```js
cat numbers.txt | jp '+_ + 10' > numbers_plus_ten.txt
```

Each line of the file `numbers.txt` is assigned to the variable `_`, and the
result of `+_ + 10` is printed to `STDOUT`, which is then redirected into
`numbers_plus_ten.txt`.

If the result of this computation is a falsey value (other than `0`, which is
allowed for convenience), then it will not be output.

### Bindings

Some special values come bound in the expression you give `jp`:

- `_` is bound to the current line of the file.
- `_line` is bound to the current line number of the file (starting at 0).
- `_prev` is bound to the result of the last expression.
- `chalk` is bound to the module [chalk](https://github.com/chalk/chalk),
  which is very convenient for coloring output.

any additional modules you include with the `-m` flag will be `require`d, and
assigned to a camel-case variable name (`module-name` is assigned to
`moduleName`)

## Examples

#### Print all lines of a file in yellow
```sh
cat text.txt | jp --falsey 'chalk.yellow(_)'
```

#### Sum all numbers in a file
```sh
cat numbers.txt | jp --reduce '+_prev + +_'
```

#### Sum second whitespace-separated column in a file
```sh
cat tabular.txt | jp --reduce '+_prev + +(_.split(/\s+/)[1])'`
```

#### Prepend every line with some random hex
```sh
cat text.txt | jp --module 'crypto' 'crypto.randomBytes(2).toString("hex") + " " + _'
```

#### Get field `value` from each line of a file (where each line is a JSON object)
```sh
cat objs.txt | jp 'JSON.parse(_).value'
```

#### Concatenate all arrays in a file of JSON arrays
```sh
cat rows.txt | jp --reduce --initial '[]' 'JSON.parse(_prev).concat(JSON.parse(_))'
```

#### List all `.js` files in green
```sh
ls | jp '_.match(/\.js$/)? chalk.green(_):_'
```

#### Print all git commits whose hashes begin in a `7`
```sh
git log --pretty=oneline | jp '_.charAt(0) === "7" && _'
```

#### Print some funky colored lines
```sh
yes | jp -n 'r = (Math.random() * 6) | 0;
  [chalk.red, chalk.green, chalk.yellow, chalk.blue, chalk.magenta, chalk.cyan][r]
  ((Math.random() * 2 | 0 % 2)? "____":"_/^\\_")'
```
