use crate::lexer::Lexer;
use crate::parser::Parser;
use crate::executor::Executor;
use anyhow::Result;

pub fn run_examples() {
    println!("🧪 Running TradeMinutes DSL Examples");
    println!("=====================================");
    
    // Example 1: Basic workflow
    let example1 = r#"
workflow "BasicExample" {
    step 1: print("Hello from Rust DSL!")
    step 2: fetch("https://api.example.com")
}
"#;
    
    println!("\n📝 Example 1: Basic Workflow");
    println!("{}", example1);
    
    match run_dsl_example(example1) {
        Ok(_) => println!("✅ Example 1 executed successfully"),
        Err(e) => println!("❌ Example 1 failed: {}", e),
    }
    
    // Example 2: Variables and concatenation
    let example2 = r#"
workflow "VariableExample" {
    let base_url = "https://api.com"
    let endpoint = "/users"
    
    step 1: fetch(base_url + endpoint)
    step 2: print("Fetched data from: " + base_url + endpoint)
}
"#;
    
    println!("\n📝 Example 2: Variables and Concatenation");
    println!("{}", example2);
    
    match run_dsl_example(example2) {
        Ok(_) => println!("✅ Example 2 executed successfully"),
        Err(e) => println!("❌ Example 2 failed: {}", e),
    }
    
    // Example 3: Conditional logic
    let example3 = r#"
workflow "ConditionalExample" {
    step 1: fetch("https://api.com/status")
    
    if (step 1.status == 200) {
        step 2: print("Success! Status: " + step 1.status)
    } else {
        step 3: print("Error! Status: " + step 1.status)
    }
}
"#;
    
    println!("\n📝 Example 3: Conditional Logic");
    println!("{}", example3);
    
    match run_dsl_example(example3) {
        Ok(_) => println!("✅ Example 3 executed successfully"),
        Err(e) => println!("❌ Example 3 failed: {}", e),
    }
    
    // Example 4: Complex workflow
    let example4 = r#"
workflow "ComplexExample" {
    let api_key = "your_secret_key"
    let base_url = "https://trading-api.com"
    
    step 1: fetch(base_url + "/market-data")
    
    if (step 1.status == 200) {
        step 2: print("Market data received successfully")
        
        if (step 1.data.price > 100) {
            step 3: send_email("trader@company.com", "High price alert!")
            step 4: notify("Price is above threshold")
        } else {
            step 5: print("Price is normal: " + step 1.data.price)
        }
    } else {
        step 6: notify("Failed to fetch market data")
        step 7: send_email("admin@company.com", "API failure")
    }
}
"#;
    
    println!("\n📝 Example 4: Complex Trading Workflow");
    println!("{}", example4);
    
    match run_dsl_example(example4) {
        Ok(_) => println!("✅ Example 4 executed successfully"),
        Err(e) => println!("❌ Example 4 failed: {}", e),
    }
}

pub fn test_tokenization() {
    println!("\n🔤 Testing Tokenization");
    println!("=======================");
    
    let dsl_code = r#"
workflow "Test" {
    let x = "hello"
    step 1: print(x + " world")
}
"#;
    
    match tokenize_dsl_example(dsl_code) {
        Ok(tokens) => {
            println!("✅ Tokenization successful");
            for (i, token) in tokens.iter().enumerate() {
                println!("  {}: {:?} ('{}')", i, token.token_type, token.lexeme);
            }
        }
        Err(e) => println!("❌ Tokenization failed: {}", e),
    }
}

pub fn test_parsing() {
    println!("\n🌳 Testing Parsing");
    println!("==================");
    
    let dsl_code = r#"
workflow "ParseTest" {
    let message = "Hello, Rust!"
    step 1: print(message)
}
"#;
    
    match parse_dsl_example(dsl_code) {
        Ok(ast) => {
            println!("✅ Parsing successful");
            println!("Program has {} workflows and {} variables", 
                    ast.workflows.len(), ast.variables.len());
            
            for workflow in &ast.workflows {
                println!("  Workflow: '{}' with {} steps", 
                        workflow.name, workflow.steps.len());
            }
            
            for variable in &ast.variables {
                println!("  Variable: {} {} = {:?}", 
                        variable.keyword, variable.name, variable.value);
            }
        }
        Err(e) => println!("❌ Parsing failed: {}", e),
    }
}

// Helper functions
fn run_dsl_example(dsl_code: &str) -> Result<()> {
    let tokens = Lexer::new(dsl_code).tokenize()?;
    let ast = Parser::new(tokens).parse()?;
    let mut executor = Executor::new();
    executor.execute(&ast)?;
    Ok(())
}

fn parse_dsl_example(dsl_code: &str) -> Result<crate::ast::Program> {
    let tokens = Lexer::new(dsl_code).tokenize()?;
    let ast = Parser::new(tokens).parse()?;
    Ok(ast)
}

fn tokenize_dsl_example(dsl_code: &str) -> Result<Vec<crate::lexer::Token>> {
    Lexer::new(dsl_code).tokenize()
} 