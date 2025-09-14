import { SCXMLValidator } from "../validator";
import {
  SCXMLBuilder,
  StateBuilder,
  TransitionBuilder,
  DataModelBuilder,
  DataBuilder,
} from "../builder";

describe("SCXML Validator", () => {
  let validator: SCXMLValidator;

  beforeEach(() => {
    validator = new SCXMLValidator();
  });

  describe("valid documents", () => {
    it("should validate a simple state machine", () => {
      const doc = SCXMLBuilder.create()
        .name("simple-machine")
        .initial("idle")
        .addState(StateBuilder.create("idle").build())
        .addState(StateBuilder.create("active").build())
        .build();

      const errors = validator.validate(doc);
      expect(errors).toHaveLength(0);
    });

    it("should validate state machine with transitions", () => {
      const doc = SCXMLBuilder.create()
        .initial("idle")
        .addState(
          StateBuilder.create("idle")
            .addTransition(
              TransitionBuilder.create().event("start").target("active").build()
            )
            .build()
        )
        .addState(StateBuilder.create("active").build())
        .build();

      const errors = validator.validate(doc);
      expect(errors).toHaveLength(0);
    });
  });

  describe("invalid documents", () => {
    it("should reject empty SCXML document", () => {
      const doc = SCXMLBuilder.create().build();
      const errors = validator.validate(doc);

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("must contain at least one state");
      expect(errors[0].severity).toBe("error");
    });

    it("should reject states without ids", () => {
      const doc = {
        scxml: {
          state: [{ id: "" }] as any,
        },
      };

      const errors = validator.validate(doc);
      expect(
        errors.some((e) => e.message.includes("State must have an id"))
      ).toBe(true);
    });

    it("should reject duplicate state ids", () => {
      const doc = SCXMLBuilder.create()
        .addState(StateBuilder.create("duplicate").build())
        .addState(StateBuilder.create("duplicate").build())
        .build();

      const errors = validator.validate(doc);
      expect(
        errors.some((e) => e.message.includes("Duplicate state id: duplicate"))
      ).toBe(true);
    });

    it("should reject invalid initial state reference", () => {
      const doc = SCXMLBuilder.create()
        .initial("nonexistent")
        .addState(StateBuilder.create("idle").build())
        .build();

      const errors = validator.validate(doc);
      expect(
        errors.some((e) =>
          e.message.includes('Initial state "nonexistent" does not exist')
        )
      ).toBe(true);
    });

    it("should reject invalid nested initial state reference", () => {
      const doc = SCXMLBuilder.create()
        .addState(
          StateBuilder.create("parent")
            .initial("nonexistent-child")
            .addState(StateBuilder.create("child").build())
            .build()
        )
        .build();

      const errors = validator.validate(doc);
      expect(
        errors.some((e) =>
          e.message.includes('Initial state "nonexistent-child" does not exist')
        )
      ).toBe(true);
    });

    it("should reject parallel states with insufficient children", () => {
      const doc = {
        scxml: {
          parallel: [
            {
              id: "insufficient",
              state: [{ id: "only-one" }],
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

    it("should reject invalid transition types", () => {
      const doc = SCXMLBuilder.create()
        .addState(
          StateBuilder.create("test")
            .addTransition({
              type: "invalid" as any,
              target: "somewhere",
            })
            .build()
        )
        .build();

      const errors = validator.validate(doc);
      expect(
        errors.some((e) => e.message.includes("Invalid transition type"))
      ).toBe(true);
    });

    it("should warn about transitions without events, conditions, or targets", () => {
      const doc = SCXMLBuilder.create()
        .addState(StateBuilder.create("test").addTransition({}).build())
        .build();

      const errors = validator.validate(doc);
      expect(
        errors.some(
          (e) =>
            e.message.includes(
              "must have at least one of: event, cond, or target"
            ) && e.severity === "warning"
        )
      ).toBe(true);
    });

    it("should reject duplicate data ids", () => {
      const dataModel = DataModelBuilder.create()
        .addData(DataBuilder.create("duplicate").expr("1").build())
        .addData(DataBuilder.create("duplicate").expr("2").build())
        .build();

      const doc = SCXMLBuilder.create()
        .addDataModel(dataModel)
        .addState(StateBuilder.create("test").build())
        .build();

      const errors = validator.validate(doc);
      expect(
        errors.some((e) => e.message.includes("Duplicate data id: duplicate"))
      ).toBe(true);
    });

    it("should reject history elements without required attributes", () => {
      const doc = {
        scxml: {
          state: [
            {
              id: "test",
              history: [
                {
                  id: "",
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
          e.message.includes("History element must have an id")
        )
      ).toBe(true);
      expect(
        errors.some((e) =>
          e.message.includes(
            'must have a type attribute of "shallow" or "deep"'
          )
        )
      ).toBe(true);
    });
  });

  describe("complex validation scenarios", () => {
    it("should validate deeply nested state hierarchy", () => {
      const doc = SCXMLBuilder.create()
        .initial("level1")
        .addState(
          StateBuilder.create("level1")
            .initial("level2a")
            .addState(
              StateBuilder.create("level2a")
                .initial("level3")
                .addState(StateBuilder.create("level3").build())
                .build()
            )
            .addState(StateBuilder.create("level2b").build())
            .build()
        )
        .build();

      const errors = validator.validate(doc);
      expect(errors).toHaveLength(0);
    });

    it("should catch errors in deeply nested states", () => {
      const doc = {
        scxml: {
          initial: "level1",
          state: [
            {
              id: "level1",
              initial: "nonexistent",
              state: [
                {
                  id: "level2",
                  state: [
                    {
                      id: "duplicate",
                    },
                    {
                      id: "duplicate",
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const errors = validator.validate(doc);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((e) =>
          e.message.includes('does not exist in state "level1"')
        )
      ).toBe(true);
      expect(
        errors.some((e) => e.message.includes("Duplicate state id: duplicate"))
      ).toBe(true);
    });
  });
});
