# SCXML Submodules Example

This example demonstrates the enhanced SCXML parser's ability to handle external references and submodules, enabling modular SCXML development.

## Features Demonstrated

### 🔗 External References Support
- **External Data Sources**: JSON files loaded as SCXML data elements
- **External SCXML Modules**: Sub-state machines loaded via `<invoke src="..."/>`
- **Recursive Resolution**: Nested external references are resolved automatically
- **Caching**: Resolved modules are cached for performance

### 📁 Example Files

- `shared-data.json` - External configuration data
- `logger-module.scxml` - Reusable logging state machine
- `main-with-submodules.scxml` - Main machine that references external modules
- `test-submodules.js` - Test script demonstrating the functionality

## Usage

### Basic External Data Reference

```xml
<datamodel>
  <data id="config" src="shared-data.json"/>
</datamodel>
```

### External SCXML Module Invocation

```xml
<invoke type="scxml" src="logger-module.scxml" id="logger">
  <param name="logLevel" expr="'info'"/>
</invoke>
```

### Running the Example

```bash
# Test submodule resolution
node examples/submodules/test-submodules.js
```

## Enhanced Parser API

### Basic Usage

```javascript
const { SCXMLParser, SCXMLModuleResolver } = require('@scxml/parser');

// Create parser with resolver
const parser = new SCXMLParser();
const resolver = new SCXMLModuleResolver({
  basePath: __dirname,
  cache: true,
  maxDepth: 5
});

parser.setResolver(resolver);

// Parse with external reference resolution
const document = await parser.parseWithResolution(scxmlContent, filePath);
```

### Module Resolver Options

```javascript
const resolver = new SCXMLModuleResolver({
  basePath: '/path/to/scxml/files',    // Base path for relative references
  cache: true,                         // Enable caching
  maxDepth: 10,                        // Maximum resolution depth
  allowedProtocols: ['file', 'http']   // Allowed protocols
});
```

## What Gets Resolved

### 1. Data Elements with `src` attribute
```xml
<data id="config" src="config.json"/>
<!-- Becomes: -->
<data id="config" src="[resolved]config.json">
  {"key": "value", ...}
</data>
```

### 2. Invoke Elements with SCXML sources
```xml
<invoke type="scxml" src="sub-machine.scxml" id="sub"/>
<!-- Becomes: -->
<invoke type="scxml" src="[resolved]sub-machine.scxml" id="sub">
  <content>{"scxml": {...}}</content>
</invoke>
```

### 3. Script Elements (future enhancement)
```xml
<script src="common-functions.js"/>
<!-- Will become: -->
<script src="[resolved]common-functions.js">
  function commonFunction() { ... }
</script>
```

## Example Output

When running the test, you'll see:

```
🔗 SCXML Submodule Resolution Test
==================================

📂 Loading main SCXML with external references...
🔄 Parsing with resolution...
✅ Parsing completed!

📊 Resolution Results:
===================
✅ Data "config": [resolved]shared-data.json
   Content: {"maxRetries":3,"timeout":5000,...
✅ Invoke "logger": [resolved]logger-module.scxml
   Type: scxml

📈 Cache Statistics:
   Cached items: 2
   Cache keys: shared-data.json, logger-module.scxml

🎉 Submodule resolution test completed successfully!
```

## Benefits

### 🧩 **Modularity**
- Break complex state machines into reusable components
- Share common data configurations across multiple machines
- Maintain cleaner, more focused SCXML files

### 🔄 **Reusability**
- Create library of common state machine patterns
- Share logging, error handling, and other utilities
- Version control individual modules separately

### ⚡ **Performance**
- Caching prevents duplicate loading
- Configurable resolution depth prevents infinite loops
- Lazy loading only resolves what's needed

### 🔒 **Safety**
- Configurable protocol restrictions
- Maximum depth protection
- Error handling with graceful fallbacks

This enhanced parser now supports real-world modular SCXML development patterns! 🚀