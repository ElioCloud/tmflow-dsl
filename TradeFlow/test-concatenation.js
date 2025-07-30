const Parser = require('../src/parser');

console.log('🧪 Testing String Concatenation\n');

// Test string concatenation
const dsl = `let base_url = "https://api.com"
let endpoint = "/users"
let full_url = base_url + endpoint

workflow "TestFlow" {
  step 1: fetch(full_url)
  step 2: summarize(step 1)
}`;

console.log('📝 DSL Input:');
console.log(dsl);
console.log('\n🔄 Parsing...\n');

try {
  const parser = new Parser(dsl);
  const ast = parser.parse();
  
  console.log('✅ Success! Parsed successfully.\n');
  
  console.log('📊 Variables:');
  ast.variables.forEach((variable, index) => {
    console.log(`  ${index + 1}. ${variable.declarationType} ${variable.name}`);
    
    if (variable.value.type === 'BinaryExpression') {
      console.log(`      Expression: ${variable.value.left.value} + ${variable.value.right.value}`);
    } else {
      console.log(`      Value: ${variable.value.value}`);
    }
  });
  
  console.log('\n📋 Workflow:');
  console.log(`  Name: ${ast.workflows[0].name}`);
  console.log(`  Steps: ${ast.workflows[0].steps.length}`);
  
} catch (error) {
  console.log('❌ Error:', error.message);
}