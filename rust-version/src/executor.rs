use anyhow::{anyhow, Result};
use std::collections::HashMap;
use crate::ast::*;

#[derive(Debug, Clone)]
pub struct StepResult {
    pub success: bool,
    pub data: String,
    pub status: u32,
    pub message: String,
}

impl StepResult {
    pub fn new(success: bool, data: String, status: u32, message: String) -> Self {
        StepResult {
            success,
            data,
            status,
            message,
        }
    }
}

pub struct Executor {
    variables: HashMap<String, String>,
    step_results: HashMap<u32, StepResult>,
}

impl Executor {
    pub fn new() -> Self {
        Executor {
            variables: HashMap::new(),
            step_results: HashMap::new(),
        }
    }
    
    pub fn execute(&mut self, program: &Program) -> Result<()> {
        println!("🚀 Executing TradeMinutes DSL Program");
        println!("=====================================");
        
        // Execute variable declarations
        for variable in &program.variables {
            self.execute_variable(variable)?;
        }
        
        // Execute workflows
        for workflow in &program.workflows {
            self.execute_workflow(workflow)?;
        }
        
        Ok(())
    }
    
    fn execute_variable(&mut self, variable: &VariableDeclaration) -> Result<()> {
        let value = self.evaluate_expression(&variable.value)?;
        self.variables.insert(variable.name.clone(), value);
        println!("📦 Variable '{}' = '{}'", variable.name, self.variables[&variable.name]);
        Ok(())
    }
    
    fn execute_workflow(&mut self, workflow: &Workflow) -> Result<()> {
        println!("\n🔄 Executing workflow: {}", workflow.name);
        
        for step in &workflow.steps {
            self.execute_step(step)?;
        }
        
        Ok(())
    }
    
    fn execute_step(&mut self, step: &Step) -> Result<()> {
        println!("  📋 Step {}: ", step.id);
        
        match &step.content {
            StepContent::Command(command) => {
                self.execute_command(step.id, command)?;
            }
            StepContent::Conditional(conditional) => {
                self.execute_conditional(conditional)?;
            }
        }
        
        Ok(())
    }
    
    fn execute_command(&mut self, step_id: u32, command: &Command) -> Result<()> {
        let args: Vec<String> = command.arguments
            .iter()
            .map(|expr| self.evaluate_expression(expr))
            .collect::<Result<Vec<String>>>()?;
        
        match command.name.as_str() {
            "print" => {
                let message = args.join(" ");
                println!("    📤 Print: {}", message);
                self.step_results.insert(step_id, StepResult::new(
                    true, message, 200, "Print executed successfully".to_string()
                ));
            }
            "log" => {
                let message = args.join(" ");
                println!("    📝 Log: {}", message);
                self.step_results.insert(step_id, StepResult::new(
                    true, message, 200, "Log executed successfully".to_string()
                ));
            }
            "fetch" => {
                let default_url = "https://api.example.com".to_string();
                let url = args.get(0).unwrap_or(&default_url);
                println!("    🌐 Fetch: {}", url);
                // Simulate fetch result
                let result = StepResult::new(
                    true,
                    format!("{{\"data\": \"Sample data from {}\"}}", url),
                    200,
                    "Fetch completed successfully".to_string()
                );
                self.step_results.insert(step_id, result);
            }
            "send_email" => {
                let default_to = "user@example.com".to_string();
                let default_subject = "Notification".to_string();
                let to = args.get(0).unwrap_or(&default_to);
                let subject = args.get(1).unwrap_or(&default_subject);
                println!("    📧 Send Email: {} - {}", to, subject);
                self.step_results.insert(step_id, StepResult::new(
                    true, format!("Email sent to {}", to), 200, "Email sent successfully".to_string()
                ));
            }
            "notify" => {
                let message = args.join(" ");
                println!("    🔔 Notify: {}", message);
                self.step_results.insert(step_id, StepResult::new(
                    true, message, 200, "Notification sent successfully".to_string()
                ));
            }
            _ => {
                println!("    ⚠️  Unknown command: {}", command.name);
                self.step_results.insert(step_id, StepResult::new(
                    false, "".to_string(), 400, format!("Unknown command: {}", command.name)
                ));
            }
        }
        
        Ok(())
    }
    
