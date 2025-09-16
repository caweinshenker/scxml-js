import {
  SCXMLDocument,
  SCXMLElement,
  StateElement,
  ParallelElement,
  FinalElement,
  TransitionElement,
  OnEntryElement,
  OnExitElement,
  DataModelElement,
  DataElement,
  InvokeElement,
  HistoryElement,
} from "./types";
import { SCXMLValidator, ValidationError } from "./validator";

export class SCXMLModifier {
  private document: SCXMLDocument;
  private validator: SCXMLValidator;
  private validateOnModify: boolean;

  constructor(document: SCXMLDocument, validateOnModify: boolean = true) {
    this.document = document; // Don't copy - operate directly on the document
    this.validator = new SCXMLValidator();
    this.validateOnModify = validateOnModify;

    // Validate the initial document
    if (this.validateOnModify) {
      this.validateDocument("Initial document is invalid");
    }
  }

  /**
   * Validate the current document and throw an error if invalid
   */
  private validateDocument(
    errorPrefix: string = "Document validation failed"
  ): void {
    const errors = this.validator.validate(this.document);
    if (errors.length > 0) {
      const errorMessages = errors
        .map((e) => `${e.path}: ${e.message}`)
        .join("; ");
      throw new Error(`${errorPrefix}: ${errorMessages}`);
    }
  }

  /**
   * Execute a modification function with validation
   */
  private withValidation<T>(operation: () => T, operationName: string): T {
    if (!this.validateOnModify) {
      return operation();
    }

    // Create a backup of just the scxml content
    const backup = JSON.parse(JSON.stringify(this.document.scxml));

    try {
      const result = operation();

      // Validate after modification
      this.validateDocument(`${operationName} resulted in invalid document`);

      return result;
    } catch (error) {
      // Restore backup on any error
      this.document.scxml = backup;
      throw error;
    }
  }

  /**
   * Disable validation for bulk operations (use with caution)
   */
  disableValidation(): this {
    this.validateOnModify = false;
    return this;
  }

  /**
   * Re-enable validation and validate current state
   */
  enableValidation(): this {
    this.validateOnModify = true;
    this.validateDocument("Document state is invalid when enabling validation");
    return this;
  }

  static from(document: SCXMLDocument): SCXMLModifier {
    return new SCXMLModifier(document);
  }

  getDocument(): SCXMLDocument {
    return JSON.parse(JSON.stringify(this.document));
  }

  setName(name: string): this {
    return this.withValidation(() => {
      this.document.scxml.name = name;
      return this;
    }, "setName");
  }

  setInitial(initial: string): this {
    return this.withValidation(() => {
      this.document.scxml.initial = initial;
      return this;
    }, "setInitial");
  }

  setDatamodel(datamodel: string): this {
    return this.withValidation(() => {
      this.document.scxml.datamodel = datamodel;
      return this;
    }, "setDatamodel");
  }

  addState(state: StateElement): this {
    return this.withValidation(() => {
      if (!this.document.scxml.state) {
        this.document.scxml.state = [];
      }
      this.document.scxml.state.push(JSON.parse(JSON.stringify(state)));
      return this;
    }, "addState");
  }

  removeState(stateId: string): this {
    if (this.document.scxml.state) {
      this.document.scxml.state = this.document.scxml.state.filter(
        (s) => s.id !== stateId
      );
      this.removeStateRecursive(this.document.scxml.state, stateId);
    }
    return this;
  }

  private removeStateRecursive(states: StateElement[], stateId: string): void {
    states.forEach((state) => {
      if (state.state) {
        state.state = state.state.filter((s) => s.id !== stateId);
        this.removeStateRecursive(state.state, stateId);
      }
    });
  }

  updateState(
    stateId: string,
    updater: (state: StateElement) => StateElement
  ): this {
    this.updateStateRecursive(
      this.document.scxml.state || [],
      stateId,
      updater
    );
    this.updateStateInParallels(
      this.document.scxml.parallel || [],
      stateId,
      updater
    );
    return this;
  }

