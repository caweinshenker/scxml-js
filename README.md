# SCXML TypeScript Parser

A comprehensive TypeScript library for parsing, creating, modifying, validating, and converting SCXML (State Chart XML) documents, with seamless integration to XState for AI agent world modeling and state machine execution.

## Features

- 🚀 **Full SCXML Support**: Complete implementation of W3C SCXML specification
- 🏗️ **Builder API**: Fluent, type-safe API for creating SCXML documents
- 🔧 **Modification API**: Programmatically modify existing SCXML documents
- ✅ **Validation**: Comprehensive validation with detailed error reporting
- 🔄 **XState Integration**: Convert SCXML to XState machines for execution
- 📝 **XML Serialization**: Convert SCXML documents back to XML
- 🎯 **TypeScript**: Full TypeScript support with complete type definitions
- 🤖 **AI-Ready**: Designed for AI agents to create and manage their own world models

## Installation

```bash
npm install scxml-parser
```

## Quick Start

### Creating SCXML Documents

```typescript
import { SCXML } from 'scxml-parser';

// Create a simple state machine
const document = SCXML.create()
  .name('traffic-light')
  .initial('red')
  .addState(SCXML.state('red')
    .addTransition(SCXML.transition()
      .event('timer')
      .target('green')
      .build())
    .build())
  .addState(SCXML.state('green')
    .addTransition(SCXML.transition()
      .event('timer')
      .target('yellow')
      .build())
    .build())
  .addState(SCXML.state('yellow')
    .addTransition(SCXML.transition()
      .event('timer')
      .target('red')
      .build())
    .build())
  .build();
```

### Parsing Existing SCXML

```typescript
import { SCXML } from 'scxml-parser';

const xmlString = `
<scxml initial="idle" xmlns="http://www.w3.org/2005/07/scxml">
  <state id="idle">
    <transition event="start" target="active"/>
  </state>
  <state id="active">
    <transition event="stop" target="idle"/>
  </state>
</scxml>`;

const document = SCXML.parse(xmlString);
```

### Converting to XState

```typescript
import { SCXML } from 'scxml-parser';

// Convert SCXML document to XState machine
const machine = SCXML.createMachine(document);

// Or get the configuration
const xstateConfig = SCXML.toXState(document);
```

### Modifying Documents

```typescript
import { SCXML } from 'scxml-parser';

const modifier = SCXML.modify(document)
  .addState(SCXML.state('error')
    .addOnEntry(SCXML.onEntry()
      .addLog({ label: 'Error occurred' })
      .build())
    .build())
  .addTransitionToState('active', SCXML.transition()
    .event('error')
    .target('error')
    .build());

const modifiedDocument = modifier.getDocument();
```

## AI Agent World Model Example

This library is particularly well-suited for AI agents to create and manage their own world models:

