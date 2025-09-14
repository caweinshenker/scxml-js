import { js2xml } from 'xml-js';
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

export interface SerializationOptions {
  compact?: boolean;
  ignoreComment?: boolean;
  ignoreInstruction?: boolean;
  ignoreAttributes?: boolean;
  ignoreText?: boolean;
  ignoreCdata?: boolean;
  ignoreDoctype?: boolean;
  spaces?: number | string;
  textKey?: string;
  attributesKey?: string;
  instructionKey?: string;
  commentKey?: string;
  cdataKey?: string;
  doctypeKey?: string;
  typeKey?: string;
  nameKey?: string;
  elementsKey?: string;
}

export class SCXMLSerializer {
  private options: SerializationOptions;

  constructor(options: SerializationOptions = {}) {
    this.options = {
      compact: false,
      ignoreComment: true,
      ignoreInstruction: true,
      ignoreAttributes: false,
      ignoreText: false,
      spaces: 2,
      ...options
    };
  }

  serialize(document: SCXMLDocument): string {
    const xmlObject = this.convertToXMLObject(document);
    return js2xml(xmlObject, this.options);
  }

  private convertToXMLObject(document: SCXMLDocument): any {
    return {
      _declaration: {
        _attributes: {
          version: '1.0',
          encoding: 'UTF-8'
        }
      },
      elements: [{
        type: 'element',
        name: 'scxml',
        attributes: this.buildScxmlAttributes(document.scxml),
        elements: this.buildScxmlElements(document.scxml)
      }]
    };
  }

  private buildScxmlAttributes(scxml: SCXMLElement): Record<string, string> {
    const attributes: Record<string, string> = {};

    if (scxml.initial) attributes.initial = scxml.initial;
    if (scxml.name) attributes.name = scxml.name;
    if (scxml.version) attributes.version = scxml.version;
    if (scxml.datamodel) attributes.datamodel = scxml.datamodel;
    if (scxml.xmlns) attributes.xmlns = scxml.xmlns;

    return attributes;
  }

  private buildScxmlElements(scxml: SCXMLElement): any[] {
    const elements: any[] = [];

    if (scxml.datamodel_element) {
      elements.push(this.buildDataModelElement(scxml.datamodel_element));
    }

    if (scxml.script) {
      scxml.script.forEach(script => {
        elements.push(this.buildScriptElement(script));
      });
    }

    if (scxml.state) {
      scxml.state.forEach(state => {
        elements.push(this.buildStateElement(state));
      });
    }

    if (scxml.parallel) {
      scxml.parallel.forEach(parallel => {
        elements.push(this.buildParallelElement(parallel));
      });
    }

    if (scxml.final) {
      scxml.final.forEach(final => {
        elements.push(this.buildFinalElement(final));
      });
    }

    return elements;
  }

  private buildStateElement(state: StateElement): any {
    const attributes: Record<string, string> = { id: state.id };
    if (state.initial) attributes.initial = state.initial;

    const elements: any[] = [];

    if (state.datamodel) {
      elements.push(this.buildDataModelElement(state.datamodel));
    }

    if (state.onentry) {
      state.onentry.forEach(onentry => {
        elements.push(this.buildOnEntryElement(onentry));
      });
    }

    if (state.onexit) {
      state.onexit.forEach(onexit => {
        elements.push(this.buildOnExitElement(onexit));
      });
    }

    if (state.transition) {
      state.transition.forEach(transition => {
        elements.push(this.buildTransitionElement(transition));
      });
    }

    if (state.state) {
      state.state.forEach(childState => {
        elements.push(this.buildStateElement(childState));
      });
    }

    if (state.parallel) {
      state.parallel.forEach(parallel => {
        elements.push(this.buildParallelElement(parallel));
      });
    }

    if (state.final) {
      state.final.forEach(final => {
        elements.push(this.buildFinalElement(final));
      });
    }

    if (state.history) {
      state.history.forEach(history => {
        elements.push(this.buildHistoryElement(history));
      });
    }

    if (state.invoke) {
      state.invoke.forEach(invoke => {
        elements.push(this.buildInvokeElement(invoke));
      });
    }

    return {
      type: 'element',
      name: 'state',
      attributes,
      elements: elements.length > 0 ? elements : undefined
    };
  }

