import { xml2js, Element, ElementCompact } from 'xml-js';
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
  ExecutableContent,
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

export class SCXMLParser {
  parse(xmlString: string): SCXMLDocument {
    const result = xml2js(xmlString, { 
      compact: false, 
      ignoreComment: true, 
      ignoreInstruction: true,
      ignoreDoctype: true,
      trim: true
    }) as Element;

    const scxmlElement = this.findElement(result, 'scxml');
    if (!scxmlElement) {
      throw new Error('No scxml root element found');
    }

    return {
      scxml: this.parseScxmlElement(scxmlElement)
    };
  }

  private findElement(element: Element, name: string): Element | undefined {
    if (element.name === name) {
      return element;
    }
    
    if (element.elements) {
      for (const child of element.elements) {
        const found = this.findElement(child, name);
        if (found) return found;
      }
    }
    
    return undefined;
  }

  private parseScxmlElement(element: Element): SCXMLElement {
    const attributes = element.attributes || {};
    const scxml: SCXMLElement = {};

    if (attributes.initial) scxml.initial = attributes.initial as string;
    if (attributes.name) scxml.name = attributes.name as string;
    if (attributes.version) scxml.version = attributes.version as string;
    if (attributes.datamodel) scxml.datamodel = attributes.datamodel as string;
    if (attributes.xmlns) scxml.xmlns = attributes.xmlns as string;

    if (element.elements) {
      for (const child of element.elements) {
        switch (child.name) {
          case 'state':
            if (!scxml.state) scxml.state = [];
            scxml.state.push(this.parseStateElement(child));
            break;
          case 'parallel':
            if (!scxml.parallel) scxml.parallel = [];
            scxml.parallel.push(this.parseParallelElement(child));
            break;
          case 'final':
            if (!scxml.final) scxml.final = [];
            scxml.final.push(this.parseFinalElement(child));
            break;
          case 'datamodel':
            scxml.datamodel_element = this.parseDataModelElement(child);
            break;
          case 'script':
            if (!scxml.script) scxml.script = [];
            scxml.script.push(this.parseScriptElement(child));
            break;
        }
      }
    }

    return scxml;
  }

  private parseStateElement(element: Element): StateElement {
    const attributes = element.attributes || {};
    const state: StateElement = {
      id: attributes.id as string
    };

    if (attributes.initial) state.initial = attributes.initial as string;

    if (element.elements) {
      for (const child of element.elements) {
        switch (child.name) {
          case 'state':
            if (!state.state) state.state = [];
            state.state.push(this.parseStateElement(child));
            break;
          case 'parallel':
            if (!state.parallel) state.parallel = [];
            state.parallel.push(this.parseParallelElement(child));
            break;
          case 'final':
            if (!state.final) state.final = [];
            state.final.push(this.parseFinalElement(child));
            break;
          case 'onentry':
            if (!state.onentry) state.onentry = [];
            state.onentry.push(this.parseOnEntryElement(child));
            break;
          case 'onexit':
            if (!state.onexit) state.onexit = [];
            state.onexit.push(this.parseOnExitElement(child));
            break;
          case 'transition':
            if (!state.transition) state.transition = [];
            state.transition.push(this.parseTransitionElement(child));
            break;
          case 'invoke':
            if (!state.invoke) state.invoke = [];
            state.invoke.push(this.parseInvokeElement(child));
            break;
          case 'datamodel':
            state.datamodel = this.parseDataModelElement(child);
            break;
          case 'history':
            if (!state.history) state.history = [];
            state.history.push(this.parseHistoryElement(child));
            break;
        }
      }
    }

    return state;
  }

  private parseParallelElement(element: Element): ParallelElement {
    const attributes = element.attributes || {};
    const parallel: ParallelElement = {
      id: attributes.id as string
    };

    if (element.elements) {
      for (const child of element.elements) {
        switch (child.name) {
          case 'state':
            if (!parallel.state) parallel.state = [];
            parallel.state.push(this.parseStateElement(child));
            break;
          case 'parallel':
            if (!parallel.parallel) parallel.parallel = [];
            parallel.parallel.push(this.parseParallelElement(child));
            break;
          case 'onentry':
            if (!parallel.onentry) parallel.onentry = [];
            parallel.onentry.push(this.parseOnEntryElement(child));
            break;
          case 'onexit':
            if (!parallel.onexit) parallel.onexit = [];
            parallel.onexit.push(this.parseOnExitElement(child));
            break;
          case 'transition':
            if (!parallel.transition) parallel.transition = [];
            parallel.transition.push(this.parseTransitionElement(child));
            break;
          case 'invoke':
            if (!parallel.invoke) parallel.invoke = [];
            parallel.invoke.push(this.parseInvokeElement(child));
            break;
          case 'datamodel':
            parallel.datamodel = this.parseDataModelElement(child);
            break;
          case 'history':
            if (!parallel.history) parallel.history = [];
            parallel.history.push(this.parseHistoryElement(child));
            break;
        }
      }
    }

    return parallel;
  }

