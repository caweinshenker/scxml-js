import { SCXMLDocument, StateElement, ParallelElement, TransitionElement } from '../types';

describe('SCXML Types', () => {
  describe('SCXMLDocument', () => {
    it('should have proper structure for a basic document', () => {
      const doc: SCXMLDocument = {
        scxml: {
          initial: 'idle',
          state: [{
            id: 'idle',
            transition: [{
              event: 'start',
              target: 'active'
            }]
          }, {
            id: 'active'
          }]
        }
      };

      expect(doc.scxml.initial).toBe('idle');
      expect(doc.scxml.state).toHaveLength(2);
      expect(doc.scxml.state![0].id).toBe('idle');
      expect(doc.scxml.state![0].transition![0].event).toBe('start');
    });
  });

  describe('StateElement', () => {
    it('should require an id', () => {
      const state: StateElement = {
        id: 'test-state'
      };

      expect(state.id).toBe('test-state');
    });

    it('should support nested states', () => {
      const state: StateElement = {
        id: 'parent',
        initial: 'child1',
        state: [{
          id: 'child1'
        }, {
          id: 'child2'
        }]
      };

      expect(state.state).toHaveLength(2);
      expect(state.initial).toBe('child1');
    });
  });

  describe('ParallelElement', () => {
    it('should support parallel states', () => {
      const parallel: ParallelElement = {
        id: 'parallel-region',
        state: [{
          id: 'branch1',
          state: [{ id: 'a' }, { id: 'b' }]
        }, {
          id: 'branch2',
          state: [{ id: 'x' }, { id: 'y' }]
        }]
      };

      expect(parallel.state).toHaveLength(2);
      expect(parallel.state![0].state).toHaveLength(2);
    });
  });

  describe('TransitionElement', () => {
    it('should support different transition types', () => {
      const transition: TransitionElement = {
        event: 'click',
        cond: 'enabled',
        target: 'next-state',
        type: 'external'
      };

      expect(transition.type).toBe('external');
      expect(transition.event).toBe('click');
      expect(transition.cond).toBe('enabled');
      expect(transition.target).toBe('next-state');
    });
  });
});