# JPipe [![npm][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/jpipe.svg?style=flat
[npm-url]: https://npmjs.org/package/jpipe

> stream editor using javascript

## Installation

Run `npm install -g jpipe`, and then use the `jp` command
as described:

```
  Usage: jp [options] <script>

  Options:

    -h, --help              output usage information
    -V, --version           output the version number
    -s, --swallow           swallow errors
    -t, --trim              trim whitespace from output
    -n, --nonewline         don't add newline (as `echo -n`)
    -f, --falsey            don't remove any falsy values
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

- `_` is bound to the current line of the file
- `_line` is bound to the current line number of the file (starting at 0)
- `chalk` is bound to the module [chalk](https://github.com/chalk/chalk),
  which is very convenient for coloring output.

## Examples

- `ls | jp '_.match(/\.js$/)? chalk.green(_):_'` - Print all js files in green.
- `git log --pretty=oneline | jp '_.charAt(0) === "7" && _'` - Print all git
  commits whose hashes begin with `7`
