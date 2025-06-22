class PostfixPPInterpreter {
  //Initializes the variable table, stack, and operator dictionary to set up the computation environment.
  constructor () {
    this.vars = Object.create(null);
    this.stack = [];
    this.operators = {
      
      '+': (lhs, rhs) => lhs + rhs,
      '-': (lhs, rhs) => lhs - rhs,
      '*': (lhs, rhs) => lhs * rhs,
      '/': (lhs, rhs) => {              
        if (rhs === 0) throw new Error('Division by zero');
        return lhs / rhs;
      },
      '%': (lhs, rhs) => lhs % rhs,
      '^': (lhs, rhs) => Math.pow(lhs, rhs)
    };
  }

  //Empties the stack to ensure a clean start for the next expression evaluation.
  resetStack () {
    this.stack.length = 0;            
  }

  //Splits the input string by spaces into an array of tokens.
  tokenize (line) {                    
    return line.trim().split(/\s+/)
  }

  //Uses regular expressions to determine whether a token is a number or a single uppercase variable.
  isNumber (token) {
    return /^-?\d+(?:\.\d+)?$/.test(token);
  }
  isVariable (token) {
    return /^[A-Z]$/.test(token);
  }

  //Processes each token by type—pushing, calculating, or assigning—and temporarily holds variables for deferred resolution.
  handleToken (token) {
    if (!token) return;
    if (this.isNumber(token)) {
      this.stack.push(Number(token));
    } else if (token in this.operators) {
      if (this.stack.length < 2) {
        throw new Error(`Stack underflow`);
      }
      const rhs = this.getValue(
        this.stack.pop()
      );
      const lhs = this.getValue(this.stack.pop());
      const res = this.operators[token](lhs, rhs);
      this.stack.push(res);
    } else if (token === '=') {
      if (this.stack.length < 2) {
        throw new Error('Stack underflow');
      }
      var raw = this.stack.pop(); 
      const value = this.getValue(raw);
      const varName = this.stack.pop();
      if (!this.isVariable(varName)) {
        throw new Error('Invalid variable');
      }
      this.vars[varName] = value;
    } else if (this.isVariable(token)) {
      this.stack.push(token);       // Values ​​are lazily resolved (getValue)
    } else {
      throw new Error('Unknown token');
    }
  }


  //Resolves operands to numeric values, throwing an error if the variable is undefined or the value is invalid.
  getValue (operand) {
    if (typeof operand === 'number'){
      return operand;
    }
    if (this.isVariable(operand)) {
      if (operand in this.vars){
        return this.vars[operand];
      } 
      throw new Error('Unassigned variable');
    }
    throw new Error('Invalid operation or operand');
  }


  // Resets the stack, processes all tokens, and returns the result (the last value).
  evaluate (line) {
    this.resetStack()
    const tokens = this.tokenize(line);
    tokens.forEach(token => this.handleToken(token));
    return this.stack.length ? this.getValue(this.stack[this.stack.length - 1]) : null;
  }
}


//Uses readline to accept interactive input, display results, and handle errors.
if (require.main === module) {
  const readline = require('readline');
  const interpreter = new PostfixPPInterpreter();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  });

  rl.prompt();
  rl.on('line', line => {
    try {
      const result = interpreter.evaluate(line);
      if (result !== null) {
        console.log(`[${result}]`);
      }
    } catch (e) {
      console.error('Error:', e.message);
      interpreter.resetStack();   //Clean on error
    }
    rl.prompt();
  }).on('close', () => {
    console.log('\nBye!');
    process.exit(0);
  });
}

module.exports = { PostfixPPInterpreter };


//Now, let's take a look at how it actually works.🎉