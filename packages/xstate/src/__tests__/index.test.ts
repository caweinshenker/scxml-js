import { Converter } from '../index';
import { SCXMLDocument } from '@scxml/parser';
import { promises as fs } from 'fs';

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn()
  }
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe('Converter', () => {
  const simpleSCXML = `
    <scxml name="test-machine" initial="idle">
      <state id="idle">
        <transition event="START" target="active"/>
      </state>
      <state id="active">
        <transition event="STOP" target="idle"/>
      </state>
    </scxml>
  `;

  const scxmlDocument: SCXMLDocument = {
    scxml: {
      name: 'test-machine',
      initial: 'idle',
      state: [
        {
          id: 'idle',
          transition: [{ event: 'START', target: 'active' }]
        },
        {
          id: 'active',
          transition: [{ event: 'STOP', target: 'idle' }]
        }
      ]
    }
  };

  describe('convert', () => {
    it('should convert SCXML document to XState machine', () => {
      const result = Converter.convert(scxmlDocument);

      expect(result.machine).toBeDefined();
      expect(result.machine.id).toBe('test-machine');
      expect(result.machine.initial).toBe('idle');
      expect(result.metadata).toBeDefined();
      expect(result.errors).toBeDefined();
      expect(result.warnings).toBeDefined();
    });

    it('should accept conversion options', () => {
      const result = Converter.convert(scxmlDocument, {
        useSetupAPI: false,
        strict: true
      });

      expect(result.metadata.conversionOptions.useSetupAPI).toBe(false);
      expect(result.metadata.conversionOptions.strict).toBe(true);
    });
  });

  describe('parse', () => {
    it('should parse SCXML string and convert to XState machine', () => {
      jest.mock('@scxml/parser', () => ({
        SCXML: {
          parse: jest.fn().mockReturnValue(scxmlDocument)
        }
      }));

      const result = Converter.parse(simpleSCXML);

      expect(result.machine).toBeDefined();
      expect(result.machine.id).toBe('test-machine');
    });

    it('should throw error for invalid SCXML string', () => {
      jest.mock('@scxml/parser', () => ({
        SCXML: {
          parse: jest.fn().mockImplementation(() => {
            throw new Error('Invalid XML');
          })
        }
      }));

      expect(() => {
        Converter.parse('invalid xml');
      }).toThrow('Failed to parse SCXML string');
    });
  });

  describe('load', () => {
    it('should read file and convert SCXML to XState machine', async () => {
      mockFs.readFile.mockResolvedValue(simpleSCXML);

      jest.mock('@scxml/parser', () => ({
        SCXML: {
          parse: jest.fn().mockReturnValue(scxmlDocument)
        }
      }));

      const result = await Converter.load('/path/to/machine.scxml');

      expect(result.machine).toBeDefined();
      expect(mockFs.readFile).toHaveBeenCalledWith('/path/to/machine.scxml', 'utf-8');
    });

    it('should throw error if file cannot be read', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      await expect(
        Converter.load('/nonexistent/file.scxml')
      ).rejects.toThrow('Failed to read SCXML file');
    });
  });

  describe('machine', () => {
    const conversionResult = {
      machine: {
        id: 'test-machine',
        initial: 'idle',
        states: {
          idle: { on: { START: { target: 'active' } } },
          active: { on: { STOP: { target: 'idle' } } }
        }
      },
      actions: {},
      guards: {},
      services: {},
      context: {},
      errors: [],
      warnings: [],
      metadata: {
        scxmlName: 'test-machine',
        convertedAt: new Date(),
        conversionOptions: { useSetupAPI: true }
      }
    };

    it('should create XState machine using setup API when available', () => {
      const mockSetup = jest.fn().mockReturnValue({
        createMachine: jest.fn().mockReturnValue('setup-machine')
      });

      const xstateModule = {
        setup: mockSetup,
        createMachine: jest.fn()
      };

      const machine = Converter.machine(conversionResult, xstateModule);

      expect(mockSetup).toHaveBeenCalledWith({
        actions: {},
        guards: {},
        actors: {}
      });
      expect(machine).toBe('setup-machine');
    });

    it('should fallback to createMachine when setup API not available', () => {
      const mockCreateMachine = jest.fn().mockReturnValue('legacy-machine');

      const xstateModule = {
        createMachine: mockCreateMachine
      };

      const legacyResult = {
        ...conversionResult,
        metadata: {
          ...conversionResult.metadata,
          conversionOptions: { useSetupAPI: false }
        }
      };

      const machine = Converter.machine(legacyResult, xstateModule);

      expect(mockCreateMachine).toHaveBeenCalledWith(
        legacyResult.machine,
        {
          actions: {},
          guards: {},
          services: {}
        }
      );
      expect(machine).toBe('legacy-machine');
    });

    it('should throw error when XState module not provided and not found', () => {
      jest.mock('xstate', () => {
        throw new Error('Module not found');
      });

      expect(() => {
        Converter.machine(conversionResult);
      }).toThrow('XState module not found');
    });
  });

  describe('validate', () => {
    it('should validate successful conversion', () => {
      const result = {
        machine: { id: 'test' },
        actions: {},
        guards: {},
        services: {},
        context: {},
        errors: [],
        warnings: [],
        metadata: {
          convertedAt: new Date(),
          conversionOptions: {}
        }
      };

      const validation = Converter.validate(result);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.warnings).toHaveLength(0);
    });

    it('should validate conversion with errors', () => {
      const result = {
        machine: { id: 'test' },
        actions: {},
        guards: {},
        services: {},
        context: {},
        errors: [{ type: 'error' as const, message: 'Test error' }],
        warnings: [{ type: 'warning' as const, message: 'Test warning' }],
        metadata: {
          convertedAt: new Date(),
          conversionOptions: {}
        }
      };

      const validation = Converter.validate(result);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Test error');
      expect(validation.warnings).toContain('Test warning');
    });
  });

  describe('convenience functions', () => {
    it('should export convenience function for document conversion', () => {
      const result = Converter.convert(scxmlDocument);
      expect(result.machine).toBeDefined();
    });
  });
});