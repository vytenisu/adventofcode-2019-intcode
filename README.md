# Advent Of Code 2019 Intcode Emulator

## Why module?

Since Advent Of Code seems to require same intcode computer over and over again, this module is for those who did not have a chance to implement it themselves on previous tasks but who would still love to work on future tasks.

I have integrated it into my own solution - it seems that it works well :)

## Usage

Typical usage
```javascript
const emulator = require('adventofcode-2019-intcode')

// Raw program which is normally provided as input data of the task
const raw = '................'

// Parse provided program
const soft = chip.parseProgram(raw)

// Initialize registers
const reg = chip.createRegisters()

// Customizable execution index (optional)
// If not provided, it will be 0
const index = 0

// Some input array (first input at index 0)
// If additional input will be requested, run will be halted
// with exit code NEED_INPUT
// One can use custom index to continue program by providing
// additional inputs.
const inputs = [0, 1, 2]

const result = emulator.run(soft, reg, [], p)

// emulator.run also accepts 5th parameter (boolean) which can enable printing every command it executes
```

Result is an object which may contain following keys:
* exitCode - reason for exiting (one of emulator.exitCodes)
* pos - current execution index
* data - current state of memory/program
* output - single output value whenever output command is reached OR array of all output values when program terminates

## State of emulator

It should be completely operational. Major emulator version matches task number of Advent Of Code 2019. So far at v13.0.0 it seems to be backwards compatible with previous tasks of the same year.

There is no test coverage for now - sry.

Had an idea to make opcodes configurable - maybe later :) Currently every opcode is simply hard-coded.

This module is basically a copy-paste of quick and dirty solution used for the task.

___
HF & GL