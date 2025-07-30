const Parser = require('../src/parser');
const Executor = require('../src/executor');

console.log('🧪 Testing Print Statements in Conditionals\n');

// Test conditional logic with print statements
const dsl = `workflow "TestFlow" {
  step 1: fetch("https://api.com")
  if (step 1.status == "success") {
    step 2: print("✅ Success! Data fetched successfully")
    step 3: send_email("success@email.com", step 1)
  } else {
    step 4: print("❌ Error: Failed to fetch data")
    step 5: notify("error@email.com", "Failed")
  }
}`;

console.log('📝 DSL Input:');
console.log(dsl);
console.log('\n🔄 Parsing and Executing...\n');

try {
  // Parse the DSL
  const parser = new Parser(dsl);
  const ast = parser.parse();
  
  console.log('✅ Parsed successfully!\n');
  
  // Execute the AST to see print statements
  const executor = new Executor();
  executor.execute(ast);
  
  console.log('\n🎉 Execution completed!');
  
} catch (error) {
  console.log('❌ Error:', error.message);
}