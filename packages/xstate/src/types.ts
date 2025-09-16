import type {
  SCXMLDocument,
  StateElement,
  ParallelElement,
  ExecutableContent
} from '@scxml/parser';

export interface ConversionOptions {
  useSetupAPI?: boolean;
  generateTypes?: boolean;
  strict?: boolean;
  preserveComments?: boolean;
}

export interface XStateMachineConfig {
  id?: string;
  initial?: string;
  context?: Record<string, any>;
  states?: Record<string, XStateNode>;
  on?: Record<string, XStateTransition | XStateTransition[]>;
  entry?: XStateAction[];
  exit?: XStateAction[];
  invoke?: XStateInvoke[];
  type?: 'atomic' | 'compound' | 'parallel' | 'final' | 'history';
}

export interface XStateNode {
  id?: string;
  initial?: string;
  context?: Record<string, any>;
  states?: Record<string, XStateNode>;
  on?: Record<string, XStateTransition | XStateTransition[]>;
  entry?: XStateAction[];
  exit?: XStateAction[];
  invoke?: XStateInvoke[];
  type?: 'atomic' | 'compound' | 'parallel' | 'final' | 'history';
  hist?: 'shallow' | 'deep';
  target?: string;
  always?: XStateTransition[];
  after?: Record<number | string, XStateTransition>;
}

export interface XStateTransition {
  target?: string | string[];
  actions?: XStateAction[];
  guard?: string | XStateGuard;
  cond?: string | XStateGuard;
  internal?: boolean;
  reenter?: boolean;
  description?: string;
}

export type XStateAction = string | {
  type: string;
  [key: string]: any;
};

export type XStateGuard = string | {
  type: string;
  [key: string]: any;
};

export interface XStateInvoke {
  id?: string;
  src: string;
  input?: Record<string, any> | ((context: any, event: any) => Record<string, any>);
  onDone?: XStateTransition | XStateTransition[];
  onError?: XStateTransition | XStateTransition[];
  autoForward?: boolean;
}

export interface ConversionContext {
  scxmlDocument: SCXMLDocument;
  options: ConversionOptions;
  actions: Map<string, XStateAction>;
  guards: Map<string, XStateGuard>;
  services: Map<string, any>;
  dataModel: Map<string, any>;
  errors: ConversionError[];
  warnings: ConversionWarning[];
}

export interface ConversionError {
  type: 'error';
  message: string;
  element?: string;
  id?: string;
  line?: number;
  column?: number;
}

export interface ConversionWarning {
  type: 'warning';
  message: string;
  element?: string;
  id?: string;
  suggestion?: string;
}

export interface ConversionResult {
  machine: XStateMachineConfig;
  actions: Record<string, XStateAction>;
  guards: Record<string, XStateGuard>;
  services: Record<string, any>;
  context: Record<string, any>;
  errors: ConversionError[];
  warnings: ConversionWarning[];
  metadata: {
    scxmlVersion?: string;
    scxmlName?: string;
    datamodel?: string;
    convertedAt: Date;
    conversionOptions: ConversionOptions;
  };
}

export type SCXMLActionType =
  | 'raise'
  | 'assign'
  | 'send'
  | 'cancel'
  | 'log'
  | 'script'
  | 'if'
  | 'foreach';

export interface ActionConversionStrategy {
  canHandle(content: ExecutableContent): boolean;
  convert(content: ExecutableContent, context: ConversionContext): XStateAction[];
}

export interface GuardConversionStrategy {
  canHandle(condition: string): boolean;
  convert(condition: string, context: ConversionContext): XStateGuard;
}

export interface StateConversionStrategy {
  canHandle(state: StateElement | ParallelElement): boolean;
  convert(state: StateElement | ParallelElement, context: ConversionContext): XStateNode;
}