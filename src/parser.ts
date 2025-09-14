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
        case 'invoke':
          if (!state.invoke) state.invoke = [];
          if (Array.isArray(childElement)) {
            childElement.forEach(child => state.invoke!.push(this.parseInvokeElement(child)));
          } else {
            state.invoke.push(this.parseInvokeElement(childElement));
          }
          break;
        case 'datamodel':
          state.datamodel = this.parseDataModelElement(childElement);
          break;
        case 'history':
          if (!state.history) state.history = [];
          if (Array.isArray(childElement)) {
            childElement.forEach(child => state.history!.push(this.parseHistoryElement(child)));
          } else {
            state.history.push(this.parseHistoryElement(childElement));
          }
          break;
        }
      }
    }

    return state;
  }

  private parseParallelElement(element: any): ParallelElement {
    const parallel: ParallelElement = {
      id: element['@_id'] || ''
    };

    // Parse child elements
    for (const key of Object.keys(element)) {
      if (key.startsWith('@_') || key === '#text' || key === '#cdata') continue;

      const childElement = element[key];

      switch (key) {
        case 'state':
          if (!parallel.state) parallel.state = [];
          if (Array.isArray(childElement)) {
            childElement.forEach(child => parallel.state!.push(this.parseStateElement(child)));
          } else {
            parallel.state.push(this.parseStateElement(childElement));
          }
          break;
        case 'parallel':
          if (!parallel.parallel) parallel.parallel = [];
          if (Array.isArray(childElement)) {
            childElement.forEach(child => parallel.parallel!.push(this.parseParallelElement(child)));
          } else {
            parallel.parallel.push(this.parseParallelElement(childElement));
          }
          break;
        case 'onentry':
          if (!parallel.onentry) parallel.onentry = [];
          if (Array.isArray(childElement)) {
            childElement.forEach(child => parallel.onentry!.push(this.parseOnEntryElement(child)));
          } else {
            parallel.onentry.push(this.parseOnEntryElement(childElement));
          }
          break;
        case 'onexit':
          if (!parallel.onexit) parallel.onexit = [];
          if (Array.isArray(childElement)) {
            childElement.forEach(child => parallel.onexit!.push(this.parseOnExitElement(child)));
          } else {
            parallel.onexit.push(this.parseOnExitElement(childElement));
          }
          break;
        case 'transition':
          if (!parallel.transition) parallel.transition = [];
          if (Array.isArray(childElement)) {
            childElement.forEach(child => parallel.transition!.push(this.parseTransitionElement(child)));
          } else {
            parallel.transition.push(this.parseTransitionElement(childElement));
          }
          break;
        case 'invoke':
          if (!parallel.invoke) parallel.invoke = [];
          if (Array.isArray(childElement)) {
            childElement.forEach(child => parallel.invoke!.push(this.parseInvokeElement(child)));
          } else {
            parallel.invoke.push(this.parseInvokeElement(childElement));
          }
          break;
        case 'datamodel':
          parallel.datamodel = this.parseDataModelElement(childElement);
          break;
        case 'history':
          if (!parallel.history) parallel.history = [];
          if (Array.isArray(childElement)) {
            childElement.forEach(child => parallel.history!.push(this.parseHistoryElement(child)));
          } else {
            parallel.history.push(this.parseHistoryElement(childElement));
          }
          break;
        }
      }
    }

    return parallel;
  }

  private parseFinalElement(element: any): FinalElement {
    const finalElement: FinalElement = {
      id: element['@_id'] || ''
    };

    // Parse child elements
    for (const key of Object.keys(element)) {
      if (key.startsWith('@_') || key === '#text' || key === '#cdata') continue;

      const childElement = element[key];

      switch (key) {
        case 'onentry':
          if (!finalElement.onentry) finalElement.onentry = [];
          if (Array.isArray(childElement)) {
            childElement.forEach(child => finalElement.onentry!.push(this.parseOnEntryElement(child)));
          } else {
            finalElement.onentry.push(this.parseOnEntryElement(childElement));
          }
          break;
        case 'onexit':
          if (!finalElement.onexit) finalElement.onexit = [];
          if (Array.isArray(childElement)) {
            childElement.forEach(child => finalElement.onexit!.push(this.parseOnExitElement(child)));
          } else {
            finalElement.onexit.push(this.parseOnExitElement(childElement));
          }
          break;
        case 'donedata':
          finalElement.donedata = this.parseDoneDataElement(childElement);
          break;
        }
      }
    }

    return finalElement;
  }

  private parseTransitionElement(element: any): TransitionElement {
    const transition: TransitionElement = {};

    const event = this.getAttributeValue(element, '@_event');
    const cond = this.getAttributeValue(element, '@_cond');
    const target = this.getAttributeValue(element, '@_target');

    if (event !== undefined) transition.event = event;
    if (cond !== undefined) transition.cond = cond;
    if (target !== undefined) transition.target = target;
    if (element['@_type']) transition.type = element['@_type'] as 'internal' | 'external';

    this.parseExecutableContent(element, transition);

    return transition;
  }

  private parseOnEntryElement(element: any): OnEntryElement {
    const onentry: OnEntryElement = {};
    this.parseExecutableContent(element, onentry);
    return onentry;
  }

  private parseOnExitElement(element: any): OnExitElement {
    const onexit: OnExitElement = {};
    this.parseExecutableContent(element, onexit);
    return onexit;
  }

  private parseDataModelElement(element: any): DataModelElement {
    const datamodel: DataModelElement = {};

    // Check for data elements
    if (element.data) {
      datamodel.data = [];
      if (Array.isArray(element.data)) {
        element.data.forEach((child: any) => datamodel.data!.push(this.parseDataElement(child)));
      } else {
        datamodel.data.push(this.parseDataElement(element.data));
      }
    }

    return datamodel;
  }

  private parseDataElement(element: any): DataElement {
    const data: DataElement = {
      id: element['@_id'] || ''
    };

    if (element['@_src']) data.src = element['@_src'];
    if (element['@_expr']) data.expr = element['@_expr'];
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

  private parseScriptElement(element: any): ScriptElement {
    const script: ScriptElement = {};

    if (element['@_src']) script.src = element['@_src'];
    const textContent = this.extractTextContent(element);
    if (textContent !== undefined) script.content = textContent;

    return script;
  }

  private parseExecutableContent(element: any, target: any): void {
    // Parse executable content child elements
    for (const key of Object.keys(element)) {
      if (key.startsWith('@_') || key === '#text' || key === '#cdata') continue;

      const childElement = element[key];

      switch (key) {
        case 'raise':
          if (!target.raise) target.raise = [];
          if (Array.isArray(childElement)) {
            childElement.forEach(child => target.raise.push(this.parseRaiseElement(child)));
          } else {
            target.raise.push(this.parseRaiseElement(childElement));
          }
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