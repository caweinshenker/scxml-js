import { XMLBuilder } from 'fast-xml-parser';
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
  format?: boolean;
  indentBy?: string;
  suppressEmptyNode?: boolean;
  suppressUnpairedNode?: boolean;
  suppressBooleanAttributes?: boolean;
  tagValueProcessor?: (name: string, value: unknown) => unknown;
  attributeValueProcessor?: (name: string, value: unknown) => unknown;
  cdataPropName?: string;
  preserveOrder?: boolean;
  ignoreAttributes?: boolean;
  processEntities?: boolean;
}

export class SCXMLSerializer {
  private options: SerializationOptions;

  constructor(options: SerializationOptions = {}) {
    this.options = {
      format: true,
      indentBy: '  ',
      suppressEmptyNode: false,
      suppressUnpairedNode: false,
      suppressBooleanAttributes: false,
      preserveOrder: true,
      ignoreAttributes: false,
      processEntities: true,
      cdataPropName: '#cdata',
      ...options
    };
  }

  serialize(document: SCXMLDocument): string {
    const builder = new XMLBuilder(this.options);
    const xmlObject = this.convertToPreserveOrderFormat(document);
    
    // Add XML declaration manually since fast-xml-parser with preserveOrder doesn't handle it the same way
    const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const xmlContent = builder.build(xmlObject);
    
    return xmlDeclaration + xmlContent;
  }

  private convertToPreserveOrderFormat(document: SCXMLDocument): any[] {
    // With preserveOrder, we return an array format like the parser expects
    const scxmlElement = this.buildScxmlElementPreserveOrder(document.scxml);
    return [scxmlElement];
  }

  private buildScxmlElementPreserveOrder(scxml: SCXMLElement): any {
    const result: any = { scxml: [] };
    
    // Add attributes in a consistent order
    const attributes: Record<string, string> = {};
    if (scxml.initial) attributes['@_initial'] = scxml.initial;
    if (scxml.name) attributes['@_name'] = scxml.name;
    if (scxml.version) attributes['@_version'] = scxml.version;
    if (scxml.datamodel) attributes['@_datamodel'] = scxml.datamodel;
    if (scxml.xmlns) attributes['@_xmlns'] = scxml.xmlns;
    
    if (Object.keys(attributes).length > 0) {
      result[':@'] = attributes;
    }

    // Add child elements in a consistent order
    if (scxml.datamodel_element) {
      this.addElementToArray(result.scxml, this.buildDataModelElementPreserveOrder(scxml.datamodel_element));
    }

    if (scxml.script) {
      scxml.script.forEach(script => {
        this.addElementToArray(result.scxml, this.buildScriptElementPreserveOrder(script));
      });
    }

    if (scxml.state) {
      scxml.state.forEach(state => {
        this.addElementToArray(result.scxml, this.buildStateElementPreserveOrder(state));
      });
    }

    if (scxml.parallel) {
      scxml.parallel.forEach(parallel => {
        this.addElementToArray(result.scxml, this.buildParallelElementPreserveOrder(parallel));
      });
    }

    if (scxml.final) {
      scxml.final.forEach(final => {
        this.addElementToArray(result.scxml, this.buildFinalElementPreserveOrder(final));
      });
    }

    return result;
  }

  private addElementToArray(array: any[], element: any): void {
    array.push(element);
  }

