#!/bin/bash

# Build script for WebAssembly integration
# This script builds the Rust tmflow-DSL for use in the browser

echo "🦀 Building TradeMinutes DSL for WebAssembly..."

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo "❌ wasm-pack not found. Installing..."
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi

# Build the WebAssembly module
echo "🔨 Building WebAssembly module..."
wasm-pack build --target web --features wasm --out-dir ../wasm-pkg

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ WebAssembly build completed successfully!"
    echo "📦 Output directory: ../wasm-pkg"
    echo ""
    echo "To use in your frontend:"
    echo "1. Copy the wasm-pkg directory to your frontend project"
    echo "2. Import the module: import init, { WasmDSLExecutor } from './wasm-pkg/trademinutes_dsl.js'"
    echo "3. Initialize: await init()"
    echo "4. Use: const executor = new WasmDSLExecutor()"
else
    echo "❌ WebAssembly build failed!"
    exit 1
fi
