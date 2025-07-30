use anyhow::{anyhow, Result};
use std::collections::HashMap;

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum TokenType {
    // Keywords
    Workflow,
    Step,
    Let,
    Var,
    Const,
    If,
    Else,
    Print,
    Log,
    Fetch,
    SendEmail,
    Notify,
    
    // Literals
    String,
    Number,
    Identifier,
    
    // Operators
    Plus,
    Equal,
    EqualEqual,
    NotEqual,
    Greater,
    Less,
    GreaterEqual,
    LessEqual,
    Dot,
    
    // Punctuation
    LeftParen,
    RightParen,
    LeftBrace,
    RightBrace,
    Colon,
    Semicolon,
    Comma,
    
    // Special
    Eof,
}

#[derive(Debug, Clone)]
pub struct Token {
    pub token_type: TokenType,
    pub lexeme: String,
    pub literal: Option<String>,
    pub line: usize,
}

impl Token {
    pub fn new(token_type: TokenType, lexeme: &str, literal: Option<&str>, line: usize) -> Self {
        Token {
            token_type,
            lexeme: lexeme.to_string(),
            literal: literal.map(|s| s.to_string()),
            line,
        }
    }
}

pub struct Lexer {
    source: Vec<char>,
    tokens: Vec<Token>,
    start: usize,
    current: usize,
    line: usize,
    keywords: HashMap<String, TokenType>,
}

impl Lexer {
    pub fn new(source: &str) -> Self {
        let mut keywords = HashMap::new();
        keywords.insert("workflow".to_string(), TokenType::Workflow);
        keywords.insert("step".to_string(), TokenType::Step);
        keywords.insert("let".to_string(), TokenType::Let);
        keywords.insert("var".to_string(), TokenType::Var);
        keywords.insert("const".to_string(), TokenType::Const);
        keywords.insert("if".to_string(), TokenType::If);
        keywords.insert("else".to_string(), TokenType::Else);
        keywords.insert("print".to_string(), TokenType::Print);
        keywords.insert("log".to_string(), TokenType::Log);
        keywords.insert("fetch".to_string(), TokenType::Fetch);
        keywords.insert("send_email".to_string(), TokenType::SendEmail);
        keywords.insert("notify".to_string(), TokenType::Notify);
        
        Lexer {
            source: source.chars().collect(),
            tokens: Vec::new(),
            start: 0,
            current: 0,
            line: 1,
            keywords,
        }
    }
    
    pub fn tokenize(&mut self) -> Result<Vec<Token>> {
        while !self.is_at_end() {
            self.start = self.current;
            self.scan_token()?;
        }
        
        self.tokens.push(Token::new(TokenType::Eof, "", None, self.line));
        Ok(self.tokens.clone())
    }
    
    fn scan_token(&mut self) -> Result<()> {
        let c = self.advance();
        
        match c {
            '(' => self.add_token(TokenType::LeftParen),
            ')' => self.add_token(TokenType::RightParen),
            '{' => self.add_token(TokenType::LeftBrace),
            '}' => self.add_token(TokenType::RightBrace),
            ':' => self.add_token(TokenType::Colon),
            ';' => self.add_token(TokenType::Semicolon),
            ',' => self.add_token(TokenType::Comma),
            '.' => self.add_token(TokenType::Dot),
            '=' => {
                if self.match_char('=') {
                    self.add_token(TokenType::EqualEqual);
                } else {
                    self.add_token(TokenType::Equal);
                }
            }
            '!' => {
                if self.match_char('=') {
                    self.add_token(TokenType::NotEqual);
                } else {
                    return Err(anyhow!("Unexpected character: !"));
                }
            }
            '<' => {
                if self.match_char('=') {
                    self.add_token(TokenType::LessEqual);
                } else {
                    self.add_token(TokenType::Less);
                }
            }
            '>' => {
                if self.match_char('=') {
                    self.add_token(TokenType::GreaterEqual);
                } else {
                    self.add_token(TokenType::Greater);
                }
            }
            '+' => self.add_token(TokenType::Plus),
            '"' => self.string()?,
            '\'' => self.string()?,
            c if c.is_ascii_digit() => self.number(),
            c if c.is_ascii_alphabetic() || c == '_' => self.identifier(),
            c if c.is_whitespace() => {
                if c == '\n' {
                    self.line += 1;
                }
            }
            _ => return Err(anyhow!("Unexpected character: {}", c)),
        }
        
        Ok(())
    }
    
    fn string(&mut self) -> Result<()> {
        let quote = self.source[self.current - 1];
        
        while self.peek() != quote && !self.is_at_end() {
            if self.peek() == '\n' {
                self.line += 1;
            }
            self.advance();
        }
        
        if self.is_at_end() {
            return Err(anyhow!("Unterminated string"));
        }
        
        // Consume the closing quote
        self.advance();
        
        // Trim the quotes
        let value = self.source[self.start + 1..self.current - 1]
            .iter()
            .collect::<String>();
        
        self.add_token_with_literal(TokenType::String, &value);
        Ok(())
    }
    
    fn number(&mut self) {
        while self.peek().is_ascii_digit() {
            self.advance();
        }
        
        // Look for decimal part
        if self.peek() == '.' && self.peek_next().is_ascii_digit() {
            self.advance(); // consume the "."
            
            while self.peek().is_ascii_digit() {
                self.advance();
            }
        }
        
        let value = self.source[self.start..self.current]
            .iter()
            .collect::<String>();
        
        self.add_token_with_literal(TokenType::Number, &value);
    }
    
    fn identifier(&mut self) {
        while self.peek().is_alphanumeric() || self.peek() == '_' {
            self.advance();
        }
        
        let text = self.source[self.start..self.current]
            .iter()
            .collect::<String>();
        
        let token_type = self.keywords.get(&text)
            .cloned()
            .unwrap_or(TokenType::Identifier);
        
        self.add_token(token_type);
    }
    
    fn advance(&mut self) -> char {
        let c = self.source[self.current];
        self.current += 1;
        c
    }
    
    fn match_char(&mut self, expected: char) -> bool {
        if self.is_at_end() || self.source[self.current] != expected {
            false
        } else {
            self.current += 1;
            true
        }
    }
    
    fn peek(&self) -> char {
        if self.is_at_end() {
            '\0'
        } else {
            self.source[self.current]
        }
    }
    
    fn peek_next(&self) -> char {
        if self.current + 1 >= self.source.len() {
            '\0'
        } else {
            self.source[self.current + 1]
        }
    }
    
    fn is_at_end(&self) -> bool {
        self.current >= self.source.len()
    }
    
    fn add_token(&mut self, token_type: TokenType) {
        let text = self.source[self.start..self.current]
            .iter()
            .collect::<String>();
        self.tokens.push(Token::new(token_type, &text, None, self.line));
    }
    
    fn add_token_with_literal(&mut self, token_type: TokenType, literal: &str) {
        let text = self.source[self.start..self.current]
            .iter()
            .collect::<String>();
        self.tokens.push(Token::new(token_type, &text, Some(literal), self.line));
    }
} 