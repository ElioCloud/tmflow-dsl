pub mod ast;
pub mod lexer;
pub mod parser;
pub mod executor;

pub use ast::*;
pub use lexer::*;
pub use parser::*;
pub use executor::*;

use anyhow::Result;

#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*;

#[cfg(feature = "wasm")]
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[cfg(feature = "wasm")]
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub struct WasmDSLExecutor {
    executor: executor::Executor,
}

#[cfg(feature = "wasm")]
#[wasm_bindgen]
impl WasmDSLExecutor {
    #[wasm_bindgen(constructor)]
    pub fn new() -> WasmDSLExecutor {
        WasmDSLExecutor {
            executor: executor::Executor::new(),
        }
    }
    
    #[wasm_bindgen]
    pub fn parse_and_execute(&mut self, dsl_code: &str) -> Result<String, JsValue> {
        console_log!("🦀 Executing DSL code: {}", dsl_code);
        
        let result = run_dsl(dsl_code);
        match result {
            Ok(_) => Ok("Execution completed successfully".to_string()),
            Err(e) => Err(JsValue::from_str(&e.to_string())),
        }
    }
    
    #[wasm_bindgen]
    pub fn parse_to_json(&self, dsl_code: &str) -> Result<String, JsValue> {
        console_log!("🦀 Parsing DSL to JSON: {}", dsl_code);
        
        let ast = parse_dsl(dsl_code).map_err(|e| JsValue::from_str(&e.to_string()))?;
        let json = serde_json::to_string(&ast).map_err(|e| JsValue::from_str(&e.to_string()))?;
        Ok(json)
    }
    
    #[wasm_bindgen]
    pub fn validate_dsl(&self, dsl_code: &str) -> Result<bool, JsValue> {
        console_log!("🦀 Validating DSL: {}", dsl_code);
        
        match parse_dsl(dsl_code) {
            Ok(_) => Ok(true),
            Err(_) => Ok(false),
        }
    }
    
    #[wasm_bindgen]
    pub fn get_supported_commands(&self) -> Vec<String> {
        vec![
            "fetch".to_string(),
            "summarize".to_string(), 
            "send_email".to_string(),
            "analyze".to_string(),
            "filter".to_string(),
            "transform".to_string(),
            "store".to_string(),
            "notify".to_string(),
            "print".to_string(),
            "log".to_string(),
            // AI-specific commands
            "input".to_string(),
            "generate".to_string(),
            "output".to_string(),
            "validate".to_string(),
        ]
    }
    
    #[wasm_bindgen]
    pub fn generate_human_steps(&self, dsl_code: &str) -> Result<String, JsValue> {
        console_log!("🦀 Generating human steps for: {}", dsl_code);
        
        let ast = parse_dsl(dsl_code).map_err(|e| JsValue::from_str(&e.to_string()))?;
        let mut steps = Vec::new();
        
        for workflow in &ast.workflows {
            for step in &workflow.steps {
                match &step.content {
                    StepContent::Command(command) => {
                        let human_desc = match command.name.as_str() {
                            "input" => format!("Step {}: Collect user input", step.id),
                            "generate" => format!("Step {}: Generate AI content", step.id),
                            "output" => format!("Step {}: Export results", step.id),
                            "fetch" => format!("Step {}: Fetch data from URL", step.id),
                            "transform" => format!("Step {}: Transform data", step.id),
                            "validate" => format!("Step {}: Validate input", step.id),
                            _ => format!("Step {}: Execute {}", step.id, command.name),
                        };
                        steps.push(human_desc);
                    }
                    StepContent::Conditional(_) => {
                        steps.push(format!("Step {}: Conditional logic", step.id));
                    }
                }
            }
        }
        
        Ok(steps.join("\n"))
    }
}

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