/**
 * TradeMinutes DSL Parser - Main Module
 * Orchestrates the complete parsing pipeline from DSL to ReactFlow JSON
 */

const Parser = require('./parser');
const Validator = require('./validator');
const Generator = require('./generator');
const DSLConverter = require('./dsl-converter');

class TradeMinutesDSL {
  constructor() {
    this.parser = null;
    this.validator = new Validator();
    this.generator = new Generator();
    this.converter = new DSLConverter();
  }

  /**
   * Parse DSL input and convert to ReactFlow JSON
   * @param {string} dslInput - The DSL input string
   * @returns {Object} Object containing ReactFlow JSON and validation results
   */
  parseDSL(dslInput) {
    try {
      // Step 1: Parse DSL to AST
      this.parser = new Parser(dslInput);
      const ast = this.parser.parse();

      // Step 2: Validate AST
      const validation = this.validator.validate(ast);

      // Step 3: Generate ReactFlow JSON
      let reactFlowData = null;
      if (validation.isValid) {
        reactFlowData = this.generator.generate(ast);
      }

      return {
        success: validation.isValid,
        reactFlowData,
        validation,
        ast
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        reactFlowData: null,
        validation: {
          isValid: false,
          errors: [error.message],
          warnings: []
        },
        ast: null
      };
    }
  }

  /**
   * Convert ReactFlow JSON back to DSL
   * @param {Object} reactFlowData - ReactFlow JSON with nodes and edges
   * @returns {string} DSL string
   */
  convertToDSL(reactFlowData) {
    try {
      return this.converter.convertToDSL(reactFlowData);
    } catch (error) {
      throw new Error(`Failed to convert to DSL: ${error.message}`);
    }
  }

  /**
   * Get supported commands
   * @returns {Array} Array of supported command names
   */
  getSupportedCommands() {
    return [
      'fetch', 'summarize', 'send_email', 'analyze', 
      'filter', 'transform', 'store', 'notify'
    ];
  }

  /**
   * Get DSL syntax examples
   * @returns {Object} Object containing syntax examples
   */
  getSyntaxExamples() {
    return {
      basic: `workflow "MyFlow" {
  step 1: fetch("https://api.com")
  step 2: summarize(step 1)
  step 3: send_email("user@example.com", step 2)
}`,
      withComments: `// This is a comment
workflow "DataPipeline" {
  /* Multi-line comment
     describing the workflow */
  step 1: fetch("https://data.com/api")
  step 2: filter(step 1, "active")
  step 3: transform(step 2, "format")
  step 4: store(step 3, "database")
}`,
      complex: `workflow "AnalyticsPipeline" {
  step 1: fetch("https://api.analytics.com/data")
  step 2: analyze(step 1, "trends")
  step 3: filter(step 2, "significant")
  step 4: summarize(step 3)
  step 5: notify("admin@company.com", step 4)
  step 6: store(step 5, "reports")
}`
    };
  }
}

module.exports = TradeMinutesDSL; 