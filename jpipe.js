#!/usr/bin/env node
const readline = require('readline')
const program = require('commander')
const vm = require('vm')
const chalk = require('chalk')

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
    + '   chalk = the \'chalk\' module.\n'
    + ' require = the \'require\' function.')
  .version('1.1.1')
//  .option('-r, --require [module]', 'require a module')
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
    out = script.runInContext(new vm.createContext({

      '_': line, // current line
      '_line': lineNumber++, // current line number
      '_prev': previous, // aggregator

      'chalk': chalk, // include the chalk module
      'require': require // allow new modules to be required

    }))
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