    fn execute_conditional(&mut self, conditional: &ConditionalStatement) -> Result<()> {
        let condition_result = self.evaluate_condition(&conditional.condition)?;
        
        if condition_result {
            println!("    ✅ Condition is true, executing if block");
            for step in &conditional.if_steps {
                self.execute_step(step)?;
            }
        } else {
            println!("    ❌ Condition is false");
            if let Some(else_steps) = &conditional.else_steps {
                println!("    🔄 Executing else block");
                for step in else_steps {
                    self.execute_step(step)?;
                }
            }
        }
        
        Ok(())
    }
    
    fn evaluate_condition(&self, condition: &Expression) -> Result<bool> {
        match condition {
            Expression::BinaryExpression { left, operator, right } => {
                let left_val = self.evaluate_expression(left)?;
                let right_val = self.evaluate_expression(right)?;
                
                match operator.as_str() {
                    "==" => Ok(left_val == right_val),
                    "!=" => Ok(left_val != right_val),
                    ">" => {
                        let left_num: f64 = left_val.parse().unwrap_or(0.0);
                        let right_num: f64 = right_val.parse().unwrap_or(0.0);
                        Ok(left_num > right_num)
                    }
                    "<" => {
                        let left_num: f64 = left_val.parse().unwrap_or(0.0);
                        let right_num: f64 = right_val.parse().unwrap_or(0.0);
                        Ok(left_num < right_num)
                    }
                    ">=" => {
                        let left_num: f64 = left_val.parse().unwrap_or(0.0);
                        let right_num: f64 = right_val.parse().unwrap_or(0.0);
                        Ok(left_num >= right_num)
                    }
                    "<=" => {
                        let left_num: f64 = left_val.parse().unwrap_or(0.0);
                        let right_num: f64 = right_val.parse().unwrap_or(0.0);
                        Ok(left_num <= right_num)
                    }
                    _ => Err(anyhow!("Unknown comparison operator: {}", operator)),
                }
            }
            _ => {
                let value = self.evaluate_expression(condition)?;
                Ok(!value.is_empty() && value != "0" && value != "false")
            }
        }
    }
    
    fn evaluate_expression(&self, expression: &Expression) -> Result<String> {
        match expression {
            Expression::StringLiteral(value) => Ok(value.clone()),
            Expression::NumberLiteral(value) => Ok(value.to_string()),
            Expression::Identifier(name) => {
                self.variables.get(name)
                    .cloned()
                    .ok_or_else(|| anyhow!("Undefined variable: {}", name))
            }
            Expression::BinaryExpression { left, operator, right } => {
                let left_val = self.evaluate_expression(left)?;
                let right_val = self.evaluate_expression(right)?;
                
                match operator.as_str() {
                    "+" => Ok(format!("{}{}", left_val, right_val)),
                    _ => Err(anyhow!("Unknown binary operator: {}", operator)),
                }
            }
            Expression::PropertyAccess { object, property } => {
                let object_val = self.evaluate_expression(object)?;
                // For now, just return the property name as a simple simulation
                Ok(format!("{}.{}", object_val, property))
            }
            Expression::StepReference { step_id, property } => {
                if let Some(result) = self.step_results.get(step_id) {
                    match property.as_deref() {
                        Some("status") => Ok(result.status.to_string()),
                        Some("data") => Ok(result.data.clone()),
                        Some("message") => Ok(result.message.clone()),
                        Some("success") => Ok(result.success.to_string()),
                        _ => Ok(result.data.clone()),
                    }
                } else {
                    Err(anyhow!("Step {} not found", step_id))
                }
            }
        }
    }
} 