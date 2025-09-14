import { XMLParser, XMLValidator } from "fast-xml-parser";
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
  DoneDataElement,
} from "./types";

export class SCXMLParser {
  // Helper functions for working with preserveOrder structure
  private getAttributes(element: any): any {
    return element[":@"] || {};
  }

  private getTextContent(element: any): string | undefined {
    if (Array.isArray(element)) {
      // Find #text nodes and concatenate them
      return element
        .filter((item) => item["#text"])
        .map((item) => item["#text"])
        .join("");
    }
    return undefined;
  }

  private getChildElements(elementArray: any[], tagName: string): any[] {
    if (!Array.isArray(elementArray)) return [];

    return elementArray
      .filter((item) => item[tagName])
      .map((item) => ({
        element: item[tagName],
        attributes: item[":@"] || {},
      }));
  }

  private getAllChildElements(
    elementArray: any[]
  ): Array<{ tagName: string; element: any; attributes: any }> {
    if (!Array.isArray(elementArray)) return [];

    return elementArray
      .filter((item) => {
        // Skip #text nodes and standalone :@ attribute objects
        const keys = Object.keys(item);
        // We want items that have element tags (not just #text or standalone :@)
        return keys.some(key => key !== "#text" && key !== ":@");
      })
      .map((item) => {
        const tagName = Object.keys(item).find(
          (key) => key !== ":@" && key !== "#text"
        )!;
        return {
          tagName,
          element: item[tagName],
          attributes: item[":@"] || {},
        };
      });
  }

  private extractTextContent(element: any): string | undefined {
    if (typeof element === "string") {
      return element;
    }

    if (Array.isArray(element)) {
      const textNodes = element.filter((item) => item["#text"]);
      if (textNodes.length > 0) {
        return textNodes
          .map((item) => item["#text"])
          .join("")
          .trim();
      }
    }

    return undefined;
  }

  parse(xmlString: string): SCXMLDocument {
    // Check for invalid XML characters (control characters except tab, newline, carriage return)
    if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(xmlString)) {
      throw new Error("Invalid XML characters detected");
    }

    // Trim leading/trailing whitespace to handle XML declarations and processing instructions
    const trimmedXml = xmlString.trim();

    // Validate XML structure first
    const validation = XMLValidator.validate(trimmedXml, {
      allowBooleanAttributes: true,
    });

    if (validation !== true) {
      throw new Error("Malformed XML: " + validation.err.msg);
    }

