const Parser = require('./src/parser');

console.log('=== Testing Variable Declarations ===\n');

// Test 1: Basic variable declarations
const testWithVariables = `let email = "user@example.com"
let api_key = "abc123"
let retry_count = 3

workflow "MyFlow" {
  step 1: fetch("https://api.com")
  step 2: send_email(email, step 1)
  step 3: notify("Processed with key: " + api_key)
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
  step 3: notify("Count: " + number_var)
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

console.log('\n' + '='.repeat(50) + '\n');

// Test 3: Variable declarations inside workflow
const testInsideWorkflow = `workflow "InsideWorkflow" {
  let email = "admin@example.com"
  let api_url = "https://api.com"
  
  step 1: fetch(api_url)
  step 2: send_email(email, step 1)
}`;

console.log('3. Variables inside workflow (should fail - not supported yet):');
console.log(testInsideWorkflow);
console.log('\nParsing...\n');

try {
  const parser3 = new Parser(testInsideWorkflow);
  const ast3 = parser3.parse();
  
  console.log('✅ Parsed successfully!');
  console.log('Note: Variables inside workflows are not yet supported');
  
} catch (error) {
  console.log('❌ Error:', error.message);
} 