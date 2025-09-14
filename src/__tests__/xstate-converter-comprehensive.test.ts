import { XStateConverter } from '../xstate-converter';
import { SCXMLBuilder, StateBuilder, TransitionBuilder, DataModelBuilder, DataBuilder, OnEntryBuilder, OnExitBuilder, ParallelBuilder } from '../builder';

describe('XState Converter Comprehensive Tests', () => {
  let converter: XStateConverter;

  beforeEach(() => {
    converter = new XStateConverter();
  });

  describe('complex state hierarchy conversion', () => {
    it('should convert deeply nested state hierarchies', () => {
      const doc = SCXMLBuilder.create()
        .name('nested-machine')
        .initial('level1')
        .addState(StateBuilder.create('level1')
          .initial('level2')
          .addState(StateBuilder.create('level2')
            .initial('level3')
            .addState(StateBuilder.create('level3')
              .initial('level4')
              .addState(StateBuilder.create('level4')
                .addTransition(TransitionBuilder.create()
                  .event('DEEP_EVENT')
                  .target('level3')
                  .build())
                .build())
              .addState(StateBuilder.create('level3alt').build())
              .build())
            .addState(StateBuilder.create('level2alt').build())
            .build())
          .addState(StateBuilder.create('level1alt').build())
          .build())
        .build();

      const xstateConfig = converter.convertToXState(doc);

      expect(xstateConfig.states!.level1.initial).toBe('level2');
      expect(xstateConfig.states!.level1.states!.level2.initial).toBe('level3');
      expect(xstateConfig.states!.level1.states!.level2.states!.level3.initial).toBe('level4');

      // Verify deep event handling
      const level4 = xstateConfig.states!.level1.states!.level2.states!.level3.states!.level4;
      expect(level4.on!.DEEP_EVENT).toBeDefined();
    });

    it('should convert mixed state and parallel hierarchies', () => {
      const doc = SCXMLBuilder.create()
        .name('mixed-hierarchy')
        .initial('root')
        .addState(StateBuilder.create('root')
          .initial('regular')
          .addState(StateBuilder.create('regular')
            .addTransition(TransitionBuilder.create()
              .event('TO_PARALLEL')
              .target('parallel-region')
              .build())
            .build())
          .addParallel(ParallelBuilder.create('parallel-region')
            .addState(StateBuilder.create('branch1')
              .initial('b1s1')
              .addState(StateBuilder.create('b1s1').build())
              .addState(StateBuilder.create('b1s2').build())
              .build())
            .addState(StateBuilder.create('branch2')
              .initial('b2s1')
              .addState(StateBuilder.create('b2s1').build())
              .build())
            .build())
          .build())
        .build();

      const xstateConfig = converter.convertToXState(doc);

      expect(xstateConfig.states!.root.initial).toBe('regular');
      expect(xstateConfig.states!.root.states!.regular.on!.TO_PARALLEL).toBeDefined();
      expect(xstateConfig.states!.root.states!['parallel-region'].type).toBe('parallel');
      expect(xstateConfig.states!.root.states!['parallel-region'].states!.branch1.initial).toBe('b1s1');
    });
  });

  describe('advanced context and data handling', () => {
    it('should convert complex data models with various types', () => {
      const dataModel = DataModelBuilder.create()
        .addData(DataBuilder.create('primitiveString').expr('"hello world"').build())
        .addData(DataBuilder.create('primitiveNumber').expr('42.5').build())
        .addData(DataBuilder.create('primitiveBoolean').expr('true').build())
        .addData(DataBuilder.create('primitiveNull').expr('null').build())
        .addData(DataBuilder.create('objectLiteral').expr('{ name: "test", value: 123, nested: { prop: true } }').build())
        .addData(DataBuilder.create('arrayLiteral').expr('[1, 2, "three", { four: 4 }, [5, 6]]').build())
        .addData(DataBuilder.create('functionExpr').expr('function() { return Date.now(); }').build())
        .addData(DataBuilder.create('jsonContent').content('{"type": "config", "enabled": true, "settings": {"timeout": 5000}}').build())
        .addData(DataBuilder.create('xmlContent').content('<config><timeout>5000</timeout><enabled>true</enabled></config>').build())
        .addData(DataBuilder.create('textContent').content('plain text configuration data').build())
        .addData(DataBuilder.create('externalRef').src('/api/dynamic-config').build())
        .build();

      const doc = SCXMLBuilder.create()
        .name('data-rich-machine')
        .initial('idle')
        .addDataModel(dataModel)
        .addState(StateBuilder.create('idle').build())
        .build();

      const xstateConfig = converter.convertToXState(doc);

      expect(xstateConfig.context.primitiveString).toBe('hello world');
      expect(xstateConfig.context.primitiveNumber).toBe(42.5);
      expect(xstateConfig.context.primitiveBoolean).toBe(true);
      expect(xstateConfig.context.primitiveNull).toBeNull();
      expect(xstateConfig.context.objectLiteral).toEqual({
        name: 'test',
        value: 123,
        nested: { prop: true }
      });
      expect(xstateConfig.context.arrayLiteral).toEqual([1, 2, 'three', { four: 4 }, [5, 6]]);
      expect(xstateConfig.context.jsonContent).toEqual({
        type: 'config',
        enabled: true,
        settings: { timeout: 5000 }
      });
      expect(xstateConfig.context.textContent).toBe('plain text configuration data');
      expect(xstateConfig.context.externalRef).toEqual({ _src: '/api/dynamic-config' });
    });

    it('should handle invalid data expressions gracefully', () => {
      const dataModel = DataModelBuilder.create()
        .addData(DataBuilder.create('validData').expr('42').build())
        .addData(DataBuilder.create('invalidSyntax').expr('{ invalid: syntax').build()) // Malformed
        .addData(DataBuilder.create('invalidJson').content('{ "invalid": json }').build()) // Malformed JSON
        .addData(DataBuilder.create('undefinedRef').expr('nonexistent.property').build())
        .build();

      const doc = SCXMLBuilder.create()
        .name('error-handling-machine')
        .initial('idle')
        .addDataModel(dataModel)
        .addState(StateBuilder.create('idle').build())
        .build();

      const xstateConfig = converter.convertToXState(doc);

      expect(xstateConfig.context.validData).toBe(42);
      expect(xstateConfig.context.invalidSyntax).toBe('{ invalid: syntax'); // Falls back to string
      expect(xstateConfig.context.invalidJson).toBe('{ "invalid": json }'); // Falls back to string
      expect(xstateConfig.context.undefinedRef).toBe('nonexistent.property'); // Falls back to string
    });
  });

  describe('complex action conversion', () => {
    it('should convert comprehensive executable content', () => {
      const complexEntry = OnEntryBuilder.create()
        .addRaise({ event: 'internal.entered' })
        .addRaise({ event: 'internal.ready' })
        .addLog({ label: 'State Entry' })
        .addLog({ expr: '"Entering at: " + Date.now()' })
        .addAssign({ location: 'entryTime', expr: 'Date.now()' })
        .addAssign({ location: 'entryCount', expr: '(entryCount || 0) + 1' })
        .addAssign({ location: 'context.nested.prop', expr: 'newValue' })
        .addSend({ event: 'entry-notification', target: 'parent' })
        .addSend({ event: 'delayed-entry', target: 'self', delay: '500ms' })
        .addSend({ event: 'complex-send', target: 'service', delay: '1s', id: 'entry-send' })
        .addScript({ content: 'console.log("Entry script executed");' })
        .addScript({ src: '/scripts/entry-handler.js' })
        .build();

      const complexTransition = TransitionBuilder.create()
        .event('COMPLEX_EVENT')
        .cond('data.enabled && context.ready')
        .target('target-state')
        .type('external')
        .addRaise({ event: 'transition.started' })
        .addLog({ expr: '"Transitioning from " + _event.type' })
        .addAssign({ location: 'lastTransition', expr: '_event' })
        .addSend({ event: 'transition-notify', target: 'supervisor', delay: '100ms' })
        .addScript({ content: 'performTransitionCleanup();' })
        .build();

      const doc = SCXMLBuilder.create()
        .name('action-rich-machine')
        .initial('complex-state')
        .addState(StateBuilder.create('complex-state')
          .addOnEntry(complexEntry)
          .addTransition(complexTransition)
          .build())
        .addState(StateBuilder.create('target-state').build())
        .build();

      const xstateConfig = converter.convertToXState(doc);

      // Verify entry actions
      const entryActions = xstateConfig.states!['complex-state'].entry;
      expect(entryActions).toHaveLength(12); // 2 raise + 2 log + 3 assign + 3 send + 2 script

      // Verify action types
      expect(entryActions.filter(a => a.type === 'xstate.raise')).toHaveLength(2);
      expect(entryActions.filter(a => a.type === 'log')).toHaveLength(2);
      expect(entryActions.filter(a => a.type === 'xstate.assign')).toHaveLength(3);
      expect(entryActions.filter(a => a.type === 'xstate.send')).toHaveLength(3);
      expect(entryActions.filter(a => a.type === 'script')).toHaveLength(2);

      // Verify transition actions
      const transition = (xstateConfig.states!['complex-state'].on as any).COMPLEX_EVENT[0];
      expect(transition.cond).toBe('data.enabled && context.ready');
      expect(transition.target).toBe('target-state');
      expect(transition.actions).toHaveLength(5);
    });

    it('should convert conditional executable content', () => {
      const conditionalEntry = OnEntryBuilder.create()
        .addLog({ label: 'Always executed' })
        // Note: Current implementation doesn't support if/else in builders
        // This would need to be added to test conditional logic conversion
        .build();

      // For now, test with conditional transitions
      const doc = SCXMLBuilder.create()
        .name('conditional-machine')
        .initial('test')
        .addState(StateBuilder.create('test')
          .addOnEntry(conditionalEntry)
          .addTransition(TransitionBuilder.create()
            .event('EVENT1')
            .cond('condition1')
            .target('state1')
            .addLog({ expr: '"Condition 1 met"' })
            .build())
          .addTransition(TransitionBuilder.create()
            .event('EVENT1')
            .cond('condition2')
            .target('state2')
            .addLog({ expr: '"Condition 2 met"' })
            .build())
          .addTransition(TransitionBuilder.create()
            .event('EVENT1')
            .target('default')
            .addLog({ expr: '"Default transition"' })
            .build())
          .build())
        .addState(StateBuilder.create('state1').build())
        .addState(StateBuilder.create('state2').build())
        .addState(StateBuilder.create('default').build())
        .build();

      const xstateConfig = converter.convertToXState(doc);

      const transitions = (xstateConfig.states!.test.on as any).EVENT1;
      expect(transitions).toHaveLength(3);

      expect(transitions[0].cond).toBe('condition1');
      expect(transitions[0].target).toBe('state1');
      expect(transitions[1].cond).toBe('condition2');
      expect(transitions[1].target).toBe('state2');
      expect(transitions[2].target).toBe('default');
      expect(transitions[2].cond).toBeUndefined();
    });
  });

  describe('service invocation conversion', () => {
    it('should convert complex invoke configurations', () => {
      const doc = SCXMLBuilder.create()
        .name('service-machine')
        .initial('invoking')
        .addState(StateBuilder.create('invoking')
          .addInvoke({
            id: 'http-service',
            type: 'http',
            src: '/api/data-service',
            autoforward: true,
            param: [
              { name: 'sessionId', expr: '_sessionid' },
              { name: 'timestamp', expr: 'Date.now()' },
              { name: 'config', location: 'serviceConfig' },
              { name: 'static', expr: '"static-value"' }
            ]
          })
          .addInvoke({
            id: 'websocket-service',
            type: 'websocket',
            srcexpr: 'dynamicWebSocketUrl',
            autoforward: false,
            param: [
              { name: 'protocol', expr: '"v1"' }
            ],
            content: {
              expr: 'JSON.stringify(initMessage)',
              content: '{"type": "init", "version": "1.0"}'
            }
          })
          .addInvoke({
            id: 'simple-service',
            type: 'promise',
            src: 'promiseService'
          })
          .build())
        .build();

      const xstateConfig = converter.convertToXState(doc);

      const invokes = xstateConfig.states!.invoking.invoke;
      expect(invokes).toHaveLength(3);

      // HTTP service
      expect(invokes![0].id).toBe('http-service');
      expect(invokes![0].src).toBe('/api/data-service');
      expect(invokes![0].autoForward).toBe(true);
      expect(invokes![0].data).toEqual({
        sessionId: '_sessionid',
        timestamp: expect.any(Number),
        config: { _location: 'serviceConfig' },
        static: 'static-value'
      });

      // WebSocket service
      expect(invokes![1].id).toBe('websocket-service');
      expect(invokes![1].src).toBe('dynamicWebSocketUrl');
      expect(invokes![1].autoForward).toBe(false);

      // Simple service
      expect(invokes![2].id).toBe('simple-service');
      expect(invokes![2].src).toBe('promiseService');
    });

    it('should handle invoke parameter evaluation edge cases', () => {
      const doc = SCXMLBuilder.create()
        .name('param-edge-cases')
        .initial('test')
        .addState(StateBuilder.create('test')
          .addInvoke({
            id: 'param-test',
            type: 'service',
            src: '/test',
            param: [
              { name: 'validExpr', expr: '42 + 8' },
              { name: 'invalidExpr', expr: 'undefined.property' },
              { name: 'complexExpr', expr: '{ nested: { prop: [1, 2, 3] } }' },
              { name: 'locationParam', location: 'dataLocation' },
              { name: 'stringLiteral', expr: '"hello world"' },
              { name: 'booleanLiteral', expr: 'false' }
            ]
          })
          .build())
        .build();

      const xstateConfig = converter.convertToXState(doc);

      const invoke = xstateConfig.states!.test.invoke![0];
      expect(invoke.data!.validExpr).toBe(50);
      expect(invoke.data!.invalidExpr).toBe('undefined.property');
      expect(invoke.data!.complexExpr).toEqual({ nested: { prop: [1, 2, 3] } });
      expect(invoke.data!.locationParam).toEqual({ _location: 'dataLocation' });
      expect(invoke.data!.stringLiteral).toBe('hello world');
      expect(invoke.data!.booleanLiteral).toBe(false);
    });
  });

  describe('event handling and transitions', () => {
    it('should convert complex event patterns', () => {
      const doc = SCXMLBuilder.create()
        .name('event-machine')
        .initial('listening')
        .addState(StateBuilder.create('listening')
          .addTransition(TransitionBuilder.create()
            .event('user.click')
            .target('clicked')
            .build())
          .addTransition(TransitionBuilder.create()
            .event('user.doubleclick')
            .target('double-clicked')
            .build())
          .addTransition(TransitionBuilder.create()
            .event('system.error')
            .cond('error.severity > 5')
            .target('error-handling')
            .build())
          .addTransition(TransitionBuilder.create()
            .event('timer.tick')
            .cond('timer.count < 10')
            .type('internal')
            .addAssign({ location: 'timer.count', expr: 'timer.count + 1' })
            .build())
          .addTransition(TransitionBuilder.create()
            .event('timer.tick')
            .cond('timer.count >= 10')
            .target('timer-expired')
            .build())
          .build())
        .addState(StateBuilder.create('clicked').build())
        .addState(StateBuilder.create('double-clicked').build())
        .addState(StateBuilder.create('error-handling').build())
        .addState(StateBuilder.create('timer-expired').build())
        .build();

      const xstateConfig = converter.convertToXState(doc);

      const listeningState = xstateConfig.states!.listening;

      expect(listeningState.on!['user.click']).toBeDefined();
      expect(listeningState.on!['user.doubleclick']).toBeDefined();
      expect(listeningState.on!['system.error']).toBeDefined();
      expect(listeningState.on!['timer.tick']).toHaveLength(2);

      const timerTransitions = listeningState.on!['timer.tick'] as any[];
      expect(timerTransitions[0].cond).toBe('timer.count < 10');
      expect(timerTransitions[0].internal).toBe(true);
      expect(timerTransitions[0].actions).toHaveLength(1);
      expect(timerTransitions[1].cond).toBe('timer.count >= 10');
      expect(timerTransitions[1].target).toBe('timer-expired');
    });

    it('should handle eventless and targetless transitions', () => {
      const doc = SCXMLBuilder.create()
        .name('special-transitions')
        .initial('auto-state')
        .addState(StateBuilder.create('auto-state')
          .addTransition(TransitionBuilder.create()
            .cond('autoCondition')
            .target('next-state')
            .build())
          .addTransition(TransitionBuilder.create()
            .event('internal-event')
            .type('internal')
            .addAssign({ location: 'counter', expr: 'counter + 1' })
            .build())
          .build())
        .addState(StateBuilder.create('next-state').build())
        .build();

      const xstateConfig = converter.convertToXState(doc);

      const autoState = xstateConfig.states!['auto-state'];

      // Eventless transition (automatic)
      expect(autoState.on!['']).toBeDefined();
      const eventlessTransition = (autoState.on![''] as any[])[0];
      expect(eventlessTransition.cond).toBe('autoCondition');
      expect(eventlessTransition.target).toBe('next-state');

      // Targetless transition (internal)
      const internalTransition = (autoState.on!['internal-event'] as any[])[0];
      expect(internalTransition.target).toBeUndefined();
      expect(internalTransition.internal).toBe(true);
      expect(internalTransition.actions).toHaveLength(1);
    });
  });

  describe('final states and completion', () => {
    it('should convert final states with done data', () => {
      const doc = SCXMLBuilder.create()
        .name('completion-machine')
        .initial('working')
        .addState(StateBuilder.create('working')
          .addTransition(TransitionBuilder.create()
            .event('COMPLETE')
            .target('success')
            .build())
          .addTransition(TransitionBuilder.create()
            .event('FAIL')
            .target('failure')
            .build())
          .build())
        .addFinal({
          id: 'success',
          onentry: [OnEntryBuilder.create()
            .addLog({ label: 'Task completed successfully' })
            .addAssign({ location: 'result.success', expr: 'true' })
            .build()],
          donedata: {
            content: {
              expr: '{ success: true, timestamp: Date.now(), result: result }'
            }
          }
        })
        .addFinal({
          id: 'failure',
          onentry: [OnEntryBuilder.create()
            .addLog({ label: 'Task failed' })
            .build()],
          donedata: {
            content: {
              content: '{"success": false, "error": "Task failed"}'
            }
          }
        })
        .build();

      const xstateConfig = converter.convertToXState(doc);

      expect(xstateConfig.states!.success.type).toBe('final');
      expect(xstateConfig.states!.success.entry).toHaveLength(2);
      expect(xstateConfig.states!.success.data).toBe('{ success: true, timestamp: Date.now(), result: result }');

      expect(xstateConfig.states!.failure.type).toBe('final');
      expect(xstateConfig.states!.failure.entry).toHaveLength(1);
      expect(xstateConfig.states!.failure.data).toBe('{"success": false, "error": "Task failed"}');
    });
  });

  describe('machine creation and execution', () => {
    it('should create executable XState machines', () => {
      const doc = SCXMLBuilder.create()
        .name('executable-machine')
        .initial('idle')
        .addDataModel(DataModelBuilder.create()
          .addData(DataBuilder.create('counter').expr('0').build())
          .addData(DataBuilder.create('enabled').expr('true').build())
          .build())
        .addState(StateBuilder.create('idle')
          .addOnEntry(OnEntryBuilder.create()
            .addAssign({ location: 'counter', expr: 'counter + 1' })
            .build())
          .addTransition(TransitionBuilder.create()
            .event('START')
            .cond('enabled')
            .target('running')
            .addAssign({ location: 'startTime', expr: 'Date.now()' })
            .build())
          .build())
        .addState(StateBuilder.create('running')
          .addTransition(TransitionBuilder.create()
            .event('STOP')
            .target('idle')
            .build())
          .build())
        .build();

      const machine = converter.createMachine(doc);

      expect(machine.id).toBe('executable-machine');
      expect(machine.initialState.value).toBe('idle');
      expect(machine.initialState.context.counter).toBe(0);
      expect(machine.initialState.context.enabled).toBe(true);

      // Test state transitions
      let state = machine.initialState;

      // Should increment counter on entry
      state = machine.transition(state, { type: '__start__' }); // Trigger initial entry
      expect(state.context.counter).toBe(1);

      // Test conditional transition
      state = machine.transition(state, 'START');
      expect(state.value).toBe('running');
      expect(state.context.startTime).toBeDefined();

      // Test return transition
      state = machine.transition(state, 'STOP');
      expect(state.value).toBe('idle');
    });

    it('should create machines with custom options', () => {
      const customConverter = new XStateConverter({
        customActions: {
          customLog: (context: any, event: any) => {
            console.log('Custom log:', context, event);
          }
        },
        customGuards: {
          customGuard: (context: any, event: any) => {
            return context.enabled && event.type === 'CUSTOM';
          }
        },
        customServices: {
          customService: (context: any, event: any) => {
            return Promise.resolve({ data: 'custom service result' });
          }
        }
      });

      const doc = SCXMLBuilder.create()
        .name('custom-machine')
        .initial('test')
        .addState(StateBuilder.create('test').build())
        .build();

      const machine = customConverter.createMachine(doc);

      expect(machine.id).toBe('custom-machine');
      expect(machine.options.actions).toHaveProperty('customLog');
      expect(machine.options.guards).toHaveProperty('customGuard');
      expect(machine.options.services).toHaveProperty('customService');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty or minimal SCXML documents', () => {
      const emptyDoc = SCXMLBuilder.create().build();
      const xstateConfig = converter.convertToXState(emptyDoc);

      expect(xstateConfig.id).toBe('scxml-machine');
      expect(xstateConfig.states).toEqual({});
      expect(xstateConfig.context).toEqual({});
    });

    it('should handle states with no transitions', () => {
      const doc = SCXMLBuilder.create()
        .name('simple-machine')
        .initial('isolated')
        .addState(StateBuilder.create('isolated').build())
        .build();

      const xstateConfig = converter.convertToXState(doc);

      expect(xstateConfig.states!.isolated).toBeDefined();
      expect(xstateConfig.states!.isolated.on).toBeUndefined();
    });

    it('should handle malformed or inconsistent SCXML gracefully', () => {
      const inconsistentDoc = {
        scxml: {
          name: 'malformed',
          initial: 'nonexistent', // References non-existent state
          state: [{
            id: 'real-state',
            transition: [{
              event: 'test',
              target: 'also-nonexistent' // References non-existent state
            }]
          }]
        }
      };

      const xstateConfig = converter.convertToXState(inconsistentDoc);

      expect(xstateConfig.id).toBe('malformed');
      expect(xstateConfig.initial).toBe('nonexistent');
      expect(xstateConfig.states!['real-state']).toBeDefined();

      const transition = (xstateConfig.states!['real-state'].on as any).test[0];
      expect(transition.target).toBe('also-nonexistent');
    });

    it('should handle very large state machines efficiently', () => {
      const builder = SCXMLBuilder.create()
        .name('large-machine')
        .initial('state_0');

      // Create a large but manageable state machine
      for (let i = 0; i < 100; i++) {
        builder.addState(StateBuilder.create(`state_${i}`)
          .addTransition(TransitionBuilder.create()
            .event('NEXT')
            .target(`state_${(i + 1) % 100}`)
            .addAssign({ location: 'currentState', expr: `${i}` })
            .build())
          .build());
      }

      const doc = builder.build();

      const start = Date.now();
      const xstateConfig = converter.convertToXState(doc);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(Object.keys(xstateConfig.states!)).toHaveLength(100);

      const machine = converter.createMachine(doc);
      expect(machine.initialState.value).toBe('state_0');
    });

    it('should handle deeply nested parallel regions', () => {
      const doc = SCXMLBuilder.create()
        .name('deep-parallel')
        .initial('level1')
        .addParallel(ParallelBuilder.create('level1')
          .addParallel(ParallelBuilder.create('level2a')
            .addState(StateBuilder.create('branch1').build())
            .addState(StateBuilder.create('branch2').build())
            .build())
          .addParallel(ParallelBuilder.create('level2b')
            .addParallel(ParallelBuilder.create('level3')
              .addState(StateBuilder.create('deep1').build())
              .addState(StateBuilder.create('deep2').build())
              .build())
            .addState(StateBuilder.create('shallow').build())
            .build())
          .build())
        .build();

      const xstateConfig = converter.convertToXState(doc);

      expect(xstateConfig.states!.level1.type).toBe('parallel');
      expect(xstateConfig.states!.level1.states!.level2a.type).toBe('parallel');
      expect(xstateConfig.states!.level1.states!.level2b.type).toBe('parallel');
      expect(xstateConfig.states!.level1.states!.level2b.states!.level3.type).toBe('parallel');
      expect(xstateConfig.states!.level1.states!.level2b.states!.level3.states!.deep1).toBeDefined();
    });
  });
});