module.exports = {
  exitCodes: {
    NEED_INPUT: 0,
    OUTPUT: 1,
    TERMINATED: 2,
  },

  errorCodes: {
    WRONG_COMMAND_MODE: 0,
    WRONG_COMMAND: 1,
    UNEXPECTED: 2,
  },

  parseProgram(rawProgram) {
    let softIndex = 0

    return rawProgram.split(',').map(Number).reduce((result, current) => {
      result[softIndex++] = current
      return result
    }, {})
  },

  createRegisters() {
    return {
      base: 0,
    }
  },

  run(data, registers, input, pos = 0, debugPrint = false) {
    let cmd = 0;
    const output = []
  
    function parseCommand(cmd) {
      let stringCmd = cmd.toString().padStart(5, '0')
    
      const cmdParts = stringCmd.split('').map(Number)
    
      const command = Number(`${cmdParts[3]}${cmdParts[4]}`)
      const op1 = cmdParts[2]
      const op2 = cmdParts[1]
      const op3 = cmdParts[0]
  
      const parsed = {cmd: command, op1, op2, op3}
    
      return parsed
    }
    
    function resolveValue(op, pos) {
      if (op == 1) {
        return data[pos] || 0
      } else if (op == 0) {
        return data[data[pos] || 0] || 0
      } else if (op == 2) {
        return data[(data[pos] || 0) + registers.base] || 0
      } else {
        const error = new Error(`Wrong command mode: ${op}`)
        error.type = this.errorCodes.WRONG_COMMAND_MODE
        throw error
      }
    }
  
    function storeValue(op, pos, value) {
      if (op == 2) {
        data[(data[pos] || 0) + registers.base] = value
      } else {
        data[data[pos]] = value
      }
    }
  
    function printCommand(cmdInfo, pos) {
      const map = {
        1: {name: 'ADD', arg: 3},
        2: {name: 'MUL', arg: 3},
        3: {name: 'PUT', arg: 1},
        4: {name: 'GET', arg: 1},
        5: {name: 'J>0', arg: 2},
        6: {name: 'J=0', arg: 2},
        7: {name: 'CLE', arg: 3},
        8: {name: 'CMP', arg: 3},
        9: {name: 'BAS', arg: 1},
        99: {name: 'END', arg: 0},
      }
  
      let o1 = 'ERR'
  
      if (cmdInfo.op1 == 0 ) {
        o1 = data[pos + 1]
      } else if (cmdInfo.op1 == 1) {
        o1 = `[${data[pos + 1]}]`
      } else if (cmdInfo.op1 == 2) {
        o1 = `[${data[pos + 1]} + ${registers.base}]`
      }
  
      let o2 = 'ERR'
  
      if (cmdInfo.op1 == 0 ) {
        o2 = data[pos + 2]
      } else if (cmdInfo.op1 == 1) {
        o2 = `[${data[pos + 2]}]`
      } else if (cmdInfo.op1 == 2) {
        o2 = `[${data[pos + 2]} + ${registers.base}]`
      }
  
      console.log(`${pos.toString().padStart(4, ' ')}: ${map[cmdInfo.cmd].name} ${map[cmdInfo.cmd].arg > 0 ? o1 : ''} ${map[cmdInfo.cmd].arg > 1 ? o2 : ''} ${map[cmdInfo.cmd].arg > 2 ? data[pos+3] : ''}`)
    }
  
    while (cmd != 99) {
      const cmdInfo = parseCommand(data[pos])
      cmd = cmdInfo.cmd
    
      if (debugPrint) {
        printCommand(cmdInfo, pos)
      }
  
      const {op1, op2, op3} = cmdInfo
    
      if (cmd === 1) {
        const a = resolveValue(op1, pos + 1)
        const b = resolveValue(op2, pos + 2)
    
        storeValue(op3, pos + 3, a + b)
        pos += 4
      } else if (cmd === 2) {
        const a = resolveValue(op1, pos + 1)
        const b = resolveValue(op2, pos + 2)
        
        storeValue(op3, pos + 3, a * b)
        pos += 4
      } else if (cmd === 3) {
        if (!input.length) {
          return {exitCode: this.exitCodes.NEED_INPUT, pos, data}
        }
  
        const a = input.shift()
    
        storeValue(op1, pos + 1, a)
        pos += 2
      } else if (cmd === 4) {
        const a = resolveValue(op1, pos + 1)
  
        output.push(a)
        pos += 2
        return {exitCode: this.exitCodes.OUTPUT, output: a, pos, data}
      } else if (cmd === 99) {
        return {exitCode: this.exitCodes.TERMINATED, output, pos, data}
      } else if (cmd === 5) {
        const a = resolveValue(op1, pos + 1)
        const b = resolveValue(op2, pos + 2)
    
        if (a) {
          pos = b
        } else {
          pos += 3
        }
      } else if (cmd === 6) {
        const a = resolveValue(op1, pos + 1)
        const b = resolveValue(op2, pos + 2)
    
        if (!a) {
          pos = b
        } else {
          pos += 3
        }
      } else if (cmd === 7) {
        const a = resolveValue(op1, pos + 1)
        const b = resolveValue(op2, pos + 2)
    
        if (a < b) {
          storeValue(op3, pos + 3, 1)
        } else {
          storeValue(op3, pos + 3, 0)
        }
    
        pos += 4
      } else if (cmd === 8) {
        const a = resolveValue(op1, pos + 1)
        const b = resolveValue(op2, pos + 2)
    
        if (a == b) {
          storeValue(op3, pos + 3, 1)
        } else {
          storeValue(op3, pos + 3, 0)
        }
    
        pos += 4
      } else if (cmd === 9) {
        const a = resolveValue(op1, pos + 1)
        registers.base += a
  
        pos += 2
      } else {
        const error = new Error(`Wrong command: ${cmd} at position ${pos}`)
        error.type = this.errorCodes.WRONG_COMMAND
        throw error
      }
    }
    
    const error = new Error('Program did not terminate correctly')
    error.type = this.errorCodes.UNEXPECTED
    throw error
  }
}
