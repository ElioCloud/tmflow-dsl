/**
 * Lexer for TradeMinutes DSL
 * Tokenizes the input string into meaningful tokens for parsing
 */

class Lexer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.tokens = [];
  }

  // Token types
  static TOKEN_TYPES = {
    KEYWORD: 'KEYWORD',
    IDENTIFIER: 'IDENTIFIER',
    STRING: 'STRING',
    NUMBER: 'NUMBER',
    COLON: 'COLON',
    COMMA: 'COMMA',
    LPAREN: 'LPAREN',
    RPAREN: 'RPAREN',
    LBRACE: 'LBRACE',
    RBRACE: 'RBRACE',
    EQUALS: 'EQUALS',
    WHITESPACE: 'WHITESPACE',
    COMMENT: 'COMMENT',
    EOF: 'EOF'
  };

  // Keywords in the DSL
  static KEYWORDS = [
    'workflow', 'step', 'fetch', 'summarize', 'send_email',
    'analyze', 'filter', 'transform', 'store', 'notify'
  ];

  /**
   * Tokenize the input string
   * @returns {Array} Array of tokens
   */
  tokenize() {
    this.tokens = [];
    this.position = 0;

    while (this.position < this.input.length) {
      const char = this.input[this.position];
      
      if (this.isWhitespace(char)) {
        this.skipWhitespace();
      } else if (char === '/') {
        this.handleComment();
      } else if (char === '"' || char === "'") {
        this.tokens.push(this.readString());
      } else if (this.isDigit(char)) {
        this.tokens.push(this.readNumber());
      } else if (this.isLetter(char)) {
        this.tokens.push(this.readIdentifier());
      } else if (char === ':') {
        this.tokens.push({ type: Lexer.TOKEN_TYPES.COLON, value: ':', position: this.position++ });
      } else if (char === ',') {
        this.tokens.push({ type: Lexer.TOKEN_TYPES.COMMA, value: ',', position: this.position++ });
      } else if (char === '(') {
        this.tokens.push({ type: Lexer.TOKEN_TYPES.LPAREN, value: '(', position: this.position++ });
      } else if (char === ')') {
        this.tokens.push({ type: Lexer.TOKEN_TYPES.RPAREN, value: ')', position: this.position++ });
      } else if (char === '{') {
        this.tokens.push({ type: Lexer.TOKEN_TYPES.LBRACE, value: '{', position: this.position++ });
      } else if (char === '}') {
        this.tokens.push({ type: Lexer.TOKEN_TYPES.RBRACE, value: '}', position: this.position++ });
      } else if (char === '=') {
        this.tokens.push({ type: Lexer.TOKEN_TYPES.EQUALS, value: '=', position: this.position++ });
      } else {
        throw new Error(`Unexpected character: ${char} at position ${this.position}`);
      }
    }

    this.tokens.push({ type: Lexer.TOKEN_TYPES.EOF, value: null, position: this.position });
    return this.tokens.filter(token => token.type !== Lexer.TOKEN_TYPES.WHITESPACE);
  }

  /**
   * Check if character is whitespace
   */
  isWhitespace(char) {
    return /\s/.test(char);
  }

  /**
   * Skip whitespace characters
   */
  skipWhitespace() {
    while (this.position < this.input.length && this.isWhitespace(this.input[this.position])) {
      this.position++;
    }
  }

  /**
   * Handle single-line and multi-line comments
   */
  handleComment() {
    const startPos = this.position;
    
    if (this.input[this.position + 1] === '/') {
      // Single-line comment
      while (this.position < this.input.length && this.input[this.position] !== '\n') {
        this.position++;
      }
    } else if (this.input[this.position + 1] === '*') {
      // Multi-line comment
      this.position += 2;
      while (this.position < this.input.length - 1) {
        if (this.input[this.position] === '*' && this.input[this.position + 1] === '/') {
          this.position += 2;
          break;
        }
        this.position++;
      }
    } else {
      throw new Error(`Invalid comment syntax at position ${startPos}`);
    }
  }

  /**
   * Check if character is a digit
   */
  isDigit(char) {
    return /[0-9]/.test(char);
  }

  /**
   * Check if character is a letter
   */
  isLetter(char) {
    return /[a-zA-Z_]/.test(char);
  }

  /**
   * Read a string literal
   */
  readString() {
    const quote = this.input[this.position];
    const startPos = this.position;
    this.position++; // Skip opening quote
    
    let value = '';
    while (this.position < this.input.length && this.input[this.position] !== quote) {
      if (this.input[this.position] === '\\') {
        this.position++;
        if (this.position < this.input.length) {
          value += this.input[this.position];
        }
      } else {
        value += this.input[this.position];
      }
      this.position++;
    }
    
    if (this.position >= this.input.length) {
      throw new Error(`Unterminated string at position ${startPos}`);
    }
    
    this.position++; // Skip closing quote
    return { type: Lexer.TOKEN_TYPES.STRING, value, position: startPos };
  }

  /**
   * Read a number literal
   */
  readNumber() {
    const startPos = this.position;
    let value = '';
    
    while (this.position < this.input.length && this.isDigit(this.input[this.position])) {
      value += this.input[this.position];
      this.position++;
    }
    
    return { type: Lexer.TOKEN_TYPES.NUMBER, value: parseInt(value), position: startPos };
  }

  /**
   * Read an identifier or keyword
   */
  readIdentifier() {
    const startPos = this.position;
    let value = '';
    
    while (this.position < this.input.length && 
           (this.isLetter(this.input[this.position]) || this.isDigit(this.input[this.position]))) {
      value += this.input[this.position];
      this.position++;
    }
    
    const type = Lexer.KEYWORDS.includes(value) ? Lexer.TOKEN_TYPES.KEYWORD : Lexer.TOKEN_TYPES.IDENTIFIER;
    return { type, value, position: startPos };
  }
}

module.exports = Lexer; 