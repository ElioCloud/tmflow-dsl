# TradeMinutes DSL Parser

## 🧠 **The Brain of TradeMinutes AI Agent**

The TradeMinutes DSL Parser is the **intelligent core** that powers the TradeMinutes AI agent's ability to understand, process, and execute complex workflow instructions. Think of it as the **brain** that converts human-readable workflow descriptions into structured, executable commands that the AI agent can understand and act upon.

### 🎯 **What It Does**
- **Understands** workflow instructions written in natural DSL syntax
- **Processes** complex multi-step workflows with dependencies
- **Validates** workflow logic to prevent errors and conflicts
- **Converts** human intent into machine-readable structures
- **Enables** the AI agent to execute sophisticated trading and analysis workflows

### 🚀 **How It Powers the AI Agent**

The parser acts as the **cognitive layer** between human input and AI execution:

```
Human Input → DSL Parser → Structured Data → AI Agent → Execution
     ↓              ↓              ↓              ↓           ↓
"Fetch data" → Parse & Validate → AST → AI Processes → Trade Actions
```

## Features

- **🧠 Intelligent Parsing**: Converts natural DSL syntax into structured workflows
- **🔍 Smart Validation**: Detects circular references, invalid steps, and logical errors
- **🎨 Visual Integration**: Generates ReactFlow-compatible JSON for workflow visualization
- **🔄 Bidirectional Conversion**: Converts between DSL and visual representations
- **💬 Natural Language Support**: Handles comments and human-readable syntax
- **⚡ Variable System**: Supports dynamic values and reusable components
- **🛡️ Error Prevention**: Comprehensive validation prevents workflow failures

## Installation

```bash
npm install
```

## Quick Start

```javascript
const TradeMinutesDSL = require('./src/index');

const dsl = new TradeMinutesDSL();

const input = `workflow "MyFlow" {
  step 1: fetch("https://api.com")
  step 2: summarize(step 1)
  step 3: send_email("user@example.com", step 2)
}`;

const result = dsl.parseDSL(input);

if (result.success) {
  console.log('ReactFlow JSON:', result.reactFlowData);
} else {
  console.log('Errors:', result.validation.errors);
}
```

## DSL Syntax

### Basic Structure

```dsl
workflow "WorkflowName" {
  step 1: command_name("argument1", "argument2")
  step 2: another_command(step 1)
  step 3: final_command("data", step 2)
}
```

### Variable Declarations (New!)

```dsl
let email = "user@example.com"
let api_key = "abc123"
let retry_count = 3

workflow "MyFlow" {
  step 1: fetch("https://api.com")
  step 2: send_email(email, step 1)
  step 3: notify("Process completed")
}
```

### Supported Commands

- `fetch(url)` - Fetch data from a URL
- `summarize(step_reference)` - Summarize data from a previous step
- `send_email(email, data)` - Send email with data
- `analyze(data, type)` - Analyze data with specified type
- `filter(data, criteria)` - Filter data based on criteria
- `transform(data, format)` - Transform data to specified format
- `store(data, location)` - Store data to specified location
- `notify(recipient, data)` - Send notification with data

### Comments

```dsl
// Single-line comment
workflow "CommentedFlow" {
  /* Multi-line comment
     describing the workflow */
  step 1: fetch("https://api.com")
  step 2: summarize(step 1)  // Inline comment
}
```

### Step References

Steps can reference outputs from previous steps:

```dsl
workflow "DataPipeline" {
  step 1: fetch("https://data.com/api")
  step 2: filter(step 1, "active")      // Uses output from step 1
  step 3: transform(step 2, "format")    // Uses output from step 2
  step 4: store(step 3, "database")     // Uses output from step 3
}
```

## API Reference

### TradeMinutesDSL Class

#### `parseDSL(dslInput)`

Parses DSL input and returns ReactFlow-compatible JSON.

**Parameters:**
- `dslInput` (string): The DSL input string