  private buildStateElementPreserveOrder(state: StateElement): any {
    const result: any = { state: [] };
    
    // Add attributes in consistent order
    const attributes: Record<string, string> = { '@_id': state.id };
    if (state.initial) attributes['@_initial'] = state.initial;
    
    if (Object.keys(attributes).length > 0) {
      result[':@'] = attributes;
    }

    // Add child elements in consistent order
    if (state.datamodel) {
      this.addElementToArray(result.state, this.buildDataModelElementPreserveOrder(state.datamodel));
    }

    if (state.onentry) {
      state.onentry.forEach(onentry => {
        this.addElementToArray(result.state, this.buildOnEntryElementPreserveOrder(onentry));
      });
    }

    if (state.onexit) {
      state.onexit.forEach(onexit => {
        this.addElementToArray(result.state, this.buildOnExitElementPreserveOrder(onexit));
      });
    }

    if (state.transition) {
      state.transition.forEach(transition => {
        this.addElementToArray(result.state, this.buildTransitionElementPreserveOrder(transition));
      });
    }

    if (state.state) {
      state.state.forEach(childState => {
        this.addElementToArray(result.state, this.buildStateElementPreserveOrder(childState));
      });
    }

    if (state.parallel) {
      state.parallel.forEach(parallel => {
        this.addElementToArray(result.state, this.buildParallelElementPreserveOrder(parallel));
      });
    }

    if (state.final) {
      state.final.forEach(final => {
        this.addElementToArray(result.state, this.buildFinalElementPreserveOrder(final));
      });
    }

    if (state.history) {
      state.history.forEach(history => {
        this.addElementToArray(result.state, this.buildHistoryElementPreserveOrder(history));
      });
    }

    if (state.invoke) {
      state.invoke.forEach(invoke => {
        this.addElementToArray(result.state, this.buildInvokeElementPreserveOrder(invoke));
      });
    }

    return result;
  }

  private buildParallelElementPreserveOrder(parallel: ParallelElement): any {
    const result: any = { parallel: [] };
    
    const attributes: Record<string, string> = { '@_id': parallel.id };
    if (Object.keys(attributes).length > 0) {
      result[':@'] = attributes;
    }

    if (parallel.datamodel) {
      this.addElementToArray(result.parallel, this.buildDataModelElementPreserveOrder(parallel.datamodel));
    }

    if (parallel.onentry) {
      parallel.onentry.forEach(onentry => {
        this.addElementToArray(result.parallel, this.buildOnEntryElementPreserveOrder(onentry));
      });
    }

    if (parallel.onexit) {
      parallel.onexit.forEach(onexit => {
        this.addElementToArray(result.parallel, this.buildOnExitElementPreserveOrder(onexit));
      });
    }

    if (parallel.transition) {
      parallel.transition.forEach(transition => {
        this.addElementToArray(result.parallel, this.buildTransitionElementPreserveOrder(transition));
      });
    }

    if (parallel.state) {
      parallel.state.forEach(state => {
        this.addElementToArray(result.parallel, this.buildStateElementPreserveOrder(state));
      });
    }

    if (parallel.parallel) {
      parallel.parallel.forEach(childParallel => {
        this.addElementToArray(result.parallel, this.buildParallelElementPreserveOrder(childParallel));
      });
    }

    if (parallel.history) {
      parallel.history.forEach(history => {
        this.addElementToArray(result.parallel, this.buildHistoryElementPreserveOrder(history));
      });
    }

    if (parallel.invoke) {
      parallel.invoke.forEach(invoke => {
        this.addElementToArray(result.parallel, this.buildInvokeElementPreserveOrder(invoke));
      });
    }

    return result;
  }

  private buildFinalElementPreserveOrder(final: FinalElement): any {
    const result: any = { final: [] };
    
    const attributes: Record<string, string> = { '@_id': final.id };
    if (Object.keys(attributes).length > 0) {
      result[':@'] = attributes;
    }

    if (final.onentry) {
      final.onentry.forEach(onentry => {
        this.addElementToArray(result.final, this.buildOnEntryElementPreserveOrder(onentry));
      });
    }

    if (final.onexit) {
      final.onexit.forEach(onexit => {
        this.addElementToArray(result.final, this.buildOnExitElementPreserveOrder(onexit));
      });
    }

    if (final.donedata) {
      this.addElementToArray(result.final, this.buildDoneDataElementPreserveOrder(final.donedata));
    }

    return result;
  }

  private buildTransitionElementPreserveOrder(transition: TransitionElement): any {
    const result: any = { transition: [] };
    
    const attributes: Record<string, string> = {};
    if (transition.event) attributes['@_event'] = transition.event;
    if (transition.cond) attributes['@_cond'] = transition.cond;
    if (transition.target) attributes['@_target'] = transition.target;
    if (transition.type) attributes['@_type'] = transition.type;
    
    if (Object.keys(attributes).length > 0) {
      result[':@'] = attributes;
    }

    this.addExecutableContentPreserveOrder(result.transition, transition);

    return result;
  }

  private buildOnEntryElementPreserveOrder(onentry: OnEntryElement): any {
    const result: any = { onentry: [] };
    this.addExecutableContentPreserveOrder(result.onentry, onentry);
    return result;
  }

