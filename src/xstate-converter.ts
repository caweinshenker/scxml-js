import { createMachine, MachineConfig, StateNodeConfig, TransitionConfig, ActionObject, GuardPredicate } from 'xstate';
import {
  SCXMLDocument,
  SCXMLElement,
  StateElement,
  ParallelElement,
  FinalElement,
  TransitionElement,
  OnEntryElement,
  OnExitElement,
  DataElement,
  ExecutableContent,
  RaiseElement,
  LogElement,
  AssignElement,
  SendElement
} from './types';

export interface ConversionOptions {
  preserveIds?: boolean;
  customActions?: Record<string, any>;
  customGuards?: Record<string, any>;
  customServices?: Record<string, any>;
}

export class XStateConverter {
  private options: ConversionOptions;

  constructor(options: ConversionOptions = {}) {
    this.options = {
      preserveIds: true,
      customActions: {},
      customGuards: {},
      customServices: {},
      ...options
    };
  }

  convertToXState(document: SCXMLDocument): MachineConfig<any, any, any> {
    const scxml = document.scxml;

    const config: MachineConfig<any, any, any> = {
      id: scxml.name || 'scxml-machine',
      initial: scxml.initial,
      context: this.buildInitialContext(scxml),
      states: {}
    };

    if (scxml.state) {
      scxml.state.forEach(state => {
        config.states![state.id] = this.convertState(state);
      });
    }

    if (scxml.parallel) {
      scxml.parallel.forEach(parallel => {
        config.states![parallel.id] = this.convertParallelState(parallel);
      });
    }

    if (scxml.final) {
      scxml.final.forEach(finalState => {
        config.states![finalState.id] = this.convertFinalState(finalState);
      });
    }

    return config;
  }

  private buildInitialContext(scxml: SCXMLElement): Record<string, any> {
    const context: Record<string, any> = {};

    if (scxml.datamodel_element?.data) {
      scxml.datamodel_element.data.forEach(data => {
        context[data.id] = this.evaluateDataValue(data);
      });
    }

    return context;
  }

  private evaluateDataValue(data: DataElement): any {
    if (data.expr) {
      try {
        return eval(`(${data.expr})`);
      } catch {
        return data.expr;
      }
    }

    if (data.content) {
      try {
        return JSON.parse(data.content);
      } catch {
        return data.content;
      }
    }

    if (data.src) {
      return { _src: data.src };
    }

    return undefined;
  }

  private convertState(state: StateElement): StateNodeConfig<any, any, any, any> {
    const config: StateNodeConfig<any, any, any, any> = {};

    if (state.initial) {
      config.initial = state.initial;
    }

    if (state.state || state.parallel || state.final) {
      config.states = {};

      state.state?.forEach(childState => {
        config.states![childState.id] = this.convertState(childState);
      });

      state.parallel?.forEach(parallel => {
        config.states![parallel.id] = this.convertParallelState(parallel);
      });

      state.final?.forEach(finalState => {
        config.states![finalState.id] = this.convertFinalState(finalState);
      });
    }

    if (state.onentry || state.onexit) {
      if (state.onentry) {
        config.entry = this.convertExecutableContent(state.onentry);
      }
      if (state.onexit) {
        config.exit = this.convertExecutableContent(state.onexit);
      }
    }

    if (state.transition) {
      config.on = {};
      state.transition.forEach(transition => {
        const eventName = transition.event || '';
        const transitionConfig = this.convertTransition(transition);

        if (!config.on![eventName]) {
          config.on![eventName] = [];
        }

        if (Array.isArray(config.on![eventName])) {
          (config.on![eventName] as any[]).push(transitionConfig);
        } else {
          config.on![eventName] = [config.on![eventName], transitionConfig];
        }
      });
    }

    if (state.invoke) {
      config.invoke = state.invoke.map(invoke => ({
        id: invoke.id,
        src: invoke.src || invoke.srcexpr,
        autoForward: invoke.autoforward,
        data: invoke.param ? this.convertParams(invoke.param) : undefined
      }));
    }

    return config;
  }