  private parseFinalElement(element: Element): FinalElement {
    const attributes = element.attributes || {};
    const finalElement: FinalElement = {
      id: attributes.id as string
    };

    if (element.elements) {
      for (const child of element.elements) {
        switch (child.name) {
          case 'onentry':
            if (!finalElement.onentry) finalElement.onentry = [];
            finalElement.onentry.push(this.parseOnEntryElement(child));
            break;
          case 'onexit':
            if (!finalElement.onexit) finalElement.onexit = [];
            finalElement.onexit.push(this.parseOnExitElement(child));
            break;
          case 'donedata':
            finalElement.donedata = this.parseDoneDataElement(child);
            break;
        }
      }
    }

    return finalElement;
  }

  private parseTransitionElement(element: Element): TransitionElement {
    const attributes = element.attributes || {};
    const transition: TransitionElement = {};

    if (attributes.event) transition.event = attributes.event as string;
    if (attributes.cond) transition.cond = attributes.cond as string;
    if (attributes.target) transition.target = attributes.target as string;
    if (attributes.type) transition.type = attributes.type as 'internal' | 'external';

    this.parseExecutableContent(element, transition);

    return transition;
  }

  private parseOnEntryElement(element: Element): OnEntryElement {
    const onentry: OnEntryElement = {};
    this.parseExecutableContent(element, onentry);
    return onentry;
  }

  private parseOnExitElement(element: Element): OnExitElement {
    const onexit: OnExitElement = {};
    this.parseExecutableContent(element, onexit);
    return onexit;
  }

  private parseDataModelElement(element: Element): DataModelElement {
    const datamodel: DataModelElement = {};

    if (element.elements) {
      for (const child of element.elements) {
        if (child.name === 'data') {
          if (!datamodel.data) datamodel.data = [];
          datamodel.data.push(this.parseDataElement(child));
        }
      }
    }

    return datamodel;
  }

  private parseDataElement(element: Element): DataElement {
    const attributes = element.attributes || {};
    const data: DataElement = {
      id: attributes.id as string
    };

    if (attributes.src) data.src = attributes.src as string;
    if (attributes.expr) data.expr = attributes.expr as string;
    if (element.elements?.[0]?.text) data.content = element.elements[0].text as string;

    return data;
  }

  private parseInvokeElement(element: Element): InvokeElement {
    const attributes = element.attributes || {};
    const invoke: InvokeElement = {};

    if (attributes.type) invoke.type = attributes.type as string;
    if (attributes.src) invoke.src = attributes.src as string;
    if (attributes.id) invoke.id = attributes.id as string;
    if (attributes.idlocation) invoke.idlocation = attributes.idlocation as string;
    if (attributes.srcexpr) invoke.srcexpr = attributes.srcexpr as string;
    if (attributes.autoforward) invoke.autoforward = attributes.autoforward === 'true';

    if (element.elements) {
      for (const child of element.elements) {
        switch (child.name) {
          case 'param':
            if (!invoke.param) invoke.param = [];
            invoke.param.push(this.parseParamElement(child));
            break;
          case 'content':
            invoke.content = this.parseContentElement(child);
            break;
        }
      }
    }

    return invoke;
  }

  private parseHistoryElement(element: Element): HistoryElement {
    const attributes = element.attributes || {};
    const history: HistoryElement = {
      id: attributes.id as string,
      type: attributes.type as 'shallow' | 'deep'
    };

    if (element.elements) {
      for (const child of element.elements) {
        if (child.name === 'transition') {
          history.transition = this.parseTransitionElement(child);
        }
      }
    }

    return history;
  }

  private parseParamElement(element: Element): ParamElement {
    const attributes = element.attributes || {};
    const param: ParamElement = {
      name: attributes.name as string
    };

    if (attributes.expr) param.expr = attributes.expr as string;
    if (attributes.location) param.location = attributes.location as string;

    return param;
  }

  private parseContentElement(element: Element): ContentElement {
    const attributes = element.attributes || {};
    const content: ContentElement = {};

    if (attributes.expr) content.expr = attributes.expr as string;
    if (element.elements?.[0]?.text) content.content = element.elements[0].text as string;

    return content;
  }

