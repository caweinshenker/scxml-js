import {
  SCXMLDocument,
  SCXMLElement,
  StateElement,
  ParallelElement,
  TransitionElement,
  OnEntryElement,
  OnExitElement,
  DataElement,
  InvokeElement
} from '@scxml/parser';

import {
  ConversionContext,
  ConversionOptions,
  ConversionResult,
  XStateMachineConfig,
  XStateNode,
  XStateTransition,
  XStateAction,
  XStateInvoke
} from './types';

export class SCXMLToXStateConverter {
  private defaultOptions: ConversionOptions = {
    useSetupAPI: true,
    generateTypes: true,
    strict: false,
    preserveComments: false
  };

  convert(scxmlDocument: SCXMLDocument, options?: Partial<ConversionOptions>): ConversionResult {
    const mergedOptions = { ...this.defaultOptions, ...options };

    const context: ConversionContext = {
      scxmlDocument,
      options: mergedOptions,
      actions: new Map(),
      guards: new Map(),
      services: new Map(),
      dataModel: new Map(),
      errors: [],
      warnings: []
    };

    try {
      const machine = this.convertSCXMLElement(scxmlDocument.scxml, context);

      return {
        machine,
        actions: Object.fromEntries(context.actions),
        guards: Object.fromEntries(context.guards),
        services: Object.fromEntries(context.services),
        context: Object.fromEntries(context.dataModel),
        errors: context.errors,
        warnings: context.warnings,
        metadata: {
          scxmlVersion: scxmlDocument.scxml.version,
          scxmlName: scxmlDocument.scxml.name,
          datamodel: scxmlDocument.scxml.datamodel,
          convertedAt: new Date(),
          conversionOptions: mergedOptions
        }
      };
    } catch (error) {
      context.errors.push({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unknown conversion error'
      });

      throw new Error(`SCXML conversion failed: ${context.errors.map(e => e.message).join(', ')}`);
    }
  }

  private convertSCXMLElement(scxml: SCXMLElement, context: ConversionContext): XStateMachineConfig {
    const machine: XStateMachineConfig = {
      id: scxml.name || 'scxml-machine',
      initial: scxml.initial
    };

    if (scxml.datamodel_element?.data) {
      machine.context = this.convertDataModel(scxml.datamodel_element.data, context);
    }

    if (scxml.state || scxml.parallel || scxml.final) {
      machine.states = {};

      if (scxml.state) {
        for (const state of scxml.state) {
          const convertedState = this.convertState(state, context);
          machine.states[state.id] = convertedState;
        }
      }

      if (scxml.parallel) {
        for (const parallel of scxml.parallel) {
          const convertedParallel = this.convertParallelState(parallel, context);
          machine.states[parallel.id] = convertedParallel;
        }
      }

      if (scxml.final) {
        for (const final of scxml.final) {
          machine.states[final.id] = {
            type: 'final',
            entry: final.onentry ? this.convertExecutableContent(final.onentry, context) : undefined,
            exit: final.onexit ? this.convertExecutableContent(final.onexit, context) : undefined
          };
        }
      }
    }

    return machine;
  }

  private convertState(state: StateElement, context: ConversionContext): XStateNode {
    const node: XStateNode = {
      id: state.id
    };

    if (state.initial) {
      node.initial = state.initial;
    }

    if (state.state || state.parallel || state.final) {
      node.states = {};

      if (state.state) {
        for (const childState of state.state) {
          const convertedChild = this.convertState(childState, context);
          node.states[childState.id] = convertedChild;
        }
      }

      if (state.parallel) {
        for (const parallel of state.parallel) {
          const convertedParallel = this.convertParallelState(parallel, context);
          node.states[parallel.id] = convertedParallel;
        }
      }

      if (state.final) {
        for (const final of state.final) {
          node.states[final.id] = {
            type: 'final',
            entry: final.onentry ? this.convertExecutableContent(final.onentry, context) : undefined,
            exit: final.onexit ? this.convertExecutableContent(final.onexit, context) : undefined
          };
        }
      }

      node.type = 'compound';
    } else {
      node.type = 'atomic';
    }

    if (state.onentry) {
      node.entry = this.convertExecutableContent(state.onentry, context);
    }

    if (state.onexit) {
      node.exit = this.convertExecutableContent(state.onexit, context);
    }

    if (state.transition) {
      node.on = this.convertTransitions(state.transition, context);
    }

    if (state.invoke) {
      node.invoke = state.invoke.map((invoke: InvokeElement) => this.convertInvoke(invoke, context));
    }

    if (state.datamodel?.data) {
      const stateContext = this.convertDataModel(state.datamodel.data, context);
      if (Object.keys(stateContext).length > 0) {
        node.context = stateContext;
      }
    }

    if (state.history) {
      for (const history of state.history) {
        if (!node.states) node.states = {};
        node.states[history.id] = {
          type: 'history',
          hist: history.type,
          target: history.transition?.target
        };
      }
    }

    return node;
  }

