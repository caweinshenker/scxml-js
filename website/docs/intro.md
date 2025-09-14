---
sidebar_position: 1
---

# Getting Started

Welcome to the **SCXML TypeScript Parser** documentation! This library provides a comprehensive, type-safe way to work with SCXML (State Chart XML) documents in TypeScript and JavaScript applications.

## What is SCXML?

SCXML (State Chart XML) is a W3C standard that provides a generic state-machine based execution environment. It's used to control the logic of applications, from simple UI state management to complex business workflows and AI agent behavior.

## Features

- 🚀 **Full SCXML Support**: Complete implementation of W3C SCXML specification
- 🏗️ **Builder API**: Fluent, type-safe API for creating SCXML documents
- 🔧 **Modification API**: Programmatically modify existing SCXML documents
- ✅ **Validation**: Comprehensive validation with detailed error reporting
- 📝 **XML Serialization**: Convert SCXML documents back to XML
- 🎯 **TypeScript**: Full TypeScript support with complete type definitions
- ⚡ **Performance**: Efficient parsing and manipulation of large state machines
- 🧪 **Well Tested**: Comprehensive test suite with edge case coverage

## Installation

Install the package using npm or yarn:

```bash npm2yarn
npm install @scxml/parser
```

## Quick Example

Here's a simple example to get you started:

```typescript
import { SCXML } from "@scxml/parser";

// Create a simple state machine
const document = SCXML.create()
  .name("traffic-light")
  .initial("red")
  .addState(
    SCXML.state("red")
      .addTransition(SCXML.transition().event("timer").target("green").build())
      .build()
  )
  .addState(
    SCXML.state("green")
      .addTransition(SCXML.transition().event("timer").target("yellow").build())
      .build()
  )
  .addState(
    SCXML.state("yellow")
      .addTransition(SCXML.transition().event("timer").target("red").build())
      .build()
  )
  .build();

// Validate the document
const errors = SCXML.validate(document);
if (errors.length === 0) {
  console.log("Valid SCXML document!");
}

// Convert to XML
const xml = SCXML.serialize(document, { spaces: 2 });
console.log(xml);
```

## What's Next?

- [Learn the core concepts](./concepts) of SCXML and this library
- [See practical examples](./examples) to build your first state machine
- [Explore the API reference](../api) for detailed documentation
- [See more examples](./examples) for common use cases

## Need Help?

- 📚 Check out the [examples](./examples) section
- 🐛 Report issues on [GitHub](https://github.com/caweinshenker/scxml-js/issues)
- 💬 Ask questions on [Stack Overflow](https://stackoverflow.com/questions/tagged/scxml) with the `scxml` tag
