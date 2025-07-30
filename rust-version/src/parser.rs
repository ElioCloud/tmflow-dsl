use anyhow::{anyhow, Result};
use crate::ast::*;
use crate::lexer::{Token, TokenType};

pub struct Parser {
    tokens: Vec<Token>,
    current: usize,
}

impl Parser {
    pub fn new(tokens: Vec<Token>) -> Self {
        Parser { tokens, current: 0 }
    }
    
    pub fn parse(&mut self) -> Result<Program> {
        let mut workflows = Vec::new();
        let mut variables = Vec::new();
        
        while !self.is_at_end() {
            match self.peek().token_type {
                TokenType::Workflow => {
                    workflows.push(self.parse_workflow()?);
                }
                TokenType::Let | TokenType::Var | TokenType::Const => {
                    variables.push(self.parse_variable_declaration()?);
                }
                _ => {
                    return Err(anyhow!("Expected workflow or variable declaration"));
                }
            }
        }
        
        Ok(Program { workflows, variables })
    }
    
    fn parse_workflow(&mut self) -> Result<Workflow> {
        self.consume(TokenType::Workflow, "Expected 'workflow'")?;
        
        let name = self.consume_string("Expected workflow name")?;
        
        self.consume(TokenType::LeftBrace, "Expected '{' after workflow name")?;
        
        let mut steps = Vec::new();
        while !self.check(TokenType::RightBrace) && !self.is_at_end() {
            steps.push(self.parse_step()?);
        }
        
        self.consume(TokenType::RightBrace, "Expected '}' after workflow body")?;
        
        Ok(Workflow { name, steps })
    }
    
    fn parse_step(&mut self) -> Result<Step> {
        self.consume(TokenType::Step, "Expected 'step'")?;
        
        let id = self.consume_number("Expected step number")? as u32;
        
        self.consume(TokenType::Colon, "Expected ':' after step number")?;
        
        let content = if self.check(TokenType::If) {
            StepContent::Conditional(self.parse_conditional_statement()?)
        } else {
            StepContent::Command(self.parse_command()?)
        };
        
        Ok(Step { id, content })
    }
    
    fn parse_command(&mut self) -> Result<Command> {
        let name = self.consume_identifier("Expected command name")?;
        
        let arguments = if self.check(TokenType::LeftParen) {
            self.consume(TokenType::LeftParen, "Expected '('")?;
            let args = self.parse_expression_list()?;
            self.consume(TokenType::RightParen, "Expected ')'")?;
            args
        } else {
            Vec::new()
        };
        
        Ok(Command { name, arguments })
    }
    
    fn parse_conditional_statement(&mut self) -> Result<ConditionalStatement> {
        self.consume(TokenType::If, "Expected 'if'")?;
        
        self.consume(TokenType::LeftParen, "Expected '(' after 'if'")?;
        let condition = self.parse_expression()?;
        self.consume(TokenType::RightParen, "Expected ')' after condition")?;
        
        self.consume(TokenType::LeftBrace, "Expected '{' after condition")?;
        let mut if_steps = Vec::new();
        while !self.check(TokenType::RightBrace) && !self.is_at_end() {
            if_steps.push(self.parse_step()?);
        }
        self.consume(TokenType::RightBrace, "Expected '}' after if block")?;
        
        let else_steps = if self.check(TokenType::Else) {
            self.advance(); // consume 'else'
            self.consume(TokenType::LeftBrace, "Expected '{' after 'else'")?;
            let mut steps = Vec::new();
            while !self.check(TokenType::RightBrace) && !self.is_at_end() {
                steps.push(self.parse_step()?);
            }
            self.consume(TokenType::RightBrace, "Expected '}' after else block")?;
            Some(steps)
        } else {
            None
        };
        
        Ok(ConditionalStatement {
            condition,
            if_steps,
            else_steps,
        })
    }
    
    fn parse_variable_declaration(&mut self) -> Result<VariableDeclaration> {
        let keyword = match self.peek().token_type {
            TokenType::Let => "let",
            TokenType::Var => "var",
            TokenType::Const => "const",
            _ => return Err(anyhow!("Expected variable declaration keyword")),
        };
        
        self.advance(); // consume keyword
        
        let name = self.consume_identifier("Expected variable name")?;
        
        self.consume(TokenType::Equal, "Expected '=' after variable name")?;
        
        let value = self.parse_expression()?;
        
        Ok(VariableDeclaration {
            keyword: keyword.to_string(),
            name,
            value,
        })
    }
    
