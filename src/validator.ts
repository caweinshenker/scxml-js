import {
  SCXMLDocument,
  SCXMLElement,
  StateElement,
  ParallelElement,
  FinalElement,
} from "./types";

export interface ValidationError {
  message: string;
  path: string;
  severity: "error" | "warning";
}

export class SCXMLValidator {
  private errors: ValidationError[] = [];
  private dataIds: Set<string> = new Set();

  validate(document: SCXMLDocument): ValidationError[] {
    this.errors = [];
    this.dataIds = new Set();
    this.validateScxmlElement(document.scxml, "scxml");
    return this.errors;
  }

  private addError(
    message: string,
    path: string,
    severity: "error" | "warning" = "error"
  ): void {
    this.errors.push({ message, path, severity });
  }

  private validateScxmlElement(element: SCXMLElement, path: string): void {
    if (!element.state && !element.parallel && !element.final) {
      this.addError(
        "SCXML document must contain at least one state, parallel, or final element",
        path
      );
    }

    const stateIds = new Set<string>();

    element.state?.forEach((state, index) => {
      this.validateStateElement(state, `${path}.state[${index}]`, stateIds);
    });

    element.parallel?.forEach((parallel, index) => {
      this.validateParallelElement(
        parallel,
        `${path}.parallel[${index}]`,
        stateIds
      );
    });

    element.final?.forEach((finalState, index) => {
      this.validateFinalElement(
        finalState,
        `${path}.final[${index}]`,
        stateIds
      );
    });

    if (element.initial) {
      if (!stateIds.has(element.initial)) {
        this.addError(
          `Initial state "${element.initial}" does not exist`,
          path
        );
      }
    }

    if (element.datamodel_element) {
      this.validateDataModel(element.datamodel_element, `${path}.datamodel`);
    }
  }

  private validateStateElement(
    state: StateElement,
    path: string,
    stateIds: Set<string>
  ): void {
    if (!state.id) {
      this.addError("State must have an id attribute", path);
      return;
    }

    if (stateIds.has(state.id)) {
      this.addError(`Duplicate state id: ${state.id}`, path);
    } else {
      stateIds.add(state.id);
    }

    // First collect child state IDs
    const childStateIds = new Set<string>();

    state.state?.forEach((childState) => {
      if (childState.id) {
        childStateIds.add(childState.id);
      }
    });

    state.parallel?.forEach((parallel) => {
      if (parallel.id) {
        childStateIds.add(parallel.id);
      }
    });

    state.final?.forEach((finalState) => {
      if (finalState.id) {
        childStateIds.add(finalState.id);
      }
    });

    // Validate initial state reference
    if (state.initial) {
      if (childStateIds.size === 0) {
        this.addError(
          `Initial state "${state.initial}" does not exist in state "${state.id}" (no child states)`,
          path
        );
      } else if (!childStateIds.has(state.initial)) {
        this.addError(
          `Initial state "${state.initial}" does not exist in state "${state.id}"`,
          path
        );
      }
    }

    // Now validate child elements
    state.state?.forEach((childState, index) => {
      this.validateStateElement(
        childState,
        `${path}.state[${index}]`,
        stateIds
      );
    });

    state.parallel?.forEach((parallel, index) => {
      this.validateParallelElement(
        parallel,
        `${path}.parallel[${index}]`,
        stateIds
      );
    });

    state.final?.forEach((finalState, index) => {
      this.validateFinalElement(
        finalState,
        `${path}.final[${index}]`,
        stateIds
      );
    });

    if (state.transition) {
      state.transition.forEach((transition, index) => {
        this.validateTransition(transition, `${path}.transition[${index}]`);
      });
    }

    if (state.datamodel) {
      this.validateDataModel(state.datamodel, `${path}.datamodel`);
    }

    state.history?.forEach((history, index) => {
      this.validateHistory(history, `${path}.history[${index}]`);
    });
  }

  private validateParallelElement(
    parallel: ParallelElement,
    path: string,
    stateIds: Set<string>
  ): void {
    if (!parallel.id) {
      this.addError("Parallel element must have an id attribute", path);
      return;
    }

    if (stateIds.has(parallel.id)) {
      this.addError(`Duplicate state id: ${parallel.id}`, path);
    } else {
      stateIds.add(parallel.id);
    }

    // Count all child states (state + parallel)
    const childCount =
      (parallel.state?.length || 0) + (parallel.parallel?.length || 0);
    if (childCount < 2) {
      this.addError(
        "Parallel element must contain at least two child states",
        path
      );
    }

    const childStateIds = new Set<string>();

    parallel.state?.forEach((childState, index) => {
      this.validateStateElement(
        childState,
        `${path}.state[${index}]`,
        childStateIds
      );
    });

    parallel.parallel?.forEach((childParallel, index) => {
      this.validateParallelElement(
        childParallel,
        `${path}.parallel[${index}]`,
        childStateIds
      );
    });

    if (parallel.transition) {
      parallel.transition.forEach((transition, index) => {
        this.validateTransition(transition, `${path}.transition[${index}]`);
      });
    }

    if (parallel.datamodel) {
      this.validateDataModel(parallel.datamodel, `${path}.datamodel`);
    }
  }

  private validateFinalElement(
    finalState: FinalElement,
    path: string,
    stateIds: Set<string>
  ): void {
    if (!finalState.id) {
      this.addError("Final state must have an id attribute", path);
      return;
    }

    if (stateIds.has(finalState.id)) {
      this.addError(`Duplicate state id: ${finalState.id}`, path);
    } else {
      stateIds.add(finalState.id);
    }
  }

  private validateTransition(transition: any, path: string): void {
    if (
      transition.type &&
      !["internal", "external"].includes(transition.type)
    ) {
      this.addError(`Invalid transition type: ${transition.type}`, path);
    }

    if (!transition.event && !transition.cond && !transition.target) {
      this.addError(
        "Transition must have at least one of: event, cond, or target",
        path,
        "warning"
      );
    }
  }

  private validateDataModel(datamodel: any, path: string): void {
    if (datamodel.data) {
      datamodel.data.forEach((data: any, index: number) => {
        if (!data.id) {
          this.addError(
            "Data element must have an id attribute",
            `${path}.data[${index}]`
          );
        } else if (this.dataIds.has(data.id)) {
          this.addError(
            `Duplicate data id: ${data.id}`,
            `${path}.data[${index}]`
          );
        } else {
          this.dataIds.add(data.id);
        }
      });
    }
  }

  private validateHistory(history: any, path: string): void {
    if (!history.id) {
      this.addError("History element must have an id attribute", path);
    }

    if (!history.type || !["shallow", "deep"].includes(history.type)) {
      this.addError(
        'History element must have a type attribute of "shallow" or "deep"',
        path
      );
    }
  }
}