```typescript
import { SCXML } from 'scxml-parser';

// AI agent creates its world model
const agentWorldModel = SCXML.create()
  .name('ai-agent-world-model')
  .initial('initializing')
  .datamodel('ecmascript')
  .addDataModel(SCXML.dataModel()
    .addData(SCXML.data('currentTask').expr('null').build())
    .addData(SCXML.data('confidence').expr('0.0').build())
    .addData(SCXML.data('worldKnowledge').content('{}').build())
    .build())
  .addState(SCXML.state('initializing')
    .addOnEntry(SCXML.onEntry()
      .addLog({ label: 'Agent initializing' })
      .addAssign({ location: 'confidence', expr: '0.1' })
      .build())
    .addTransition(SCXML.transition()
      .event('ready')
      .target('idle')
      .build())
    .build())
  .addState(SCXML.state('idle')
    .addTransition(SCXML.transition()
      .event('task.assigned')
      .target('processing')
      .addAssign({ location: 'currentTask', expr: '_event.data.task' })
      .build())
    .build())
  .addState(SCXML.state('processing')
    .addParallel(SCXML.parallel('cognitive-processes')
      .addState(SCXML.state('understanding')
        .addInvoke(SCXML.invoke()
          .type('http')
          .src('/ai/nlp/understand')
          .build())
        .build())
      .addState(SCXML.state('planning')
        .addOnEntry(SCXML.onEntry()
          .addLog({ label: 'Creating execution plan' })
          .build())
        .build())
      .build())
    .addTransition(SCXML.transition()
      .event('task.completed')
      .target('reporting')
      .build())
    .build())
  .addState(SCXML.state('reporting')
    .addOnEntry(SCXML.onEntry()
      .addSend({ event: 'task.report', target: 'supervisor' })
      .build())
    .addTransition(SCXML.transition()
      .event('report.sent')
      .target('idle')
      .build())
    .build())
  .build();

// Convert to XState for execution
const machine = SCXML.createMachine(agentWorldModel);

// Agent can modify its world model dynamically
const modifier = SCXML.modify(agentWorldModel);
modifier.addState(SCXML.state('learning')
  .addOnEntry(SCXML.onEntry()
    .addLog({ label: 'Updating world knowledge' })
    .addAssign({
      location: 'worldKnowledge.lastUpdate',
      expr: 'Date.now()'
    })
    .build())
  .build());

const updatedModel = modifier.getDocument();
```

## API Reference

### Core Functions

#### `SCXML.create()`
Creates a new SCXML document builder.

#### `SCXML.parse(xmlString: string)`
Parses an SCXML XML string into a document object.

#### `SCXML.validate(document: SCXMLDocument)`
Validates an SCXML document and returns validation errors.

#### `SCXML.serialize(document: SCXMLDocument, options?: SerializationOptions)`
Serializes an SCXML document to XML string.

#### `SCXML.modify(document: SCXMLDocument)`
Creates a modifier for programmatically changing SCXML documents.

#### `SCXML.toXState(document: SCXMLDocument, options?: ConversionOptions)`
Converts SCXML document to XState configuration.

#### `SCXML.createMachine(document: SCXMLDocument, options?: any)`
Creates an XState machine from SCXML document.

### Builders

#### State Builder
```typescript
SCXML.state('my-state')
  .initial('child-state')
  .addTransition(transition)
  .addOnEntry(onEntryAction)
  .addOnExit(onExitAction)
  .addInvoke(invokeElement)
  .addState(childState)
  .build();
```

#### Transition Builder
```typescript
SCXML.transition()
  .event('my-event')
  .cond('x > 0')
  .target('target-state')
  .type('external')
  .addLog({ label: 'Transitioning' })
  .addAssign({ location: 'x', expr: 'x + 1' })
  .addSend({ event: 'notification', target: 'parent' })
  .build();
```

#### Data Model Builder
```typescript
SCXML.dataModel()
  .addData(SCXML.data('counter').expr('0').build())
  .addData(SCXML.data('config').content('{"enabled": true}').build())
  .build();
```

#### Action Builders
```typescript
// Entry/Exit Actions
SCXML.onEntry()
  .addLog({ label: 'Entering state' })
  .addAssign({ location: 'count', expr: 'count + 1' })
  .addRaise({ event: 'internal.entered' })
  .addSend({ event: 'notify', target: 'parent' })
  .build();

// Parallel States
SCXML.parallel('concurrent-region')
  .addState(branch1)
  .addState(branch2)
  .build();

// Invocations
SCXML.invoke()
  .type('http')
  .src('/api/service')
  .id('my-service')
  .autoforward(true)
  .build();
```

### Modification API

