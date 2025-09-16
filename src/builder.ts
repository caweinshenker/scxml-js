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
  RaiseElement,
  IfElement,
  ForEachElement,
  LogElement,
  AssignElement,
  SendElement,
  CancelElement,
  ScriptElement,
  ParamElement,
  ContentElement,
  DoneDataElement
} from './types';

export class SCXMLBuilder {
  private document: SCXMLDocument;

  constructor() {
    this.document = {
      scxml: {
        version: '1.0',
        xmlns: 'http://www.w3.org/2005/07/scxml'
      }
    };
  }

  static create(): SCXMLBuilder {
    return new SCXMLBuilder();
  }

  name(name: string): this {
    this.document.scxml.name = name;
    return this;
  }

  initial(initial: string): this {
    this.document.scxml.initial = initial;
    return this;
  }

  datamodel(datamodel: string): this {
    this.document.scxml.datamodel = datamodel;
    return this;
  }

  addState(state: StateElement): this {
    if (!this.document.scxml.state) {
      this.document.scxml.state = [];
    }
    this.document.scxml.state.push(state);
    return this;
  }

  addParallel(parallel: ParallelElement): this {
    if (!this.document.scxml.parallel) {
      this.document.scxml.parallel = [];
    }
    this.document.scxml.parallel.push(parallel);
    return this;
  }

  addFinal(final: FinalElement): this {
    if (!this.document.scxml.final) {
      this.document.scxml.final = [];
    }
    this.document.scxml.final.push(final);
    return this;
  }

  addDataModel(dataModel: DataModelElement): this {
    this.document.scxml.datamodel_element = dataModel;
    return this;
  }

  addScript(script: ScriptElement): this {
    if (!this.document.scxml.script) {
      this.document.scxml.script = [];
    }
    this.document.scxml.script.push(script);
    return this;
  }

  build(): SCXMLDocument {
    const SCXMLDocument = require('./types').SCXMLDocument;
    return new SCXMLDocument(JSON.parse(JSON.stringify(this.document.scxml)));
  }
}

export class StateBuilder {
  private state: StateElement;

  constructor(id: string) {
    this.state = { id };
  }

  static create(id: string): StateBuilder {
    return new StateBuilder(id);
  }

  initial(initial: string): this {
    this.state.initial = initial;
    return this;
  }

  addState(childState: StateElement): this {
    if (!this.state.state) {
      this.state.state = [];
    }
    this.state.state.push(childState);
    return this;
  }

  addParallel(parallel: ParallelElement): this {
    if (!this.state.parallel) {
      this.state.parallel = [];
    }
    this.state.parallel.push(parallel);
    return this;
  }

  addFinal(final: FinalElement): this {
    if (!this.state.final) {
      this.state.final = [];
    }
    this.state.final.push(final);
    return this;
  }

  addTransition(transition: TransitionElement): this {
    if (!this.state.transition) {
      this.state.transition = [];
    }
    this.state.transition.push(transition);
    return this;
  }

  addOnEntry(onEntry: OnEntryElement): this {
    if (!this.state.onentry) {
      this.state.onentry = [];
    }
    this.state.onentry.push(onEntry);
    return this;
  }

  addOnExit(onExit: OnExitElement): this {
    if (!this.state.onexit) {
      this.state.onexit = [];
    }
    this.state.onexit.push(onExit);
    return this;
  }

  addInvoke(invoke: InvokeElement): this {
    if (!this.state.invoke) {
      this.state.invoke = [];
    }
    this.state.invoke.push(invoke);
    return this;
  }

  addHistory(history: HistoryElement): this {
    if (!this.state.history) {
      this.state.history = [];
    }
    this.state.history.push(history);
    return this;
  }

  addDataModel(dataModel: DataModelElement): this {
    this.state.datamodel = dataModel;
    return this;
  }

  build(): StateElement {
    return JSON.parse(JSON.stringify(this.state));
  }
}

export class ParallelBuilder {
  private parallel: ParallelElement;

  constructor(id: string) {
    this.parallel = { id };
  }

  static create(id: string): ParallelBuilder {
    return new ParallelBuilder(id);
  }

  addState(state: StateElement): this {
    if (!this.parallel.state) {
      this.parallel.state = [];
    }
    this.parallel.state.push(state);
    return this;
  }

  addParallel(childParallel: ParallelElement): this {
    if (!this.parallel.parallel) {
      this.parallel.parallel = [];
    }
    this.parallel.parallel.push(childParallel);
    return this;
  }

  addTransition(transition: TransitionElement): this {
    if (!this.parallel.transition) {
      this.parallel.transition = [];
    }
    this.parallel.transition.push(transition);
    return this;
  }

  addOnEntry(onEntry: OnEntryElement): this {
    if (!this.parallel.onentry) {
      this.parallel.onentry = [];
    }
    this.parallel.onentry.push(onEntry);
    return this;
  }

  addOnExit(onExit: OnExitElement): this {
    if (!this.parallel.onexit) {
      this.parallel.onexit = [];
    }
    this.parallel.onexit.push(onExit);
    return this;
  }

  build(): ParallelElement {
    return JSON.parse(JSON.stringify(this.parallel));
  }
}

export class TransitionBuilder {
  private transition: TransitionElement;

  constructor() {
    this.transition = {};
  }

  static create(): TransitionBuilder {
    return new TransitionBuilder();
  }

  event(event: string): this {
    this.transition.event = event;
    return this;
  }

  cond(cond: string): this {
    this.transition.cond = cond;
    return this;
  }

