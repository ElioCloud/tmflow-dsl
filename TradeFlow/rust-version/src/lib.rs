pub mod ast;
pub mod lexer;
pub mod parser;
pub mod executor;

pub use ast::*;
pub use lexer::*;
pub use parser::*;
pub use executor::*;

use anyhow::Result;

/// Parse and execute a DSL program
pub fn run_dsl(dsl_code: &str) -> Result<()> {
    // Tokenize
    let tokens = lexer::Lexer::new(dsl_code).tokenize()?;
    
    // Parse
    let ast = parser::Parser::new(tokens).parse()?;
    
    // Execute
    let mut executor = executor::Executor::new();
    executor.execute(&ast)?;
    
    Ok(())
}

/// Parse DSL code into AST without execution
pub fn parse_dsl(dsl_code: &str) -> Result<Program> {
    let tokens = lexer::Lexer::new(dsl_code).tokenize()?;
    let ast = parser::Parser::new(tokens).parse()?;
    Ok(ast)
}

/// Tokenize DSL code
pub fn tokenize_dsl(dsl_code: &str) -> Result<Vec<Token>> {
    lexer::Lexer::new(dsl_code).tokenize()
} 