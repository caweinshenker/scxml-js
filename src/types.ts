import type { ValidationError } from "./validator";
import type { SerializationOptions } from "./serializer";

export class SCXMLDocument {
  public scxml: SCXMLElement;
  private _modifier?: any;
  private _validator?: any;
  private _serializer?: any;

  constructor(scxml: SCXMLElement) {
    this.scxml = scxml;
  }

  private get modifier(): any {
    if (!this._modifier) {
      // Import here to avoid circular dependency
      const { SCXMLModifier } = require("./modifier");
      this._modifier = new SCXMLModifier(this);
    }
    return this._modifier;
  }

  private get validator(): any {
    if (!this._validator) {
      const { SCXMLValidator } = require("./validator");
      this._validator = new SCXMLValidator();
    }
    return this._validator;
  }

  private get serializer(): any {
    if (!this._serializer) {
      const { SCXMLSerializer } = require("./serializer");
      this._serializer = new SCXMLSerializer();
    }
    return this._serializer;
  }

  // Modification API
  setName(name: string): this {
    this.modifier.setName(name);
    return this;
  }

  setInitial(initial: string): this {
    this.modifier.setInitial(initial);
    return this;
  }

  setDatamodel(datamodel: string): this {
    this.modifier.setDatamodel(datamodel);
    return this;
  }

  addState(state: StateElement): this {
    this.modifier.addState(state);
    return this;
  }

  removeState(stateId: string): this {
    this.modifier.removeState(stateId);
    return this;
  }

  updateState(
    stateId: string,
    updater: (state: StateElement) => StateElement
  ): this {
    this.modifier.updateState(stateId, updater);
    return this;
  }

  findState(stateId: string): StateElement | undefined {
    return this.modifier.findState(stateId);
  }

  addTransitionToState(stateId: string, transition: TransitionElement): this {
    this.modifier.addTransitionToState(stateId, transition);
    return this;
  }

  removeTransitionFromState(stateId: string, transitionIndex: number): this {
    this.modifier.removeTransitionFromState(stateId, transitionIndex);
    return this;
  }

  addParallel(parallel: ParallelElement): this {
    this.modifier.addParallel(parallel);
    return this;
  }

  removeParallel(parallelId: string): this {
    this.modifier.removeParallel(parallelId);
    return this;
  }

  addDataElement(data: DataElement): this {
    this.modifier.addDataElement(data);
    return this;
  }

  removeDataElement(dataId: string): this {
    this.modifier.removeDataElement(dataId);
    return this;
  }

  updateDataElement(
    dataId: string,
    updater: (data: DataElement) => DataElement
  ): this {
    this.modifier.updateDataElement(dataId, updater);
    return this;
  }

  // NEW: Fragment insertion API
  insertFragment(fragmentXml: string, targetStateId?: string): this {
    this.modifier.insertFragment(fragmentXml, targetStateId);
    return this;
  }

  // NEW: Convert state to parallel
  convertToParallel(stateId: string): this {
    this.modifier.convertToParallel(stateId);
    return this;
  }

  // NEW: Add state to specific parent
  addStateToParent(parentStateId: string, state: StateElement): this {
    this.modifier.addStateToParent(parentStateId, state);
    return this;
  }

  // Validation API
  validate(): ValidationError[] {
    return this.validator.validate(this);
  }

  isValid(): boolean {
    return this.validate().length === 0;
  }

  // Serialization API
  serialize(options?: SerializationOptions): string {
    return this.serializer.serialize(this, options);
  }

  toXML(options?: SerializationOptions): string {
    return this.serialize(options);
  }

  // Validation control methods
  disableValidation(): this {
    this.modifier.disableValidation();
    return this;
  }

  enableValidation(): this {
    this.modifier.enableValidation();
    return this;
  }

  // Utility methods
  clone(): SCXMLDocument {
    return new SCXMLDocument(JSON.parse(JSON.stringify(this.scxml)));
  }

  getStateHierarchy(): string[] {
    const hierarchy: string[] = [];
    this._collectStateIds(this.scxml.state || [], hierarchy);
    this._collectParallelIds(this.scxml.parallel || [], hierarchy);
    return hierarchy;
  }

  private _collectStateIds(states: StateElement[], result: string[]): void {
    for (const state of states) {
      result.push(state.id);
      if (state.state) {
        this._collectStateIds(state.state, result);
      }
      if (state.parallel) {
        this._collectParallelIds(state.parallel, result);
      }
    }
  }

  private _collectParallelIds(
    parallels: ParallelElement[],
    result: string[]
  ): void {
    for (const parallel of parallels) {
      result.push(parallel.id);
      if (parallel.state) {
        this._collectStateIds(parallel.state, result);
      }
      if (parallel.parallel) {
        this._collectParallelIds(parallel.parallel, result);
      }
    }
  }
}

export interface SCXMLElement {
  initial?: string;
  name?: string;
  version?: string;
  datamodel?: string;
  xmlns?: string;
  state?: StateElement[];
  parallel?: ParallelElement[];
  final?: FinalElement[];
  datamodel_element?: DataModelElement;
  script?: ScriptElement[];
}

