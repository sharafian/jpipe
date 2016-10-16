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

  Options:

    -h, --help             output usage information
    -V, --version          output the version number
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

## Examples

- `cat numbers.txt | jp --reduce '+_prev + +_'` - Sum all numbers in a file.
- `cat tabular.txt | jp --reduce '+_prev + +(_.split(/\s+/)[1])'` - Sum the
  second whitespace-separated field of all lines in a file.
- `cat objs.txt | jp 'JSON.parse(_).value'` - Get field `value` from each line
  of a file where every line is a JSON object.
- `cat rows.txt | jp --reduce --initial '[]' 'JSON.parse(_prev).concat(JSON.parse(_))'` -
  concatenate all arrays in a file where each line is a JSON array.
- `ls | jp '_.match(/\.js$/)? chalk.green(_):_'` - Print all js files in green.
- `git log --pretty=oneline | jp '_.charAt(0) === "7" && _'` - Print all git
  commits whose hashes begin with `7`
