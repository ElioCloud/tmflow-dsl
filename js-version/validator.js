/**
 * Validator for TradeMinutes DSL AST
 * Validates workflows for errors and inconsistencies
 */

class Validator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validate a parsed AST
   * @param {Object} ast - The parsed Abstract Syntax Tree
   * @returns {Object} Validation result with errors and warnings
   */
  validate(ast) {
    this.errors = [];
    this.warnings = [];

    if (!ast || !ast.workflows) {
      this.errors.push('Invalid AST structure');
      return this.getResult();
    }

    ast.workflows.forEach(workflow => {
      this.validateWorkflow(workflow);
    });

    return this.getResult();
  }

  /**
   * Validate a single workflow
   * @param {Object} workflow - The workflow to validate
   */
  validateWorkflow(workflow) {
    if (!workflow.name) {
      this.errors.push(`Workflow missing name`);
      return;
    }

    if (!workflow.steps || workflow.steps.length === 0) {
      this.warnings.push(`Workflow "${workflow.name}" has no steps`);
      return;
    }

    // Check for duplicate step numbers
    const stepNumbers = new Set();
    workflow.steps.forEach(step => {
      if (stepNumbers.has(step.number)) {
        this.errors.push(`Duplicate step number ${step.number} in workflow "${workflow.name}"`);
      } else {
        stepNumbers.add(step.number);
      }
    });

    // Validate each step
    workflow.steps.forEach(step => {
      this.validateStep(step, workflow);
    });

    // Check for circular references
    this.checkCircularReferences(workflow);
  }

  /**
   * Validate a single step
   * @param {Object} step - The step to validate
   * @param {Object} workflow - The parent workflow
   */
  validateStep(step, workflow) {
    if (!step.number || typeof step.number !== 'number') {
      this.errors.push(`Invalid step number in workflow "${workflow.name}"`);
      return;
    }

    if (!step.command) {
      this.errors.push(`Step ${step.number} in workflow "${workflow.name}" has no command`);
      return;
    }

    // Validate command
    this.validateCommand(step.command, step.number, workflow);
  }

  /**
   * Validate a command
   * @param {Object} command - The command to validate
   * @param {number} stepNumber - The step number containing this command
   * @param {Object} workflow - The parent workflow
   */
  validateCommand(command, stepNumber, workflow) {
    if (!command.name) {
      this.errors.push(`Step ${stepNumber} in workflow "${workflow.name}" has no command name`);
      return;
    }

    // Check if command is supported
    const supportedCommands = [
      'fetch', 'summarize', 'send_email', 'analyze', 
      'filter', 'transform', 'store', 'notify'
    ];

    if (!supportedCommands.includes(command.name)) {
      this.warnings.push(`Unknown command "${command.name}" in step ${stepNumber} of workflow "${workflow.name}"`);
    }

    // Validate arguments
    if (command.arguments) {
      command.arguments.forEach((arg, index) => {
        this.validateArgument(arg, stepNumber, workflow, index);
      });
    }
  }

  /**
   * Validate a command argument
   * @param {Object} arg - The argument to validate
   * @param {number} stepNumber - The step number
   * @param {Object} workflow - The parent workflow
   * @param {number} argIndex - The argument index
   */
  validateArgument(arg, stepNumber, workflow, argIndex) {
    if (arg.type === 'StepReference') {
      this.validateStepReference(arg, stepNumber, workflow, argIndex);
    } else if (arg.type === 'StringLiteral') {
      if (!arg.value || typeof arg.value !== 'string') {
        this.errors.push(`Invalid string argument at position ${argIndex} in step ${stepNumber} of workflow "${workflow.name}"`);
      }
    } else if (arg.type === 'NumberLiteral') {
      if (typeof arg.value !== 'number') {
        this.errors.push(`Invalid number argument at position ${argIndex} in step ${stepNumber} of workflow "${workflow.name}"`);
      }
    }
  }

  /**
   * Validate a step reference
   * @param {Object} arg - The step reference argument
   * @param {number} stepNumber - The current step number
   * @param {Object} workflow - The parent workflow
   * @param {number} argIndex - The argument index
   */
  validateStepReference(arg, stepNumber, workflow, argIndex) {
    if (!arg.stepNumber || typeof arg.stepNumber !== 'number') {
      this.errors.push(`Invalid step reference at position ${argIndex} in step ${stepNumber} of workflow "${workflow.name}"`);
      return;
    }

    // Check if referenced step exists
    const referencedStep = workflow.steps.find(s => s.number === arg.stepNumber);
    if (!referencedStep) {
      this.errors.push(`Step ${stepNumber} in workflow "${workflow.name}" references non-existent step ${arg.stepNumber}`);
      return;
    }

    // Check for self-reference
    if (arg.stepNumber === stepNumber) {
      this.errors.push(`Step ${stepNumber} in workflow "${workflow.name}" references itself`);
      return;
    }

    // Check for forward reference (referencing a step that comes after)
    if (arg.stepNumber > stepNumber) {
      this.warnings.push(`Step ${stepNumber} in workflow "${workflow.name}" references future step ${arg.stepNumber}`);
    }
  }

  /**
   * Check for circular references in the workflow
   * @param {Object} workflow - The workflow to check
   */
  checkCircularReferences(workflow) {
    const visited = new Set();
    const recursionStack = new Set();

    workflow.steps.forEach(step => {
      if (!visited.has(step.number)) {
        if (this.hasCircularReference(step.number, workflow, visited, recursionStack)) {
          this.errors.push(`Circular reference detected in workflow "${workflow.name}"`);
        }
      }
    });
  }

  /**
   * Check if a step has circular references using DFS
   * @param {number} stepNumber - The step number to check
   * @param {Object} workflow - The parent workflow
   * @param {Set} visited - Set of visited steps
   * @param {Set} recursionStack - Set of steps in current recursion stack
   * @returns {boolean} True if circular reference is found
   */
  hasCircularReference(stepNumber, workflow, visited, recursionStack) {
    visited.add(stepNumber);
    recursionStack.add(stepNumber);

    const step = workflow.steps.find(s => s.number === stepNumber);
    if (!step || !step.command || !step.command.arguments) {
      recursionStack.delete(stepNumber);
      return false;
    }

    // Find all step references in this step's arguments
    const stepReferences = step.command.arguments
      .filter(arg => arg.type === 'StepReference')
      .map(arg => arg.stepNumber);

    for (const refStepNumber of stepReferences) {
      if (!visited.has(refStepNumber)) {
        if (this.hasCircularReference(refStepNumber, workflow, visited, recursionStack)) {
          return true;
        }
      } else if (recursionStack.has(refStepNumber)) {
        return true;
      }
    }

    recursionStack.delete(stepNumber);
    return false;
  }

  /**
   * Get validation result
   * @returns {Object} Object containing errors and warnings
   */
  getResult() {
    return {
      isValid: this.errors.length === 0,
      errors: [...this.errors],
      warnings: [...this.warnings]
    };
  }
}

module.exports = Validator; 