  private parseDoneDataElement(element: Element): DoneDataElement {
    const donedata: DoneDataElement = {};

    if (element.elements) {
      for (const child of element.elements) {
        switch (child.name) {
          case 'content':
            donedata.content = this.parseContentElement(child);
            break;
          case 'param':
            if (!donedata.param) donedata.param = [];
            donedata.param.push(this.parseParamElement(child));
            break;
        }
      }
    }

    return donedata;
  }

  private parseScriptElement(element: Element): ScriptElement {
    const attributes = element.attributes || {};
    const script: ScriptElement = {};

    if (attributes.src) script.src = attributes.src as string;
    if (element.elements?.[0]?.text) script.content = element.elements[0].text as string;

    return script;
  }

  private parseExecutableContent(element: Element, target: any): void {
    if (!element.elements) return;

    for (const child of element.elements) {
      switch (child.name) {
        case 'raise':
          if (!target.raise) target.raise = [];
          target.raise.push(this.parseRaiseElement(child));
          break;
        case 'if':
          if (!target.if) target.if = [];
          target.if.push(this.parseIfElement(child));
          break;
        case 'foreach':
          if (!target.foreach) target.foreach = [];
          target.foreach.push(this.parseForEachElement(child));
          break;
        case 'log':
          if (!target.log) target.log = [];
          target.log.push(this.parseLogElement(child));
          break;
        case 'assign':
          if (!target.assign) target.assign = [];
          target.assign.push(this.parseAssignElement(child));
          break;
        case 'send':
          if (!target.send) target.send = [];
          target.send.push(this.parseSendElement(child));
          break;
        case 'cancel':
          if (!target.cancel) target.cancel = [];
          target.cancel.push(this.parseCancelElement(child));
          break;
        case 'script':
          if (!target.script) target.script = [];
          target.script.push(this.parseScriptElement(child));
          break;
      }
    }
  }

  private parseRaiseElement(element: Element): RaiseElement {
    const attributes = element.attributes || {};
    return {
      event: attributes.event as string
    };
  }

  private parseIfElement(element: Element): IfElement {
    const attributes = element.attributes || {};
    const ifElement: IfElement = {
      cond: attributes.cond as string
    };

    this.parseExecutableContent(element, ifElement);
    return ifElement;
  }

  private parseForEachElement(element: Element): ForEachElement {
    const attributes = element.attributes || {};
    const forEach: ForEachElement = {
      array: attributes.array as string,
      item: attributes.item as string
    };

    if (attributes.index) forEach.index = attributes.index as string;

    this.parseExecutableContent(element, forEach);
    return forEach;
  }

  private parseLogElement(element: Element): LogElement {
    const attributes = element.attributes || {};
    const log: LogElement = {};

    if (attributes.label) log.label = attributes.label as string;
    if (attributes.expr) log.expr = attributes.expr as string;

    return log;
  }

  private parseAssignElement(element: Element): AssignElement {
    const attributes = element.attributes || {};
    const assign: AssignElement = {
      location: attributes.location as string
    };

    if (attributes.expr) assign.expr = attributes.expr as string;

    return assign;
  }

  private parseSendElement(element: Element): SendElement {
    const attributes = element.attributes || {};
    const send: SendElement = {};

    if (attributes.event) send.event = attributes.event as string;
    if (attributes.eventexpr) send.eventexpr = attributes.eventexpr as string;
    if (attributes.target) send.target = attributes.target as string;
    if (attributes.targetexpr) send.targetexpr = attributes.targetexpr as string;
    if (attributes.type) send.type = attributes.type as string;
    if (attributes.typeexpr) send.typeexpr = attributes.typeexpr as string;
    if (attributes.id) send.id = attributes.id as string;
    if (attributes.idlocation) send.idlocation = attributes.idlocation as string;
    if (attributes.delay) send.delay = attributes.delay as string;
    if (attributes.delayexpr) send.delayexpr = attributes.delayexpr as string;
    if (attributes.namelist) send.namelist = attributes.namelist as string;

    if (element.elements) {
      for (const child of element.elements) {
        switch (child.name) {
          case 'param':
            if (!send.param) send.param = [];
            send.param.push(this.parseParamElement(child));
            break;
          case 'content':
            send.content = this.parseContentElement(child);
            break;
        }
      }
    }

    return send;
  }

  private parseCancelElement(element: Element): CancelElement {
    const attributes = element.attributes || {};
    const cancel: CancelElement = {};

    if (attributes.sendid) cancel.sendid = attributes.sendid as string;
    if (attributes.sendidexpr) cancel.sendidexpr = attributes.sendidexpr as string;

    return cancel;
  }
}