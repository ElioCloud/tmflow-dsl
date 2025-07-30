/**
 * Example usage of TradeMinutes DSL Parser
 * Demonstrates parsing DSL input and generating ReactFlow JSON
 */

const TradeMinutesDSL = require('./index');

// Sample DSL input
const sampleDSL = `workflow "MyFlow" {
  step 1: fetch("https://api.com")
  step 2: summarize(step 1)
  step 3: send_email("user@example.com", step 2)
}`;

// More complex example with comments
const complexDSL = `// This is a data processing workflow
workflow "DataPipeline" {
  /* Multi-line comment
     describing the workflow */
  step 1: fetch("https://data.com/api")
  step 2: filter(step 1, "active")
  step 3: transform(step 2, "format")
  step 4: store(step 3, "database")
}`;

// Example with errors (circular reference)
const errorDSL = `workflow "ErrorFlow" {
  step 1: fetch("https://api.com")
  step 2: summarize(step 3)  // Forward reference
  step 3: send_email("user@example.com", step 2)  // Circular reference
}`;

function runExample() {
  console.log('=== TradeMinutes DSL Parser Example ===\n');

  const dsl = new TradeMinutesDSL();

  // Example 1: Basic workflow
  console.log('1. Basic Workflow:');
  console.log('Input DSL:');
  console.log(sampleDSL);
  console.log('\nParsing...\n');

  const result1 = dsl.parseDSL(sampleDSL);
  
  if (result1.success) {
    console.log('✅ Parsing successful!');
    console.log('\nReactFlow JSON:');
    console.log(JSON.stringify(result1.reactFlowData, null, 2));
    
    console.log('\nValidation:');
    console.log('Errors:', result1.validation.errors);
    console.log('Warnings:', result1.validation.warnings);
  } else {
    console.log('❌ Parsing failed:');
    console.log('Error:', result1.error);
    console.log('Validation errors:', result1.validation.errors);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Example 2: Complex workflow
  console.log('2. Complex Workflow with Comments:');
  console.log('Input DSL:');
  console.log(complexDSL);
  console.log('\nParsing...\n');

  const result2 = dsl.parseDSL(complexDSL);
  
  if (result2.success) {
    console.log('✅ Parsing successful!');
    console.log('\nReactFlow JSON:');
    console.log(JSON.stringify(result2.reactFlowData, null, 2));
  } else {
    console.log('❌ Parsing failed:');
    console.log('Error:', result2.error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Example 3: Error handling
  console.log('3. Error Handling (Circular Reference):');
  console.log('Input DSL:');
  console.log(errorDSL);
  console.log('\nParsing...\n');

  const result3 = dsl.parseDSL(errorDSL);
  
  if (result3.success) {
    console.log('✅ Parsing successful!');
  } else {
    console.log('❌ Parsing failed (expected):');
    console.log('Validation errors:', result3.validation.errors);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Example 4: Convert back to DSL
  console.log('4. Convert ReactFlow JSON back to DSL:');
  if (result1.success) {
    try {
      const backToDSL = dsl.convertToDSL(result1.reactFlowData);
      console.log('Converted back to DSL:');
      console.log(backToDSL);
    } catch (error) {
      console.log('❌ Conversion failed:', error.message);
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Example 5: Supported commands
  console.log('5. Supported Commands:');
  console.log(dsl.getSupportedCommands());

  console.log('\n' + '='.repeat(50) + '\n');

  // Example 6: Syntax examples
  console.log('6. Syntax Examples:');
  const examples = dsl.getSyntaxExamples();
  console.log('Basic:', examples.basic);
  console.log('\nWith Comments:', examples.withComments);
  console.log('\nComplex:', examples.complex);
}

// Run the example if this file is executed directly
if (require.main === module) {
  runExample();
}

module.exports = { runExample }; 