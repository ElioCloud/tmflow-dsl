/**
 * Parser for TradeMinutes DSL
 * Converts tokens into an Abstract Syntax Tree (AST)
 */

const Lexer = require('./lexer');

class Parser {
  constructor(input) {
    this.lexer = new Lexer(input);
    this.tokens = [];
    this.current = 0;
  }

  /**
   * Parse the input and return AST
   * @returns {Object} Abstract Syntax Tree
   */
  parse() {
    this.tokens = this.lexer.tokenize();
    this.current = 0;
    
    const ast = {
      type: 'Program',
      workflows: []
    };

    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'workflow')) {
        ast.workflows.push(this.parseWorkflow());
      } else {
        this.advance(); // Skip unknown tokens
      }
    }

    return ast;
  }

  /**
   * Parse a workflow definition
   */
  parseWorkflow() {
    this.consume('KEYWORD', 'workflow', 'Expected "workflow" keyword');
    
    const name = this.consume('STRING', null, 'Expected workflow name');
    this.consume('LBRACE', null, 'Expected "{" after workflow name');
    
    const steps = [];
    while (!this.check('RBRACE') && !this.isAtEnd()) {
      steps.push(this.parseStep());
    }
    
    this.consume('RBRACE', null, 'Expected "}" to close workflow');
    
    return {
      type: 'Workflow',
      name: name.value,
      steps
    };
  }

  /**
   * Parse a step definition
   */
  parseStep() {
    this.consume('KEYWORD', 'step', 'Expected "step" keyword');
    
    const stepNumber = this.consume('NUMBER', null, 'Expected step number');
    this.consume('COLON', null, 'Expected ":" after step number');
    
    const command = this.parseCommand();
    
    return {
      type: 'Step',
      number: stepNumber.value,
      command
    };
  }

  /**
   * Parse a command with its arguments
   */
  parseCommand() {
    const commandName = this.consume('KEYWORD', null, 'Expected command name');
    this.consume('LPAREN', null, 'Expected "(" after command name');
    
    const args = [];
    
    // Parse arguments
    while (true) {
      const currentToken = this.peek();
      
      // If we're at the closing parenthesis, we're done
      if (currentToken.type === 'RPAREN') {
        break;
      }
      
      // If we're at the end, that's an error
      if (currentToken.type === 'EOF') {
        throw new Error(`Unexpected end of input at position ${currentToken.position}`);
      }
      
      // Parse the argument
      args.push(this.parseArgument());
      
      // Check if we're done or need a comma
      const nextToken = this.peek();
      if (nextToken.type === 'RPAREN') {
        break;
      } else if (nextToken.type === 'COMMA') {
        this.advance(); // consume the comma
      } else {
        throw new Error(`Expected "," or ")" at position ${nextToken.position}`);
      }
    }
    
    // Consume the closing parenthesis
    this.consume('RPAREN', null, 'Expected ")" to close command arguments');
    
    return {
      type: 'Command',
      name: commandName.value,
      arguments: args
    };
  }

  /**
   * Parse a command argument
   */
  parseArgument() {
    if (this.match('STRING', null)) {
      return {
        type: 'StringLiteral',
        value: this.previous().value
      };
    } else if (this.match('NUMBER', null)) {
      return {
        type: 'NumberLiteral',
        value: this.previous().value
      };
    } else if (this.match('KEYWORD', 'step')) {
      // Reference to another step
      const stepRef = this.consume('NUMBER', null, 'Expected step number after "step"');
      return {
        type: 'StepReference',
        stepNumber: stepRef.value
      };
    } else if (this.match('IDENTIFIER', null)) {
      return {
        type: 'Identifier',
        value: this.previous().value
      };
    } else {
      throw new Error(`Unexpected token at position ${this.peek().position}`);
    }
  }

  /**
   * Check if current token matches expected type and value
   */
  match(type, value) {
    if (this.check(type, value)) {
      this.advance();
      return true;
    }
    return false;
  }

  /**
   * Check if current token is of expected type and value
   */
  check(type, value) {
    if (this.isAtEnd()) return false;
    const token = this.peek();
    return token.type === type && (value === null || value === undefined || token.value === value);
  }

  /**
   * Consume a token of expected type and value
   */
  consume(type, value, message) {
    if (this.check(type, value)) {
      return this.advance();
    }
    throw new Error(`${message} at position ${this.peek().position}`);
  }

  /**
   * Advance to next token
   */
  advance() {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.previous();
  }

  /**
   * Check if we've reached the end of tokens
   */
  isAtEnd() {
    return this.peek().type === 'EOF';
  }

  /**
   * Get current token without advancing
   */
  peek() {
    return this.tokens[this.current];
  }

  /**
   * Get previous token
   */
  previous() {
    return this.tokens[this.current - 1];
  }
}

module.exports = Parser; 