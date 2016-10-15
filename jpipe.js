#!/usr/bin/env node
const readline = require('readline')
const program = require('commander')
const vm = require('vm')
const chalk = require('chalk')

process.on('uncaughtException', (err) => {
  console.error(chalk.red(err.stack))
})

program
  .usage('[options] <script>')
  .version('1.0.0')
//  .option('-r, --require [module]', 'require a module')
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
pipe.on('line', (line) => {
  let out

  try {
    out = script.runInContext(new vm.createContext({

      '_': line, // current line
      '_line': lineNumber++, // current line number

      'chalk': chalk // include the chalk module

    }))
  } catch (e) {
    if (!program.swallow) console.error(chalk.red(e))
    return
  }

  if (!out && !program.falsey) return
  if (program.trim) out = out.trim()

  process.stdout.write('' + out)

  if (!program.nonewline) process.stdout.write('\n')
})