export interface StateElement {
  id: string;
  initial?: string;
  state?: StateElement[];
  parallel?: ParallelElement[];
  final?: FinalElement[];
  onentry?: OnEntryElement[];
  onexit?: OnExitElement[];
  transition?: TransitionElement[];
  invoke?: InvokeElement[];
  datamodel?: DataModelElement;
  history?: HistoryElement[];
}

export interface ParallelElement {
  id: string;
  state?: StateElement[];
  parallel?: ParallelElement[];
  onentry?: OnEntryElement[];
  onexit?: OnExitElement[];
  transition?: TransitionElement[];
  invoke?: InvokeElement[];
  datamodel?: DataModelElement;
  history?: HistoryElement[];
}

export interface FinalElement {
  id: string;
  onentry?: OnEntryElement[];
  onexit?: OnExitElement[];
  donedata?: DoneDataElement;
}

export interface TransitionElement {
  event?: string;
  cond?: string;
  target?: string;
  type?: "internal" | "external";
  raise?: RaiseElement[];
  if?: IfElement[];
  foreach?: ForEachElement[];
  log?: LogElement[];
  assign?: AssignElement[];
  send?: SendElement[];
  cancel?: CancelElement[];
  script?: ScriptElement[];
}

export interface OnEntryElement {
  raise?: RaiseElement[];
  if?: IfElement[];
  foreach?: ForEachElement[];
  log?: LogElement[];
  assign?: AssignElement[];
  send?: SendElement[];
  cancel?: CancelElement[];
  script?: ScriptElement[];
}

export interface OnExitElement {
  raise?: RaiseElement[];
  if?: IfElement[];
  foreach?: ForEachElement[];
  log?: LogElement[];
  assign?: AssignElement[];
  send?: SendElement[];
  cancel?: CancelElement[];
  script?: ScriptElement[];
}

export interface HistoryElement {
  id: string;
  type: "shallow" | "deep";
  transition?: TransitionElement;
}

export interface DataModelElement {
  data?: DataElement[];
}

export interface DataElement {
  id: string;
  src?: string;
  expr?: string;
  content?: string;
}

export interface InvokeElement {
  type?: string;
  src?: string;
  id?: string;
  idlocation?: string;
  srcexpr?: string;
  autoforward?: boolean;
  param?: ParamElement[];
  finalize?: FinalizeElement;
  content?: ContentElement;
}

export interface ParamElement {
  name: string;
  expr?: string;
  location?: string;
}

export interface FinalizeElement {
  raise?: RaiseElement[];
  if?: IfElement[];
  foreach?: ForEachElement[];
  log?: LogElement[];
  assign?: AssignElement[];
  send?: SendElement[];
  cancel?: CancelElement[];
  script?: ScriptElement[];
}

export interface ContentElement {
  expr?: string;
  content?: string;
}

export interface DoneDataElement {
  content?: ContentElement;
  param?: ParamElement[];
}

export interface RaiseElement {
  event: string;
}

export interface IfElement {
  cond: string;
  raise?: RaiseElement[];
  if?: IfElement[];
  elseif?: ElseIfElement[];
  else?: ElseElement;
  foreach?: ForEachElement[];
  log?: LogElement[];
  assign?: AssignElement[];
  send?: SendElement[];
  cancel?: CancelElement[];
  script?: ScriptElement[];
}

export interface ElseIfElement {
  cond: string;
  raise?: RaiseElement[];
  if?: IfElement[];
  foreach?: ForEachElement[];
  log?: LogElement[];
  assign?: AssignElement[];
  send?: SendElement[];
  cancel?: CancelElement[];
  script?: ScriptElement[];
}

export interface ElseElement {
  raise?: RaiseElement[];
  if?: IfElement[];
  foreach?: ForEachElement[];
  log?: LogElement[];
  assign?: AssignElement[];
  send?: SendElement[];
  cancel?: CancelElement[];
  script?: ScriptElement[];
}

export interface ForEachElement {
  array: string;
  item: string;
  index?: string;
  raise?: RaiseElement[];
  if?: IfElement[];
  foreach?: ForEachElement[];
  log?: LogElement[];
  assign?: AssignElement[];
  send?: SendElement[];
  cancel?: CancelElement[];
  script?: ScriptElement[];
}

export interface LogElement {
  label?: string;
  expr?: string;
}

export interface AssignElement {
  location: string;
  expr?: string;
}

export interface SendElement {
  event?: string;
  eventexpr?: string;
  target?: string;
  targetexpr?: string;
  type?: string;
  typeexpr?: string;
  id?: string;
  idlocation?: string;
  delay?: string;
  delayexpr?: string;
  namelist?: string;
  param?: ParamElement[];
  content?: ContentElement;
}

export interface CancelElement {
  sendid?: string;
  sendidexpr?: string;
}

export interface ScriptElement {
  src?: string;
  content?: string;
}

export type ExecutableContent =
  | RaiseElement
  | IfElement
  | ForEachElement
  | LogElement
  | AssignElement
  | SendElement
  | CancelElement
  | ScriptElement;