  private convertParallelState(parallel: ParallelElement): StateNodeConfig<any, any, any, any> {
    const config: StateNodeConfig<any, any, any, any> = {
      type: 'parallel',
      states: {}
    };

    parallel.state?.forEach(state => {
      config.states![state.id] = this.convertState(state);
    });

    parallel.parallel?.forEach(childParallel => {
      config.states![childParallel.id] = this.convertParallelState(childParallel);
    });

    if (parallel.onentry) {
      config.entry = this.convertExecutableContent(parallel.onentry);
    }

    if (parallel.onexit) {
      config.exit = this.convertExecutableContent(parallel.onexit);
    }

    if (parallel.transition) {
      config.on = {};
      parallel.transition.forEach(transition => {
        const eventName = transition.event || '';
        config.on![eventName] = this.convertTransition(transition);
      });
    }

    return config;
  }

  private convertFinalState(finalState: FinalElement): StateNodeConfig<any, any, any, any> {
    const config: StateNodeConfig<any, any, any, any> = {
      type: 'final'
    };

    if (finalState.onentry) {
      config.entry = this.convertExecutableContent(finalState.onentry);
    }

    if (finalState.donedata) {
      config.data = finalState.donedata.content?.content || finalState.donedata.content?.expr;
    }

    return config;
  }

  private convertTransition(transition: TransitionElement): TransitionConfig<any, any> {
    const config: TransitionConfig<any, any> = {};

    if (transition.target) {
      config.target = transition.target;
    }

    if (transition.cond) {
      config.cond = transition.cond;
    }

    if (transition.type === 'internal') {
      config.internal = true;
    }

    const actions = this.convertTransitionActions(transition);
    if (actions.length > 0) {
      config.actions = actions;
    }

    return config;
  }

  private convertTransitionActions(transition: TransitionElement): any[] {
    const actions: any[] = [];

    if (transition.raise) {
      transition.raise.forEach(raise => {
        actions.push({ type: 'xstate.raise', event: raise.event });
      });
    }

    if (transition.log) {
      transition.log.forEach(log => {
        actions.push({
          type: 'log',
          label: log.label,
          expr: log.expr
        });
      });
    }

    if (transition.assign) {
      transition.assign.forEach(assign => {
        actions.push({
          type: 'xstate.assign',
          assignment: {
            [assign.location]: assign.expr
          }
        });
      });
    }

    if (transition.send) {
      transition.send.forEach(send => {
        actions.push({
          type: 'xstate.send',
          event: send.event || send.eventexpr,
          to: send.target || send.targetexpr,
          delay: send.delay || send.delayexpr
        });
      });
    }

    if (transition.script) {
      transition.script.forEach(script => {
        actions.push({
          type: 'script',
          content: script.content,
          src: script.src
        });
      });
    }

    return actions;
  }

  private convertExecutableContent(elements: (OnEntryElement | OnExitElement)[]): any[] {
    const actions: any[] = [];

    elements.forEach(element => {
      if (element.raise) {
        element.raise.forEach(raise => {
          actions.push({ type: 'xstate.raise', event: raise.event });
        });
      }

      if (element.log) {
        element.log.forEach(log => {
          actions.push({
            type: 'log',
            label: log.label,
            expr: log.expr
          });
        });
      }

      if (element.assign) {
        element.assign.forEach(assign => {
          actions.push({
            type: 'xstate.assign',
            assignment: {
              [assign.location]: assign.expr
            }
          });
        });
      }

      if (element.send) {
        element.send.forEach(send => {
          actions.push({
            type: 'xstate.send',
            event: send.event || send.eventexpr,
            to: send.target || send.targetexpr,
            delay: send.delay || send.delayexpr
          });
        });
      }

      if (element.script) {
        element.script.forEach(script => {
          actions.push({
            type: 'script',
            content: script.content,
            src: script.src
          });
        });
      }
    });

    return actions;
  }

  private convertParams(params: any[]): Record<string, any> {
    const data: Record<string, any> = {};

    params.forEach(param => {
      if (param.expr) {
        try {
          data[param.name] = eval(`(${param.expr})`);
        } catch {
          data[param.name] = param.expr;
        }
      } else if (param.location) {
        data[param.name] = { _location: param.location };
      }
    });

    return data;
  }

  convertFromXState(machineConfig: MachineConfig<any, any, any>): SCXMLDocument {
    throw new Error('XState to SCXML conversion not yet implemented');
  }

  createMachine(document: SCXMLDocument, options?: any) {
    const config = this.convertToXState(document);
    return createMachine(config, {
      actions: this.options.customActions,
      guards: this.options.customGuards,
      services: this.options.customServices,
      ...options
    });
  }
}