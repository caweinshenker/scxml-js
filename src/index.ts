// Core types
export * from './types';

// Parser
export { SCXMLParser } from './parser';

// Builder/Creation API
export {
  SCXMLBuilder,
  StateBuilder,
  ParallelBuilder,
  TransitionBuilder,
  DataModelBuilder,
  DataBuilder,
  InvokeBuilder,
  OnEntryBuilder,
  OnExitBuilder
} from './builder';

// Modifier API
export { SCXMLModifier } from './modifier';

// Validator
export { SCXMLValidator, ValidationError } from './validator';

// Serializer
export { SCXMLSerializer, SerializationOptions } from './serializer';

// XState Integration
export { XStateConverter, ConversionOptions } from './xstate-converter';

// Convenience functions
export const SCXML = {
  // Parser
  parse: (xmlString: string) => new SCXMLParser().parse(xmlString),

  // Builder
  create: () => SCXMLBuilder.create(),
  state: (id: string) => StateBuilder.create(id),
  parallel: (id: string) => ParallelBuilder.create(id),
  transition: () => TransitionBuilder.create(),
  dataModel: () => DataModelBuilder.create(),
  data: (id: string) => DataBuilder.create(id),
  invoke: () => InvokeBuilder.create(),
  onEntry: () => OnEntryBuilder.create(),
  onExit: () => OnExitBuilder.create(),

  // Modifier
  modify: (document: any) => SCXMLModifier.from(document),

  // Validator
  validate: (document: any) => new SCXMLValidator().validate(document),

  // Serializer
  serialize: (document: any, options?: any) => new SCXMLSerializer(options).serialize(document),

  // XState
  toXState: (document: any, options?: any) => new XStateConverter(options).convertToXState(document),
  createMachine: (document: any, options?: any) => new XStateConverter().createMachine(document, options)
};

// Version
export const VERSION = '0.1.0';