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

export class SCXMLModifier {
  private document: SCXMLDocument;

  constructor(document: SCXMLDocument) {
    this.document = JSON.parse(JSON.stringify(document));
  }

  static from(document: SCXMLDocument): SCXMLModifier {
    return new SCXMLModifier(document);
  }

  getDocument(): SCXMLDocument {
    return JSON.parse(JSON.stringify(this.document));
  }

  setName(name: string): this {
    this.document.scxml.name = name;
    return this;
  }

  setInitial(initial: string): this {
    this.document.scxml.initial = initial;
    return this;
  }

  setDatamodel(datamodel: string): this {
    this.document.scxml.datamodel = datamodel;
    return this;
  }

  addState(state: StateElement): this {
    if (!this.document.scxml.state) {
      this.document.scxml.state = [];
    }
    this.document.scxml.state.push(JSON.parse(JSON.stringify(state)));
    return this;
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

  clone(): SCXMLModifier {
    return new SCXMLModifier(this.document);
  }
}
