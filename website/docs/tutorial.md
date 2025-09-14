---
sidebar_position: 3
---

# Tutorial: Building Your First State Machine

This tutorial will walk you through creating, validating, and using SCXML documents with the TypeScript parser.

## Prerequisites

Make sure you have the library installed:

```bash npm2yarn
npm install @scxml/parser
```

## Step 1: Basic State Machine

Let's start with a simple two-state machine:

```typescript
import { SCXML } from '@scxml/parser';

const simpleMachine = SCXML.create()
  .name('simple-machine')
  .initial('off')
  .addState(SCXML.state('off')
    .addTransition(SCXML.transition()
      .event('turn_on')
      .target('on')
      .build())
    .build())
  .addState(SCXML.state('on')
    .addTransition(SCXML.transition()
      .event('turn_off')
      .target('off')
      .build())
    .build())
  .build();

console.log('Created simple machine:', simpleMachine.name);
```

## Step 2: Adding Actions

Let's add entry and exit actions:

```typescript
const machineWithActions = SCXML.create()
  .name('machine-with-actions')
  .initial('idle')
  .addState(SCXML.state('idle')
    .addOnEntry(SCXML.onEntry()
      .addLog({ label: 'Entering idle state' })
      .build())
    .addTransition(SCXML.transition()
      .event('start')
      .target('working')
      .addLog({ label: 'Starting work' })
      .build())
    .build())
  .addState(SCXML.state('working')
    .addOnEntry(SCXML.onEntry()
      .addLog({ label: 'Now working...' })
      .build())
    .addOnExit(SCXML.onExit()
      .addLog({ label: 'Finished working' })
      .build())
    .addTransition(SCXML.transition()
      .event('complete')
      .target('idle')
      .build())
    .build())
  .build();
```

## Step 3: Data and Conditions

Add data model and conditional transitions:

```typescript
const dataStateMachine = SCXML.create()
  .name('data-state-machine')
  .initial('waiting')
  .datamodel('ecmascript')
  .addDataModel(SCXML.dataModel()
    .addData(SCXML.data('attemptCount').expr('0').build())
    .addData(SCXML.data('maxAttempts').expr('3').build())
    .build())
  .addState(SCXML.state('waiting')
    .addTransition(SCXML.transition()
      .event('try')
      .target('processing')
      .addAssign({ location: 'attemptCount', expr: 'attemptCount + 1' })
      .build())
    .build())
  .addState(SCXML.state('processing')
    .addTransition(SCXML.transition()
      .event('success')
      .target('completed')
      .build())
    .addTransition(SCXML.transition()
      .event('failure')
      .cond('attemptCount < maxAttempts')
      .target('waiting')
      .build())
    .addTransition(SCXML.transition()
      .event('failure')
      .cond('attemptCount >= maxAttempts')
      .target('failed')
      .build())
    .build())
  .addState(SCXML.state('completed').build())
  .addState(SCXML.state('failed').build())
  .build();
```

## Step 4: Compound States

Create hierarchical states:

```typescript
const hierarchicalMachine = SCXML.create()
  .name('hierarchical-machine')
  .initial('application')
  .addState(SCXML.state('application')
    .initial('menu')
    .addState(SCXML.state('menu')
      .addTransition(SCXML.transition()
        .event('select_game')
        .target('game')
        .build())
      .addTransition(SCXML.transition()
        .event('exit')
        .target('shutdown')
        .build())
      .build())
    .addState(SCXML.state('game')
      .initial('playing')
      .addState(SCXML.state('playing')
        .addTransition(SCXML.transition()
          .event('pause')
          .target('paused')
          .build())
        .addTransition(SCXML.transition()
          .event('game_over')
          .target('menu')
          .build())
        .build())
      .addState(SCXML.state('paused')
        .addTransition(SCXML.transition()
          .event('resume')
          .target('playing')
          .build())
        .addTransition(SCXML.transition()
          .event('quit')
          .target('menu')
          .build())
        .build())
      .build())
    .build())
  .addState(SCXML.state('shutdown').build())
  .build();
```

## Step 5: Validation

Always validate your state machines:

```typescript
function validateAndReport(document: any, name: string) {
  console.log(`\\n=== Validating ${name} ===`);

  const errors = SCXML.validate(document);

  if (errors.length === 0) {
    console.log('✅ Valid SCXML document!');
  } else {
    console.log(`❌ Found ${errors.length} validation errors:`);
    errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.severity}: ${error.message}`);
      if (error.path) {
        console.log(`     Path: ${error.path}`);
      }
    });
  }
}