**Returns:**
```javascript
{
  success: boolean,
  reactFlowData: {
    nodes: Array,
    edges: Array
  },
  validation: {
    isValid: boolean,
    errors: Array,
    warnings: Array
  },
  ast: Object
}
```

#### `convertToDSL(reactFlowData)`

Converts ReactFlow JSON back to DSL format.

**Parameters:**
- `reactFlowData` (Object): ReactFlow JSON with nodes and edges

**Returns:**
- `string`: DSL string

#### `getSupportedCommands()`

Returns list of supported commands.

**Returns:**
- `Array`: Array of supported command names

#### `getSyntaxExamples()`

Returns syntax examples for different use cases.

**Returns:**
- `Object`: Object containing different syntax examples

## Validation Features

### Error Detection

- **Duplicate Step Numbers**: Detects when multiple steps have the same number
- **Non-existent References**: Detects references to steps that don't exist
- **Self-references**: Detects when a step references itself
- **Circular References**: Detects circular dependencies between steps
- **Malformed Syntax**: Detects syntax errors in the DSL

### Warning Detection

- **Unknown Commands**: Warns about unsupported commands
- **Forward References**: Warns when steps reference future steps
- **Empty Workflows**: Warns about workflows with no steps

## ReactFlow Integration

The parser generates JSON compatible with ReactFlow:

```javascript
{
  "nodes": [
    {
      "id": "step-1",
      "type": "default",
      "position": { "x": 50, "y": 50 },
      "data": {
        "label": "Step 1",
        "stepNumber": 1,
        "command": "fetch",
        "arguments": ["\"https://api.com\""],
        "description": "fetch(\"https://api.com\")"
      },
      "style": {
        "background": "#e3f2fd",
        "border": "1px solid #ccc",
        "borderRadius": "8px",
        "padding": "10px",
        "minWidth": "150px"
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1-2",
      "source": "step-1",
      "target": "step-2",
      "type": "smoothstep",
      "animated": false,
      "style": { "stroke": "#333", "strokeWidth": 2 }
    }
  ]
}
```

### Node Features

- **Color Coding**: Different commands have different background colors
- **Step Information**: Each node contains step number, command, and arguments
- **Positioning**: Nodes are automatically positioned in a grid layout

### Edge Features

- **Sequential Edges**: Connect steps in execution order
- **Reference Edges**: Show data flow between steps (dashed, animated)
- **Labels**: Reference edges are labeled as "data flow"

## Examples

### Basic Workflow

```dsl
workflow "MyFlow" {
  step 1: fetch("https://api.com")
  step 2: summarize(step 1)
  step 3: send_email("user@example.com", step 2)
}
```

### Complex Data Pipeline

```dsl
workflow "AnalyticsPipeline" {
  step 1: fetch("https://api.analytics.com/data")
  step 2: analyze(step 1, "trends")
  step 3: filter(step 2, "significant")
  step 4: summarize(step 3)
  step 5: notify("admin@company.com", step 4)
  step 6: store(step 5, "reports")
}
```

### Error Examples

```dsl
// This will cause validation errors
workflow "ErrorFlow" {
  step 1: fetch("https://api.com")
  step 2: summarize(step 3)  // Forward reference
  step 3: send_email("user@example.com", step 2)  // Circular reference
}
```

## Running Examples

```bash
# Run the example file
npm start

# Run tests
npm test
```

## Architecture

The parser consists of several modular components:

1. **Lexer** (`src/lexer.js`): Tokenizes the input string
2. **Parser** (`src/parser.js`): Converts tokens to Abstract Syntax Tree (AST)
3. **Executor** (`src/executor.js`): Executes the AST and runs commands
4. **Validator** (`src/validator.js`): Validates the AST for errors and warnings
5. **Generator** (`src/generator.js`): Converts AST to ReactFlow JSON
6. **DSL Converter** (`src/dsl-converter.js`): Converts ReactFlow JSON back to DSL
7. **Main Module** (`src/index.js`): Orchestrates the entire pipeline

