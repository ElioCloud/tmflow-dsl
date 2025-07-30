const Parser = require('../src/parser');

// Put your workflow here
const myWorkflow = `
let email = "user@example.com"
workflow "MyTest" {
  step 1: fetch("https://api.com")
  step 2: send_email(email, step 1)
}
`;

try {
  const parser = new Parser(myWorkflow);
  const result = parser.parse();
  console.log("✅ It worked!", result);
} catch (error) {
  console.log("❌ Error:", error.message);
}