  private buildOnExitElementPreserveOrder(onexit: OnExitElement): any {
    const result: any = { onexit: [] };
    this.addExecutableContentPreserveOrder(result.onexit, onexit);
    return result;
  }

  private buildDataModelElementPreserveOrder(datamodel: DataModelElement): any {
    const result: any = { datamodel: [] };

    if (datamodel.data) {
      datamodel.data.forEach(data => {
        this.addElementToArray(result.datamodel, this.buildDataElementPreserveOrder(data));
      });
    }

    return result;
  }

  private buildDataElementPreserveOrder(data: DataElement): any {
    const result: any = { data: [] };
    
    const attributes: Record<string, string> = { '@_id': data.id };
    if (data.src) attributes['@_src'] = data.src;
    if (data.expr) attributes['@_expr'] = data.expr;
    
    if (Object.keys(attributes).length > 0) {
      result[':@'] = attributes;
    }

    if (data.content) {
      result.data.push({ '#text': data.content });
    }

    return result;
  }

  private buildInvokeElementPreserveOrder(invoke: InvokeElement): any {
    const result: any = { invoke: [] };
    
    const attributes: Record<string, string> = {};
    if (invoke.type) attributes['@_type'] = invoke.type;
    if (invoke.src) attributes['@_src'] = invoke.src;
    if (invoke.id) attributes['@_id'] = invoke.id;
    if (invoke.idlocation) attributes['@_idlocation'] = invoke.idlocation;
    if (invoke.srcexpr) attributes['@_srcexpr'] = invoke.srcexpr;
    if (invoke.autoforward !== undefined) attributes['@_autoforward'] = invoke.autoforward.toString();
    
    if (Object.keys(attributes).length > 0) {
      result[':@'] = attributes;
    }

    if (invoke.param) {
      invoke.param.forEach(param => {
        this.addElementToArray(result.invoke, this.buildParamElementPreserveOrder(param));
      });
    }

    if (invoke.content) {
      this.addElementToArray(result.invoke, this.buildContentElementPreserveOrder(invoke.content));
    }

    return result;
  }

  private buildHistoryElementPreserveOrder(history: HistoryElement): any {
    const result: any = { history: [] };
    
    const attributes: Record<string, string> = {
      '@_id': history.id,
      '@_type': history.type
    };
    
    if (Object.keys(attributes).length > 0) {
      result[':@'] = attributes;
    }

    if (history.transition) {
      this.addElementToArray(result.history, this.buildTransitionElementPreserveOrder(history.transition));
    }

    return result;
  }

  private buildParamElementPreserveOrder(param: ParamElement): any {
    const result: any = { param: [] };
    
    const attributes: Record<string, string> = { '@_name': param.name };
    if (param.expr) attributes['@_expr'] = param.expr;
    if (param.location) attributes['@_location'] = param.location;
    
    if (Object.keys(attributes).length > 0) {
      result[':@'] = attributes;
    }

    return result;
  }

  private buildContentElementPreserveOrder(content: ContentElement): any {
    const result: any = { content: [] };
    
    const attributes: Record<string, string> = {};
    if (content.expr) attributes['@_expr'] = content.expr;
    
    if (Object.keys(attributes).length > 0) {
      result[':@'] = attributes;
    }

    if (content.content) {
      result.content.push({ '#text': content.content });
    }

    return result;
  }

  private buildDoneDataElementPreserveOrder(donedata: DoneDataElement): any {
    const result: any = { donedata: [] };

    if (donedata.content) {
      this.addElementToArray(result.donedata, this.buildContentElementPreserveOrder(donedata.content));
    }

    if (donedata.param) {
      donedata.param.forEach(param => {
        this.addElementToArray(result.donedata, this.buildParamElementPreserveOrder(param));
      });
    }

    return result;
  }

  private buildScriptElementPreserveOrder(script: ScriptElement): any {
    const result: any = { script: [] };
    
    const attributes: Record<string, string> = {};
    if (script.src) attributes['@_src'] = script.src;
    
    if (Object.keys(attributes).length > 0) {
      result[':@'] = attributes;
    }

    if (script.content) {
      result.script.push({ '#text': script.content });
    }

    return result;
  }

