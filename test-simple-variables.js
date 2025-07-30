const Parser = require('./src/parser');

console.log('=== Testing Simple Variable Declarations ===\n');

// Test 1: Basic variable declarations without concatenation
const testWithVariables = `let email = "user@example.com"
let api_key = "abc123"
let retry_count = 3

workflow "MyFlow" {
  step 1: fetch("https://api.com")
  step 2: send_email(email, step 1)
  step 3: notify("Process completed")
}`;

console.log('1. Basic variable declarations:');
console.log(testWithVariables);
console.log('\nParsing...\n');

try {
  const parser1 = new Parser(testWithVariables);
  const ast1 = parser1.parse();
  
  console.log('✅ Parsed successfully!');
  console.log('AST:');
  console.log(JSON.stringify(ast1, null, 2));
  
  // Show variables
  console.log('\n📊 Variables found:');
  ast1.variables.forEach((variable, index) => {
    console.log(`  ${index + 1}. ${variable.declarationType} ${variable.name} = ${JSON.stringify(variable.value.value)}`);
  });
  
  // Show workflow
  console.log('\n📋 Workflow:');
  const workflow = ast1.workflows[0];
  console.log(`  Name: ${workflow.name}`);
  console.log(`  Steps: ${workflow.steps.length}`);
  
  // Show how variables are used in steps
  workflow.steps.forEach((step, index) => {
    console.log(`\n  Step ${step.number}: ${step.command.name}`);
    step.command.arguments.forEach((arg, argIndex) => {
      if (arg.type === 'Identifier') {
        console.log(`    Argument ${argIndex + 1}: Variable "${arg.value}"`);
      } else if (arg.type === 'StringLiteral') {
        console.log(`    Argument ${argIndex + 1}: String "${arg.value}"`);
      } else if (arg.type === 'StepReference') {
        console.log(`    Argument ${argIndex + 1}: Step reference ${arg.stepNumber}`);
      }
    });
  });
  
} catch (error) {
  console.log('❌ Error:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test 2: Different variable types
const testDifferentTypes = `let string_var = "hello"
let number_var = 42
let identifier_var = trademinutes

workflow "TypeTest" {
  step 1: fetch("https://api.com")
  step 2: send_email(string_var, step 1)
  step 3: notify("Test completed")
}`;

console.log('2. Different variable types:');
console.log(testDifferentTypes);
console.log('\nParsing...\n');

try {
  const parser2 = new Parser(testDifferentTypes);
  const ast2 = parser2.parse();
  
  console.log('✅ Parsed successfully!');
  
  console.log('\n📊 Variables by type:');
  ast2.variables.forEach((variable, index) => {
    console.log(`  ${index + 1}. ${variable.name} (${variable.value.type}) = ${JSON.stringify(variable.value.value)}`);
  });
  
} catch (error) {
  console.log('❌ Error:', error.message);
} 