  private convertParallelState(parallel: ParallelElement, context: ConversionContext): XStateNode {
    const node: XStateNode = {
      id: parallel.id,
      type: 'parallel'
    };

    if (parallel.state || parallel.parallel) {
      node.states = {};

      if (parallel.state) {
        for (const state of parallel.state) {
          const convertedState = this.convertState(state, context);
          node.states[state.id] = convertedState;
        }
      }

      if (parallel.parallel) {
        for (const nestedParallel of parallel.parallel) {
          const convertedParallel = this.convertParallelState(nestedParallel, context);
          node.states[nestedParallel.id] = convertedParallel;
        }
      }
    }

    if (parallel.onentry) {
      node.entry = this.convertExecutableContent(parallel.onentry, context);
    }

    if (parallel.onexit) {
      node.exit = this.convertExecutableContent(parallel.onexit, context);
    }

    if (parallel.transition) {
      node.on = this.convertTransitions(parallel.transition, context);
    }

    if (parallel.invoke) {
      node.invoke = parallel.invoke.map((invoke: InvokeElement) => this.convertInvoke(invoke, context));
    }

    return node;
  }

  private convertTransitions(transitions: TransitionElement[], context: ConversionContext): Record<string, XStateTransition | XStateTransition[]> {
    const events: Record<string, XStateTransition[]> = {};

    for (const transition of transitions) {
      const event = transition.event || '*';
      const xstateTransition: XStateTransition = {};

      if (transition.target) {
        xstateTransition.target = transition.target;
      }

      if (transition.cond) {
        const guardId = `guard_${this.generateId()}`;
        context.guards.set(guardId, transition.cond);
        xstateTransition.guard = guardId;
      }

      xstateTransition.internal = transition.type === 'internal';

      const actions: XStateAction[] = [];
      if (transition.raise) {
        for (const raise of transition.raise) {
          actions.push({ type: 'raise', event: raise.event });
        }
      }
      if (transition.assign) {
        for (const assign of transition.assign) {
          actions.push({
            type: 'assign',
            assignment: { [assign.location]: assign.expr }
          });
        }
      }
      if (transition.send) {
        for (const send of transition.send) {
          actions.push({
            type: 'send',
            event: send.event || send.eventexpr,
            to: send.target || send.targetexpr,
            delay: send.delay || send.delayexpr
          });
        }
      }
      if (transition.log) {
        for (const log of transition.log) {
          actions.push({
            type: 'log',
            message: log.expr || log.label
          });
        }
      }

      if (actions.length > 0) {
        xstateTransition.actions = actions;
      }

      if (!events[event]) {
        events[event] = [];
      }
      events[event].push(xstateTransition);
    }

    const result: Record<string, XStateTransition | XStateTransition[]> = {};
    for (const [event, transitionList] of Object.entries(events)) {
      result[event] = transitionList.length === 1 ? transitionList[0] : transitionList;
    }

    return result;
  }

  private convertExecutableContent(content: OnEntryElement[] | OnExitElement[], context: ConversionContext): XStateAction[] {
    const actions: XStateAction[] = [];

    for (const element of content) {
      if (element.raise) {
        for (const raise of element.raise) {
          actions.push({ type: 'raise', event: raise.event });
        }
      }
      if (element.assign) {
        for (const assign of element.assign) {
          actions.push({
            type: 'assign',
            assignment: { [assign.location]: assign.expr }
          });
        }
      }
      if (element.send) {
        for (const send of element.send) {
          actions.push({
            type: 'send',
            event: send.event || send.eventexpr,
            to: send.target || send.targetexpr,
            delay: send.delay || send.delayexpr
          });
        }
      }
      if (element.log) {
        for (const log of element.log) {
          actions.push({
            type: 'log',
            message: log.expr || log.label
          });
        }
      }
      if (element.script) {
        for (const script of element.script) {
          const actionId = `script_${this.generateId()}`;
          context.actions.set(actionId, {
            type: 'script',
            content: script.content,
            src: script.src
          });
          actions.push(actionId);
        }
      }
    }

    return actions;
  }

  private convertDataModel(data: DataElement[], context: ConversionContext): Record<string, any> {
    const dataModel: Record<string, any> = {};

    for (const dataElement of data) {
      if (dataElement.expr) {
        try {
          const parsed = JSON.parse(dataElement.expr);
          dataModel[dataElement.id] = parsed;
        } catch {
          dataModel[dataElement.id] = dataElement.expr;
        }
      } else if (dataElement.content) {
        try {
          dataModel[dataElement.id] = JSON.parse(dataElement.content);
        } catch {
          dataModel[dataElement.id] = dataElement.content;
        }
      } else {
        dataModel[dataElement.id] = null;
      }

      context.dataModel.set(dataElement.id, dataModel[dataElement.id]);
    }

    return dataModel;
  }

  private convertInvoke(invoke: InvokeElement, context: ConversionContext): XStateInvoke {
    const xstateInvoke: XStateInvoke = {
      src: invoke.src || invoke.srcexpr || invoke.type || 'unknown'
    };

    if (invoke.id) {
      xstateInvoke.id = invoke.id;
    }

    if (invoke.autoforward) {
      xstateInvoke.autoForward = invoke.autoforward;
    }

    if (invoke.param) {
      xstateInvoke.input = {};
      for (const param of invoke.param) {
        if (param.expr) {
          try {
            xstateInvoke.input[param.name] = JSON.parse(param.expr);
          } catch {
            xstateInvoke.input[param.name] = param.expr;
          }
        }
      }
    }

    const serviceId = `service_${invoke.src || invoke.type || this.generateId()}`;
    context.services.set(serviceId, {
      src: invoke.src,
      type: invoke.type,
      content: invoke.content
    });

    return xstateInvoke;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}