  private addExecutableContentPreserveOrder(elements: any[], container: any): void {
    if (container.raise) {
      container.raise.forEach((raise: RaiseElement) => {
        this.addElementToArray(elements, {
          raise: [],
          ':@': { '@_event': raise.event }
        });
      });
    }

    if (container.if) {
      container.if.forEach((ifElement: IfElement) => {
        this.addElementToArray(elements, this.buildIfElementPreserveOrder(ifElement));
      });
    }

    if (container.foreach) {
      container.foreach.forEach((foreach: ForEachElement) => {
        this.addElementToArray(elements, this.buildForEachElementPreserveOrder(foreach));
      });
    }

    if (container.log) {
      container.log.forEach((log: LogElement) => {
        const attributes: Record<string, string> = {};
        if (log.label) attributes['@_label'] = log.label;
        if (log.expr) attributes['@_expr'] = log.expr;

        this.addElementToArray(elements, {
          log: [],
          ':@': attributes
        });
      });
    }

    if (container.assign) {
      container.assign.forEach((assign: AssignElement) => {
        const attributes: Record<string, string> = { '@_location': assign.location };
        if (assign.expr) attributes['@_expr'] = assign.expr;

        this.addElementToArray(elements, {
          assign: [],
          ':@': attributes
        });
      });
    }

    if (container.send) {
      container.send.forEach((send: SendElement) => {
        this.addElementToArray(elements, this.buildSendElementPreserveOrder(send));
      });
    }

    if (container.cancel) {
      container.cancel.forEach((cancel: CancelElement) => {
        const attributes: Record<string, string> = {};
        if (cancel.sendid) attributes['@_sendid'] = cancel.sendid;
        if (cancel.sendidexpr) attributes['@_sendidexpr'] = cancel.sendidexpr;

        this.addElementToArray(elements, {
          cancel: [],
          ':@': attributes
        });
      });
    }

    if (container.script) {
      container.script.forEach((script: ScriptElement) => {
        this.addElementToArray(elements, this.buildScriptElementPreserveOrder(script));
      });
    }
  }

  private buildIfElementPreserveOrder(ifElement: IfElement): any {
    const result: any = { if: [] };
    
    const attributes: Record<string, string> = { '@_cond': ifElement.cond };
    if (Object.keys(attributes).length > 0) {
      result[':@'] = attributes;
    }

    this.addExecutableContentPreserveOrder(result.if, ifElement);

    return result;
  }

  private buildForEachElementPreserveOrder(foreach: ForEachElement): any {
    const result: any = { foreach: [] };
    
    const attributes: Record<string, string> = {
      '@_array': foreach.array,
      '@_item': foreach.item
    };

    if (foreach.index) attributes['@_index'] = foreach.index;
    
    if (Object.keys(attributes).length > 0) {
      result[':@'] = attributes;
    }

    this.addExecutableContentPreserveOrder(result.foreach, foreach);

    return result;
  }

  private buildSendElementPreserveOrder(send: SendElement): any {
    const result: any = { send: [] };
    
    const attributes: Record<string, string> = {};
    if (send.event) attributes['@_event'] = send.event;
    if (send.eventexpr) attributes['@_eventexpr'] = send.eventexpr;
    if (send.target) attributes['@_target'] = send.target;
    if (send.targetexpr) attributes['@_targetexpr'] = send.targetexpr;
    if (send.type) attributes['@_type'] = send.type;
    if (send.typeexpr) attributes['@_typeexpr'] = send.typeexpr;
    if (send.id) attributes['@_id'] = send.id;
    if (send.idlocation) attributes['@_idlocation'] = send.idlocation;
    if (send.delay) attributes['@_delay'] = send.delay;
    if (send.delayexpr) attributes['@_delayexpr'] = send.delayexpr;
    if (send.namelist) attributes['@_namelist'] = send.namelist;
    
    if (Object.keys(attributes).length > 0) {
      result[':@'] = attributes;
    }

    if (send.param) {
      send.param.forEach(param => {
        this.addElementToArray(result.send, this.buildParamElementPreserveOrder(param));
      });
    }

    if (send.content) {
      this.addElementToArray(result.send, this.buildContentElementPreserveOrder(send.content));
    }

    return result;
  }
}