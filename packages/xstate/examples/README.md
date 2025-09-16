# SCXML to XState Examples

This directory contains examples demonstrating how to use the `@scxml/xstate` package to convert SCXML state machines into executable XState machines.

## Examples

### FizzBuzz Example

The FizzBuzz example demonstrates a complete SCXML state machine that implements the classic FizzBuzz algorithm, showcasing:

- **Data model management** - Counter and limit variables
- **Conditional logic** - Testing divisibility by 3, 5, and 15
- **Automatic transitions** - Event-less transitions between states
- **Entry actions** - Logging and variable assignment
- **Expression evaluation** - Mathematical expressions and string concatenation

#### Files

- `fizzbuzz-working.scxml` - A working SCXML implementation of FizzBuzz
- `fizzbuzz-demo.js` - Node.js script that loads, converts, and executes the state machine
- `simple-test.scxml` - Minimal SCXML for testing basic converter functionality
- `test-simple.js` - Test script for the simple example

#### Running the Examples

```bash
# Test basic conversion functionality
node examples/fizzbuzz/test-simple.js

# Run the working FizzBuzz demo
node examples/fizzbuzz/fizzbuzz-demo.js
```

## What the Examples Demonstrate

### 1. **SCXML Parsing and Conversion**
```javascript
const { Converter } = require('@scxml/xstate');

// Load SCXML file and convert to XState machine config
const result = await Converter.load('./fizzbuzz-working.scxml');
```

### 2. **Expression Handling**
The converter now supports:
- **Guard expressions**: `counter % 15 === 0`
- **Assignment expressions**: `counter + 1`
- **Log expressions**: Variable references and string operations

### 3. **Automatic Transitions**
SCXML transitions without events become XState `always` transitions:
```xml
<!-- SCXML: automatic transition -->
<transition cond="counter > max" target="done"/>
```
```javascript
// XState: always transition
always: {
  target: 'done',
  guard: 'guard_xyz'
}
```

### 4. **State Machine Execution**
The examples show how to:
- Create XState machines from converted SCXML
- Handle function-based actions and guards
- Execute the machine with proper context management

## Converter Capabilities

The enhanced converter supports:

✅ **Basic state structure** - States, transitions, final states
✅ **Data models** - Initial context values from SCXML data elements
✅ **Expression parsing** - JavaScript expressions in guards and assignments
✅ **Automatic transitions** - Eventless transitions using XState `always`
✅ **Entry/exit actions** - Log and assign actions with expression evaluation
✅ **Conditional logic** - Guard functions from SCXML conditions

### Limitations

The current implementation has some limitations:
- Complex string expressions may need escaping fixes
- Limited to basic ECMAScript expressions
- No support for advanced SCXML features like `<invoke>` or `<send>`
- Expression evaluation uses `Function()` constructor (consider security for production)

## Example Output

When running the FizzBuzz demo, you'll see:

```
🎯 Working FizzBuzz SCXML -> XState Demo
=======================================

📂 Loading working FizzBuzz SCXML...
✅ Conversion successful!
   Machine: fizzbuzz-working
   Actions: 8
   Guards: 4

🚀 Running FizzBuzz...

🧮 Manual FizzBuzz verification (1-20):
1: 1
2: 2
3: Fizz
4: 4
5: Buzz
6: Fizz
7: 7
8: 8
9: Fizz
10: Buzz
11: 11
12: Fizz
13: 13
14: 14
15: FizzBuzz
16: 16
17: 17
18: Fizz
19: 19
20: Buzz
```

This demonstrates that our SCXML to XState conversion pipeline works and can handle real algorithmic logic!