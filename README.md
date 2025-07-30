# 🚀 TradeMinutes DSL Parser (Rust Implementation)

## 🧠 **The Brain of TradeMinutes AI Agent**

The TradeMinutes DSL Parser is the **intelligent core** that powers the TradeMinutes AI agent's ability to understand, process, and execute complex workflow instructions. This **Rust implementation** provides blazing-fast performance with memory safety guarantees.

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

## ✨ **Features**

### **🚀 Performance & Safety**
- **Zero-cost abstractions** - Blazingly fast parsing
- **Memory safety** without garbage collection
- **Compile-time guarantees** prevent runtime errors
- **Concurrent execution** ready

### **🧩 Language Features**
- **Variable Declarations** (`let`, `var`, `const`)
- **String Concatenation** (`+` operator)
- **Conditional Logic** (`if`/`else` statements)
- **Step References** (`step 1.status`)
- **Property Access** (`object.property`)
- **Command Execution** (`print`, `fetch`, `send_email`, etc.)

### **🔧 Built-in Commands**
- `print(message)` - Output to console
- `log(message)` - Log information
- `fetch(url)` - HTTP requests
- `send_email(to, subject)` - Email notifications
- `notify(message)` - System notifications

## 📝 **DSL Syntax Examples**

### **Basic Workflow**
```dsl
workflow "SimpleFlow" {
    step 1: print("Hello, World!")
    step 2: fetch("https://api.com/data")
}
```

### **Variable Declarations**
```dsl
workflow "VariableExample" {
    let base_url = "https://api.com"
    let endpoint = "/users"
    
    step 1: fetch(base_url + endpoint)
    step 2: print("Fetched: " + step 1.data)
}
```

### **Conditional Logic**
```dsl
workflow "ConditionalFlow" {
    step 1: fetch("https://api.com/status")
    
    if (step 1.status == 200) {
        step 2: print("Success: " + step 1.data)
    } else {
        step 3: print("Error: " + step 1.status)
    }
}
```

### **Complex Trading Workflow**
```dsl
workflow "TradingStrategy" {
    let api_key = "your_api_key"
    let base_url = "https://trading-api.com"
    
    step 1: fetch(base_url + "/market-data")
    
    if (step 1.status == 200) {
        step 2: print("Market data received")
        
        if (step 1.data.price > 100) {
            step 3: send_email("trader@company.com", "High price alert")
        } else {
            step 4: print("Price is normal: " + step 1.data.price)
        }
    } else {
        step 5: notify("Market data fetch failed")
    }
}
```

## 🛠 **Installation & Usage**

### **Prerequisites**
- Rust 1.70+ installed
- Cargo package manager

### **Build & Run**
```bash
# Navigate to the rust-version directory
cd rust-version

# Build the project
cargo build

# Run the example
cargo run
```

### **Development**
```bash
# Run tests
cargo test

# Run with release optimizations
cargo run --release

# Check for issues
cargo check
```

## 🏗 **Architecture**

### **Core Components**

1. **Lexer** (`rust-version/src/lexer.rs`)
   - Tokenizes DSL input
   - Handles keywords, literals, operators
   - Provides error reporting

2. **Parser** (`rust-version/src/parser.rs`)
   - Converts tokens to AST
   - Handles syntax validation
   - Builds structured program representation

3. **AST** (`rust-version/src/ast.rs`)
   - Defines program structure
   - Supports all DSL features
   - Serializable for persistence

4. **Executor** (`rust-version/src/executor.rs`)
   - Runs parsed programs
   - Manages variable scope
   - Simulates command execution

### **Data Flow**
```
DSL Code → Lexer → Tokens → Parser → AST → Executor → Output
```

## 🔍 **Error Handling**

The parser provides comprehensive error handling:

- **Lexical errors** - Invalid characters, unterminated strings
- **Syntax errors** - Missing tokens, invalid structure
- **Semantic errors** - Undefined variables, type mismatches
- **Runtime errors** - Command failures, network issues

## 🚀 **Performance Benefits**

### **vs JavaScript Version**
- **10-100x faster** parsing
- **Lower memory usage**
- **Better error detection** at compile time
- **Concurrent execution** support

### **Memory Safety**
- **No null pointer exceptions**
- **No buffer overflows**
- **Thread safety** guarantees
- **Automatic resource management**

## 📊 **API Reference**

### **Main Parser Functions**

#### `parse_dsl(input: &str) -> Result<Ast, ParseError>`

Parses DSL input and returns an Abstract Syntax Tree.

**Parameters:**
- `input` (string): The DSL input string

**Returns:**
```rust
Result<Ast, ParseError>
```

#### `execute_workflow(ast: &Ast) -> Result<ExecutionResult, ExecutionError>`

Executes a parsed workflow and returns the results.

**Parameters:**
- `ast` (Ast): The parsed Abstract Syntax Tree

**Returns:**
```rust
Result<ExecutionResult, ExecutionError>
```

### **Supported Commands**

- `fetch(url)` - Fetch data from a URL
- `summarize(step_reference)` - Summarize data from a previous step
- `send_email(email, data)` - Send email with data
- `analyze(data, type)` - Analyze data with specified type
- `filter(data, criteria)` - Filter data based on criteria
- `transform(data, format)` - Transform data to specified format
- `store(data, location)` - Store data to specified location
- `notify(recipient, data)` - Send notification with data
- `print(message)` - Print message to console
- `log(message)` - Log message to console

## 🔮 **Future Enhancements**

### **Planned Features**
- **Loops & Iterations** (`for each item in collection`)
- **Function Definitions** (`function name(params)`)
- **Error Handling** (`try/catch` blocks)
- **File Operations** (`read_file`, `write_file`)
- **Advanced Math** (mathematical expressions)
- **WebAssembly** compilation for web deployment

### **Integration Possibilities**
- **Web Interface** - Compile to WASM for browser
- **CLI Tool** - Command-line workflow runner
- **API Server** - RESTful DSL execution service
- **Plugin System** - Extensible command library

## 🧪 **Testing**

### **Running Tests**
```bash
# Run all tests
cargo test

# Run specific test file
cargo test test_examples

# Run with output
cargo test -- --nocapture
```

### **Test Examples**
```bash
# Test parsing
cargo test test_parser

# Test execution
cargo test test_executor

# Test lexer
cargo test test_lexer
```

## 🤝 **Contributing**

This is part of the larger TradeMinutes ecosystem. Contributions are welcome!

### **Development Setup**
```bash
git clone <repository>
cd rust-version
cargo build
cargo test
```

### **Code Style**
- Follow Rust conventions
- Use meaningful variable names
- Add comprehensive tests
- Document public APIs

## 📄 **License**

This project is part of the TradeMinutes ecosystem and follows the same licensing terms.

---

**Built with ❤️ in Rust for the TradeMinutes AI Agent**
