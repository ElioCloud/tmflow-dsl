/**
 * Test suite for TradeMinutes DSL Parser
 */

const TradeMinutesDSL = require('../src/index');

describe('TradeMinutes DSL Parser', () => {
  let dsl;

  beforeEach(() => {
    dsl = new TradeMinutesDSL();
  });

  describe('Basic Parsing', () => {
    test('should parse basic workflow', () => {
      const input = `workflow "MyFlow" {
  step 1: fetch("https://api.com")
  step 2: summarize(step 1)
  step 3: send_email("user@example.com", step 2)
}`;

      const result = dsl.parseDSL(input);

      expect(result.success).toBe(true);
      expect(result.reactFlowData).toBeDefined();
      expect(result.reactFlowData.nodes).toHaveLength(3);
      expect(result.reactFlowData.edges).toHaveLength(2);
    });

    test('should parse workflow with comments', () => {
      const input = `// This is a comment
workflow "DataPipeline" {
  /* Multi-line comment */
  step 1: fetch("https://data.com/api")
  step 2: filter(step 1, "active")
}`;

      const result = dsl.parseDSL(input);

      expect(result.success).toBe(true);
      expect(result.reactFlowData.nodes).toHaveLength(2);
    });

    test('should handle empty workflow', () => {
      const input = `workflow "EmptyFlow" {
}`;

      const result = dsl.parseDSL(input);

      expect(result.success).toBe(true);
      expect(result.reactFlowData.nodes).toHaveLength(0);
      expect(result.reactFlowData.edges).toHaveLength(0);
    });
  });

  describe('Validation', () => {
    test('should detect duplicate step numbers', () => {
      const input = `workflow "DuplicateSteps" {
  step 1: fetch("https://api.com")
  step 1: summarize(step 1)
}`;

      const result = dsl.parseDSL(input);

      expect(result.success).toBe(false);
      expect(result.validation.errors).toContain('Duplicate step number 1');
    });

    test('should detect non-existent step references', () => {
      const input = `workflow "InvalidReference" {
  step 1: fetch("https://api.com")
  step 2: summarize(step 3)
}`;

      const result = dsl.parseDSL(input);

      expect(result.success).toBe(false);
      expect(result.validation.errors).toContain('references non-existent step 3');
    });

    test('should detect self-references', () => {
      const input = `workflow "SelfReference" {
  step 1: fetch("https://api.com")
  step 2: summarize(step 2)
}`;

      const result = dsl.parseDSL(input);

      expect(result.success).toBe(false);
      expect(result.validation.errors).toContain('references itself');
    });

    test('should detect circular references', () => {
      const input = `workflow "CircularReference" {
  step 1: fetch("https://api.com")
  step 2: summarize(step 3)
  step 3: send_email("user@example.com", step 2)
}`;

      const result = dsl.parseDSL(input);

      expect(result.success).toBe(false);
      expect(result.validation.errors).toContain('Circular reference detected');
    });

    test('should warn about unknown commands', () => {
      const input = `workflow "UnknownCommand" {
  step 1: unknown_command("test")
}`;

      const result = dsl.parseDSL(input);

      expect(result.success).toBe(true);
      expect(result.validation.warnings).toContain('Unknown command "unknown_command"');
    });

    test('should warn about forward references', () => {
      const input = `workflow "ForwardReference" {
  step 1: fetch("https://api.com")
  step 2: summarize(step 3)
  step 3: send_email("user@example.com", step 2)
}`;

      const result = dsl.parseDSL(input);

      expect(result.success).toBe(false);
      expect(result.validation.warnings).toContain('references future step 3');
    });
  });

  describe('ReactFlow Generation', () => {
    test('should generate correct node structure', () => {
      const input = `workflow "TestFlow" {
  step 1: fetch("https://api.com")
  step 2: summarize(step 1)
}`;

      const result = dsl.parseDSL(input);

      expect(result.success).toBe(true);
      
      const nodes = result.reactFlowData.nodes;
      expect(nodes).toHaveLength(2);
      
      // Check first node
      expect(nodes[0].id).toBe('step-1');
      expect(nodes[0].data.stepNumber).toBe(1);
      expect(nodes[0].data.command).toBe('fetch');
      
      // Check second node
      expect(nodes[1].id).toBe('step-2');
      expect(nodes[1].data.stepNumber).toBe(2);
      expect(nodes[1].data.command).toBe('summarize');
    });

    test('should generate correct edge structure', () => {
      const input = `workflow "TestFlow" {
  step 1: fetch("https://api.com")
  step 2: summarize(step 1)
}`;

      const result = dsl.parseDSL(input);

      expect(result.success).toBe(true);
      
      const edges = result.reactFlowData.edges;
      expect(edges).toHaveLength(2); // Sequential + reference edge
      
      // Check sequential edge
      const sequentialEdge = edges.find(e => e.id === 'edge-1-2');
      expect(sequentialEdge).toBeDefined();
      expect(sequentialEdge.source).toBe('step-1');
      expect(sequentialEdge.target).toBe('step-2');
      
      // Check reference edge
      const referenceEdge = edges.find(e => e.id === 'ref-edge-1-2');
      expect(referenceEdge).toBeDefined();
      expect(referenceEdge.source).toBe('step-1');
      expect(referenceEdge.target).toBe('step-2');
      expect(referenceEdge.label).toBe('data flow');
    });

    test('should assign correct node colors', () => {
      const input = `workflow "ColorTest" {
  step 1: fetch("https://api.com")
  step 2: summarize(step 1)
  step 3: send_email("user@example.com", step 2)
}`;

      const result = dsl.parseDSL(input);

      expect(result.success).toBe(true);
      
      const nodes = result.reactFlowData.nodes;
      expect(nodes[0].style.background).toBe('#e3f2fd'); // fetch color
      expect(nodes[1].style.background).toBe('#f3e5f5'); // summarize color
      expect(nodes[2].style.background).toBe('#e8f5e8'); // send_email color
    });
  });

  describe('DSL Conversion', () => {
    test('should convert ReactFlow JSON back to DSL', () => {
      const input = `workflow "RoundTrip" {
  step 1: fetch("https://api.com")
  step 2: summarize(step 1)
}`;

      const result = dsl.parseDSL(input);
      expect(result.success).toBe(true);

      const backToDSL = dsl.convertToDSL(result.reactFlowData);
      
      // The converted DSL should contain the same workflow name and commands
      expect(backToDSL).toContain('workflow "RoundTrip"');
      expect(backToDSL).toContain('fetch("https://api.com")');
      expect(backToDSL).toContain('summarize(step 1)');
    });
  });

  describe('Supported Commands', () => {
    test('should return list of supported commands', () => {
      const commands = dsl.getSupportedCommands();
      
      expect(commands).toContain('fetch');
      expect(commands).toContain('summarize');
      expect(commands).toContain('send_email');
      expect(commands).toContain('analyze');
      expect(commands).toContain('filter');
      expect(commands).toContain('transform');
      expect(commands).toContain('store');
      expect(commands).toContain('notify');
    });
  });

  describe('Syntax Examples', () => {
    test('should provide syntax examples', () => {
      const examples = dsl.getSyntaxExamples();
      
      expect(examples.basic).toContain('workflow');
      expect(examples.withComments).toContain('//');
      expect(examples.complex).toContain('step');
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed DSL', () => {
      const input = `workflow "Malformed" {
  step 1: fetch("https://api.com"
  step 2: summarize(step 1)
}`;

      const result = dsl.parseDSL(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should handle invalid step numbers', () => {
      const input = `workflow "InvalidSteps" {
  step abc: fetch("https://api.com")
}`;

      const result = dsl.parseDSL(input);

      expect(result.success).toBe(false);
    });
  });
}); 