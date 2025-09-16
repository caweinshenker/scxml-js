/**
 * @fileoverview
 * SCXML TypeScript Parser - A comprehensive library for parsing, creating, modifying,
 * validating, and serializing SCXML (State Chart XML) documents.
 *
 * Provides full W3C SCXML specification support with TypeScript type safety.
 *
 * @example
 * ```typescript
 * import { SCXML } from '@scxml/parser';
 *
 * // Create an SCXML document
 * const document = SCXML.create()
 *   .name('traffic-light')
 *   .initial('red')
 *   .addState(SCXML.state('red')
 *     .addTransition(SCXML.transition()
 *       .event('timer')
 *       .target('green')
 *       .build())
 *     .build())
 *   .build();
 *
 * // Validate and serialize
 * const errors = SCXML.validate(document);
 * const xml = SCXML.serialize(document);
 * ```
 *
 * @version 0.1.0
 * @license MIT
 */

/**
 * Core TypeScript interfaces for SCXML document structure.
 *
 * @group Types
 */
export * from './types';

/**
 * XML parser for converting SCXML strings to document objects.
 *
 * @group Core
 */
export { SCXMLParser } from './parser';

/**
 * Module resolver for handling external SCXML references.
 *
 * @group Core
 */
export { SCXMLModuleResolver, ResolverOptions, ResolvedContent } from './module-resolver';

/**
 * Fluent API builders for creating SCXML documents programmatically.
 *
 * These builders provide a type-safe, fluent interface for constructing
 * SCXML documents from scratch.
 *
 * @group Builders
 */
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

/**
 * API for programmatically modifying existing SCXML documents.
 *
 * @group Modifiers
 */
export { SCXMLModifier } from './modifier';

/**
 * Comprehensive validation for SCXML document structure and semantics.
 *
 * @group Validation
 */
export { SCXMLValidator, ValidationError } from './validator';

/**
 * Convert SCXML documents back to XML strings with configurable formatting.
 *
 * @group Serialization
 */
export { SCXMLSerializer, SerializationOptions } from './serializer';

// Import classes for use in SCXML utility object
import { SCXMLParser } from './parser';
import {
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
import { SCXMLModifier } from './modifier';
import { SCXMLValidator } from './validator';
import { SCXMLSerializer } from './serializer';

/**
 * Convenience object providing easy access to all SCXML operations.
 *
 * This is the main entry point for most users of the library, providing
 * a simple API for all common operations without needing to import
 * individual classes.
 *
 * @example
 * ```typescript
 * import { SCXML } from '@scxml/parser';
 *
 * // Parse XML
 * const doc = SCXML.parse('<scxml>...</scxml>');
 *
 * // Create new document
 * const newDoc = SCXML.create()
 *   .name('my-machine')
 *   .initial('idle')
 *   .addState(SCXML.state('idle')
 *     .addTransition(SCXML.transition()
 *       .event('start')
 *       .target('active')
 *       .build())
 *     .build())
 *   .build();
 *
 * // Validate and serialize
 * const errors = SCXML.validate(newDoc);
 * const xml = SCXML.serialize(newDoc);
 * ```
 *
 * @group Utilities
 */
export const SCXML = {
  // Parser functions
  /**
   * Parse an SCXML XML string into a document object.
   *
   * @param xmlString - The XML string to parse
   * @returns Parsed SCXML document
   * @throws {Error} When XML is malformed or invalid
   *
   * @example
   * ```typescript
   * const doc = SCXML.parse(`
   *   <scxml initial="idle">
   *     <state id="idle"/>
   *   </scxml>
   * `);
   * ```
   */
  parse: (xmlString: string) => new SCXMLParser().parse(xmlString),

  // Builder functions
  /**
   * Create a new SCXML document builder.
   *
   * @returns New SCXML document builder instance
   *
   * @example
   * ```typescript
   * const doc = SCXML.create()
   *   .name('my-machine')
   *   .initial('idle')
   *   .build();
   * ```
   */
  create: () => SCXMLBuilder.create(),

  /**
   * Create a new state builder.
   *
   * @param id - Unique identifier for the state
   * @returns New state builder instance
   */
  state: (id: string) => StateBuilder.create(id),

  /**
   * Create a new parallel state builder.
   *
   * @param id - Unique identifier for the parallel region
   * @returns New parallel builder instance
   */
  parallel: (id: string) => ParallelBuilder.create(id),

  /**
   * Create a new transition builder.
   *
   * @returns New transition builder instance
   */
  transition: () => TransitionBuilder.create(),

  /**
   * Create a new data model builder.
   *
   * @returns New data model builder instance
   */
  dataModel: () => DataModelBuilder.create(),

  /**
   * Create a new data element builder.
   *
   * @param id - Unique identifier for the data element
   * @returns New data builder instance
   */
  data: (id: string) => DataBuilder.create(id),

  /**
   * Create a new invoke element builder.
   *
   * @returns New invoke builder instance
   */
  invoke: () => InvokeBuilder.create(),

  /**
   * Create a new entry action builder.
   *
   * @returns New entry action builder instance
   */
  onEntry: () => OnEntryBuilder.create(),

  /**
   * Create a new exit action builder.
   *
   * @returns New exit action builder instance
   */
  onExit: () => OnExitBuilder.create(),

  // Modifier functions
  /**
   * Create a document modifier for an existing SCXML document.
   *
   * @param document - The SCXML document to modify
   * @returns Document modifier instance
   *
   * @example
   * ```typescript
   * const modifier = SCXML.modify(document);
   * modifier.addState(SCXML.state('new-state').build());
   * const modified = modifier.getDocument();
   * ```
   * 
   * @deprecated Use document.addState(), document.insertFragment(), etc. directly instead
   */
  modify: (document: any) => SCXMLModifier.from(document),

  // Validation functions
  /**
   * Validate an SCXML document for structural and semantic correctness.
   *
   * @param document - The SCXML document to validate
   * @returns Array of validation errors (empty if valid)
   *
   * @example
   * ```typescript
   * const errors = SCXML.validate(document);
   * if (errors.length > 0) {
   *   console.log('Validation errors:', errors);
   * }
   * ```
   */
  validate: (document: any) => new SCXMLValidator().validate(document),

  // Serialization functions
  /**
   * Serialize an SCXML document to XML string.
   *
   * @param document - The SCXML document to serialize
   * @param options - Serialization options (formatting, spacing, etc.)
   * @returns XML string representation
   *
   * @example
   * ```typescript
   * const xml = SCXML.serialize(document, { spaces: 2 });
   * ```
   */
  serialize: (document: any, options?: any) => new SCXMLSerializer(options).serialize(document),

};

// Version
export const VERSION = '0.1.0';