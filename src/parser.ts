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

    // Parse the XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      cdataPropName: "#cdata",
      parseAttributeValue: false,
      parseTagValue: false,
      trimValues: false,
    });

    const result = parser.parse(trimmedXml);

    if (!result.scxml) {
      throw new Error("No scxml root element found");
    }

    return {
      scxml: this.parseScxmlElement(result.scxml),
    };
  }

  private extractTextContent(element: any): string | undefined {
    // fast-xml-parser puts text in #text and CDATA in #cdata
    let content = "";

    if (element["#text"]) {
      content += element["#text"];
    }

    if (element["#cdata"]) {
      content += element["#cdata"];
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
      if (key.startsWith("@_")) {
        const attrName = key.substring(2); // Remove @_ prefix
        const value = element[key];

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

    // Parse child elements
    for (const key of Object.keys(element)) {
      if (key.startsWith("@_") || key === "#text" || key === "#cdata") continue;

      const childElement = element[key];

      switch (key) {
        case "state":
          if (!scxml.state) scxml.state = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              scxml.state!.push(this.parseStateElement(child))
            );
          } else {
            scxml.state.push(this.parseStateElement(childElement));
          }
          break;
        case "parallel":
          if (!scxml.parallel) scxml.parallel = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              scxml.parallel!.push(this.parseParallelElement(child))
            );
          } else {
            scxml.parallel.push(this.parseParallelElement(childElement));
          }
          break;
        case "final":
          if (!scxml.final) scxml.final = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              scxml.final!.push(this.parseFinalElement(child))
            );
          } else {
            scxml.final.push(this.parseFinalElement(childElement));
          }
          break;
        case "datamodel":
          scxml.datamodel_element = this.parseDataModelElement(childElement);
          break;
        case "script":
          if (!scxml.script) scxml.script = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              scxml.script!.push(this.parseScriptElement(child))
            );
          } else {
            scxml.script.push(this.parseScriptElement(childElement));
          }
          break;
      }
    }

    return scxml;
  }

  private parseStateElement(element: any): StateElement {
    const state: StateElement = {
      id: this.getAttributeValue(element, "@_id") || "",
    };

    // Handle other attributes
    if (element["@_initial"]) state.initial = element["@_initial"];

    // Parse child elements
    for (const key of Object.keys(element)) {
      if (key.startsWith("@_") || key === "#text" || key === "#cdata") continue;

      const childElement = element[key];

      switch (key) {
        case "state":
          if (!state.state) state.state = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              state.state!.push(this.parseStateElement(child))
            );
          } else {
            state.state.push(this.parseStateElement(childElement));
          }
          break;
        case "parallel":
          if (!state.parallel) state.parallel = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              state.parallel!.push(this.parseParallelElement(child))
            );
          } else {
            state.parallel.push(this.parseParallelElement(childElement));
          }
          break;
        case "final":
          if (!state.final) state.final = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              state.final!.push(this.parseFinalElement(child))
            );
          } else {
            state.final.push(this.parseFinalElement(childElement));
          }
          break;
        case "onentry":
          if (!state.onentry) state.onentry = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              state.onentry!.push(this.parseOnEntryElement(child))
            );
          } else {
            state.onentry.push(this.parseOnEntryElement(childElement));
          }
          break;
        case "onexit":
          if (!state.onexit) state.onexit = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              state.onexit!.push(this.parseOnExitElement(child))
            );
          } else {
            state.onexit.push(this.parseOnExitElement(childElement));
          }
          break;
        case "transition":
          if (!state.transition) state.transition = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              state.transition!.push(this.parseTransitionElement(child))
            );
          } else {
            state.transition.push(this.parseTransitionElement(childElement));
          }
          break;
        case "invoke":
          if (!state.invoke) state.invoke = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              state.invoke!.push(this.parseInvokeElement(child))
            );
          } else {
            state.invoke.push(this.parseInvokeElement(childElement));
          }
          break;
        case "datamodel":
          state.datamodel = this.parseDataModelElement(childElement);
          break;
        case "history":
          if (!state.history) state.history = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              state.history!.push(this.parseHistoryElement(child))
            );
          } else {
            state.history.push(this.parseHistoryElement(childElement));
          }
          break;
      }
    }

    return state;
  }

  private parseParallelElement(element: any): ParallelElement {
    const parallel: ParallelElement = {
      id: element["@_id"] || "",
    };

    // Parse child elements
    for (const key of Object.keys(element)) {
      if (key.startsWith("@_") || key === "#text" || key === "#cdata") continue;

      const childElement = element[key];

      switch (key) {
        case "state":
          if (!parallel.state) parallel.state = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              parallel.state!.push(this.parseStateElement(child))
            );
          } else {
            parallel.state.push(this.parseStateElement(childElement));
          }
          break;
        case "parallel":
          if (!parallel.parallel) parallel.parallel = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              parallel.parallel!.push(this.parseParallelElement(child))
            );
          } else {
            parallel.parallel.push(this.parseParallelElement(childElement));
          }
          break;
        case "onentry":
          if (!parallel.onentry) parallel.onentry = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              parallel.onentry!.push(this.parseOnEntryElement(child))
            );
          } else {
            parallel.onentry.push(this.parseOnEntryElement(childElement));
          }
          break;
        case "onexit":
          if (!parallel.onexit) parallel.onexit = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              parallel.onexit!.push(this.parseOnExitElement(child))
            );
          } else {
            parallel.onexit.push(this.parseOnExitElement(childElement));
          }
          break;
        case "transition":
          if (!parallel.transition) parallel.transition = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              parallel.transition!.push(this.parseTransitionElement(child))
            );
          } else {
            parallel.transition.push(this.parseTransitionElement(childElement));
          }
          break;
        case "invoke":
          if (!parallel.invoke) parallel.invoke = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              parallel.invoke!.push(this.parseInvokeElement(child))
            );
          } else {
            parallel.invoke.push(this.parseInvokeElement(childElement));
          }
          break;
        case "datamodel":
          parallel.datamodel = this.parseDataModelElement(childElement);
          break;
        case "history":
          if (!parallel.history) parallel.history = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              parallel.history!.push(this.parseHistoryElement(child))
            );
          } else {
            parallel.history.push(this.parseHistoryElement(childElement));
          }
          break;
      }
    }

    return parallel;
  }

  private parseFinalElement(element: any): FinalElement {
    const finalElement: FinalElement = {
      id: element["@_id"] || "",
    };

    // Parse child elements
    for (const key of Object.keys(element)) {
      if (key.startsWith("@_") || key === "#text" || key === "#cdata") continue;

      const childElement = element[key];

      switch (key) {
        case "onentry":
          if (!finalElement.onentry) finalElement.onentry = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              finalElement.onentry!.push(this.parseOnEntryElement(child))
            );
          } else {
            finalElement.onentry.push(this.parseOnEntryElement(childElement));
          }
          break;
        case "onexit":
          if (!finalElement.onexit) finalElement.onexit = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              finalElement.onexit!.push(this.parseOnExitElement(child))
            );
          } else {
            finalElement.onexit.push(this.parseOnExitElement(childElement));
          }
          break;
        case "donedata":
          finalElement.donedata = this.parseDoneDataElement(childElement);
          break;
      }
    }

    return finalElement;
  }

  private parseTransitionElement(element: any): TransitionElement {
    const transition: TransitionElement = {};

    const event = this.getAttributeValue(element, "@_event");
    const cond = this.getAttributeValue(element, "@_cond");
    const target = this.getAttributeValue(element, "@_target");

    if (event !== undefined) transition.event = event;
    if (cond !== undefined) transition.cond = cond;
    if (target !== undefined) transition.target = target;
    if (element["@_type"])
      transition.type = element["@_type"] as "internal" | "external";

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
        element.data.forEach((child: any) =>
          datamodel.data!.push(this.parseDataElement(child))
        );
      } else {
        datamodel.data.push(this.parseDataElement(element.data));
      }
    }

    return datamodel;
  }

  private parseDataElement(element: any): DataElement {
    const data: DataElement = {
      id: element["@_id"] || "",
    };

    if (element["@_src"]) data.src = element["@_src"];
    if (element["@_expr"]) data.expr = element["@_expr"];
    const textContent = this.extractTextContent(element);
    if (textContent !== undefined) data.content = textContent;

    return data;
  }

  private parseInvokeElement(element: any): InvokeElement {
    const invoke: InvokeElement = {};

    if (element["@_type"]) invoke.type = element["@_type"];
    if (element["@_src"]) invoke.src = element["@_src"];
    if (element["@_id"]) invoke.id = element["@_id"];
    if (element["@_idlocation"]) invoke.idlocation = element["@_idlocation"];
    if (element["@_srcexpr"]) invoke.srcexpr = element["@_srcexpr"];
    if (element["@_autoforward"])
      invoke.autoforward = element["@_autoforward"] === "true";

    // Parse child elements
    for (const key of Object.keys(element)) {
      if (key.startsWith("@_") || key === "#text" || key === "#cdata") continue;

      const childElement = element[key];

      switch (key) {
        case "param":
          if (!invoke.param) invoke.param = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              invoke.param!.push(this.parseParamElement(child))
            );
          } else {
            invoke.param.push(this.parseParamElement(childElement));
          }
          break;
        case "content":
          invoke.content = this.parseContentElement(childElement);
          break;
      }
    }

    return invoke;
  }

  private parseHistoryElement(element: any): HistoryElement {
    const history: HistoryElement = {
      id: element["@_id"] || "",
      type: element["@_type"] as "shallow" | "deep",
    };

    // Handle transition child element
    if (element.transition) {
      // History elements only have one transition, so we take the first one if it's an array
      const transitionElement = Array.isArray(element.transition)
        ? element.transition[0]
        : element.transition;
      history.transition = this.parseTransitionElement(transitionElement);
    }

    return history;
  }

  private parseParamElement(element: any): ParamElement {
    const param: ParamElement = {
      name: element["@_name"] || "",
    };

    if (element["@_expr"]) param.expr = element["@_expr"];
    if (element["@_location"]) param.location = element["@_location"];

    return param;
  }

  private parseContentElement(element: any): ContentElement {
    const content: ContentElement = {};

    // Handle the case where fast-xml-parser returns a string directly for text-only elements
    if (typeof element === "string") {
      content.content = element;
      return content;
    }

    // Handle object case (when element has attributes)
    if (element["@_expr"]) content.expr = element["@_expr"];
    const textContent = this.extractTextContent(element);
    if (textContent !== undefined) content.content = textContent;

    return content;
  }

  private parseDoneDataElement(element: any): DoneDataElement {
    const donedata: DoneDataElement = {};

    // Parse child elements
    for (const key of Object.keys(element)) {
      if (key.startsWith("@_") || key === "#text" || key === "#cdata") continue;

      const childElement = element[key];

      switch (key) {
        case "content":
          donedata.content = this.parseContentElement(childElement);
          break;
        case "param":
          if (!donedata.param) donedata.param = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              donedata.param!.push(this.parseParamElement(child))
            );
          } else {
            donedata.param.push(this.parseParamElement(childElement));
          }
          break;
      }
    }

    return donedata;
  }

  private parseScriptElement(element: any): ScriptElement {
    const script: ScriptElement = {};

    // Handle the case where fast-xml-parser returns a string directly for text-only elements
    if (typeof element === "string") {
      script.content = element;
      return script;
    }

    // Handle object case (when element has attributes)
    if (element["@_src"]) script.src = element["@_src"];
    const textContent = this.extractTextContent(element);
    if (textContent !== undefined) script.content = textContent;

    return script;
  }

  private parseExecutableContent(element: any, target: any): void {
    // Parse executable content child elements
    for (const key of Object.keys(element)) {
      if (key.startsWith("@_") || key === "#text" || key === "#cdata") continue;

      const childElement = element[key];

      switch (key) {
        case "raise":
          if (!target.raise) target.raise = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              target.raise.push(this.parseRaiseElement(child))
            );
          } else {
            target.raise.push(this.parseRaiseElement(childElement));
          }
          break;
        case "if":
          if (!target.if) target.if = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              target.if.push(this.parseIfElement(child))
            );
          } else {
            target.if.push(this.parseIfElement(childElement));
          }
          break;
        case "foreach":
          if (!target.foreach) target.foreach = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              target.foreach.push(this.parseForEachElement(child))
            );
          } else {
            target.foreach.push(this.parseForEachElement(childElement));
          }
          break;
        case "log":
          if (!target.log) target.log = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              target.log.push(this.parseLogElement(child))
            );
          } else {
            target.log.push(this.parseLogElement(childElement));
          }
          break;
        case "assign":
          if (!target.assign) target.assign = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              target.assign.push(this.parseAssignElement(child))
            );
          } else {
            target.assign.push(this.parseAssignElement(childElement));
          }
          break;
        case "send":
          if (!target.send) target.send = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              target.send.push(this.parseSendElement(child))
            );
          } else {
            target.send.push(this.parseSendElement(childElement));
          }
          break;
        case "cancel":
          if (!target.cancel) target.cancel = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              target.cancel.push(this.parseCancelElement(child))
            );
          } else {
            target.cancel.push(this.parseCancelElement(childElement));
          }
          break;
        case "script":
          if (!target.script) target.script = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              target.script.push(this.parseScriptElement(child))
            );
          } else {
            target.script.push(this.parseScriptElement(childElement));
          }
          break;
      }
    }
  }

  private parseRaiseElement(element: any): RaiseElement {
    return {
      event: element["@_event"] || "",
    };
  }

  private parseIfElement(element: any): IfElement {
    const ifElement: IfElement = {
      cond: element["@_cond"] || "",
    };

    this.parseExecutableContent(element, ifElement);
    return ifElement;
  }

  private parseForEachElement(element: any): ForEachElement {
    const forEach: ForEachElement = {
      array: element["@_array"] || "",
      item: element["@_item"] || "",
    };

    if (element["@_index"]) forEach.index = element["@_index"];

    this.parseExecutableContent(element, forEach);
    return forEach;
  }

  private parseLogElement(element: any): LogElement {
    const log: LogElement = {};

    if (element["@_label"]) log.label = element["@_label"];
    if (element["@_expr"]) log.expr = element["@_expr"];

    return log;
  }

  private parseAssignElement(element: any): AssignElement {
    const assign: AssignElement = {
      location: element["@_location"] || "",
    };

    if (element["@_expr"]) assign.expr = element["@_expr"];

    return assign;
  }

  private parseSendElement(element: any): SendElement {
    const send: SendElement = {};

    if (element["@_event"]) send.event = element["@_event"];
    if (element["@_eventexpr"]) send.eventexpr = element["@_eventexpr"];
    if (element["@_target"]) send.target = element["@_target"];
    if (element["@_targetexpr"]) send.targetexpr = element["@_targetexpr"];
    if (element["@_type"]) send.type = element["@_type"];
    if (element["@_typeexpr"]) send.typeexpr = element["@_typeexpr"];
    if (element["@_id"]) send.id = element["@_id"];
    if (element["@_idlocation"]) send.idlocation = element["@_idlocation"];
    if (element["@_delay"]) send.delay = element["@_delay"];
    if (element["@_delayexpr"]) send.delayexpr = element["@_delayexpr"];
    if (element["@_namelist"]) send.namelist = element["@_namelist"];

    // Parse child elements
    for (const key of Object.keys(element)) {
      if (key.startsWith("@_") || key === "#text" || key === "#cdata") continue;

      const childElement = element[key];

      switch (key) {
        case "param":
          if (!send.param) send.param = [];
          if (Array.isArray(childElement)) {
            childElement.forEach((child) =>
              send.param!.push(this.parseParamElement(child))
            );
          } else {
            send.param.push(this.parseParamElement(childElement));
          }
          break;
        case "content":
          send.content = this.parseContentElement(childElement);
          break;
      }
    }

    return send;
  }

  private parseCancelElement(element: any): CancelElement {
    const cancel: CancelElement = {};

    if (element["@_sendid"]) cancel.sendid = element["@_sendid"];
    if (element["@_sendidexpr"]) cancel.sendidexpr = element["@_sendidexpr"];

    return cancel;
  }
}