    fn parse_expression(&mut self) -> Result<Expression> {
        self.parse_binary_expression()
    }
    
    fn parse_binary_expression(&mut self) -> Result<Expression> {
        let mut left = self.parse_primary()?;
        
        while self.match_token(&[TokenType::Plus, TokenType::EqualEqual, TokenType::NotEqual, 
                               TokenType::Greater, TokenType::Less, TokenType::GreaterEqual, TokenType::LessEqual]) {
            let operator = self.previous().lexeme.clone();
            let right = self.parse_primary()?;
            left = Expression::binary(left, &operator, right);
        }
        
        Ok(left)
    }
    
    fn parse_primary(&mut self) -> Result<Expression> {
        match self.peek().token_type {
            TokenType::String => {
                let value = self.advance().literal.clone().unwrap_or_default();
                Ok(Expression::string(&value))
            }
            TokenType::Number => {
                let value = self.advance().lexeme.parse::<f64>()
                    .map_err(|_| anyhow!("Invalid number"))?;
                Ok(Expression::number(value))
            }
            TokenType::Identifier => {
                let name = self.advance().lexeme.clone();
                
                // Check for property access (e.g., step 1.status)
                if self.check(TokenType::Dot) {
                    self.advance(); // consume '.'
                    let property = self.consume_identifier("Expected property name")?;
                    Ok(Expression::property_access(Expression::identifier(&name), &property))
                } else {
                    Ok(Expression::identifier(&name))
                }
            }
            TokenType::Step => {
                self.advance(); // consume 'step'
                let step_id = self.consume_number("Expected step number")? as u32;
                
                let property = if self.check(TokenType::Dot) {
                    self.advance(); // consume '.'
                    Some(self.consume_identifier("Expected property name")?)
                } else {
                    None
                };
                
                Ok(Expression::step_reference(step_id, property.as_deref()))
            }
            _ => Err(anyhow!("Expected expression")),
        }
    }
    
    fn parse_expression_list(&mut self) -> Result<Vec<Expression>> {
        let mut expressions = Vec::new();
        
        if !self.check(TokenType::RightParen) {
            loop {
                expressions.push(self.parse_expression()?);
                
                if !self.match_token(&[TokenType::Comma]) {
                    break;
                }
            }
        }
        
        Ok(expressions)
    }
    
    // Helper methods
    fn advance(&mut self) -> &Token {
        if !self.is_at_end() {
            self.current += 1;
        }
        self.previous()
    }
    
    fn check(&self, token_type: TokenType) -> bool {
        if self.is_at_end() {
            false
        } else {
            self.peek().token_type == token_type
        }
    }
    
    fn match_token(&mut self, types: &[TokenType]) -> bool {
        for token_type in types {
            if self.check(token_type.clone()) {
                self.advance();
                return true;
            }
        }
        false
    }
    
    fn consume(&mut self, token_type: TokenType, message: &str) -> Result<&Token> {
        if self.check(token_type) {
            Ok(self.advance())
        } else {
            Err(anyhow!("{}", message))
        }
    }
    
    fn consume_string(&mut self, message: &str) -> Result<String> {
        let token = self.consume(TokenType::String, message)?;
        Ok(token.literal.clone().unwrap_or_default())
    }
    
    fn consume_number(&mut self, message: &str) -> Result<f64> {
        let token = self.consume(TokenType::Number, message)?;
        token.lexeme.parse::<f64>()
            .map_err(|_| anyhow!("{}", message))
    }
    
    fn consume_identifier(&mut self, message: &str) -> Result<String> {
        let token = self.consume(TokenType::Identifier, message)?;
        Ok(token.lexeme.clone())
    }
    
    fn peek(&self) -> &Token {
        &self.tokens[self.current]
    }
    
    fn previous(&self) -> &Token {
        &self.tokens[self.current - 1]
    }
    
    fn is_at_end(&self) -> bool {
        self.current >= self.tokens.len() || self.peek().token_type == TokenType::Eof
    }
} 