  private buildParallelElement(parallel: ParallelElement): any {
    const attributes: Record<string, string> = { id: parallel.id };
    const elements: any[] = [];

    if (parallel.datamodel) {
      elements.push(this.buildDataModelElement(parallel.datamodel));
    }

    if (parallel.onentry) {
      parallel.onentry.forEach(onentry => {
        elements.push(this.buildOnEntryElement(onentry));
      });
    }

    if (parallel.onexit) {
      parallel.onexit.forEach(onexit => {
        elements.push(this.buildOnExitElement(onexit));
      });
    }

    if (parallel.transition) {
      parallel.transition.forEach(transition => {
        elements.push(this.buildTransitionElement(transition));
      });
    }

    if (parallel.state) {
      parallel.state.forEach(state => {
        elements.push(this.buildStateElement(state));
      });
    }

    if (parallel.parallel) {
      parallel.parallel.forEach(childParallel => {
        elements.push(this.buildParallelElement(childParallel));
      });
    }

    if (parallel.history) {
      parallel.history.forEach(history => {
        elements.push(this.buildHistoryElement(history));
      });
    }

    if (parallel.invoke) {
      parallel.invoke.forEach(invoke => {
        elements.push(this.buildInvokeElement(invoke));
      });
    }

    return {
      type: 'element',
      name: 'parallel',
      attributes,
      elements: elements.length > 0 ? elements : undefined
    };
  }

  private buildFinalElement(final: FinalElement): any {
    const attributes: Record<string, string> = { id: final.id };
    const elements: any[] = [];

    if (final.onentry) {
      final.onentry.forEach(onentry => {
        elements.push(this.buildOnEntryElement(onentry));
      });
    }

    if (final.onexit) {
      final.onexit.forEach(onexit => {
        elements.push(this.buildOnExitElement(onexit));
      });
    }

    if (final.donedata) {
      elements.push(this.buildDoneDataElement(final.donedata));
    }

    return {
      type: 'element',
      name: 'final',
      attributes,
      elements: elements.length > 0 ? elements : undefined
    };
  }

  private buildTransitionElement(transition: TransitionElement): any {
    const attributes: Record<string, string> = {};

    if (transition.event) attributes.event = transition.event;
    if (transition.cond) attributes.cond = transition.cond;
    if (transition.target) attributes.target = transition.target;
    if (transition.type) attributes.type = transition.type;

    const elements: any[] = [];
    this.addExecutableContent(elements, transition);

    return {
      type: 'element',
      name: 'transition',
      attributes,
      elements: elements.length > 0 ? elements : undefined
    };
  }

  private buildOnEntryElement(onentry: OnEntryElement): any {
    const elements: any[] = [];
    this.addExecutableContent(elements, onentry);

    return {
      type: 'element',
      name: 'onentry',
      elements: elements.length > 0 ? elements : undefined
    };
  }

  private buildOnExitElement(onexit: OnExitElement): any {
    const elements: any[] = [];
    this.addExecutableContent(elements, onexit);

    return {
      type: 'element',
      name: 'onexit',
      elements: elements.length > 0 ? elements : undefined
    };
  }

  private buildDataModelElement(datamodel: DataModelElement): any {
    const elements: any[] = [];

    if (datamodel.data) {
      datamodel.data.forEach(data => {
        elements.push(this.buildDataElement(data));
      });
    }

    return {
      type: 'element',
      name: 'datamodel',
      elements: elements.length > 0 ? elements : undefined
    };
  }

  private buildDataElement(data: DataElement): any {
    const attributes: Record<string, string> = { id: data.id };

    if (data.src) attributes.src = data.src;
    if (data.expr) attributes.expr = data.expr;

    const elements: any[] = [];
    if (data.content) {
      elements.push({
        type: 'text',
        text: data.content
      });
    }

    return {
      type: 'element',
      name: 'data',
      attributes,
      elements: elements.length > 0 ? elements : undefined
    };
  }

  private buildInvokeElement(invoke: InvokeElement): any {
    const attributes: Record<string, string> = {};

    if (invoke.type) attributes.type = invoke.type;
    if (invoke.src) attributes.src = invoke.src;
    if (invoke.id) attributes.id = invoke.id;
    if (invoke.idlocation) attributes.idlocation = invoke.idlocation;
    if (invoke.srcexpr) attributes.srcexpr = invoke.srcexpr;
    if (invoke.autoforward !== undefined) attributes.autoforward = invoke.autoforward.toString();

    const elements: any[] = [];

    if (invoke.param) {
      invoke.param.forEach(param => {
        elements.push(this.buildParamElement(param));
      });
    }

    if (invoke.content) {
      elements.push(this.buildContentElement(invoke.content));
    }

    return {
      type: 'element',
      name: 'invoke',
      attributes,
      elements: elements.length > 0 ? elements : undefined
    };
  }

  private buildHistoryElement(history: HistoryElement): any {
    const attributes: Record<string, string> = {
      id: history.id,
      type: history.type
    };

    const elements: any[] = [];

    if (history.transition) {
      elements.push(this.buildTransitionElement(history.transition));
    }

    return {
      type: 'element',
      name: 'history',
      attributes,
      elements: elements.length > 0 ? elements : undefined
    };
  }

  private buildParamElement(param: ParamElement): any {
    const attributes: Record<string, string> = { name: param.name };

    if (param.expr) attributes.expr = param.expr;
    if (param.location) attributes.location = param.location;

    return {
      type: 'element',
      name: 'param',
      attributes
    };
  }

