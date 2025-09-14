---
sidebar_position: 2
---

# Core Concepts

Understanding the key concepts of SCXML and this library will help you build effective state machines.

## SCXML Fundamentals

### State Machines
A state machine consists of:
- **States**: Represent different conditions or situations
- **Transitions**: Define how to move between states
- **Events**: Triggers that cause transitions
- **Actions**: Code that executes during transitions or state entry/exit

### Document Structure
An SCXML document has this basic structure:

```xml
<scxml initial="initialState">
  <state id="state1">
    <transition event="event1" target="state2"/>
  </state>
  <state id="state2">
    <transition event="event2" target="state1"/>
  </state>
</scxml>
```

## Library Architecture

### Core Components

1. **Parser** (`SCXMLParser`): Converts XML strings to document objects
2. **Builder** (`SCXMLBuilder`): Creates documents programmatically
3. **Modifier** (`SCXMLModifier`): Changes existing documents
4. **Validator** (`SCXMLValidator`): Ensures document correctness
5. **Serializer** (`SCXMLSerializer`): Converts documents back to XML

### Type System

The library provides complete TypeScript types for all SCXML elements:

```typescript
interface SCXMLDocument {
  version?: string;
  initial?: string;
  name?: string;
  datamodel?: string;
  states: StateElement[];
  dataModel?: DataModelElement;
  // ... other properties
}
```

## Builder Pattern

The library uses a fluent builder pattern for creating SCXML documents:

```typescript
const document = SCXML.create()
  .name('my-machine')
  .initial('idle')
  .addState(SCXML.state('idle')
    .addTransition(SCXML.transition()
      .event('start')
      .target('active')
      .build())
    .build())
  .build();
```

### Builder Benefits
- **Type Safety**: Catch errors at compile time
- **IntelliSense**: Full IDE support with autocompletion
- **Fluent API**: Readable, chainable method calls
- **Validation**: Built-in validation during construction

## Data Models

SCXML supports different data models for state machine variables:

```typescript
const document = SCXML.create()
  .datamodel('ecmascript')
  .addDataModel(SCXML.dataModel()
    .addData(SCXML.data('counter').expr('0').build())
    .addData(SCXML.data('config').content('{"enabled": true}').build())
    .build())
  .build();
```

## Validation

The library performs comprehensive validation:

```typescript
const errors = SCXML.validate(document);
errors.forEach(error => {
  console.log(`${error.severity}: ${error.message} at ${error.path}`);
});
```

### Validation Types
- **Structural**: Checks document structure and required elements
- **Semantic**: Validates state references, transition targets, etc.
- **Data Model**: Ensures data expressions are valid

## Next Steps

- [Learn how to create documents](./tutorial) with the builder API
- [See practical examples](./examples) of common patterns
- [Explore the full API](../api) for detailed reference