---
sidebar_position: 3
---

# Examples

This page provides practical examples of using the SCXML TypeScript Parser for common scenarios.

## Simple State Machine

A basic on/off toggle state machine:

```typescript
import { SCXML } from "@scxml/parser";

const toggleMachine = SCXML.create()
  .name("toggle")
  .initial("off")
  .addState(
    SCXML.state("off")
      .addTransition(SCXML.transition().event("toggle").target("on").build())
      .build()
  )
  .addState(
    SCXML.state("on")
      .addTransition(SCXML.transition().event("toggle").target("off").build())
      .build()
  )
  .build();

const xml = SCXML.serialize(toggleMachine);
console.log(xml);
```

## User Authentication Flow

A more complex state machine modeling user authentication:

```typescript
import { SCXML } from "@scxml/parser";

const authMachine = SCXML.create()
  .name("authentication")
  .initial("logged-out")
  .addDataModel(
    SCXML.dataModel()
      .addData(SCXML.data("attempts").expr("0").build())
      .addData(SCXML.data("maxAttempts").expr("3").build())
      .build()
  )
  .addState(
    SCXML.state("logged-out")
      .addTransition(
        SCXML.transition().event("login").target("checking").build()
      )
      .build()
  )
  .addState(
    SCXML.state("checking")
      .addOnEntry(
        SCXML.onEntry().addLog({ label: "Checking credentials..." }).build()
      )
      .addTransition(
        SCXML.transition()
          .event("success")
          .target("logged-in")
          .addAssign({ location: "attempts", expr: "0" })
          .build()
      )
      .addTransition(
        SCXML.transition()
          .event("failure")
          .cond("attempts < maxAttempts")
          .target("logged-out")
          .addAssign({ location: "attempts", expr: "attempts + 1" })
          .build()
      )
      .addTransition(
        SCXML.transition()
          .event("failure")
          .cond("attempts >= maxAttempts")
          .target("locked")
          .build()
      )
      .build()
  )
  .addState(
    SCXML.state("logged-in")
      .addTransition(
        SCXML.transition().event("logout").target("logged-out").build()
      )
      .build()
  )
  .addState(
    SCXML.state("locked")
      .addOnEntry(
        SCXML.onEntry()
          .addLog({ label: "Account locked due to too many attempts" })
          .build()
      )
      .build()
  )
  .build();
```

## Parsing Existing SCXML

Working with existing SCXML documents:

```typescript
import { SCXML } from "@scxml/parser";

const xmlString = `
<scxml initial="idle" xmlns="http://www.w3.org/2005/07/scxml">
  <state id="idle">
    <transition event="start" target="active"/>
  </state>
  <state id="active">
    <transition event="stop" target="idle"/>
    <transition event="pause" target="paused"/>
  </state>
  <state id="paused">
    <transition event="resume" target="active"/>
    <transition event="stop" target="idle"/>
  </state>
</scxml>`;

// Parse the XML
const document = SCXML.parse(xmlString);

// Validate the parsed document
const errors = SCXML.validate(document);
if (errors.length > 0) {
  console.log("Validation errors:", errors);
}

// Modify the document
const modifier = SCXML.modify(document)
  .addState(
    SCXML.state("error")
      .addOnEntry(
        SCXML.onEntry().addLog({ label: "Error state entered" }).build()
      )
      .build()
  )
  .addTransitionToState(
    "active",
    SCXML.transition().event("error").target("error").build()
  );

const modifiedDocument = modifier.getDocument();
```

## Parallel States

Modeling concurrent behavior with parallel states:

```typescript
import { SCXML } from "@scxml/parser";

const mediaPlayerMachine = SCXML.create()
  .name("media-player")
  .initial("player")
  .addState(
    SCXML.state("player")
      .addParallel(
        SCXML.parallel("main")
          .addState(
            SCXML.state("playback")
              .initial("stopped")
              .addState(
                SCXML.state("stopped")
                  .addTransition(
                    SCXML.transition().event("play").target("playing").build()
                  )
                  .build()
              )
              .addState(
                SCXML.state("playing")
                  .addTransition(
                    SCXML.transition().event("pause").target("paused").build()
                  )
                  .addTransition(
                    SCXML.transition().event("stop").target("stopped").build()
                  )
                  .build()
              )
              .addState(
                SCXML.state("paused")
                  .addTransition(
                    SCXML.transition().event("play").target("playing").build()
                  )
                  .addTransition(
                    SCXML.transition().event("stop").target("stopped").build()
                  )
                  .build()
              )
              .build()
          )
          .addState(
            SCXML.state("volume")
              .initial("medium")
              .addState(
                SCXML.state("muted")
                  .addTransition(
                    SCXML.transition().event("unmute").target("medium").build()
                  )
                  .build()
              )
              .addState(
                SCXML.state("low")
                  .addTransition(
                    SCXML.transition()
                      .event("volume.up")
                      .target("medium")
                      .build()
                  )
                  .addTransition(
                    SCXML.transition().event("mute").target("muted").build()
                  )
                  .build()
              )
              .addState(
                SCXML.state("medium")
                  .addTransition(
                    SCXML.transition().event("volume.up").target("high").build()
                  )
                  .addTransition(
                    SCXML.transition()
                      .event("volume.down")
                      .target("low")
                      .build()
                  )
                  .addTransition(
                    SCXML.transition().event("mute").target("muted").build()
                  )
                  .build()
              )
              .addState(
                SCXML.state("high")
                  .addTransition(
                    SCXML.transition()
                      .event("volume.down")
                      .target("medium")
                      .build()
                  )
                  .addTransition(
                    SCXML.transition().event("mute").target("muted").build()
                  )
                  .build()
              )
              .build()
          )
          .build()
      )
      .build()
  )
  .build();
```

## Working with Data Models

Using data models and expressions:

```typescript
import { SCXML } from "@scxml/parser";

const counterMachine = SCXML.create()
  .name("counter")
  .datamodel("ecmascript")
  .initial("active")
  .addDataModel(
    SCXML.dataModel()
      .addData(SCXML.data("count").expr("0").build())
      .addData(SCXML.data("step").expr("1").build())
      .build()
  )
  .addState(
    SCXML.state("active")
      .addTransition(
        SCXML.transition()
          .event("increment")
          .addAssign({ location: "count", expr: "count + step" })
          .build()
      )
      .addTransition(
        SCXML.transition()
          .event("decrement")
          .addAssign({ location: "count", expr: "count - step" })
          .build()
      )
      .addTransition(
        SCXML.transition()
          .event("reset")
          .addAssign({ location: "count", expr: "0" })
          .build()
      )
      .addTransition(
        SCXML.transition()
          .event("set.step")
          .addAssign({ location: "step", expr: "_event.data.value" })
          .build()
      )
      .build()
  )
  .build();
```

## Error Handling and Validation

Comprehensive error handling:

```typescript
import { SCXML } from "@scxml/parser";

try {
  const document = SCXML.parse(xmlString);

  // Validate the document
  const errors = SCXML.validate(document);

  if (errors.length > 0) {
    console.log("Validation errors found:");
    errors.forEach((error) => {
      console.log(`- ${error.severity}: ${error.message} at ${error.path}`);
    });
  }

  // Continue with valid document...
  const xml = SCXML.serialize(document, {
    format: true,
    indentBy: "  ",
  });
} catch (parseError) {
  console.error("Parse error:", parseError.message);
}
```

## Next Steps

- Check out the [API Reference](../api) for complete method documentation
- Learn more about [SCXML concepts](./concepts)
- Explore the [GitHub repository](https://github.com/caweinshenker/scxml-js) for more examples
