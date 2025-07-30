/**
 * DSL Converter for TradeMinutes
 * Converts ReactFlow JSON back to DSL format
 */

class DSLConverter {
  constructor() {
    this.indentSize = 2;
  }

  /**
   * Convert ReactFlow JSON back to DSL format
   * @param {Object} reactFlowData - ReactFlow JSON with nodes and edges
   * @returns {string} DSL string
   */
  convertToDSL(reactFlowData) {
    if (!reactFlowData || !reactFlowData.nodes || !reactFlowData.edges) {
      throw new Error('Invalid ReactFlow data structure');
    }

    // Extract workflow information from nodes
    const workflowName = this.extractWorkflowName(reactFlowData.nodes);
    const steps = this.extractSteps(reactFlowData.nodes, reactFlowData.edges);

    return this.generateDSL(workflowName, steps);
  }

  /**
   * Extract workflow name from nodes
   * @param {Array} nodes - ReactFlow nodes
   * @returns {string} Workflow name
   */
  extractWorkflowName(nodes) {
    // Try to find a workflow name from node data
    const workflowNode = nodes.find(node => 
      node.data && node.data.workflowName
    );
    
    return workflowNode ? workflowNode.data.workflowName : 'MyWorkflow';
  }

  /**
   * Extract steps from nodes and edges
   * @param {Array} nodes - ReactFlow nodes
   * @param {Array} edges - ReactFlow edges
   * @returns {Array} Array of step objects
   */
  extractSteps(nodes, edges) {
    const steps = [];
    const stepMap = new Map();

    // Create a map of step numbers to node data
    nodes.forEach(node => {
      if (node.data && node.data.stepNumber) {
        stepMap.set(node.data.stepNumber, node.data);
      }
    });

    // Sort steps by step number
    const sortedStepNumbers = Array.from(stepMap.keys()).sort((a, b) => a - b);

    sortedStepNumbers.forEach(stepNumber => {
      const nodeData = stepMap.get(stepNumber);
      const step = this.createStepFromNodeData(stepNumber, nodeData, edges);
      steps.push(step);
    });

    return steps;
  }

  /**
   * Create a step object from node data
   * @param {number} stepNumber - The step number
   * @param {Object} nodeData - Node data from ReactFlow
   * @param {Array} edges - ReactFlow edges
   * @returns {Object} Step object
   */
  createStepFromNodeData(stepNumber, nodeData, edges) {
    const command = this.parseCommandFromDescription(nodeData.description);
    
    // Find step references from edges
    const references = this.findStepReferences(stepNumber, edges);
    
    // Update command arguments with references
    if (references.length > 0) {
      command.arguments = command.arguments.map(arg => {
        if (arg.type === 'StringLiteral' && references.includes(arg.value)) {
          return {
            type: 'StepReference',
            stepNumber: parseInt(arg.value)
          };
        }
        return arg;
      });
    }

    return {
      number: stepNumber,
      command
    };
  }

  /**
   * Parse command from description string
   * @param {string} description - Step description
   * @returns {Object} Command object
   */
  parseCommandFromDescription(description) {
    if (!description) {
      return { name: 'unknown', arguments: [] };
    }

    // Extract command name and arguments from description like "fetch(\"url\", step 1)"
    const match = description.match(/^(\w+)\((.*)\)$/);
    if (!match) {
      return { name: 'unknown', arguments: [] };
    }

    const commandName = match[1];
    const argsString = match[2];
    const args = this.parseArguments(argsString);

    return {
      name: commandName,
      arguments: args
    };
  }

  /**
   * Parse arguments string into argument objects
   * @param {string} argsString - Arguments string
   * @returns {Array} Array of argument objects
   */
  parseArguments(argsString) {
    if (!argsString.trim()) {
      return [];
    }

    const args = [];
    const parts = argsString.split(',').map(part => part.trim());

    parts.forEach(part => {
      if (part.startsWith('"') && part.endsWith('"')) {
        // String literal
        args.push({
          type: 'StringLiteral',
          value: part.slice(1, -1)
        });
      } else if (part.startsWith('step ')) {
        // Step reference
        const stepNumber = parseInt(part.substring(5));
        args.push({
          type: 'StepReference',
          stepNumber
        });
      } else if (!isNaN(part)) {
        // Number literal
        args.push({
          type: 'NumberLiteral',
          value: parseInt(part)
        });
      } else {
        // Identifier
        args.push({
          type: 'Identifier',
          value: part
        });
      }
    });

    return args;
  }

  /**
   * Find step references from edges
   * @param {number} stepNumber - Current step number
   * @param {Array} edges - ReactFlow edges
   * @returns {Array} Array of referenced step numbers
   */
  findStepReferences(stepNumber, edges) {
    const references = [];
    
    edges.forEach(edge => {
      if (edge.target === `step-${stepNumber}` && edge.label === 'data flow') {
        const sourceStepNumber = parseInt(edge.source.replace('step-', ''));
        references.push(sourceStepNumber);
      }
    });

    return references;
  }

  /**
   * Generate DSL string from workflow name and steps
   * @param {string} workflowName - Workflow name
   * @param {Array} steps - Array of step objects
   * @returns {string} DSL string
   */
  generateDSL(workflowName, steps) {
    let dsl = `workflow "${workflowName}" {\n`;

    steps.forEach(step => {
      dsl += this.indent(1) + `step ${step.number}: ${this.formatCommand(step.command)}\n`;
    });

    dsl += '}';
    return dsl;
  }

  /**
   * Format command for DSL output
   * @param {Object} command - Command object
   * @returns {string} Formatted command string
   */
  formatCommand(command) {
    const args = command.arguments.map(arg => {
      switch (arg.type) {
        case 'StringLiteral':
          return `"${arg.value}"`;
        case 'NumberLiteral':
          return arg.value.toString();
        case 'StepReference':
          return `step ${arg.stepNumber}`;
        case 'Identifier':
          return arg.value;
        default:
          return 'unknown';
      }
    }).join(', ');

    return `${command.name}(${args})`;
  }

  /**
   * Create indentation string
   * @param {number} level - Indentation level
   * @returns {string} Indentation string
   */
  indent(level) {
    return ' '.repeat(level * this.indentSize);
  }
}

module.exports = DSLConverter; 