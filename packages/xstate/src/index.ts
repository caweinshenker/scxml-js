import { SCXML, SCXMLDocument } from '@scxml/parser';
import { promises as fs } from 'fs';
import { SCXMLToXStateConverter } from './converter';
import {
  ConversionOptions,
  ConversionResult
} from './types';

export * from './types';
export { SCXMLToXStateConverter } from './converter';

export class Converter {
  private static converter = new SCXMLToXStateConverter();

  static convert(
    scxmlDocument: SCXMLDocument,
    options?: Partial<ConversionOptions>
  ): ConversionResult {
    return this.converter.convert(scxmlDocument, options);
  }

  static parse(
    scxmlString: string,
    options?: Partial<ConversionOptions>
  ): ConversionResult {
    try {
      const scxmlDocument = SCXML.parse(scxmlString);
      return this.converter.convert(scxmlDocument, options);
    } catch (error) {
      throw new Error(`Failed to parse SCXML string: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async load(
    filePath: string,
    options?: Partial<ConversionOptions>
  ): Promise<ConversionResult> {
    try {
      const scxmlString = await fs.readFile(filePath, 'utf-8');
      return this.parse(scxmlString, options);
    } catch (error) {
      throw new Error(`Failed to read SCXML file "${filePath}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static machine(
    result: ConversionResult,
    xstateModule?: any
  ): any {
    if (!xstateModule) {
      try {
        xstateModule = require('xstate');
      } catch (error) {
        throw new Error('XState module not found. Please install xstate or provide it as a parameter.');
      }
    }

    const { createMachine, setup } = xstateModule;

    if (result.metadata.conversionOptions.useSetupAPI && setup) {
      return setup({
        actions: result.actions,
        guards: result.guards,
        actors: result.services
      }).createMachine(result.machine);
    } else if (createMachine) {
      return createMachine(
        result.machine,
        {
          actions: result.actions,
          guards: result.guards,
          services: result.services
        }
      );
    } else {
      throw new Error('Neither createMachine nor setup function found in XState module');
    }
  }

  static validate(result: ConversionResult): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors = result.errors.map(e => e.message);
    const warnings = result.warnings.map(w => w.message);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const convert = Converter.convert;
export const parse = Converter.parse;
export const load = Converter.load;
export const machine = Converter.machine;
export const validate = Converter.validate;

export const VERSION = '0.1.0';