    // Parse the XML with preserveOrder for deterministic parsing
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      cdataPropName: "#cdata",
      parseAttributeValue: false,
      parseTagValue: false,
      trimValues: false,
      preserveOrder: true,
    });

    const result = parser.parse(trimmedXml);

    // With preserveOrder, result is an array
    if (!Array.isArray(result) || result.length === 0) {
      throw new Error("No scxml root element found");
    }

    // Find the scxml element (may not be at index 0 if there's an XML declaration)
    let scxmlElement = null;
    for (const element of result) {
      if (element.scxml) {
        scxmlElement = element;
        break;
      }
    }

    if (!scxmlElement) {
      throw new Error("No scxml root element found");
    }

    const scxmlData = scxmlElement.scxml;
    const scxmlAttributes = scxmlElement[":@"] || {};

    return {
      scxml: this.parseScxmlElement(scxmlData, scxmlAttributes),
    };
  }


  private getAttributeValue(attributes: any, key: string): string | undefined {
    const value = attributes[key];
    // Explicitly handle empty string attributes (they should remain empty, not undefined)
    return value !== undefined ? (value as string) : undefined;
  }

  private parseScxmlElement(
    elementArray: any[],
    attributes: any
  ): SCXMLElement {
    const scxml: SCXMLElement = {};

    // Extract attributes from the element
    for (const key of Object.keys(attributes)) {
      if (key.startsWith("@_")) {
        const attrName = key.substring(2); // Remove @_ prefix
        const value = attributes[key];

        switch (attrName) {
          case "initial":
            scxml.initial = value;
            break;
          case "name":
            scxml.name = value;
            break;
          case "version":
            scxml.version = value;
            break;
          case "datamodel":
            scxml.datamodel = value;
            break;
          case "xmlns":
            scxml.xmlns = value;
            break;
        }
      }
    }

    // Parse child elements using preserveOrder structure
    const children = this.getAllChildElements(elementArray);

    for (const child of children) {
      switch (child.tagName) {
        case "state":
          if (!scxml.state) scxml.state = [];
          scxml.state.push(
            this.parseStateElement(child.element, child.attributes)
          );
          break;
        case "parallel":
          if (!scxml.parallel) scxml.parallel = [];
          scxml.parallel.push(
            this.parseParallelElement(child.element, child.attributes)
          );
          break;
        case "final":
          if (!scxml.final) scxml.final = [];
          scxml.final.push(
            this.parseFinalElement(child.element, child.attributes)
          );
          break;
        case "datamodel":
          scxml.datamodel_element = this.parseDataModelElement(
            child.element,
            child.attributes
          );
          break;
        case "script":
          if (!scxml.script) scxml.script = [];
          scxml.script.push(
            this.parseScriptElement(child.element, child.attributes)
          );
          break;
      }
    }

    return scxml;
  }

  private parseStateElement(elementArray: any[], attributes: any): StateElement {
    const state: StateElement = {
      id: this.getAttributeValue(attributes, "@_id") || "",
    };

    // Handle other attributes
    if (attributes["@_initial"]) state.initial = attributes["@_initial"];

    // Parse child elements using preserveOrder structure
    const children = this.getAllChildElements(elementArray);
    
    for (const child of children) {
      switch (child.tagName) {
        case "state":
          if (!state.state) state.state = [];
          state.state.push(this.parseStateElement(child.element, child.attributes));
          break;
        case "parallel":
          if (!state.parallel) state.parallel = [];
          state.parallel.push(this.parseParallelElement(child.element, child.attributes));
          break;
        case "final":
          if (!state.final) state.final = [];
          state.final.push(this.parseFinalElement(child.element, child.attributes));
          break;
        case "onentry":
          if (!state.onentry) state.onentry = [];
          state.onentry.push(this.parseOnEntryElement(child.element, child.attributes));
          break;
        case "onexit":
          if (!state.onexit) state.onexit = [];
          state.onexit.push(this.parseOnExitElement(child.element, child.attributes));
          break;
        case "transition":
          if (!state.transition) state.transition = [];
          state.transition.push(this.parseTransitionElement(child.element, child.attributes));
          break;
        case "invoke":
          if (!state.invoke) state.invoke = [];
          state.invoke.push(this.parseInvokeElement(child.element, child.attributes));
          break;
        case "datamodel":
          state.datamodel = this.parseDataModelElement(child.element, child.attributes);
          break;
        case "history":
          if (!state.history) state.history = [];
          state.history.push(this.parseHistoryElement(child.element, child.attributes));
          break;
      }
    }

    return state;
  }

  private parseParallelElement(elementArray: any[], attributes: any): ParallelElement {
    const parallel: ParallelElement = {
      id: attributes["@_id"] || "",
    };

    // Parse child elements using preserveOrder structure
    const children = this.getAllChildElements(elementArray);
    
    for (const child of children) {
      switch (child.tagName) {
        case "state":
          if (!parallel.state) parallel.state = [];
          parallel.state.push(this.parseStateElement(child.element, child.attributes));
          break;
        case "parallel":
          if (!parallel.parallel) parallel.parallel = [];
          parallel.parallel.push(this.parseParallelElement(child.element, child.attributes));
          break;
        case "onentry":
          if (!parallel.onentry) parallel.onentry = [];
          parallel.onentry.push(this.parseOnEntryElement(child.element, child.attributes));
          break;
        case "onexit":
          if (!parallel.onexit) parallel.onexit = [];
          parallel.onexit.push(this.parseOnExitElement(child.element, child.attributes));
          break;
        case "transition":
          if (!parallel.transition) parallel.transition = [];
          parallel.transition.push(this.parseTransitionElement(child.element, child.attributes));
          break;
        case "invoke":
          if (!parallel.invoke) parallel.invoke = [];
          parallel.invoke.push(this.parseInvokeElement(child.element, child.attributes));
          break;
        case "datamodel":
          parallel.datamodel = this.parseDataModelElement(child.element, child.attributes);
          break;
        case "history":
          if (!parallel.history) parallel.history = [];
          parallel.history.push(this.parseHistoryElement(child.element, child.attributes));
          break;
      }
    }

    return parallel;
  }

  private parseFinalElement(elementArray: any[], attributes: any): FinalElement {
    const finalElement: FinalElement = {
      id: attributes["@_id"] || "",
    };

    // Parse child elements using preserveOrder structure
    const children = this.getAllChildElements(elementArray);
    
    for (const child of children) {
      switch (child.tagName) {
        case "onentry":
          if (!finalElement.onentry) finalElement.onentry = [];
          finalElement.onentry.push(this.parseOnEntryElement(child.element, child.attributes));
          break;
        case "onexit":
          if (!finalElement.onexit) finalElement.onexit = [];
          finalElement.onexit.push(this.parseOnExitElement(child.element, child.attributes));
          break;
        case "donedata":
          finalElement.donedata = this.parseDoneDataElement(child.element, child.attributes);
          break;
      }
    }

    return finalElement;
  }

  private parseTransitionElement(elementArray: any[], attributes: any): TransitionElement {
    const transition: TransitionElement = {};

    const event = this.getAttributeValue(attributes, "@_event");
    const cond = this.getAttributeValue(attributes, "@_cond");
    const target = this.getAttributeValue(attributes, "@_target");

    if (event !== undefined) transition.event = event;
    if (cond !== undefined) transition.cond = cond;
    if (target !== undefined) transition.target = target;
    if (attributes["@_type"])
      transition.type = attributes["@_type"] as "internal" | "external";

    this.parseExecutableContent(elementArray, transition);

    return transition;
  }

  private parseOnEntryElement(elementArray: any[], attributes: any): OnEntryElement {
    const onentry: OnEntryElement = {};
    this.parseExecutableContent(elementArray, onentry);
    return onentry;
  }

  private parseOnExitElement(elementArray: any[], attributes: any): OnExitElement {
    const onexit: OnExitElement = {};
    this.parseExecutableContent(elementArray, onexit);
    return onexit;
  }

  private parseDataModelElement(elementArray: any[], attributes: any): DataModelElement {
    
    const datamodel: DataModelElement = {};

    // Parse child elements using preserveOrder structure
    const children = this.getAllChildElements(elementArray);
    
    for (const child of children) {
      switch (child.tagName) {
        case "data":
          if (!datamodel.data) datamodel.data = [];
          datamodel.data.push(this.parseDataElement(child.element, child.attributes));
          break;
      }
    }

    return datamodel;
  }

  private parseDataElement(elementArray: any[], attributes: any): DataElement {
    const data: DataElement = {
      id: attributes["@_id"] || "",
    };

    if (attributes["@_src"]) data.src = attributes["@_src"];
    if (attributes["@_expr"]) data.expr = attributes["@_expr"];
    const textContent = this.extractTextContent(elementArray);
    if (textContent !== undefined) data.content = textContent;

    return data;
  }

  private parseInvokeElement(elementArray: any[], attributes: any): InvokeElement {
    const invoke: InvokeElement = {};

    if (attributes["@_type"]) invoke.type = attributes["@_type"];
    if (attributes["@_src"]) invoke.src = attributes["@_src"];
    if (attributes["@_id"]) invoke.id = attributes["@_id"];
    if (attributes["@_idlocation"]) invoke.idlocation = attributes["@_idlocation"];
    if (attributes["@_srcexpr"]) invoke.srcexpr = attributes["@_srcexpr"];
    if (attributes["@_autoforward"])
      invoke.autoforward = attributes["@_autoforward"] === "true";

    // Parse child elements using preserveOrder structure
    const children = this.getAllChildElements(elementArray);
    
    for (const child of children) {
      switch (child.tagName) {
        case "param":
          if (!invoke.param) invoke.param = [];
          invoke.param.push(this.parseParamElement(child.element, child.attributes));
          break;
        case "content":
          invoke.content = this.parseContentElement(child.element, child.attributes);
          break;
      }
    }

    return invoke;
  }

  private parseHistoryElement(elementArray: any[], attributes: any): HistoryElement {
    const history: HistoryElement = {
      id: attributes["@_id"] || "",
      type: attributes["@_type"] as "shallow" | "deep",
    };

    // Handle transition child element using preserveOrder structure
    const children = this.getAllChildElements(elementArray);
    const transitionChild = children.find(child => child.tagName === "transition");
    
    if (transitionChild) {
      history.transition = this.parseTransitionElement(transitionChild.element, transitionChild.attributes);
    }

    return history;
  }

  private parseParamElement(elementArray: any[], attributes: any): ParamElement {
    const param: ParamElement = {
      name: attributes["@_name"] || "",
    };

    if (attributes["@_expr"]) param.expr = attributes["@_expr"];
    if (attributes["@_location"]) param.location = attributes["@_location"];

    return param;
  }

  private parseContentElement(elementArray: any[], attributes: any): ContentElement {
    const content: ContentElement = {};

    // Handle the case where fast-xml-parser returns a string directly for text-only elements
    if (Array.isArray(elementArray) && elementArray.length === 1 && typeof elementArray[0] === "string") {
      content.content = elementArray[0];
      return content;
    }

    // Handle object case (when element has attributes)
    if (attributes["@_expr"]) content.expr = attributes["@_expr"];
    const textContent = this.extractTextContent(elementArray);
    if (textContent !== undefined) content.content = textContent;

    return content;
  }

  private parseDoneDataElement(elementArray: any[], attributes: any): DoneDataElement {
    const donedata: DoneDataElement = {};

    // Parse child elements using preserveOrder structure
    const children = this.getAllChildElements(elementArray);
    
    for (const child of children) {
      switch (child.tagName) {
        case "content":
          donedata.content = this.parseContentElement(child.element, child.attributes);
          break;
        case "param":
          if (!donedata.param) donedata.param = [];
          donedata.param.push(this.parseParamElement(child.element, child.attributes));
          break;
      }
    }

    return donedata;
  }

  private parseScriptElement(elementArray: any[], attributes: any): ScriptElement {
    const script: ScriptElement = {};

    // Handle the case where fast-xml-parser returns a string directly for text-only elements
    if (Array.isArray(elementArray) && elementArray.length === 1 && typeof elementArray[0] === "string") {
      script.content = elementArray[0];
      return script;
    }

    // Handle object case (when element has attributes)
    if (attributes["@_src"]) script.src = attributes["@_src"];
    const textContent = this.extractTextContent(elementArray);
    if (textContent !== undefined) script.content = textContent;

    return script;
  }

  private parseExecutableContent(elementArray: any[], target: any): void {
    // Parse executable content child elements using preserveOrder structure
    const children = this.getAllChildElements(elementArray);
    
    for (const child of children) {
      switch (child.tagName) {
        case "raise":
          if (!target.raise) target.raise = [];
          target.raise.push(this.parseRaiseElement(child.element, child.attributes));
          break;
        case "if":
          if (!target.if) target.if = [];
          target.if.push(this.parseIfElement(child.element, child.attributes));
          break;
        case "foreach":
          if (!target.foreach) target.foreach = [];
          target.foreach.push(this.parseForEachElement(child.element, child.attributes));
          break;
        case "log":
          if (!target.log) target.log = [];
          target.log.push(this.parseLogElement(child.element, child.attributes));
          break;
        case "assign":
          if (!target.assign) target.assign = [];
          target.assign.push(this.parseAssignElement(child.element, child.attributes));
          break;
        case "send":
          if (!target.send) target.send = [];
          target.send.push(this.parseSendElement(child.element, child.attributes));
          break;
        case "cancel":
          if (!target.cancel) target.cancel = [];
          target.cancel.push(this.parseCancelElement(child.element, child.attributes));
          break;
        case "script":
          if (!target.script) target.script = [];
          target.script.push(this.parseScriptElement(child.element, child.attributes));
          break;
      }
    }
  }

  private parseRaiseElement(elementArray: any[], attributes: any): RaiseElement {
    return {
      event: attributes["@_event"] || "",
    };
  }

  private parseIfElement(elementArray: any[], attributes: any): IfElement {
    const ifElement: IfElement = {
      cond: attributes["@_cond"] || "",
    };

    this.parseExecutableContent(elementArray, ifElement);
    return ifElement;
  }

  private parseForEachElement(elementArray: any[], attributes: any): ForEachElement {
    const forEach: ForEachElement = {
      array: attributes["@_array"] || "",
      item: attributes["@_item"] || "",
    };

    if (attributes["@_index"]) forEach.index = attributes["@_index"];

    this.parseExecutableContent(elementArray, forEach);
    return forEach;
  }

  private parseLogElement(elementArray: any[], attributes: any): LogElement {
    const log: LogElement = {};

    if (attributes["@_label"]) log.label = attributes["@_label"];
    if (attributes["@_expr"]) log.expr = attributes["@_expr"];

    return log;
  }

  private parseAssignElement(elementArray: any[], attributes: any): AssignElement {
    const assign: AssignElement = {
      location: attributes["@_location"] || "",
    };

    if (attributes["@_expr"]) assign.expr = attributes["@_expr"];

    return assign;
  }

  private parseSendElement(elementArray: any[], attributes: any): SendElement {
    const send: SendElement = {};

    if (attributes["@_event"]) send.event = attributes["@_event"];
    if (attributes["@_eventexpr"]) send.eventexpr = attributes["@_eventexpr"];
    if (attributes["@_target"]) send.target = attributes["@_target"];
    if (attributes["@_targetexpr"]) send.targetexpr = attributes["@_targetexpr"];
    if (attributes["@_type"]) send.type = attributes["@_type"];
    if (attributes["@_typeexpr"]) send.typeexpr = attributes["@_typeexpr"];
    if (attributes["@_id"]) send.id = attributes["@_id"];
    if (attributes["@_idlocation"]) send.idlocation = attributes["@_idlocation"];
    if (attributes["@_delay"]) send.delay = attributes["@_delay"];
    if (attributes["@_delayexpr"]) send.delayexpr = attributes["@_delayexpr"];
    if (attributes["@_namelist"]) send.namelist = attributes["@_namelist"];

    // Parse child elements using preserveOrder structure
    const children = this.getAllChildElements(elementArray);
    
    for (const child of children) {
      switch (child.tagName) {
        case "param":
          if (!send.param) send.param = [];
          send.param.push(this.parseParamElement(child.element, child.attributes));
          break;
        case "content":
          send.content = this.parseContentElement(child.element, child.attributes);
          break;
      }
    }

    return send;
  }

  private parseCancelElement(elementArray: any[], attributes: any): CancelElement {
    const cancel: CancelElement = {};

    if (attributes["@_sendid"]) cancel.sendid = attributes["@_sendid"];
    if (attributes["@_sendidexpr"]) cancel.sendidexpr = attributes["@_sendidexpr"];

    return cancel;
  }
}
