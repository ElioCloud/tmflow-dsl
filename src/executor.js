/**
 * Executor for TradeMinutes DSL
 * Executes the parsed AST and runs commands
 */

class Executor {
  constructor() {
    this.variables = {};
    this.stepResults = {};
  }

  /**
   * Execute a parsed AST
   * @param {Object} ast - The parsed Abstract Syntax Tree
   */
  execute(ast) {
    console.log('🚀 Executing DSL Workflow...\n');
    
    // Execute variables first
    if (ast.variables && ast.variables.length > 0) {
      console.log('📝 Setting up variables...');
      ast.variables.forEach(variable => {
        this.executeVariable(variable);
      });
      console.log('');
    }
    
    // Execute workflows
    ast.workflows.forEach(workflow => {
      this.executeWorkflow(workflow);
    });
  }

  /**
   * Execute a variable declaration
   */
  executeVariable(variable) {
    const value = this.evaluateExpression(variable.value);
    this.variables[variable.name] = value;
    console.log(`  ✅ Set ${variable.declarationType} ${variable.name} = ${JSON.stringify(value)}`);
  }

  /**
   * Execute a workflow
   */
  executeWorkflow(workflow) {
    console.log(`📋 Executing workflow: ${workflow.name}`);
    console.log(`   Steps: ${workflow.steps.length}\n`);
    
    workflow.steps.forEach((step, index) => {
      console.log(`   Step ${index + 1}:`);
      this.executeStep(step);
      console.log('');
    });
  }

  /**
   * Execute a step
   */
  executeStep(step) {
    if (step.type === 'Step') {
      this.executeCommand(step);
    } else if (step.type === 'ConditionalStatement') {
      this.executeConditional(step);
    }
  }

  /**
   * Execute a command
   */
  executeCommand(step) {
    const command = step.command;
    const args = command.arguments.map(arg => this.evaluateExpression(arg));
    
    console.log(`     Command: ${command.name}`);
    console.log(`     Arguments: ${args.map(arg => JSON.stringify(arg)).join(', ')}`);
    
    // Execute the command
    switch (command.name) {
      case 'print':
      case 'log':
        console.log(`     📤 OUTPUT: ${args[0]}`);
        this.stepResults[step.number] = { type: 'print', output: args[0] };
        break;
        
      case 'fetch':
        console.log(`     🌐 FETCHING: ${args[0]}`);
        this.stepResults[step.number] = { 
          type: 'fetch', 
          url: args[0], 
          status: 'success',
          data: { message: 'Mock data from API' }
        };
        break;
        
      case 'send_email':
        console.log(`     📧 SENDING EMAIL: ${args[0]}`);
        this.stepResults[step.number] = { 
          type: 'send_email', 
          to: args[0], 
          data: args[1],
          status: 'sent'
        };
        break;
        
      case 'notify':
        console.log(`     🔔 NOTIFICATION: ${args[0]} - ${args[1]}`);
        this.stepResults[step.number] = { 
          type: 'notify', 
          to: args[0], 
          message: args[1],
          status: 'sent'
        };
        break;
        
      default:
        console.log(`     ⚙️  Executing: ${command.name}`);
        this.stepResults[step.number] = { 
          type: command.name, 
          status: 'completed',
          data: args
        };
    }
  }

  /**
   * Execute a conditional statement
   */
  executeConditional(conditional) {
    console.log(`     🔀 Conditional Statement:`);
    
    const conditionResult = this.evaluateCondition(conditional.condition);
    console.log(`     Condition: ${conditionResult ? '✅ TRUE' : '❌ FALSE'}`);
    
    if (conditionResult) {
      console.log(`     Executing IF branch (${conditional.ifSteps.length} steps):`);
      conditional.ifSteps.forEach((step, index) => {
        console.log(`       IF Step ${index + 1}:`);
        this.executeStep(step);
      });
    } else {
      console.log(`     Executing ELSE branch (${conditional.elseSteps.length} steps):`);
      conditional.elseSteps.forEach((step, index) => {
        console.log(`       ELSE Step ${index + 1}:`);
        this.executeStep(step);
      });
    }
  }

  /**
   * Evaluate a condition
   */
  evaluateCondition(condition) {
    if (condition.type === 'ComparisonExpression') {
      const left = this.evaluateExpression(condition.left);
      const right = this.evaluateExpression(condition.right);
      
      switch (condition.operator) {
        case '==': return left == right;
        case '!=': return left != right;
        case '>': return left > right;
        case '<': return left < right;
        case '>=': return left >= right;
        case '<=': return left <= right;
        default: return false;
      }
    }
    return false;
  }

  /**
   * Evaluate an expression
   */
  evaluateExpression(expression) {
    if (expression.type === 'StringLiteral') {
      return expression.value;
    } else if (expression.type === 'NumberLiteral') {
      return expression.value;
    } else if (expression.type === 'Identifier') {
      return this.variables[expression.value];
    } else if (expression.type === 'BinaryExpression') {
      const left = this.evaluateExpression(expression.left);
      const right = this.evaluateExpression(expression.right);
      
      if (expression.operator === '+') {
        return left + right;
      }
    } else if (expression.type === 'PropertyAccess') {
      const object = this.evaluateExpression(expression.object);
      if (object && object.status) {
        return object.status;
      }
    } else if (expression.type === 'StepReference') {
      return this.stepResults[expression.stepNumber];
    }
    
    return expression.value || expression;
  }
}

module.exports = Executor; 