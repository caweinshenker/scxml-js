# Variable: SCXML

> `const` **SCXML**: `object`

Defined in: [index.ts:138](https://github.com/caweinshenker/scxml-js/blob/7dd2f3af253aee1431983d9212ae959f7d7083ba/src/index.ts#L138)

Convenience object providing easy access to all SCXML operations.

This is the main entry point for most users of the library, providing
a simple API for all common operations without needing to import
individual classes.

## Type Declaration

### create()

> **create**: () => [`SCXMLBuilder`](../classes/SCXMLBuilder.md)

Create a new SCXML document builder.

#### Returns

[`SCXMLBuilder`](../classes/SCXMLBuilder.md)

New SCXML document builder instance

#### Example

```typescript
const doc = SCXML.create()
  .name('my-machine')
  .initial('idle')
  .build();
```

### data()

> **data**: (`id`) => [`DataBuilder`](../classes/DataBuilder.md)

Create a new data element builder.

#### Parameters

##### id

`string`

Unique identifier for the data element

#### Returns

[`DataBuilder`](../classes/DataBuilder.md)

New data builder instance

### dataModel()

> **dataModel**: () => [`DataModelBuilder`](../classes/DataModelBuilder.md)

Create a new data model builder.

#### Returns

[`DataModelBuilder`](../classes/DataModelBuilder.md)

New data model builder instance

### invoke()

> **invoke**: () => [`InvokeBuilder`](../classes/InvokeBuilder.md)

Create a new invoke element builder.

#### Returns

[`InvokeBuilder`](../classes/InvokeBuilder.md)

New invoke builder instance

### modify()

> **modify**: (`document`) => [`SCXMLModifier`](../classes/SCXMLModifier.md)

Create a document modifier for an existing SCXML document.

#### Parameters

##### document

`any`

The SCXML document to modify

#### Returns

[`SCXMLModifier`](../classes/SCXMLModifier.md)

Document modifier instance

#### Example

```typescript
const modifier = SCXML.modify(document);
modifier.addState(SCXML.state('new-state').build());
const modified = modifier.getDocument();
```

### onEntry()

> **onEntry**: () => [`OnEntryBuilder`](../classes/OnEntryBuilder.md)

Create a new entry action builder.

#### Returns

[`OnEntryBuilder`](../classes/OnEntryBuilder.md)

New entry action builder instance

### onExit()

> **onExit**: () => [`OnExitBuilder`](../classes/OnExitBuilder.md)

Create a new exit action builder.

#### Returns

[`OnExitBuilder`](../classes/OnExitBuilder.md)

New exit action builder instance

### parallel()

> **parallel**: (`id`) => [`ParallelBuilder`](../classes/ParallelBuilder.md)

Create a new parallel state builder.

#### Parameters

##### id

`string`

Unique identifier for the parallel region

#### Returns

[`ParallelBuilder`](../classes/ParallelBuilder.md)

New parallel builder instance

### parse()

> **parse**: (`xmlString`) => [`SCXMLDocument`](../interfaces/SCXMLDocument.md)

Parse an SCXML XML string into a document object.

#### Parameters

##### xmlString

`string`

The XML string to parse

#### Returns

[`SCXMLDocument`](../interfaces/SCXMLDocument.md)

Parsed SCXML document

#### Throws

When XML is malformed or invalid

#### Example

```typescript
const doc = SCXML.parse(`
  <scxml initial="idle">
    <state id="idle"/>
  </scxml>
`);
```

### serialize()

> **serialize**: (`document`, `options?`) => `string`

Serialize an SCXML document to XML string.

#### Parameters

##### document

`any`

The SCXML document to serialize

##### options?

`any`

Serialization options (formatting, spacing, etc.)

#### Returns

`string`

XML string representation

#### Example

```typescript
const xml = SCXML.serialize(document, { spaces: 2 });
```

### state()

> **state**: (`id`) => [`StateBuilder`](../classes/StateBuilder.md)

Create a new state builder.

#### Parameters

##### id

`string`

Unique identifier for the state

#### Returns

[`StateBuilder`](../classes/StateBuilder.md)

New state builder instance

### transition()

> **transition**: () => [`TransitionBuilder`](../classes/TransitionBuilder.md)

Create a new transition builder.

#### Returns

[`TransitionBuilder`](../classes/TransitionBuilder.md)

New transition builder instance

### validate()

> **validate**: (`document`) => [`ValidationError`](../interfaces/ValidationError.md)[]

Validate an SCXML document for structural and semantic correctness.

#### Parameters

##### document

`any`

The SCXML document to validate

#### Returns

[`ValidationError`](../interfaces/ValidationError.md)[]

Array of validation errors (empty if valid)

#### Example

```typescript
const errors = SCXML.validate(document);
if (errors.length > 0) {
  console.log('Validation errors:', errors);
}
```

## Example

```typescript
import { SCXML } from '@scxml/parser';

// Parse XML
const doc = SCXML.parse('<scxml>...</scxml>');

// Create new document
const newDoc = SCXML.create()
  .name('my-machine')
  .initial('idle')
  .addState(SCXML.state('idle')
    .addTransition(SCXML.transition()
      .event('start')
      .target('active')
      .build())
    .build())
  .build();

// Validate and serialize
const errors = SCXML.validate(newDoc);
const xml = SCXML.serialize(newDoc);
```
