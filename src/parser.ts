import { XMLParser, XMLValidator } from 'fast-xml-parser';
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
    // Check for invalid XML characters (control characters except tab, newline, carriage return)
    if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(xmlString)) {
      throw new Error('Invalid XML characters detected');
    }

    // Validate XML structure first
    const validation = XMLValidator.validate(xmlString, {
      allowBooleanAttributes: true
    });

    if (validation !== true) {
      throw new Error('Malformed XML: ' + validation.err.msg);
    }

    // Parse the XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      cdataTagName: '#cdata',
      parseAttributeValue: false,
      parseTagValue: false,
      trimValues: false,
      parseTrueNumberOnly: false
    });

    const result = parser.parse(xmlString);

    if (!result.scxml) {
      throw new Error('No scxml root element found');
    }

    return {
      scxml: this.parseScxmlElement(result.scxml)
    };
  }

  private extractTextContent(element: any): string | undefined {
    // fast-xml-parser puts text in #text and CDATA in #cdata
    let content = '';

    if (element['#text']) {
      content += element['#text'];
    }

    if (element['#cdata']) {
      content += element['#cdata'];
    }

    return content || undefined;
  }

  private getAttributeValue(attributes: any, key: string): string | undefined {
    const value = attributes[key];
    // Explicitly handle empty string attributes (they should remain empty, not undefined)
    return value !== undefined ? (value as string) : undefined;
  }

  private parseScxmlElement(element: any): SCXMLElement {
    const scxml: SCXMLElement = {};

    // Extract attributes from the element (fast-xml-parser puts them as direct properties starting with @)
    for (const key of Object.keys(element)) {
      if (key.startsWith('@_')) {
        const attrName = key.substring(2); // Remove @_ prefix
        const value = element[key];

        switch (attrName) {
          case 'initial':
            scxml.initial = value;
            break;
          case 'name':
            scxml.name = value;
            break;
          case 'version':
            scxml.version = value;
            break;
          case 'datamodel':
            scxml.datamodel = value;
            break;
          case 'xmlns':
            scxml.xmlns = value;
            break;
        }
      }
    }

    // Parse child elements
    for (const key of Object.keys(element)) {
      if (key.startsWith('@_') || key === '#text' || key === '#cdata') continue;

      const childElement = element[key];

      switch (key) {
        case 'state':
          if (!scxml.state) scxml.state = [];
          if (Array.isArray(childElement)) {
            childElement.forEach(child => scxml.state!.push(this.parseStateElement(child)));
          } else {
            scxml.state.push(this.parseStateElement(childElement));
          }
          break;
        case 'parallel':
          if (!scxml.parallel) scxml.parallel = [];
          if (Array.isArray(childElement)) {
            childElement.forEach(child => scxml.parallel!.push(this.parseParallelElement(child)));
          } else {
            scxml.parallel.push(this.parseParallelElement(childElement));
          }
          break;
        case 'final':
          if (!scxml.final) scxml.final = [];
          if (Array.isArray(childElement)) {
            childElement.forEach(child => scxml.final!.push(this.parseFinalElement(child)));
          } else {
            scxml.final.push(this.parseFinalElement(childElement));
          }
          break;
        case 'datamodel':
          scxml.datamodel_element = this.parseDataModelElement(childElement);
          break;
        case 'script':
          if (!scxml.script) scxml.script = [];
          if (Array.isArray(childElement)) {
            childElement.forEach(child => scxml.script!.push(this.parseScriptElement(child)));
          } else {
            scxml.script.push(this.parseScriptElement(childElement));
          }
          break;
        }
      }
    }

    return scxml;
  }

  private parseStateElement(element: any): StateElement {
    const state: StateElement = {
      id: this.getAttributeValue(element, '@_id') || ''
    };

    // Handle other attributes
    if (element['@_initial']) state.initial = element['@_initial'];
    if (element['@_final']) state.final = element['@_final'] === 'true';

    // Parse child elements
    for (const key of Object.keys(element)) {
      if (key.startsWith('@_') || key === '#text' || key === '#cdata') continue;

      const childElement = element[key];

      switch (key) {
        case 'state':
          if (!state.state) state.state = [];
          if (Array.isArray(childElement)) {
            childElement.forEach(child => state.state!.push(this.parseStateElement(child)));
          } else {
            state.state.push(this.parseStateElement(childElement));
          }
          break;
        case 'parallel':
          if (!state.parallel) state.parallel = [];
          if (Array.isArray(childElement)) {
            childElement.forEach(child => state.parallel!.push(this.parseParallelElement(child)));
          } else {
            state.parallel.push(this.parseParallelElement(childElement));
          }
          break;
        case 'final':
          if (!state.final) state.final = [];
          if (Array.isArray(childElement)) {
            childElement.forEach(child => state.final!.push(this.parseFinalElement(child)));
          } else {
            state.final.push(this.parseFinalElement(childElement));
          }
          break;
        case 'onentry':
          if (!state.onentry) state.onentry = [];
          if (Array.isArray(childElement)) {
            childElement.forEach(child => state.onentry!.push(this.parseOnEntryElement(child)));
          } else {
            state.onentry.push(this.parseOnEntryElement(childElement));
          }
          break;
        case 'onexit':
          if (!state.onexit) state.onexit = [];
          if (Array.isArray(childElement)) {
            childElement.forEach(child => state.onexit!.push(this.parseOnExitElement(child)));
          } else {
            state.onexit.push(this.parseOnExitElement(childElement));
          }
          break;
        case 'transition':
          if (!state.transition) state.transition = [];
          if (Array.isArray(childElement)) {
            childElement.forEach(child => state.transition!.push(this.parseTransitionElement(child)));
          } else {
            state.transition.push(this.parseTransitionElement(childElement));
          }
          break;
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

    const event = this.getAttributeValue(attributes, 'event');
    const cond = this.getAttributeValue(attributes, 'cond');
    const target = this.getAttributeValue(attributes, 'target');

    if (event !== undefined) transition.event = event;
    if (cond !== undefined) transition.cond = cond;
    if (target !== undefined) transition.target = target;
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
    const textContent = this.extractTextContent(element);
    if (textContent !== undefined) data.content = textContent;

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
    const textContent = this.extractTextContent(element);
    if (textContent !== undefined) content.content = textContent;

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
    const textContent = this.extractTextContent(element);
    if (textContent !== undefined) script.content = textContent;

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