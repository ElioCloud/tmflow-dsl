/**
 * Generator for TradeMinutes DSL
 * Converts validated AST into ReactFlow-compatible JSON format
 */

class Generator {
  constructor() {
    this.nodeIdCounter = 0;
    this.nodeSpacing = { x: 200, y: 100 };
    this.startPosition = { x: 50, y: 50 };
  }

  /**
   * Generate ReactFlow JSON from validated AST
   * @param {Object} ast - The validated Abstract Syntax Tree
   * @returns {Object} ReactFlow-compatible JSON with nodes and edges
   */
  generate(ast) {
    if (!ast || !ast.workflows || ast.workflows.length === 0) {
      throw new Error('No valid workflows found in AST');
    }

    // For now, we'll process the first workflow
    // In a real implementation, you might want to handle multiple workflows
    const workflow = ast.workflows[0];
    
    const nodes = this.generateNodes(workflow);
    const edges = this.generateEdges(workflow);

    return {
      nodes,
      edges
    };
  }

  /**
   * Generate nodes for a workflow
   * @param {Object} workflow - The workflow to generate nodes for
   * @returns {Array} Array of ReactFlow nodes
   */
  generateNodes(workflow) {
    const nodes = [];
    const stepMap = new Map();

    // Sort steps by number to ensure proper ordering
    const sortedSteps = workflow.steps.sort((a, b) => a.number - b.number);

    sortedSteps.forEach((step, index) => {
      const nodeId = `step-${step.number}`;
      stepMap.set(step.number, nodeId);

      const position = {
        x: this.startPosition.x + (index * this.nodeSpacing.x),
        y: this.startPosition.y + (index * this.nodeSpacing.y)
      };

      const node = {
        id: nodeId,
        type: 'default',
        position,
        data: {
          label: `Step ${step.number}`,
          stepNumber: step.number,
          command: step.command.name,
          arguments: this.formatArguments(step.command.arguments),
          description: this.generateStepDescription(step)
        },
        style: {
          background: this.getNodeColor(step.command.name),
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '10px',
          minWidth: '150px'
        }
      };

      nodes.push(node);
    });

    return nodes;
  }

  /**
   * Generate edges for a workflow
   * @param {Object} workflow - The workflow to generate edges for
   * @returns {Array} Array of ReactFlow edges
   */
  generateEdges(workflow) {
    const edges = [];
    const sortedSteps = workflow.steps.sort((a, b) => a.number - b.number);

    // Create sequential edges (step 1 -> step 2 -> step 3, etc.)
    for (let i = 0; i < sortedSteps.length - 1; i++) {
      const currentStep = sortedSteps[i];
      const nextStep = sortedSteps[i + 1];

      const edge = {
        id: `edge-${currentStep.number}-${nextStep.number}`,
        source: `step-${currentStep.number}`,
        target: `step-${nextStep.number}`,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#333', strokeWidth: 2 }
      };

      edges.push(edge);
    }

    // Create reference edges for step dependencies
    sortedSteps.forEach(step => {
      if (step.command && step.command.arguments) {
        step.command.arguments.forEach(arg => {
          if (arg.type === 'StepReference') {
            const referenceEdge = {
              id: `ref-edge-${step.number}-${arg.stepNumber}`,
              source: `step-${arg.stepNumber}`,
              target: `step-${step.number}`,
              type: 'smoothstep',
              animated: true,
              style: { 
                stroke: '#ff6b6b', 
                strokeWidth: 2,
                strokeDasharray: '5,5'
              },
              label: 'data flow'
            };

            edges.push(referenceEdge);
          }
        });
      }
    });

    return edges;
  }

  /**
   * Format command arguments for display
   * @param {Array} arguments - The command arguments
   * @returns {Array} Formatted arguments
   */
  formatArguments(args) {
    if (!args) return [];

    return args.map(arg => {
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
    });
  }

  /**
   * Generate a human-readable description for a step
   * @param {Object} step - The step to describe
   * @returns {string} Step description
   */
  generateStepDescription(step) {
    const commandName = step.command.name;
    const args = this.formatArguments(step.command.arguments).join(', ');
    
    return `${commandName}(${args})`;
  }

  /**
   * Get node color based on command type
   * @param {string} commandName - The command name
   * @returns {string} CSS color value
   */
  getNodeColor(commandName) {
    const colorMap = {
      'fetch': '#e3f2fd',      // Light blue
      'summarize': '#f3e5f5',  // Light purple
      'send_email': '#e8f5e8', // Light green
      'analyze': '#fff3e0',    // Light orange
      'filter': '#fce4ec',     // Light pink
      'transform': '#f1f8e9',  // Light lime
      'store': '#e0f2f1',      // Light teal
      'notify': '#fafafa'      // Light gray
    };

    return colorMap[commandName] || '#ffffff';
  }
}

module.exports = Generator; 