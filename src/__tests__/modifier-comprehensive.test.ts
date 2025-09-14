import { SCXMLModifier } from '../modifier';
import { SCXMLBuilder, StateBuilder, TransitionBuilder, DataBuilder, ParallelBuilder, OnEntryBuilder } from '../builder';

describe('SCXML Modifier Comprehensive Tests', () => {
  let baseDocument: any;
  let complexDocument: any;

  beforeEach(() => {
    baseDocument = SCXMLBuilder.create()
      .name('test-machine')
      .initial('idle')
      .addState(StateBuilder.create('idle')
        .addTransition(TransitionBuilder.create()
          .event('start')
          .target('active')
          .build())
        .build())
      .addState(StateBuilder.create('active')
        .addTransition(TransitionBuilder.create()
          .event('stop')
          .target('idle')
          .build())
        .build())
      .build();

    complexDocument = SCXMLBuilder.create()
      .name('complex-machine')
      .initial('root')
      .addState(StateBuilder.create('root')
        .initial('level1')
        .addState(StateBuilder.create('level1')
          .initial('level2a')
          .addState(StateBuilder.create('level2a')
            .addTransition(TransitionBuilder.create()
              .event('next')
              .target('level2b')
              .build())
            .build())
          .addState(StateBuilder.create('level2b')
            .addTransition(TransitionBuilder.create()
              .event('up')
              .target('../level1alt')
              .build())
            .build())
          .build())
        .addState(StateBuilder.create('level1alt').build())
        .addParallel(ParallelBuilder.create('parallel')
          .addState(StateBuilder.create('p1').build())
          .addState(StateBuilder.create('p2').build())
          .build())
        .build())
      .build();
  });

  describe('deep state hierarchy modifications', () => {
    it('should handle modifications in deeply nested states', () => {
      const modifier = SCXMLModifier.from(complexDocument);

      // Add state to deeply nested location
      modifier.updateState('level2a', state => {
        if (!state.state) state.state = [];
        state.state.push({
          id: 'level3',
          transition: [{
            event: 'deep-event',
            target: '../../level1alt'
          }]
        });
        return state;
      });

      const result = modifier.getDocument();
      const level2a = modifier.findState('level2a');
      expect(level2a!.state).toHaveLength(1);
      expect(level2a!.state![0].id).toBe('level3');
    });

    it('should handle state removal at various hierarchy levels', () => {
      const modifier = SCXMLModifier.from(complexDocument);

      // Remove deeply nested state
      modifier.updateState('level1', state => {
        state.state = state.state!.filter(s => s.id !== 'level2b');
        return state;
      });

      const result = modifier.getDocument();
      const level1 = modifier.findState('level1');
      expect(level1!.state).toHaveLength(1);
      expect(level1!.state![0].id).toBe('level2a');
    });

    it('should update initial state references in nested hierarchies', () => {
      const modifier = SCXMLModifier.from(complexDocument);

      // Change initial state reference
      modifier.updateState('level1', state => {
        state.initial = 'level2b';
        return state;
      });

      const result = modifier.getDocument();
      const level1 = modifier.findState('level1');
      expect(level1!.initial).toBe('level2b');
    });
  });

  describe('complex transition modifications', () => {
    it('should handle adding multiple transitions with complex conditions', () => {
      const modifier = SCXMLModifier.from(baseDocument);

      const complexTransitions = [
        TransitionBuilder.create()
          .event('conditional')
          .cond('data.value > 10 && data.enabled')
          .target('active')
          .addLog({ expr: '"Complex condition met"' })
          .addAssign({ location: 'data.lastTransition', expr: 'Date.now()' })
          .build(),
        TransitionBuilder.create()
          .event('timed')
          .cond('timer.elapsed > 5000')
          .target('timeout')
          .addSend({ event: 'timeout-notification', target: 'supervisor' })
          .build(),
        TransitionBuilder.create()
          .cond('emergency.detected')
          .target('emergency')
          .type('external')
          .addRaise({ event: 'emergency.raised' })
          .build()
      ];

      complexTransitions.forEach(transition => {
        modifier.addTransitionToState('idle', transition);
      });

      // Add the new states referenced by transitions
      modifier.addState(StateBuilder.create('timeout').build());
      modifier.addState(StateBuilder.create('emergency').build());

      const result = modifier.getDocument();
      const idleState = modifier.findState('idle');
      expect(idleState!.transition).toHaveLength(4); // Original + 3 new

      expect(idleState!.transition![1].cond).toBe('data.value > 10 && data.enabled');
      expect(idleState!.transition![1].log).toHaveLength(1);
      expect(idleState!.transition![1].assign).toHaveLength(1);

      expect(idleState!.transition![2].send).toHaveLength(1);
      expect(idleState!.transition![3].type).toBe('external');
      expect(idleState!.transition![3].raise).toHaveLength(1);
    });

    it('should handle removing transitions based on complex predicates', () => {
      // First add multiple transitions
      const modifier = SCXMLModifier.from(baseDocument);

      const transitions = [
        TransitionBuilder.create().event('event1').target('state1').build(),
        TransitionBuilder.create().event('event2').target('state2').build(),
        TransitionBuilder.create().event('event3').target('state1').build(),
        TransitionBuilder.create().cond('condition').target('state3').build()
      ];

      transitions.forEach(t => modifier.addTransitionToState('idle', t));

      // Remove all transitions targeting 'state1'
      modifier.removeTransitionFromState('idle', t => t.target === 'state1');

      const result = modifier.getDocument();
      const idleState = modifier.findState('idle');

      // Should have original 'start' transition + event2 + condition transitions
      expect(idleState!.transition).toHaveLength(3);
      expect(idleState!.transition!.some(t => t.target === 'state1')).toBe(false);
      expect(idleState!.transition!.some(t => t.target === 'state2')).toBe(true);
    });

    it('should handle updating transitions with complex modifications', () => {
      const modifier = SCXMLModifier.from(baseDocument);

      // Add a transition to modify
      modifier.addTransitionToState('active', TransitionBuilder.create()
        .event('modify-me')
        .target('old-target')
        .cond('old-condition')
        .addLog({ label: 'old-log' })
        .build());

      // Update the transition
      modifier.updateTransitionInState('active',
        t => t.event === 'modify-me',
        t => {
          t.target = 'new-target';
          t.cond = 'new-condition';
          t.type = 'internal';
          if (!t.assign) t.assign = [];
          t.assign.push({ location: 'modified', expr: 'true' });
          if (t.log) t.log[0].label = 'modified-log';
          return t;
        }
      );

      const result = modifier.getDocument();
      const activeState = modifier.findState('active');
      const modifiedTransition = activeState!.transition!.find(t => t.event === 'modify-me');

      expect(modifiedTransition!.target).toBe('new-target');
      expect(modifiedTransition!.cond).toBe('new-condition');
      expect(modifiedTransition!.type).toBe('internal');
      expect(modifiedTransition!.assign).toHaveLength(1);
      expect(modifiedTransition!.log![0].label).toBe('modified-log');
    });
  });

  describe('parallel state modifications', () => {
    it('should handle modifications within parallel regions', () => {
      const modifier = SCXMLModifier.from(complexDocument);

      // Add state to parallel region
      modifier.updateState('parallel', parallel => {
        if (!parallel.state) parallel.state = [];
        parallel.state.push({
          id: 'p3',
          onentry: [{
            log: [{ label: 'Entering p3' }]
          }]
        });
        return parallel;
      });

      // Add transition to existing parallel branch
      modifier.addTransitionToState('p1', TransitionBuilder.create()
        .event('p1-event')
        .target('p2')
        .build());

      const result = modifier.getDocument();

      // Debug: Log all states to see what's available
      console.log('All states in document:');
      const logStates = (states: any[], prefix = '') => {
        states?.forEach(state => {
          console.log(`${prefix}- ${state.id} (type: ${state.parallel ? 'parallel' : 'state'})`);
          if (state.state) {
            logStates(state.state, prefix + '  ');
          }
        });
      };
      logStates(result.scxml.state || []);

      // Debug: Also log parallel states separately
      console.log('All parallel states:');
      const logParallel = (states: any[], prefix = '') => {
        states?.forEach(state => {
          if (state.parallel) {
            console.log(`${prefix}Found parallel: ${state.id}`);
          }
          if (state.state) {
            logParallel(state.state, prefix + '  ');
          }
        });
      };
      logParallel(result.scxml.state || []);

      // Debug: Check what the actual root state contains
      const rootState = result.scxml.state?.[0];
      console.log('Root state structure:', {
        id: rootState?.id,
        parallel: rootState?.parallel,
        hasState: !!rootState?.state,
        stateCount: rootState?.state?.length,
        stateIds: rootState?.state?.map((s: any) => s.id)
      });

      const parallel = modifier.findState('parallel');

      // Debug: Check if parallel state exists and what its structure is
      if (!parallel) {
        throw new Error('Parallel state not found');
      }
      if (!parallel.state) {
        throw new Error('Parallel state has no child states');
      }

      expect(parallel.state).toHaveLength(3);
      expect(parallel.state[2].id).toBe('p3');

      const p1 = modifier.findState('p1');
      expect(p1!.transition).toHaveLength(1);
      expect(p1!.transition![0].target).toBe('p2');
    });

    it('should handle adding nested parallel regions', () => {
      const modifier = SCXMLModifier.from(baseDocument);

      const nestedParallel = ParallelBuilder.create('nested-parallel')
        .addState(StateBuilder.create('np1')
          .addTransition(TransitionBuilder.create()
            .event('np-event')
            .target('np2')
            .build())
          .build())
        .addState(StateBuilder.create('np2').build())
        .addParallel(ParallelBuilder.create('double-nested')
          .addState(StateBuilder.create('dn1').build())
          .addState(StateBuilder.create('dn2').build())
          .build())
        .build();

      modifier.addState(nestedParallel);

      const result = modifier.getDocument();
      const parallel = modifier.findState('nested-parallel');
      expect(parallel).toBeDefined();
      expect(parallel!.state).toHaveLength(2);
      expect(parallel!.parallel).toHaveLength(1);

      const doubleNested = modifier.findState('double-nested');
      expect(doubleNested).toBeDefined();
      expect(doubleNested!.state).toHaveLength(2);
    });
  });

  describe('data model modifications', () => {
    it('should handle complex data model operations', () => {
      const modifier = SCXMLModifier.from(baseDocument);

      // Add various data types
      const dataElements = [
        DataBuilder.create('counter').expr('0').build(),
        DataBuilder.create('config').content('{"debug": true, "timeout": 5000}').build(),
        DataBuilder.create('external').src('/api/data').build(),
        DataBuilder.create('array').expr('[1, 2, 3, 4, 5]').build(),
        DataBuilder.create('function').expr('function() { return Math.random(); }').build()
      ];

      dataElements.forEach(data => modifier.addDataToModel(data));

      // Update some data
      modifier.updateDataInModel('counter', d => {
        d.expr = '10';
        return d;
      });

      modifier.updateDataInModel('config', d => {
        d.content = '{"debug": false, "timeout": 10000, "retries": 3}';
        return d;
      });

      // Remove one data element
      modifier.removeDataFromModel('external');

      const result = modifier.getDocument();
      expect(result.scxml.datamodel_element!.data).toHaveLength(4);

      const counter = result.scxml.datamodel_element!.data!.find(d => d.id === 'counter');
      expect(counter!.expr).toBe('10');

      const config = result.scxml.datamodel_element!.data!.find(d => d.id === 'config');
      expect(config!.content).toContain('"retries": 3');

      const external = result.scxml.datamodel_element!.data!.find(d => d.id === 'external');
      expect(external).toBeUndefined();
    });

    it('should handle data model with duplicate ID handling', () => {
      const modifier = SCXMLModifier.from(baseDocument);

      // Add initial data
      modifier.addDataToModel(DataBuilder.create('shared').expr('1').build());
      modifier.addDataToModel(DataBuilder.create('shared').expr('2').build()); // Duplicate ID

      const result = modifier.getDocument();
      expect(result.scxml.datamodel_element!.data).toHaveLength(2);

      // Both should be present (modifier doesn't prevent duplicates, validator does)
      const sharedElements = result.scxml.datamodel_element!.data!.filter(d => d.id === 'shared');
      expect(sharedElements).toHaveLength(2);
    });
  });

  describe('state renaming with complex references', () => {
    it('should handle renaming with hierarchical target references', () => {
      const modifier = SCXMLModifier.from(complexDocument);

      // Add some transitions with complex targets
      modifier.addTransitionToState('level2a', TransitionBuilder.create()
        .event('jump-to-alt')
        .target('../../level1alt')
        .build());

      modifier.addTransitionToState('p1', TransitionBuilder.create()
        .event('jump-out')
        .target('../../../level1alt')
        .build());

      // Rename the target state
      modifier.renameState('level1alt', 'level1-alternative');

      const result = modifier.getDocument();

      // Verify state was renamed
      const renamed = modifier.findState('level1-alternative');
      expect(renamed).toBeDefined();
      expect(renamed!.id).toBe('level1-alternative');

      // Verify old name doesn't exist
      const old = modifier.findState('level1alt');
      expect(old).toBeUndefined();

      // Verify references were updated
      const level2a = modifier.findState('level2a');
      const jumpTransition = level2a!.transition!.find(t => t.event === 'jump-to-alt');
      expect(jumpTransition!.target).toBe('../../level1-alternative');

      const p1 = modifier.findState('p1');
      const jumpOutTransition = p1!.transition!.find(t => t.event === 'jump-out');
      expect(jumpOutTransition!.target).toBe('../../../level1-alternative');
    });

    it('should handle renaming with initial state reference updates', () => {
      const modifier = SCXMLModifier.from(complexDocument);

      // Rename a state that's referenced as initial
      modifier.renameState('level2a', 'level2-alpha');

      const result = modifier.getDocument();

      // Check that initial reference was updated
      const level1 = modifier.findState('level1');
      expect(level1!.initial).toBe('level2-alpha');

      // Verify the renamed state exists
      const renamed = modifier.findState('level2-alpha');
      expect(renamed).toBeDefined();
      expect(renamed!.id).toBe('level2-alpha');
    });

    it('should handle renaming states in parallel regions', () => {
      const modifier = SCXMLModifier.from(complexDocument);

      // Add cross-references between parallel branches
      modifier.addTransitionToState('p1', TransitionBuilder.create()
        .event('to-p2')
        .target('p2')
        .build());

      modifier.addTransitionToState('p2', TransitionBuilder.create()
        .event('to-p1')
        .target('p1')
        .build());

      // Rename one of the parallel states
      modifier.renameState('p2', 'parallel-branch-2');

      const result = modifier.getDocument();

      // Verify references were updated
      const p1 = modifier.findState('p1');
      expect(p1!.transition![0].target).toBe('parallel-branch-2');

      const renamed = modifier.findState('parallel-branch-2');
      expect(renamed!.transition![0].target).toBe('p1');
    });
  });

  describe('advanced action modifications', () => {
    it('should handle adding complex action sequences', () => {
      const modifier = SCXMLModifier.from(baseDocument);

      const complexEntry = OnEntryBuilder.create()
        .addLog({ expr: '"Entering with timestamp: " + Date.now()' })
        .addAssign({ location: 'entryTime', expr: 'Date.now()' })
        .addAssign({ location: 'entryCount', expr: '(entryCount || 0) + 1' })
        .addRaise({ event: 'state.entered' })
        .addSend({
          event: 'entry-notification',
          target: 'supervisor',
          delay: '100ms'
        })
        .addScript({ content: 'performComplexInitialization();' })
        .build();

      modifier.addOnEntryToState('idle', complexEntry);

      // Add multiple on-entry actions to same state
      const secondEntry = OnEntryBuilder.create()
        .addLog({ label: 'Second entry action' })
        .build();

      modifier.addOnEntryToState('idle', secondEntry);

      const result = modifier.getDocument();
      const idleState = modifier.findState('idle');
      expect(idleState!.onentry).toHaveLength(2);

      // First entry should have all action types
      expect(idleState!.onentry![0].log).toHaveLength(1);
      expect(idleState!.onentry![0].assign).toHaveLength(2);
      expect(idleState!.onentry![0].raise).toHaveLength(1);
      expect(idleState!.onentry![0].send).toHaveLength(1);
      expect(idleState!.onentry![0].script).toHaveLength(1);

      // Second entry should have just log
      expect(idleState!.onentry![1].log).toHaveLength(1);
      expect(idleState!.onentry![1].log![0].label).toBe('Second entry action');
    });

    it('should handle complex invoke modifications', () => {
      const modifier = SCXMLModifier.from(baseDocument);

      const complexInvoke = {
        id: 'complex-service',
        type: 'http',
        src: '/api/complex-endpoint',
        autoforward: true,
        param: [
          { name: 'stateId', expr: '_sessionid' },
          { name: 'timestamp', expr: 'Date.now()' },
          { name: 'config', location: 'configData' }
        ],
        finalize: {
          log: [{ label: 'Service finalized' }],
          assign: [{ location: 'serviceResult', expr: '_event.data' }]
        },
        content: {
          expr: 'JSON.stringify({ context: _context, event: _event })',
          content: '{"fallback": "static content"}'
        }
      };

      modifier.addInvokeToState('active', complexInvoke);

      const result = modifier.getDocument();
      const activeState = modifier.findState('active');
      expect(activeState!.invoke).toHaveLength(1);

      const invoke = activeState!.invoke![0];
      expect(invoke.id).toBe('complex-service');
      expect(invoke.param).toHaveLength(3);
      expect(invoke.param![0].name).toBe('stateId');
      expect(invoke.param![1].expr).toBe('Date.now()');
      expect(invoke.param![2].location).toBe('configData');
      expect(invoke.content!.expr).toBeDefined();
      expect(invoke.content!.content).toBeDefined();
    });
  });

  describe('bulk operations and performance', () => {
    it('should handle bulk state additions efficiently', () => {
      const modifier = SCXMLModifier.from(baseDocument);

      const start = Date.now();

      // Add 100 states with transitions
      for (let i = 0; i < 100; i++) {
        const state = StateBuilder.create(`bulk-state-${i}`)
          .addTransition(TransitionBuilder.create()
            .event(`event-${i}`)
            .target(`bulk-state-${(i + 1) % 100}`)
            .addLog({ expr: `"Processing state ${i}"` })
            .addAssign({ location: 'currentState', expr: `${i}` })
            .build())
          .build();

        modifier.addState(state);
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second

      const result = modifier.getDocument();
      expect(result.scxml.state).toHaveLength(102); // Original 2 + 100 new
      expect(modifier.getAllStateIds()).toHaveLength(102);
    });

    it('should handle bulk transition modifications efficiently', () => {
      const modifier = SCXMLModifier.from(baseDocument);

      const start = Date.now();

      // Add many transitions to a single state
      for (let i = 0; i < 50; i++) {
        modifier.addTransitionToState('idle', TransitionBuilder.create()
          .event(`bulk-event-${i}`)
          .cond(`condition${i}`)
          .target('active')
          .addLog({ expr: `"Bulk transition ${i}"` })
          .build());
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);

      const result = modifier.getDocument();
      const idleState = modifier.findState('idle');
      expect(idleState!.transition).toHaveLength(51); // Original 1 + 50 new
    });

    it('should handle bulk data operations efficiently', () => {
      const modifier = SCXMLModifier.from(baseDocument);

      const start = Date.now();

      // Add many data elements
      for (let i = 0; i < 100; i++) {
        modifier.addDataToModel(DataBuilder.create(`data-${i}`)
          .expr(`Math.random() * ${i}`)
          .build());
      }

      // Update half of them
      for (let i = 0; i < 50; i++) {
        modifier.updateDataInModel(`data-${i}`, d => {
          d.expr = `"updated-${i}"`;
          return d;
        });
      }

      // Remove a quarter of them
      for (let i = 75; i < 100; i++) {
        modifier.removeDataFromModel(`data-${i}`);
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);

      const result = modifier.getDocument();
      expect(result.scxml.datamodel_element!.data).toHaveLength(75); // 100 - 25 removed
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should handle operations on non-existent states gracefully', () => {
      const modifier = SCXMLModifier.from(baseDocument);

      // These operations should not throw but also should not modify the document
      const originalDoc = modifier.getDocument();

      modifier.addTransitionToState('non-existent', TransitionBuilder.create()
        .event('test')
        .build());

      modifier.updateState('non-existent', state => {
        state.initial = 'changed';
        return state;
      });

      const result = modifier.getDocument();
      expect(JSON.stringify(result)).toBe(JSON.stringify(originalDoc));
    });

    it('should handle circular state modifications without infinite loops', () => {
      const modifier = SCXMLModifier.from(baseDocument);

      // Create potential for circular updates
      modifier.updateState('idle', state => {
        if (!state.state) state.state = [];
        state.state.push({
          id: 'child-of-idle',
          transition: [{
            event: 'back-to-parent',
            target: 'idle'
          }]
        });
        return state;
      });

      modifier.updateState('active', state => {
        if (!state.state) state.state = [];
        state.state.push({
          id: 'child-of-active',
          transition: [{
            event: 'to-idle-child',
            target: 'child-of-idle'
          }]
        });
        return state;
      });

      const result = modifier.getDocument();
      expect(result.scxml.state).toHaveLength(2); // Should not have infinite states

      const idle = modifier.findState('idle');
      expect(idle!.state).toHaveLength(1);
      expect(idle!.state![0].id).toBe('child-of-idle');

      const childOfIdle = modifier.findState('child-of-idle');
      expect(childOfIdle).toBeDefined();
      expect(childOfIdle!.transition![0].target).toBe('idle');
    });

    it('should handle deep cloning with complex nested structures', () => {
      const modifier = SCXMLModifier.from(complexDocument);
      const clone = modifier.clone();

      // Modify original
      modifier.setName('modified-original');
      modifier.addState(StateBuilder.create('new-in-original').build());

      // Modify clone
      clone.setName('modified-clone');
      clone.addState(StateBuilder.create('new-in-clone').build());

      const originalDoc = modifier.getDocument();
      const cloneDoc = clone.getDocument();

      expect(originalDoc.scxml.name).toBe('modified-original');
      expect(cloneDoc.scxml.name).toBe('modified-clone');

      const originalStates = modifier.getAllStateIds();
      const cloneStates = clone.getAllStateIds();

      expect(originalStates).toContain('new-in-original');
      expect(originalStates).not.toContain('new-in-clone');
      expect(cloneStates).toContain('new-in-clone');
      expect(cloneStates).not.toContain('new-in-original');
    });

    it('should maintain document integrity during complex operations', () => {
      const modifier = SCXMLModifier.from(complexDocument);

      // Perform series of complex operations
      modifier
        .setName('integrity-test')
        .setInitial('root')
        .addState(StateBuilder.create('integrity-state')
          .addTransition(TransitionBuilder.create()
            .event('integrity-event')
            .target('root')
            .build())
          .build())
        .renameState('level1', 'renamed-level1')
        .addTransitionToState('level2a', TransitionBuilder.create()
          .event('test-integrity')
          .target('integrity-state')
          .build())
        .addDataToModel(DataBuilder.create('integrity-data').expr('42').build())
        .updateDataInModel('integrity-data', d => {
          d.expr = '84';
          return d;
        });

      const result = modifier.getDocument();

      // Verify basic structure integrity
      expect(result.scxml.name).toBe('integrity-test');
      expect(result.scxml.initial).toBe('root');
      expect(result.scxml.datamodel_element!.data![0].expr).toBe('84');

      // Verify state renaming worked
      const renamed = modifier.findState('renamed-level1');
      expect(renamed).toBeDefined();

      // Verify new state was added
      const integrityState = modifier.findState('integrity-state');
      expect(integrityState).toBeDefined();

      // Verify all state IDs are still unique
      const allIds = modifier.getAllStateIds();
      const uniqueIds = [...new Set(allIds)];
      expect(allIds.length).toBe(uniqueIds.length);
    });
  });
});