  private buildContentElement(content: ContentElement): any {
    const attributes: Record<string, string> = {};

    if (content.expr) attributes.expr = content.expr;

    const elements: any[] = [];
    if (content.content) {
      elements.push({
        type: 'text',
        text: content.content
      });
    }

    return {
      type: 'element',
      name: 'content',
      attributes,
      elements: elements.length > 0 ? elements : undefined
    };
  }

  private buildDoneDataElement(donedata: DoneDataElement): any {
    const elements: any[] = [];

    if (donedata.content) {
      elements.push(this.buildContentElement(donedata.content));
    }

    if (donedata.param) {
      donedata.param.forEach(param => {
        elements.push(this.buildParamElement(param));
      });
    }

    return {
      type: 'element',
      name: 'donedata',
      elements: elements.length > 0 ? elements : undefined
    };
  }

  private buildScriptElement(script: ScriptElement): any {
    const attributes: Record<string, string> = {};

    if (script.src) attributes.src = script.src;

    const elements: any[] = [];
    if (script.content) {
      elements.push({
        type: 'text',
        text: script.content
      });
    }

    return {
      type: 'element',
      name: 'script',
      attributes,
      elements: elements.length > 0 ? elements : undefined
    };
  }

  private addExecutableContent(elements: any[], container: any): void {
    if (container.raise) {
      container.raise.forEach((raise: RaiseElement) => {
        elements.push({
          type: 'element',
          name: 'raise',
          attributes: { event: raise.event }
        });
      });
    }

    if (container.if) {
      container.if.forEach((ifElement: IfElement) => {
        elements.push(this.buildIfElement(ifElement));
      });
    }

    if (container.foreach) {
      container.foreach.forEach((foreach: ForEachElement) => {
        elements.push(this.buildForEachElement(foreach));
      });
    }

    if (container.log) {
      container.log.forEach((log: LogElement) => {
        const attributes: Record<string, string> = {};
        if (log.label) attributes.label = log.label;
        if (log.expr) attributes.expr = log.expr;

        elements.push({
          type: 'element',
          name: 'log',
          attributes
        });
      });
    }

    if (container.assign) {
      container.assign.forEach((assign: AssignElement) => {
        const attributes: Record<string, string> = { location: assign.location };
        if (assign.expr) attributes.expr = assign.expr;

        elements.push({
          type: 'element',
          name: 'assign',
          attributes
        });
      });
    }

    if (container.send) {
      container.send.forEach((send: SendElement) => {
        elements.push(this.buildSendElement(send));
      });
    }

    if (container.cancel) {
      container.cancel.forEach((cancel: CancelElement) => {
        const attributes: Record<string, string> = {};
        if (cancel.sendid) attributes.sendid = cancel.sendid;
        if (cancel.sendidexpr) attributes.sendidexpr = cancel.sendidexpr;

        elements.push({
          type: 'element',
          name: 'cancel',
          attributes
        });
      });
    }

    if (container.script) {
      container.script.forEach((script: ScriptElement) => {
        elements.push(this.buildScriptElement(script));
      });
    }
  }

  private buildIfElement(ifElement: IfElement): any {
    const attributes: Record<string, string> = { cond: ifElement.cond };
    const elements: any[] = [];

    this.addExecutableContent(elements, ifElement);

    return {
      type: 'element',
      name: 'if',
      attributes,
      elements: elements.length > 0 ? elements : undefined
    };
  }

  private buildForEachElement(foreach: ForEachElement): any {
    const attributes: Record<string, string> = {
      array: foreach.array,
      item: foreach.item
    };

    if (foreach.index) attributes.index = foreach.index;

    const elements: any[] = [];
    this.addExecutableContent(elements, foreach);

    return {
      type: 'element',
      name: 'foreach',
      attributes,
      elements: elements.length > 0 ? elements : undefined
    };
  }

  private buildSendElement(send: SendElement): any {
    const attributes: Record<string, string> = {};

    if (send.event) attributes.event = send.event;
    if (send.eventexpr) attributes.eventexpr = send.eventexpr;
    if (send.target) attributes.target = send.target;
    if (send.targetexpr) attributes.targetexpr = send.targetexpr;
    if (send.type) attributes.type = send.type;
    if (send.typeexpr) attributes.typeexpr = send.typeexpr;
    if (send.id) attributes.id = send.id;
    if (send.idlocation) attributes.idlocation = send.idlocation;
    if (send.delay) attributes.delay = send.delay;
    if (send.delayexpr) attributes.delayexpr = send.delayexpr;
    if (send.namelist) attributes.namelist = send.namelist;

    const elements: any[] = [];

    if (send.param) {
      send.param.forEach(param => {
        elements.push(this.buildParamElement(param));
      });
    }

    if (send.content) {
      elements.push(this.buildContentElement(send.content));
    }

    return {
      type: 'element',
      name: 'send',
      attributes,
      elements: elements.length > 0 ? elements : undefined
    };
  }
}