// Validate all our machines
validateAndReport(simpleMachine, 'Simple Machine');
validateAndReport(machineWithActions, 'Machine with Actions');
validateAndReport(dataStateMachine, 'Data State Machine');
validateAndReport(hierarchicalMachine, 'Hierarchical Machine');
```

## Step 6: Serialization

Convert your documents to XML:

```typescript
function serializeAndSave(document: any, name: string) {
  const xml = SCXML.serialize(document, {
    spaces: 2,
    declaration: true
  });

  console.log(`\\n=== ${name} XML ===`);
  console.log(xml);

  // In a real application, you might save to file:
  // fs.writeFileSync(`${name.toLowerCase().replace(/\\s+/g, '-')}.scxml`, xml);
}

// Serialize our machines
serializeAndSave(simpleMachine, 'Simple Machine');
```

## Step 7: Parsing Existing SCXML

You can also parse existing SCXML documents:

```typescript
const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
<scxml version="1.0" initial="start" xmlns="http://www.w3.org/2005/07/scxml">
  <state id="start">
    <transition event="go" target="end"/>
  </state>
  <final id="end"/>
</scxml>`;

try {
  const parsedDocument = SCXML.parse(xmlString);
  console.log('Successfully parsed SCXML:', parsedDocument.name || 'unnamed');

  // Validate the parsed document
  validateAndReport(parsedDocument, 'Parsed Document');
} catch (error) {
  console.error('Failed to parse SCXML:', error.message);
}
```

## Complete Example

Here's a complete working example you can run:

```typescript
import { SCXML } from '@scxml/parser';

// Create a coffee machine state machine
const coffeeMachine = SCXML.create()
  .name('coffee-machine')
  .initial('idle')
  .datamodel('ecmascript')
  .addDataModel(SCXML.dataModel()
    .addData(SCXML.data('waterLevel').expr('100').build())
    .addData(SCXML.data('coffeeLevel').expr('50').build())
    .build())
  .addState(SCXML.state('idle')
    .addOnEntry(SCXML.onEntry()
      .addLog({ label: 'Coffee machine ready' })
      .build())
    .addTransition(SCXML.transition()
      .event('make_coffee')
      .cond('waterLevel > 0 && coffeeLevel > 0')
      .target('brewing')
      .build())
    .addTransition(SCXML.transition()
      .event('make_coffee')
      .cond('waterLevel <= 0 || coffeeLevel <= 0')
      .target('error')
      .build())
    .build())
  .addState(SCXML.state('brewing')
    .addOnEntry(SCXML.onEntry()
      .addLog({ label: 'Brewing coffee...' })
      .addAssign({ location: 'waterLevel', expr: 'waterLevel - 10' })
      .addAssign({ location: 'coffeeLevel', expr: 'coffeeLevel - 5' })
      .build())
    .addTransition(SCXML.transition()
      .event('brewing_complete')
      .target('ready')
      .build())
    .build())
  .addState(SCXML.state('ready')
    .addOnEntry(SCXML.onEntry()
      .addLog({ label: 'Coffee ready! Enjoy!' })
      .build())
    .addTransition(SCXML.transition()
      .event('take_coffee')
      .target('idle')
      .build())
    .build())
  .addState(SCXML.state('error')
    .addOnEntry(SCXML.onEntry()
      .addLog({ label: 'Error: Please refill water or coffee' })
      .build())
    .addTransition(SCXML.transition()
      .event('refill')
      .target('idle')
      .addAssign({ location: 'waterLevel', expr: '100' })
      .addAssign({ location: 'coffeeLevel', expr: '50' })
      .build())
    .build())
  .build();

// Validate and serialize
const errors = SCXML.validate(coffeeMachine);
console.log('Validation errors:', errors.length);

const xml = SCXML.serialize(coffeeMachine, { spaces: 2 });
console.log('Generated SCXML:\\n', xml);
```

## Next Steps

Now that you understand the basics:

- [Explore more examples](./examples) for specific use cases
- [Read the concepts guide](./concepts) for deeper understanding
- [Check the API reference](../api) for complete documentation
- [See advanced patterns](./examples) like parallel states and invocations