  private updateStateRecursive(
    states: StateElement[],
    stateId: string,
    updater: (state: StateElement) => StateElement
  ): boolean {
    for (let i = 0; i < states.length; i++) {
      if (states[i].id === stateId) {
        states[i] = updater(JSON.parse(JSON.stringify(states[i])));
        return true;
      }
      if (
        states[i].state &&
        this.updateStateRecursive(states[i].state!, stateId, updater)
      ) {
        return true;
      }
      if (
        states[i].parallel &&
        this.updateStateInParallels(states[i].parallel!, stateId, updater)
      ) {
        return true;
      }
    }
    return false;
  }

  private updateStateInParallels(
    parallels: ParallelElement[],
    stateId: string,
    updater: (state: StateElement) => StateElement
  ): boolean {
    for (let i = 0; i < parallels.length; i++) {
      // Check if this parallel element matches the stateId
      if (parallels[i].id === stateId) {
        // Cast ParallelElement to StateElement for the updater
        const updatedParallel = updater(parallels[i] as any);
        parallels[i] = updatedParallel as any;
        return true;
      }
      if (
        parallels[i].state &&
        this.updateStateRecursive(parallels[i].state!, stateId, updater)
      ) {
        return true;
      }
      if (
        parallels[i].parallel &&
        this.updateStateInParallels(parallels[i].parallel!, stateId, updater)
      ) {
        return true;
      }
    }
    return false;
  }

  findState(stateId: string): StateElement | undefined {
    return (
      this.findStateRecursive(this.document.scxml.state || [], stateId) ||
      this.findStateInParallels(this.document.scxml.parallel || [], stateId)
    );
  }

  private findStateRecursive(
    states: StateElement[],
    stateId: string
  ): StateElement | undefined {
    for (const state of states) {
      if (state.id === stateId) {
        return state;
      }
      if (state.state) {
        const found = this.findStateRecursive(state.state, stateId);
        if (found) return found;
      }
      if (state.parallel) {
        const found = this.findStateInParallels(state.parallel, stateId);
        if (found) return found;
      }
    }
    return undefined;
  }

  private findStateInParallels(
    parallels: ParallelElement[],
    stateId: string
  ): StateElement | undefined {
    for (const parallel of parallels) {
      // Check if this parallel element matches the stateId
      if (parallel.id === stateId) {
        // Return ParallelElement cast as StateElement
        return parallel as any;
      }
      if (parallel.state) {
        const found = this.findStateRecursive(parallel.state, stateId);
        if (found) return found;
      }
      if (parallel.parallel) {
        const found = this.findStateInParallels(parallel.parallel, stateId);
        if (found) return found;
      }
    }
    return undefined;
  }

  addTransitionToState(stateId: string, transition: TransitionElement): this {
    return this.updateState(stateId, (state) => {
      if (!state.transition) {
        state.transition = [];
      }
      state.transition.push(JSON.parse(JSON.stringify(transition)));
      return state;
    });
  }

  removeTransitionFromState(
    stateId: string,
    predicate: (transition: TransitionElement) => boolean
  ): this {
    return this.updateState(stateId, (state) => {
      if (state.transition) {
        state.transition = state.transition.filter((t) => !predicate(t));
      }
      return state;
    });
  }

  updateTransitionInState(
    stateId: string,
    predicate: (transition: TransitionElement) => boolean,
    updater: (transition: TransitionElement) => TransitionElement
  ): this {
    return this.updateState(stateId, (state) => {
      if (state.transition) {
        state.transition = state.transition.map((t) =>
          predicate(t) ? updater(JSON.parse(JSON.stringify(t))) : t
        );
      }
      return state;
    });
  }

  addOnEntryToState(stateId: string, onEntry: OnEntryElement): this {
    return this.updateState(stateId, (state) => {
      if (!state.onentry) {
        state.onentry = [];
      }
      state.onentry.push(JSON.parse(JSON.stringify(onEntry)));
      return state;
    });
  }

  addOnExitToState(stateId: string, onExit: OnExitElement): this {
    return this.updateState(stateId, (state) => {
      if (!state.onexit) {
        state.onexit = [];
      }
      state.onexit.push(JSON.parse(JSON.stringify(onExit)));
      return state;
    });
  }

  addInvokeToState(stateId: string, invoke: InvokeElement): this {
    return this.updateState(stateId, (state) => {
      if (!state.invoke) {
        state.invoke = [];
      }
      state.invoke.push(JSON.parse(JSON.stringify(invoke)));
      return state;
    });
  }

