const Parser = require('./src/parser');

console.log('=== Testing Variable Declarations ===\n');

// Test 1: Basic variable declarations
const test1 = `let email = "user@example.com"
let api_key = "abc123"
let retry_count = 3

workflow "MyFlow" {
  step 1: fetch("https://api.com")
  step 2: send_email(email, step 1)
  step 3: notify("Process completed")
}`;

console.log('1. Basic variable declarations:');
console.log(test1);
console.log('\nParsing...\n');

try {
  const parser1 = new Parser(test1);
  const ast1 = parser1.parse();
  
  console.log('✅ Parsed successfully!');
  console.log('Variables found:', ast1.variables.length);
  ast1.variables.forEach((variable, index) => {
    console.log(`  ${index + 1}. ${variable.declarationType} ${variable.name} = ${JSON.stringify(variable.value.value)}`);
  });
  
  console.log('\nWorkflow:', ast1.workflows[0].name);
  console.log('Steps:', ast1.workflows[0].steps.length);
  
} catch (error) {
  console.log('❌ Error:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test 2: Different variable types
const test2 = `let string_var = "hello"
let number_var = 42
let identifier_var = trademinutes

workflow "TypeTest" {
  step 1: fetch("https://api.com")
  step 2: send_email(string_var, step 1)
  step 3: notify("Test completed")
}`;

console.log('2. Different variable types:');
console.log(test2);
console.log('\nParsing...\n');

try {
  const parser2 = new Parser(test2);
  const ast2 = parser2.parse();
  
  console.log('✅ Parsed successfully!');
  console.log('Variables by type:');
  ast2.variables.forEach((variable, index) => {
    console.log(`  ${index + 1}. ${variable.name} (${variable.value.type}) = ${JSON.stringify(variable.value.value)}`);
  });
  
} catch (error) {
  console.log('❌ Error:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test 3: No variables (original functionality)
const test3 = `workflow "SimpleFlow" {
  step 1: fetch("https://api.com")
  step 2: summarize(step 1)
}`;

console.log('3. No variables (original functionality):');
console.log(test3);
console.log('\nParsing...\n');

try {
  const parser3 = new Parser(test3);
  const ast3 = parser3.parse();
  
  console.log('✅ Parsed successfully!');
  console.log('Variables:', ast3.variables.length);
  console.log('Workflows:', ast3.workflows.length);
  
} catch (error) {
  console.log('❌ Error:', error.message);
} 