```typescript
const modifier = SCXML.modify(document);

// State management
modifier.addState(newState);
modifier.removeState('state-id');
modifier.updateState('state-id', state => {
  state.initial = 'new-initial';
  return state;
});
modifier.renameState('old-id', 'new-id');

// Transition management
modifier.addTransitionToState('state-id', transition);
modifier.removeTransitionFromState('state-id', t => t.event === 'remove-me');
modifier.updateTransitionInState('state-id',
  t => t.event === 'update-me',
  t => { t.target = 'new-target'; return t; }
);

// Data management
modifier.addDataToModel(dataElement);
modifier.updateDataInModel('data-id', d => {
  d.expr = 'newValue';
  return d;
});
modifier.removeDataFromModel('data-id');

// Utility methods
modifier.getAllStateIds();
modifier.findState('state-id');
modifier.clone();

const modifiedDocument = modifier.getDocument();
```

### Validation

```typescript
import { SCXML, ValidationError } from 'scxml-parser';

const errors: ValidationError[] = SCXML.validate(document);

errors.forEach(error => {
  console.log(`${error.severity}: ${error.message} at ${error.path}`);
});
```

### Advanced XState Integration

```typescript
import { SCXML, XStateConverter } from 'scxml-parser';

const converter = new XStateConverter({
  customActions: {
    myCustomAction: (context, event) => {
      console.log('Custom action executed');
    }
  },
  customGuards: {
    isEnabled: (context, event) => context.enabled === true
  },
  customServices: {
    myService: (context, event) => {
      return fetch('/api/my-service');
    }
  }
});

const machine = converter.createMachine(document);
```

## SCXML Feature Support

This library supports all major SCXML features:

- ✅ **Basic States**: Simple and compound states
- ✅ **Parallel States**: Concurrent state regions
- ✅ **Final States**: Terminal states with done data
- ✅ **Transitions**: Event-driven, conditional, and targetless transitions
- ✅ **Actions**: Entry, exit, and transition actions
- ✅ **Data Model**: ECMAScript and other data models
- ✅ **Executable Content**: Raise, log, assign, send, cancel, script, if, foreach
- ✅ **Invocations**: External service invocations
- ✅ **History States**: Shallow and deep history
- ✅ **Validation**: Comprehensive structural validation

## MCP Integration for AI Agents

This library is designed to work seamlessly with Model Context Protocol (MCP) systems, allowing AI agents to:

1. **Create State Models**: Define their own behavioral state machines
2. **Update Models**: Dynamically modify state machines based on learning
3. **Execute Models**: Use XState for actual state machine execution
4. **Persist Models**: Serialize state machines for storage and transmission
5. **Validate Models**: Ensure state machine correctness before execution

### Example MCP Tool Integration

```typescript
// MCP tool for AI agents to manage their state models
export async function updateAgentWorldModel(
  currentModelXml: string,
  updates: StateUpdate[]
): Promise<string> {
  const document = SCXML.parse(currentModelXml);
  const modifier = SCXML.modify(document);

  updates.forEach(update => {
    switch (update.type) {
      case 'add-state':
        modifier.addState(SCXML.state(update.stateId)
          .addOnEntry(SCXML.onEntry()
            .addLog({ label: `Entering ${update.stateId}` })
            .build())
          .build());
        break;
      case 'add-transition':
        modifier.addTransitionToState(update.fromState,
          SCXML.transition()
            .event(update.event)
            .target(update.toState)
            .build());
        break;
    }
  });

  const updatedDocument = modifier.getDocument();

  // Validate before returning
  const errors = SCXML.validate(updatedDocument);
  if (errors.length > 0) {
    throw new Error(`Invalid state model: ${errors.map(e => e.message).join(', ')}`);
  }

  return SCXML.serialize(updatedDocument);
}
```

## Testing

Run the test suite:

```bash
npm test
```

The library includes comprehensive tests covering:
- Parser functionality with various SCXML documents
- Builder API for all SCXML elements
- Modification operations
- Validation rules
- XState conversion accuracy
- Serialization round-trips
- Integration scenarios
- Performance with large state machines

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Built on the W3C SCXML specification
- Integrates with XState for execution
- Designed for AI agent world modeling use cases
- Supports Model Context Protocol (MCP) integration