  setStateDataModel(stateId: string, dataModel: DataModelElement): this {
    return this.updateState(stateId, (state) => {
      state.datamodel = JSON.parse(JSON.stringify(dataModel));
      return state;
    });
  }

  addDataToModel(data: DataElement): this {
    if (!this.document.scxml.datamodel_element) {
      this.document.scxml.datamodel_element = {};
    }
    if (!this.document.scxml.datamodel_element.data) {
      this.document.scxml.datamodel_element.data = [];
    }
    this.document.scxml.datamodel_element.data.push(
      JSON.parse(JSON.stringify(data))
    );
    return this;
  }

  updateDataInModel(
    dataId: string,
    updater: (data: DataElement) => DataElement
  ): this {
    if (this.document.scxml.datamodel_element?.data) {
      this.document.scxml.datamodel_element.data =
        this.document.scxml.datamodel_element.data.map((d) =>
          d.id === dataId ? updater(JSON.parse(JSON.stringify(d))) : d
        );
    }
    return this;
  }

  removeDataFromModel(dataId: string): this {
    if (this.document.scxml.datamodel_element?.data) {
      this.document.scxml.datamodel_element.data =
        this.document.scxml.datamodel_element.data.filter(
          (d) => d.id !== dataId
        );
    }
    return this;
  }

  renameState(oldId: string, newId: string): this {
    this.updateState(oldId, (state) => {
      state.id = newId;
      return state;
    });

    this.updateAllTransitionTargets(oldId, newId);
    this.updateInitialReferences(oldId, newId);

    return this;
  }

  private updateAllTransitionTargets(
    oldTarget: string,
    newTarget: string
  ): void {
    const updateTransitionTarget = (transition: any) => {
      if (transition.target) {
        // Handle exact matches
        if (transition.target === oldTarget) {
          transition.target = newTarget;
        }
        // Handle hierarchical path references (e.g., "../../level1alt" when renaming "level1alt")
        else if (transition.target.endsWith("/" + oldTarget)) {
          transition.target = transition.target.replace(
            "/" + oldTarget,
            "/" + newTarget
          );
        }
        // Handle path that is exactly the old target after navigation (e.g., "../level1alt")
        else if (
          transition.target.endsWith(oldTarget) &&
          (transition.target.endsWith("/" + oldTarget) ||
            transition.target.startsWith("../"))
        ) {
          const prefix = transition.target.substring(
            0,
            transition.target.length - oldTarget.length
          );
          transition.target = prefix + newTarget;
        }
      }
    };

    this.walkAllStates((state) => {
      if (state.transition) {
        state.transition.forEach(updateTransitionTarget);
      }
    });

    this.walkAllParallels((parallel) => {
      if (parallel.transition) {
        parallel.transition.forEach(updateTransitionTarget);
      }
    });
  }

  private updateInitialReferences(oldId: string, newId: string): void {
    if (this.document.scxml.initial === oldId) {
      this.document.scxml.initial = newId;
    }

    this.walkAllStates((state) => {
      if (state.initial === oldId) {
        state.initial = newId;
      }
    });
  }

  private walkAllStates(callback: (state: StateElement) => void): void {
    const walk = (states: StateElement[]) => {
      states.forEach((state) => {
        callback(state);
        if (state.state) walk(state.state);
        if (state.parallel) {
          state.parallel.forEach((p) => {
            if (p.state) walk(p.state);
          });
        }
      });
    };

    if (this.document.scxml.state) {
      walk(this.document.scxml.state);
    }
  }

  private walkAllParallels(
    callback: (parallel: ParallelElement) => void
  ): void {
    const walk = (parallels: ParallelElement[]) => {
      parallels.forEach((parallel) => {
        callback(parallel);
        if (parallel.state) {
          parallel.state.forEach((s) => {
            if (s.parallel) walk(s.parallel);
          });
        }
        if (parallel.parallel) walk(parallel.parallel);
      });
    };

    if (this.document.scxml.parallel) {
      walk(this.document.scxml.parallel);
    }
  }

