#!/usr/bin/env node
const readline = require('readline')
const program = require('commander')
const vm = require('vm')
const chalk = require('chalk')
const camelCase = require('camelcase')

// include modules
const getModules = function (module, store) {
  try {
    console.log(camelCase(module))
    store[camelCase(module)] = require(module)
  } catch (e) {
    // exit if you're requiring an invalid module
    console.error(chalk.red(e.message))
    process.exit(1)
  }
  return store
}

process.on('uncaughtException', (err) => {
  console.error(chalk.red(err.stack))
})

program
  .usage('[options] <expression>')
  .description(
      'A stream editor in javascript. Evaluates <expression> for each\n'
    + '  line of STDIN, where:\n\n'
    + '       _ = the current line\n'
    + '   _line = the current line number (starting at 0)\n'
    + '   _prev = the previous result of the expression\n'
    + '           (starts as \'\' or as [value] if --initial is set)\n\n'
    + '   chalk = the \'chalk\' module.\n\n'
    + '   other modules are included with the -m flag. For example,\n'
    + '   \'-m "module-name"\' assigns \'require("module-name")\' to\n'
    + '   \'moduleName\'.')
  .version('1.1.1')
  .option('-m, --module [module]', 'include a module in your expression',
    getModules, {})
  .option('-r, --reduce', 'print only the last value computed')
  .option('-i, --initial [value]', 'set the inital value of "_prev"')
  .option('-s, --swallow', 'swallow errors')
  .option('-t, --trim', 'trim whitespace from output')
  .option('-n, --nonewline', 'don\'t add newline (as `echo -n`)')
  .option('-f, --falsey', 'don\'t remove any falsy values')
  .parse(process.argv)

if (!program.args[0]) {
  program.help()
  process.exit(1)
}

const modules = program.module // map of module options
const script = new vm.Script(program.args[0])
const pipe = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})

let lineNumber = 0
let previous = program.initial || ''

pipe.on('line', (line) => {
  let out

  try {
    out = script.runInContext(new vm.createContext(Object.assign({

      '_': line, // current line
      '_line': lineNumber++, // current line number
      '_prev': previous, // aggregator

      'chalk': chalk // include the chalk module

    }, modules))) // add all included modules to the context
  } catch (e) {
    if (!program.swallow) console.error(chalk.red(e))
    return
  }

  if (out !== 0 && !out && !program.falsey) return
  previous = out // only set previous if output was truthy
  
  if (program.reduce) return
  if (program.trim) out = out.trim()

  process.stdout.write('' + out)

  if (!program.nonewline) process.stdout.write('\n')
})

// print the last result if --reduce is on
if (program.reduce) {
  pipe.on('close', () => {
    process.stdout.write('' + previous)
    if (!program.nonewline) process.stdout.write('\n')
  })
}
