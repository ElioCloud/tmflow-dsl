# TradeFlow JavaScript Version

This directory contains the JavaScript implementation of the TradeFlow DSL (Domain Specific Language) for trading automation.

## Files

### Core Implementation
- `lexer.js` - Lexical analyzer for parsing tokens
- `parser.js` - Parser for building AST (Abstract Syntax Tree)
- `executor.js` - Execution engine for running trading logic
- `validator.js` - Validation logic for trading rules
- `generator.js` - Code generation utilities
- `dsl-converter.js` - DSL to JavaScript converter
- `index.js` - Main entry point

### Examples and Tests
- `example.js` - Example usage of the DSL
- `parser.test.js` - Parser unit tests
- `test-variables.js` - Variable handling tests
- `test-variable.js` - Additional variable tests
- `test-conditionallogic.js` - Conditional logic tests
- `test-concatenation.js` - String concatenation tests

## Usage

```bash
npm install
node index.js
```

## Features

- Custom DSL for trading automation
- Lexical analysis and parsing
- AST-based execution
- Validation and error handling
- Test suite for core functionality 