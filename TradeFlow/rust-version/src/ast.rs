use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Program {
    pub workflows: Vec<Workflow>,
    pub variables: Vec<VariableDeclaration>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Workflow {
    pub name: String,
    pub steps: Vec<Step>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Step {
    pub id: u32,
    pub content: StepContent,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StepContent {
    Command(Command),
    Conditional(ConditionalStatement),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Command {
    pub name: String,
    pub arguments: Vec<Expression>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConditionalStatement {
    pub condition: Expression,
    pub if_steps: Vec<Step>,
    pub else_steps: Option<Vec<Step>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VariableDeclaration {
    pub keyword: String, // let, var, const
    pub name: String,
    pub value: Expression,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Expression {
    StringLiteral(String),
    NumberLiteral(f64),
    Identifier(String),
    BinaryExpression {
        left: Box<Expression>,
        operator: String,
        right: Box<Expression>,
    },
    PropertyAccess {
        object: Box<Expression>,
        property: String,
    },
    StepReference {
        step_id: u32,
        property: Option<String>,
    },
}

impl Expression {
    pub fn string(value: &str) -> Self {
        Expression::StringLiteral(value.to_string())
    }
    
    pub fn number(value: f64) -> Self {
        Expression::NumberLiteral(value)
    }
    
    pub fn identifier(name: &str) -> Self {
        Expression::Identifier(name.to_string())
    }
    
    pub fn binary(left: Expression, operator: &str, right: Expression) -> Self {
        Expression::BinaryExpression {
            left: Box::new(left),
            operator: operator.to_string(),
            right: Box::new(right),
        }
    }
    
    pub fn property_access(object: Expression, property: &str) -> Self {
        Expression::PropertyAccess {
            object: Box::new(object),
            property: property.to_string(),
        }
    }
    
    pub fn step_reference(step_id: u32, property: Option<&str>) -> Self {
        Expression::StepReference {
            step_id,
            property: property.map(|p| p.to_string()),
        }
    }
} 