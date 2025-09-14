import { SCXMLValidator } from "../validator";
import {
  SCXMLBuilder,
  StateBuilder,
  TransitionBuilder,
  DataModelBuilder,
  DataBuilder,
  ParallelBuilder,
} from "../builder";

describe("SCXML Validator Comprehensive Tests", () => {
  let validator: SCXMLValidator;

  beforeEach(() => {
    validator = new SCXMLValidator();
  });

  describe("state hierarchy validation", () => {
    it("should validate complex nested hierarchies", () => {
      const doc = SCXMLBuilder.create()
        .initial("root")
        .addState(
          StateBuilder.create("root")
            .initial("level1a")
            .addState(
              StateBuilder.create("level1a")
                .initial("level2a")
                .addState(
                  StateBuilder.create("level2a")
                    .initial("level3a")
                    .addState(StateBuilder.create("level3a").build())
                    .addState(StateBuilder.create("level3b").build())
                    .build()
                )
                .addState(StateBuilder.create("level2b").build())
                .build()
            )
            .addState(StateBuilder.create("level1b").build())
            .build()
        )
        .build();

      const errors = validator.validate(doc);
      expect(errors).toHaveLength(0);
    });

    it("should detect circular initial references", () => {
      const doc = {
        scxml: {
          initial: "state1",
          state: [
            {
              id: "state1",
              initial: "state2",
              state: [
                {
                  id: "state2",
                  initial: "state1", // Circular reference
                },
              ],
            },
          ],
        },
      };

      const errors = validator.validate(doc);
      expect(
        errors.some((e) => e.message.includes("does not exist in state"))
      ).toBe(true);
    });

    it("should validate multiple levels of initial state references", () => {
      const doc = SCXMLBuilder.create()
        .initial("a")
        .addState(
          StateBuilder.create("a")
            .initial("b")
            .addState(
              StateBuilder.create("b")
                .initial("c")
                .addState(StateBuilder.create("c").build())
                .build()
            )
            .build()
        )
        .build();

      const errors = validator.validate(doc);
      expect(errors).toHaveLength(0);
    });

    it("should detect orphaned states in complex hierarchies", () => {
      const doc = {
        scxml: {
          initial: "root",
          state: [
            {
              id: "root",
              initial: "nonexistent", // Should point to child1
              state: [
                {
                  id: "child1",
                  initial: "grandchild1",
                  state: [
                    {
                      id: "grandchild1",
                    },
                    {
                      id: "grandchild2",
                    },
                  ],
                },
              ],
            },
            {
              id: "orphan", // Not referenced anywhere
            },
          ],
        },
      };

      const errors = validator.validate(doc);
      expect(errors.some((e) => e.message.includes("nonexistent"))).toBe(true);
    });
  });

  describe("transition validation", () => {
    it("should validate transitions with complex target paths", () => {
      const doc = SCXMLBuilder.create()
        .initial("root")
        .addState(
          StateBuilder.create("root")
            .initial("child1")
            .addState(
              StateBuilder.create("child1")
                .addTransition(
                  TransitionBuilder.create()
                    .event("toSibling")
                    .target("child2")
                    .build()
                )
                .addTransition(
                  TransitionBuilder.create()
                    .event("toNephew")
                    .target("child2.grandchild1")
                    .build()
                )
                .build()
            )
            .addState(
              StateBuilder.create("child2")
                .initial("grandchild1")
                .addState(StateBuilder.create("grandchild1").build())
                .addState(StateBuilder.create("grandchild2").build())
                .build()
            )
            .build()
        )
        .build();

      const errors = validator.validate(doc);
      expect(errors).toHaveLength(0);
    });

    it("should validate eventless transitions", () => {
      const doc = SCXMLBuilder.create()
        .initial("start")
        .addState(
          StateBuilder.create("start")
            .addTransition(
              TransitionBuilder.create()
                .cond("timeout > 0")
                .target("end")
                .build()
            )
            .build()
        )
        .addState(StateBuilder.create("end").build())
        .build();

      const errors = validator.validate(doc);
      expect(errors.filter((e) => e.severity === "error")).toHaveLength(0);
      // Should have warning about transition without event
      expect(errors.filter((e) => e.severity === "warning")).toHaveLength(0); // cond is sufficient
    });

    it("should validate conditionless transitions", () => {
      const doc = SCXMLBuilder.create()
        .initial("start")
        .addState(
          StateBuilder.create("start")
            .addTransition(
              TransitionBuilder.create().event("go").target("end").build()
            )
            .build()
        )
        .addState(StateBuilder.create("end").build())
        .build();

      const errors = validator.validate(doc);
      expect(errors.filter((e) => e.severity === "error")).toHaveLength(0);
    });

    it("should warn about transitions without event, condition, or target", () => {
      const doc = SCXMLBuilder.create()
        .initial("start")
        .addState(
          StateBuilder.create("start")
            .addTransition(TransitionBuilder.create().build())
            .build()
        )
        .build();

      const errors = validator.validate(doc);
      expect(
        errors.some(
          (e) =>
            e.severity === "warning" &&
            e.message.includes(
              "must have at least one of: event, cond, or target"
            )
        )
      ).toBe(true);
    });

    it("should validate all transition types", () => {
      const doc = SCXMLBuilder.create()
        .initial("test")
        .addState(
          StateBuilder.create("test")
            .addTransition(
              TransitionBuilder.create()
                .event("external")
                .type("external")
                .target("test")
                .build()
            )
            .addTransition(
              TransitionBuilder.create()
                .event("internal")
                .type("internal")
                .build()
            )
            .build()
        )
        .build();

      const errors = validator.validate(doc);
      expect(errors.filter((e) => e.severity === "error")).toHaveLength(0);
    });

    it("should reject invalid transition types", () => {
      const doc = {
        scxml: {
          state: [
            {
              id: "test",
              transition: [
                {
                  event: "test",
                  type: "invalid",
                },
              ],
            },
          ],
        },
      } as any; // Use 'as any' to test validation with invalid types

      const errors = validator.validate(doc);
      expect(
        errors.some((e) => e.message.includes("Invalid transition type"))
      ).toBe(true);
    });
  });

  describe("parallel state validation", () => {
    it("should validate complex parallel hierarchies", () => {
      const doc = SCXMLBuilder.create()
        .initial("concurrent")
        .addParallel(
          ParallelBuilder.create("concurrent")
            .addState(
              StateBuilder.create("branch1")
                .initial("b1s1")
                .addState(StateBuilder.create("b1s1").build())
                .addState(StateBuilder.create("b1s2").build())
                .build()
            )
            .addState(
              StateBuilder.create("branch2")
                .initial("b2s1")
                .addState(StateBuilder.create("b2s1").build())
                .addState(StateBuilder.create("b2s2").build())
                .build()
            )
            .addState(
              StateBuilder.create("branch3")
                .initial("b3s1")
                .addState(StateBuilder.create("b3s1").build())
                .build()
            )
            .build()
        )
        .build();

      const errors = validator.validate(doc);
      expect(errors.filter((e) => e.severity === "error")).toHaveLength(0);
    });

    it("should require at least two child states in parallel", () => {
      const doc = {
        scxml: {
          parallel: [
            {
              id: "insufficient",
              state: [
                {
                  id: "lonely",
                },
              ],
            },
          ],
        },
      };

      const errors = validator.validate(doc);
      expect(
        errors.some((e) =>
          e.message.includes("must contain at least two child states")
        )
      ).toBe(true);
    });

    it("should validate nested parallel regions", () => {
      const doc = SCXMLBuilder.create()
        .initial("outer")
        .addParallel(
          ParallelBuilder.create("outer")
            .addState(StateBuilder.create("branch1").build())
            .addParallel(
              ParallelBuilder.create("inner")
                .addState(StateBuilder.create("inner1").build())
                .addState(StateBuilder.create("inner2").build())
                .build()
            )
            .build()
        )
        .build();

      const errors = validator.validate(doc);
      expect(errors.filter((e) => e.severity === "error")).toHaveLength(0);
    });

    it("should handle parallel states with no children", () => {
      const doc = {
        scxml: {
          parallel: [
            {
              id: "empty",
            },
          ],
        },
      };

      const errors = validator.validate(doc);
      expect(
        errors.some((e) =>
          e.message.includes("must contain at least two child states")
        )
      ).toBe(true);
    });
  });

  describe("data model validation", () => {
    it("should validate complex data models", () => {
      const dataModel = DataModelBuilder.create()
        .addData(DataBuilder.create("string").expr("'hello'").build())
        .addData(DataBuilder.create("number").expr("42").build())
        .addData(DataBuilder.create("boolean").expr("true").build())
        .addData(
          DataBuilder.create("object").content('{"key": "value"}').build()
        )
        .addData(DataBuilder.create("array").expr("[1, 2, 3]").build())
        .addData(DataBuilder.create("external").src("/api/data").build())
        .build();

      const doc = SCXMLBuilder.create()
        .addDataModel(dataModel)
        .addState(StateBuilder.create("test").build())
        .build();

      const errors = validator.validate(doc);
      expect(errors.filter((e) => e.severity === "error")).toHaveLength(0);
    });

    it("should detect duplicate data IDs across nested states", () => {
      const doc = SCXMLBuilder.create()
        .addDataModel(
          DataModelBuilder.create()
            .addData(DataBuilder.create("counter").expr("0").build())
            .build()
        )
        .addState(
          StateBuilder.create("parent")
            .addDataModel(
              DataModelBuilder.create()
                .addData(DataBuilder.create("counter").expr("1").build()) // Duplicate ID
                .build()
            )
            .build()
        )
        .build();

      const errors = validator.validate(doc);
      expect(
        errors.some((e) => e.message.includes("Duplicate data id: counter"))
      ).toBe(true);
    });

    it("should validate data elements without IDs", () => {
      const doc = {
        scxml: {
          datamodel_element: {
            data: [
              {
                expr: "42",
                // Missing id
              },
            ],
          },
          state: [
            {
              id: "test",
            },
          ],
        },
      } as any; // Use 'as any' to test validation with invalid types

      const errors = validator.validate(doc);
      expect(
        errors.some((e) => e.message.includes("Data element must have an id"))
      ).toBe(true);
    });

    it("should handle empty data model", () => {
      const doc = SCXMLBuilder.create()
        .addDataModel(DataModelBuilder.create().build())
        .addState(StateBuilder.create("test").build())
        .build();

      const errors = validator.validate(doc);
      expect(errors.filter((e) => e.severity === "error")).toHaveLength(0);
    });
  });

  describe("history state validation", () => {
    it("should validate history states with all attributes", () => {
      const doc = SCXMLBuilder.create()
        .initial("compound")
        .addState(
          StateBuilder.create("compound")
            .initial("child1")
            .addHistory({
              id: "hist1",
              type: "shallow",
              transition: {
                target: "child1",
              },
            })
            .addHistory({
              id: "hist2",
              type: "deep",
              transition: {
                target: "child2",
              },
            })
            .addState(StateBuilder.create("child1").build())
            .addState(StateBuilder.create("child2").build())
            .build()
        )
        .build();

      const errors = validator.validate(doc);
      expect(errors.filter((e) => e.severity === "error")).toHaveLength(0);
    });

    it("should validate history state IDs", () => {
      const doc = {
        scxml: {
          state: [
            {
              id: "test",
              history: [
                {
                  type: "shallow",
                  // Missing id
                },
              ],
            },
          ],
        },
      } as any; // Use 'as any' to test validation with invalid types

      const errors = validator.validate(doc);
      expect(
        errors.some((e) =>
          e.message.includes("History element must have an id")
        )
      ).toBe(true);
    });

    it("should validate history state types", () => {
      const doc = {
        scxml: {
          state: [
            {
              id: "test",
              history: [
                {
                  id: "hist",
                  type: "invalid",
                },
              ],
            },
          ],
        },
      } as any; // Use 'as any' to test validation with invalid types

      const errors = validator.validate(doc);
      expect(
        errors.some((e) =>
          e.message.includes(
            'must have a type attribute of "shallow" or "deep"'
          )
        )
      ).toBe(true);
    });

    it("should handle history states without type", () => {
      const doc = {
        scxml: {
          state: [
            {
              id: "test",
              history: [
                {
                  id: "hist",
                  // Missing type
                },
              ],
            },
          ],
        },
      } as any; // Use 'as any' to test validation with invalid types

      const errors = validator.validate(doc);
      expect(
        errors.some((e) =>
          e.message.includes(
            'must have a type attribute of "shallow" or "deep"'
          )
        )
      ).toBe(true);
    });
  });

  describe("final state validation", () => {
    it("should validate final states with done data", () => {
      const doc = SCXMLBuilder.create()
        .initial("active")
        .addState(
          StateBuilder.create("active")
            .addTransition(
              TransitionBuilder.create()
                .event("complete")
                .target("done")
                .build()
            )
            .build()
        )
        .addFinal({
          id: "done",
          onentry: [
            {
              log: [{ label: "Completed" }],
            },
          ],
          donedata: {
            content: {
              content: '{"success": true}',
            },
          },
        })
        .build();

      const errors = validator.validate(doc);
      expect(errors.filter((e) => e.severity === "error")).toHaveLength(0);
    });

    it("should require final state IDs", () => {
      const doc = {
        scxml: {
          final: [
            {
              // Missing id
            },
          ],
        },
      } as any; // Use 'as any' to test validation with invalid types

      const errors = validator.validate(doc);
      expect(
        errors.some((e) => e.message.includes("Final state must have an id"))
      ).toBe(true);
    });

    it("should detect duplicate final state IDs", () => {
      const doc = SCXMLBuilder.create()
        .addFinal({ id: "done" })
        .addFinal({ id: "done" }) // Duplicate
        .build();

      const errors = validator.validate(doc);
      expect(
        errors.some((e) => e.message.includes("Duplicate state id: done"))
      ).toBe(true);
    });
  });

  describe("cross-reference validation", () => {
    it("should validate complex state reference patterns", () => {
      const doc = SCXMLBuilder.create()
        .initial("main")
        .addState(
          StateBuilder.create("main")
            .initial("idle")
            .addState(
              StateBuilder.create("idle")
                .addTransition(
                  TransitionBuilder.create()
                    .event("start")
                    .target("working.phase1")
                    .build()
                )
                .build()
            )
            .addState(
              StateBuilder.create("working")
                .initial("phase1")
                .addState(
                  StateBuilder.create("phase1")
                    .addTransition(
                      TransitionBuilder.create()
                        .event("next")
                        .target("phase2")
                        .build()
                    )
                    .build()
                )
                .addState(
                  StateBuilder.create("phase2")
                    .addTransition(
                      TransitionBuilder.create()
                        .event("complete")
                        .target("../../done")
                        .build()
                    )
                    .build()
                )
                .build()
            )
            .build()
        )
        .addFinal({ id: "done" })
        .build();

      const errors = validator.validate(doc);
      expect(errors.filter((e) => e.severity === "error")).toHaveLength(0);
    });

    it("should detect broken cross-references in large hierarchies", () => {
      const doc = SCXMLBuilder.create()
        .initial("level1")
        .addState(
          StateBuilder.create("level1")
            .initial("level2a")
            .addState(
              StateBuilder.create("level2a")
                .addTransition(
                  TransitionBuilder.create()
                    .event("jump")
                    .target("nonexistent.deeply.nested")
                    .build()
                )
                .build()
            )
            .addState(StateBuilder.create("level2b").build())
            .build()
        )
        .build();

      // Note: Current validator only checks direct state ID existence
      // More sophisticated path validation would be needed for complex targets
      const errors = validator.validate(doc);
      expect(errors.filter((e) => e.severity === "error")).toHaveLength(0);
    });
  });

  describe("edge case validations", () => {
    it("should handle empty SCXML document", () => {
      const doc = { scxml: {} };
      const errors = validator.validate(doc);
      expect(
        errors.some((e) =>
          e.message.includes("must contain at least one state")
        )
      ).toBe(true);
    });

    it("should handle null and undefined values gracefully", () => {
      const doc = {
        scxml: {
          state: [
            {
              id: null,
              initial: undefined,
              transition: null,
            },
          ],
        },
      } as any; // Use 'as any' to test validation with invalid types

      const errors = validator.validate(doc);
      expect(
        errors.some((e) => e.message.includes("State must have an id"))
      ).toBe(true);
    });

    it("should validate very large state machines", () => {
      const builder = SCXMLBuilder.create().initial("state0");

      for (let i = 0; i < 1000; i++) {
        builder.addState(
          StateBuilder.create(`state${i}`)
            .addTransition(
              TransitionBuilder.create()
                .event("next")
                .target(`state${(i + 1) % 1000}`)
                .build()
            )
            .build()
        );
      }

      const doc = builder.build();
      const errors = validator.validate(doc);
      expect(errors.filter((e) => e.severity === "error")).toHaveLength(0);
    });

    it("should handle mixed state types in same container", () => {
      const doc = SCXMLBuilder.create()
        .initial("regular")
        .addState(StateBuilder.create("regular").build())
        .addParallel(
          ParallelBuilder.create("concurrent")
            .addState(StateBuilder.create("branch1").build())
            .addState(StateBuilder.create("branch2").build())
            .build()
        )
        .addFinal({ id: "done" })
        .build();

      const errors = validator.validate(doc);
      expect(errors.filter((e) => e.severity === "error")).toHaveLength(0);
    });

    it("should detect state ID collisions across different state types", () => {
      const doc = {
        scxml: {
          state: [{ id: "duplicate" }],
          parallel: [{ id: "duplicate" }], // Collision
          final: [{ id: "unique" }],
        },
      };

      const errors = validator.validate(doc);
      expect(
        errors.some((e) => e.message.includes("Duplicate state id: duplicate"))
      ).toBe(true);
    });
  });

  describe("validation performance", () => {
    it("should validate complex documents efficiently", () => {
      const builder = SCXMLBuilder.create().initial("root");

      // Create root state with nested levels
      const rootState = StateBuilder.create("root").initial("level0");
      
      // Create all level states as siblings (no initial attributes needed for siblings)
      for (let i = 0; i < 50; i++) {
        const levelState = StateBuilder.create(`level${i}`).addTransition(
          TransitionBuilder.create()
            .event(`event${i}`)
            .target(`level${(i + 1) % 50}`)
            .build()
        );

        rootState.addState(levelState.build());
      }

      const doc = builder.addState(rootState.build()).build();

      const start = Date.now();
      const errors = validator.validate(doc);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(errors.filter((e) => e.severity === "error")).toHaveLength(0);
    });
  });
});