  target(target: string): this {
    this.transition.target = target;
    return this;
  }

  type(type: 'internal' | 'external'): this {
    this.transition.type = type;
    return this;
  }

  addRaise(raise: RaiseElement): this {
    if (!this.transition.raise) {
      this.transition.raise = [];
    }
    this.transition.raise.push(raise);
    return this;
  }

  addLog(log: LogElement): this {
    if (!this.transition.log) {
      this.transition.log = [];
    }
    this.transition.log.push(log);
    return this;
  }

  addAssign(assign: AssignElement): this {
    if (!this.transition.assign) {
      this.transition.assign = [];
    }
    this.transition.assign.push(assign);
    return this;
  }

  addSend(send: SendElement): this {
    if (!this.transition.send) {
      this.transition.send = [];
    }
    this.transition.send.push(send);
    return this;
  }

  addScript(script: ScriptElement): this {
    if (!this.transition.script) {
      this.transition.script = [];
    }
    this.transition.script.push(script);
    return this;
  }

  build(): TransitionElement {
    return JSON.parse(JSON.stringify(this.transition));
  }
}

export class DataModelBuilder {
  private dataModel: DataModelElement;

  constructor() {
    this.dataModel = {};
  }

  static create(): DataModelBuilder {
    return new DataModelBuilder();
  }

  addData(data: DataElement): this {
    if (!this.dataModel.data) {
      this.dataModel.data = [];
    }
    this.dataModel.data.push(data);
    return this;
  }

  build(): DataModelElement {
    return JSON.parse(JSON.stringify(this.dataModel));
  }
}

export class DataBuilder {
  private data: DataElement;

  constructor(id: string) {
    this.data = { id };
  }

  static create(id: string): DataBuilder {
    return new DataBuilder(id);
  }

  src(src: string): this {
    this.data.src = src;
    return this;
  }

  expr(expr: string): this {
    this.data.expr = expr;
    return this;
  }

  content(content: string): this {
    this.data.content = content;
    return this;
  }

  build(): DataElement {
    return JSON.parse(JSON.stringify(this.data));
  }
}

export class InvokeBuilder {
  private invoke: InvokeElement;

  constructor() {
    this.invoke = {};
  }

  static create(): InvokeBuilder {
    return new InvokeBuilder();
  }

  type(type: string): this {
    this.invoke.type = type;
    return this;
  }

  src(src: string): this {
    this.invoke.src = src;
    return this;
  }

  id(id: string): this {
    this.invoke.id = id;
    return this;
  }

  srcexpr(srcexpr: string): this {
    this.invoke.srcexpr = srcexpr;
    return this;
  }

  autoforward(autoforward: boolean): this {
    this.invoke.autoforward = autoforward;
    return this;
  }

  addParam(param: ParamElement): this {
    if (!this.invoke.param) {
      this.invoke.param = [];
    }
    this.invoke.param.push(param);
    return this;
  }

  content(content: ContentElement): this {
    this.invoke.content = content;
    return this;
  }

  build(): InvokeElement {
    return JSON.parse(JSON.stringify(this.invoke));
  }
}

export class OnEntryBuilder {
  private onEntry: OnEntryElement;

  constructor() {
    this.onEntry = {};
  }

  static create(): OnEntryBuilder {
    return new OnEntryBuilder();
  }

  addRaise(raise: RaiseElement): this {
    if (!this.onEntry.raise) {
      this.onEntry.raise = [];
    }
    this.onEntry.raise.push(raise);
    return this;
  }

  addLog(log: LogElement): this {
    if (!this.onEntry.log) {
      this.onEntry.log = [];
    }
    this.onEntry.log.push(log);
    return this;
  }

  addAssign(assign: AssignElement): this {
    if (!this.onEntry.assign) {
      this.onEntry.assign = [];
    }
    this.onEntry.assign.push(assign);
    return this;
  }

  addSend(send: SendElement): this {
    if (!this.onEntry.send) {
      this.onEntry.send = [];
    }
    this.onEntry.send.push(send);
    return this;
  }

  addScript(script: ScriptElement): this {
    if (!this.onEntry.script) {
      this.onEntry.script = [];
    }
    this.onEntry.script.push(script);
    return this;
  }

  build(): OnEntryElement {
    return JSON.parse(JSON.stringify(this.onEntry));
  }
}

export class OnExitBuilder {
  private onExit: OnExitElement;

  constructor() {
    this.onExit = {};
  }

  static create(): OnExitBuilder {
    return new OnExitBuilder();
  }

  addRaise(raise: RaiseElement): this {
    if (!this.onExit.raise) {
      this.onExit.raise = [];
    }
    this.onExit.raise.push(raise);
    return this;
  }

  addLog(log: LogElement): this {
    if (!this.onExit.log) {
      this.onExit.log = [];
    }
    this.onExit.log.push(log);
    return this;
  }

  addAssign(assign: AssignElement): this {
    if (!this.onExit.assign) {
      this.onExit.assign = [];
    }
    this.onExit.assign.push(assign);
    return this;
  }

  addSend(send: SendElement): this {
    if (!this.onExit.send) {
      this.onExit.send = [];
    }
    this.onExit.send.push(send);
    return this;
  }

  addScript(script: ScriptElement): this {
    if (!this.onExit.script) {
      this.onExit.script = [];
    }
    this.onExit.script.push(script);
    return this;
  }

  build(): OnExitElement {
    return JSON.parse(JSON.stringify(this.onExit));
  }
}