  getAllStateIds(): string[] {
    const ids: string[] = [];

    this.walkAllStates((state) => {
      ids.push(state.id);
    });

    if (this.document.scxml.parallel) {
      this.document.scxml.parallel.forEach((parallel) => {
        ids.push(parallel.id);
      });
    }

    if (this.document.scxml.final) {
      this.document.scxml.final.forEach((final) => {
        ids.push(final.id);
      });
    }

    return ids;
  }

  /**
   * Insert an arbitrary SCXML fragment at a specific location in the document.
   * The fragment will be parsed and validated before insertion.
   *
   * @param fragmentXml - XML string containing SCXML elements to insert
   * @param targetStateId - Optional state ID to insert into. If not provided, inserts at root level
   * @throws {Error} If fragment is invalid or target state doesn't exist
   */
  insertFragment(fragmentXml: string, targetStateId?: string): this {
    return this.withValidation(() => {
      // Parse the fragment using a minimal parser
      const parser = new (require("./parser").SCXMLParser)();

      try {
        // Try to parse as a complete SCXML document first
        let fragmentDoc;
        try {
          fragmentDoc = parser.parse(`<scxml>${fragmentXml}</scxml>`);
        } catch {
          // If that fails, try as a standalone fragment
          fragmentDoc = parser.parse(fragmentXml);
        }

        // Validate the parsed fragment
        const fragmentErrors = this.validator.validate(fragmentDoc);
        if (fragmentErrors.length > 0) {
          const errorMessages = fragmentErrors
            .map((e) => `${e.path}: ${e.message}`)
            .join("; ");
          throw new Error(`Fragment validation failed: ${errorMessages}`);
        }

        // Extract elements from the parsed fragment
        const elements = this.extractElementsFromFragment(fragmentDoc);

        if (targetStateId) {
          // Insert into specific state
          const targetState = this.findState(targetStateId);
          if (!targetState) {
            throw new Error(`Target state '${targetStateId}' not found`);
          }
          this.insertElementsIntoState(targetState, elements);
        } else {
          // Insert at root level
          this.insertElementsIntoRoot(elements);
        }
      } catch (error) {
        throw new Error(
          `Failed to insert fragment: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }

      return this;
    }, "insertFragment");
  }

  /**
   * Convert a regular state to a parallel state.
   * This moves all child states into parallel regions.
   */
  convertToParallel(stateId: string): this {
    return this.withValidation(() => {
      const state = this.findState(stateId);
      if (!state) {
        throw new Error(`State '${stateId}' not found`);
      }

      // If state already has substates, convert them to parallel regions
      if (state.state && state.state.length > 0) {
        const childStates = [...state.state]; // Copy the array

        // Clear existing states
        state.state = [];

        // Initialize parallel array if it doesn't exist
        if (!state.parallel) {
          state.parallel = [];
        }

        // Convert each child state to a parallel region
        childStates.forEach((childState, index) => {
          const parallelRegion: ParallelElement = {
            id: `${stateId}_parallel_${index}`,
            state: [childState],
          };
          state.parallel!.push(parallelRegion);
        });
      }

      return this;
    }, "convertToParallel");
  }

  /**
   * Add a state to a specific parent state.
   */
  addStateToParent(parentStateId: string, state: StateElement): this {
    return this.withValidation(() => {
      const parentState = this.findState(parentStateId);
      if (!parentState) {
        throw new Error(`Parent state '${parentStateId}' not found`);
      }

      if (!parentState.state) {
        parentState.state = [];
      }
      parentState.state.push(JSON.parse(JSON.stringify(state)));
      return this;
    }, "addStateToParent");
  }

  /**
   * Convert a state to parallel with named regions, creating valid parallel structure.
   * This method ensures the resulting parallel state meets validation requirements.
   *
   * @param stateId - ID of the state to convert
   * @param regionIds - Array of parallel region IDs to create (must be at least 2)
   * @param distributeExistingStates - Whether to distribute existing substates across regions
   */
  convertToParallelWithSubstates(
    stateId: string,
    regionIds: string[],
    distributeExistingStates: boolean = true
  ): this {
    return this.withValidation(() => {
      if (regionIds.length < 2) {
        throw new Error(
          `At least 2 parallel regions required, got ${regionIds.length}`
        );
      }

      const state = this.findState(stateId);
      if (!state) {
        throw new Error(`State '${stateId}' not found`);
      }

      // Collect existing substates
      const existingStates = state.state ? [...state.state] : [];

      // Clear existing states
      state.state = [];

      // Initialize parallel array
      if (!state.parallel) {
        state.parallel = [];
      }

      // Create parallel regions
      for (let i = 0; i < regionIds.length; i++) {
        const regionId = regionIds[i];
        const parallelRegion: ParallelElement = {
          id: regionId,
          state: [],
        };

        // Distribute existing states across regions if requested
        if (distributeExistingStates && existingStates.length > 0) {
          // Simple round-robin distribution
          const statesForThisRegion = existingStates.filter(
            (_, index) => index % regionIds.length === i
          );
          parallelRegion.state = statesForThisRegion;
        }

        // Ensure each region has at least two states for validation (parallel requirement)
        if (!parallelRegion.state || parallelRegion.state.length === 0) {
          parallelRegion.state = [
            {
              id: `${regionId}_state1`,
            },
            {
              id: `${regionId}_state2`,
            },
          ];
        } else if (parallelRegion.state.length === 1) {
          // If only one state, add another to meet parallel validation requirements
          parallelRegion.state.push({
            id: `${regionId}_additional`,
          });
        }

        state.parallel.push(parallelRegion);
      }

      return this;
    }, "convertToParallelWithSubstates");
  }

  private extractElementsFromFragment(fragmentDoc: any): any {
    // Extract various types of elements from the parsed fragment
    const elements: any = {};

    if (fragmentDoc.scxml) {
      const scxml = fragmentDoc.scxml;
      if (scxml.state) elements.states = scxml.state;
      if (scxml.parallel) elements.parallels = scxml.parallel;
      if (scxml.final) elements.finals = scxml.final;
      if (scxml.transition) elements.transitions = scxml.transition;
      if (scxml.datamodel_element) elements.datamodel = scxml.datamodel_element;
    }

    // Handle direct elements (for fragments that aren't wrapped in <scxml>)
    if (fragmentDoc.state)
      elements.states = Array.isArray(fragmentDoc.state)
        ? fragmentDoc.state
        : [fragmentDoc.state];
    if (fragmentDoc.parallel)
      elements.parallels = Array.isArray(fragmentDoc.parallel)
        ? fragmentDoc.parallel
        : [fragmentDoc.parallel];
    if (fragmentDoc.transition)
      elements.transitions = Array.isArray(fragmentDoc.transition)
        ? fragmentDoc.transition
        : [fragmentDoc.transition];

    return elements;
  }

  private insertElementsIntoState(
    targetState: StateElement,
    elements: any
  ): void {
    // Add states
    if (elements.states) {
      if (!targetState.state) targetState.state = [];
      targetState.state.push(...elements.states);
    }

    // Add parallel regions
    if (elements.parallels) {
      if (!targetState.parallel) targetState.parallel = [];
      targetState.parallel.push(...elements.parallels);
    }

    // Add transitions
    if (elements.transitions) {
      if (!targetState.transition) targetState.transition = [];
      targetState.transition.push(...elements.transitions);
    }

    // Add final states
    if (elements.finals) {
      if (!targetState.final) targetState.final = [];
      targetState.final.push(...elements.finals);
    }
  }

  private insertElementsIntoRoot(elements: any): void {
    // Add states to root
    if (elements.states) {
      if (!this.document.scxml.state) this.document.scxml.state = [];
      this.document.scxml.state.push(...elements.states);
    }

    // Add parallel regions to root
    if (elements.parallels) {
      if (!this.document.scxml.parallel) this.document.scxml.parallel = [];
      this.document.scxml.parallel.push(...elements.parallels);
    }

    // Add final states to root
    if (elements.finals) {
      if (!this.document.scxml.final) this.document.scxml.final = [];
      this.document.scxml.final.push(...elements.finals);
    }

    // Handle datamodel
    if (elements.datamodel) {
      this.document.scxml.datamodel_element = elements.datamodel;
    }
  }

  clone(): SCXMLModifier {
    return new SCXMLModifier(this.document);
  }
}
