mod lexer;
mod parser;
mod executor;
mod ast;
mod test_examples;

use anyhow::Result;

fn main() -> Result<()> {
    println!("🚀 TradeMinutes DSL Parser (Rust Version)");
    println!("===========================================");
    
    // Example DSL code with AI commands
    let dsl_code = r#"
workflow "AI Content Generator" {
    let topic = "artificial intelligence"
    let model = "mistral-small-latest"
    
    step 1: input("topic", "text", "Enter a topic to write about")
    step 2: validate(step 1, "required")
    step 3: generate("Write about " + topic, model, "0.7")
    step 4: output(step 3, "pdf", "Generated Article")
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
    println!("\n🔧 Starting parsing...");
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