mod lexer;
mod parser;
mod executor;
mod ast;
mod test_examples;

use anyhow::Result;

fn main() -> Result<()> {
    println!("🚀 TradeMinutes DSL Parser (Rust Version)");
    println!("===========================================");
    
    // Example DSL code
    let dsl_code = r#"
workflow "TestFlow" {
    let base_url = "https://api.com"
    let endpoint = "/users"
    
    step 1: fetch(base_url + endpoint)
    
    if (step 1.status == 200) {
        step 2: print("Success: " + step 1.data)
    } else {
        step 3: print("Error: " + step 1.status)
    }
}
"#;

    println!("\n📝 Parsing DSL code:");
    println!("{}", dsl_code);
    
    // Tokenize
    let tokens = lexer::Lexer::new(dsl_code).tokenize()?;
    println!("\n🔤 Tokens:");
    for token in &tokens {
        println!("  {:?}", token);
    }
    
    // Parse
    let ast = parser::Parser::new(tokens).parse()?;
    println!("\n🌳 AST:");
    println!("{:#?}", ast);
    
    // Execute
    let mut executor = executor::Executor::new();
    executor.execute(&ast)?;
    
    println!("\n✅ Execution completed!");
    
    // Run additional examples
    test_examples::run_examples();
    test_examples::test_tokenization();
    test_examples::test_parsing();
    
    Ok(())
} 