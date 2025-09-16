import { SCXMLToXStateConverter } from '../converter';
import { SCXMLDocument } from '@scxml/parser';
import { ConversionOptions } from '../types';

describe('SCXMLToXStateConverter', () => {
  let converter: SCXMLToXStateConverter;

  beforeEach(() => {
    converter = new SCXMLToXStateConverter();
  });

  describe('basic conversion', () => {
    it('should convert a simple SCXML document to XState machine', () => {
      const scxmlDoc: SCXMLDocument = {
        scxml: {
          name: 'simple-machine',
          initial: 'idle',
          state: [
            {
              id: 'idle',
              transition: [
                {
                  event: 'START',
                  target: 'active'
                }
              ]
            },
            {
              id: 'active',
              transition: [
                {
                  event: 'STOP',
                  target: 'idle'
                }
              ]
            }
          ]
        }
      };

      const result = converter.convert(scxmlDoc);

      expect(result.machine.id).toBe('simple-machine');
      expect(result.machine.initial).toBe('idle');
      expect(result.machine.states).toBeDefined();
      expect(result.machine.states!['idle']).toBeDefined();
      expect(result.machine.states!['active']).toBeDefined();
      expect(result.machine.states!['idle'].on).toBeDefined();
      expect(result.machine.states!['idle'].on!['START']).toBeDefined();
    });

    it('should convert SCXML with data model', () => {
      const scxmlDoc: SCXMLDocument = {
        scxml: {
          name: 'machine-with-data',
          initial: 'state1',
          datamodel_element: {
            data: [
              {
                id: 'counter',
                expr: '0'
              },
              {
                id: 'message',
                content: 'Hello World'
              }
            ]
          },
          state: [
            {
              id: 'state1'
            }
          ]
        }
      };

      const result = converter.convert(scxmlDoc);

      expect(result.machine.context).toBeDefined();
      expect(result.machine.context!['counter']).toBe(0);
      expect(result.machine.context!['message']).toBe('Hello World');
    });

    it('should convert SCXML with entry and exit actions', () => {
      const scxmlDoc: SCXMLDocument = {
        scxml: {
          name: 'machine-with-actions',
          initial: 'state1',
          state: [
            {
              id: 'state1',
              onentry: [
                {
                  log: [{ label: 'Entering state1' }],
                  assign: [{ location: 'counter', expr: '1' }]
                }
              ],
              onexit: [
                {
                  log: [{ label: 'Exiting state1' }]
                }
              ]
            }
          ]
        }
      };

      const result = converter.convert(scxmlDoc);

      expect(result.machine.states!['state1'].entry).toBeDefined();
      expect(result.machine.states!['state1'].exit).toBeDefined();
      expect(result.machine.states!['state1'].entry!.length).toBeGreaterThan(0);
      expect(result.machine.states!['state1'].exit!.length).toBeGreaterThan(0);
    });

    it('should convert SCXML with parallel states', () => {
      const scxmlDoc: SCXMLDocument = {
        scxml: {
          name: 'parallel-machine',
          initial: 'main',
          state: [
            {
              id: 'main',
              initial: 'parallel1',
              parallel: [
                {
                  id: 'parallel1',
                  state: [
                    { id: 'p1_state1' },
                    { id: 'p1_state2' }
                  ]
                }
              ]
            }
          ]
        }
      };

      const result = converter.convert(scxmlDoc);

      expect(result.machine.states!['main'].states!['parallel1'].type).toBe('parallel');
      expect(result.machine.states!['main'].states!['parallel1'].states).toBeDefined();
    });

    it('should convert SCXML with final states', () => {
      const scxmlDoc: SCXMLDocument = {
        scxml: {
          name: 'machine-with-final',
          initial: 'start',
          state: [
            {
              id: 'start',
              transition: [{ event: 'FINISH', target: 'end' }]
            }
          ],
          final: [
            {
              id: 'end',
              onentry: [
                {
                  log: [{ label: 'Machine finished' }]
                }
              ]
            }
          ]
        }
      };

      const result = converter.convert(scxmlDoc);

      expect(result.machine.states!['end'].type).toBe('final');
      expect(result.machine.states!['end'].entry).toBeDefined();
    });

    it('should handle transitions with conditions', () => {
      const scxmlDoc: SCXMLDocument = {
        scxml: {
          name: 'conditional-machine',
          initial: 'state1',
          state: [
            {
              id: 'state1',
              transition: [
                {
                  event: 'EVENT',
                  cond: 'counter > 5',
                  target: 'state2'
                }
              ]
            },
            {
              id: 'state2'
            }
          ]
        }
      };

      const result = converter.convert(scxmlDoc);

      const transition = result.machine.states!['state1'].on!['EVENT'] as any;
      expect(transition.guard).toBeDefined();
      expect(result.guards).toBeDefined();
    });

    it('should convert transitions with actions', () => {
      const scxmlDoc: SCXMLDocument = {
        scxml: {
          name: 'machine-with-transition-actions',
          initial: 'state1',
          state: [
            {
              id: 'state1',
              transition: [
                {
                  event: 'INCREMENT',
                  target: 'state2',
                  assign: [{ location: 'counter', expr: 'counter + 1' }],
                  raise: [{ event: 'UPDATED' }]
                }
              ]
            },
            {
              id: 'state2'
            }
          ]
        }
      };

      const result = converter.convert(scxmlDoc);

      const transition = result.machine.states!['state1'].on!['INCREMENT'] as any;
      expect(transition.actions).toBeDefined();
      expect(transition.actions.length).toBeGreaterThan(0);
    });
  });

  describe('conversion options', () => {
    it('should respect useSetupAPI option', () => {
      const scxmlDoc: SCXMLDocument = {
        scxml: {
          name: 'test-machine',
          initial: 'state1',
          state: [{ id: 'state1' }]
        }
      };

      const options: ConversionOptions = {
        useSetupAPI: false
      };

      const result = converter.convert(scxmlDoc, options);

      expect(result.metadata.conversionOptions.useSetupAPI).toBe(false);
    });

    it('should handle strict mode', () => {
      const scxmlDoc: SCXMLDocument = {
        scxml: {
          name: 'test-machine',
          initial: 'nonexistent-state',
          state: [{ id: 'state1' }]
        }
      };

      const options: ConversionOptions = {
        strict: true
      };

      expect(() => {
        converter.convert(scxmlDoc, options);
      }).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should collect errors during conversion', () => {
      const scxmlDoc: SCXMLDocument = {
        scxml: {
          name: 'invalid-machine',
          initial: 'state1',
          state: []
        }
      };

      const result = converter.convert(scxmlDoc);

      expect(result.errors).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should provide conversion metadata', () => {
      const scxmlDoc: SCXMLDocument = {
        scxml: {
          name: 'test-machine',
          version: '1.0',
          datamodel: 'ecmascript',
          initial: 'state1',
          state: [{ id: 'state1' }]
        }
      };

      const result = converter.convert(scxmlDoc);

      expect(result.metadata).toBeDefined();
      expect(result.metadata.scxmlName).toBe('test-machine');
      expect(result.metadata.scxmlVersion).toBe('1.0');
      expect(result.metadata.datamodel).toBe('ecmascript');
      expect(result.metadata.convertedAt).toBeInstanceOf(Date);
    });
  });
});