## 🚀 **Executor - Running DSL Workflows**

The **Executor** is the component that actually runs your DSL workflows and executes commands. It takes the parsed AST and executes each step, showing real output on the terminal.

### **How to Use the Executor**

```javascript
const Parser = require('./src/parser');
const Executor = require('./src/executor');

// Parse your DSL
const parser = new Parser(dsl);
const ast = parser.parse();

// Execute the workflow
const executor = new Executor();
executor.execute(ast);
```

### **Example with Print Statements**

```dsl
workflow "PrintTest" {
  step 1: fetch("https://api.com")
  if (step 1.status == "success") {
    step 2: print("✅ Success! Data fetched successfully")
    step 3: send_email("success@email.com", step 1)
  } else {
    step 4: print("❌ Error: Failed to fetch data")
    step 5: notify("error@email.com", "Failed")
  }
}
```

**Output:**
```
🚀 Executing DSL Workflow...

📋 Executing workflow: PrintTest
   Steps: 2

   Step 1:
     Command: fetch
     Arguments: "https://api.com"
     🌐 FETCHING: https://api.com

   Step 2:
     🔀 Conditional Statement:
     Condition: ✅ TRUE
     Executing IF branch (2 steps):
       IF Step 1:
     Command: print
     Arguments: "✅ Success! Data fetched successfully"
     📤 OUTPUT: ✅ Success! Data fetched successfully
       IF Step 2:
     Command: send_email
     Arguments: "success@email.com", {...}
     📧 SENDING EMAIL: success@email.com

🎉 Execution completed!
```

### **Supported Commands in Executor**

- **`print(message)`** - Prints message to terminal
- **`log(message)`** - Logs message to terminal  
- **`fetch(url)`** - Fetches data from URL (mock)
- **`send_email(to, data)`** - Sends email (mock)
- **`notify(recipient, message)`** - Sends notification (mock)
- **`summarize(data)`** - Summarizes data (mock)
- **`analyze(data, type)`** - Analyzes data (mock)
- **`filter(data, criteria)`** - Filters data (mock)
- **`transform(data, format)`** - Transforms data (mock)
- **`store(data, location)`** - Stores data (mock)

### **Variable Support**

The executor supports variables and expressions:

```dsl
let base_url = "https://api.com"
let endpoint = "/users"
let full_url = base_url + endpoint

workflow "VariableTest" {
  step 1: fetch(full_url)
  step 2: print("Fetched from: " + full_url)
  step 3: send_email("user@email.com", step 1)
}
```

### **Conditional Execution**

The executor properly handles if/else statements:

```dsl
workflow "ConditionalTest" {
  step 1: fetch("https://api.com")
  if (step 1.status == "success") {
    step 2: print("✅ Success!")
    step 3: send_email("success@email.com", step 1)
  } else {
    step 4: print("❌ Failed!")
    step 5: notify("admin@email.com", "Error occurred")
  }
}
```

### **Step Results**

The executor maintains step results that can be referenced:

```dsl
workflow "StepReferenceTest" {
  step 1: fetch("https://api.com")
  step 2: print("Step 1 result: " + step 1.status)
  step 3: send_email("user@email.com", step 1.data)
}
```

### **Running Tests**

```bash
# Test parsing and execution
node test/test-conditionallogic.js

# Test variables
node test/test-variable.js

# Test string concatenation  
node test/test-concatenation.js
```

## Extending the Parser

### Adding New Commands

1. Add the command name to `Lexer.KEYWORDS` in `src/lexer.js`
2. Add the command to the supported commands list in `src/validator.js`
3. Add a color mapping in `src/generator.js` if needed

### Adding New Validation Rules

Extend the `Validator` class in `src/validator.js` to add new validation methods.

### Customizing Node Appearance

Modify the `Generator` class in `src/generator.js` to customize node styling and positioning.

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Support

For issues and questions, please open an issue on the GitHub repository.
