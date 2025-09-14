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
} from '../builder';

describe('SCXML Builder Comprehensive Tests', () => {
  describe('fluent API chaining', () => {
    it('should support complex method chaining', () => {
      const doc = SCXMLBuilder.create()
        .name('complex-machine')
        .initial('start')
        .datamodel('ecmascript')
        .addDataModel(DataModelBuilder.create()
          .addData(DataBuilder.create('counter').expr('0').build())
          .addData(DataBuilder.create('config').content('{"debug": true}').build())
          .build())
        .addState(StateBuilder.create('start')
          .addOnEntry(OnEntryBuilder.create()
            .addLog({ label: 'Starting' })
            .addAssign({ location: 'counter', expr: 'counter + 1' })
            .build())
          .addTransition(TransitionBuilder.create()
            .event('begin')
            .target('processing')
            .addLog({ expr: '"Transitioning to processing"' })
            .build())
          .build())
        .addState(StateBuilder.create('processing')
          .addOnExit(OnExitBuilder.create()
            .addLog({ label: 'Exiting processing' })
            .build())
          .build())
        .build();

      expect(doc.scxml.name).toBe('complex-machine');
      expect(doc.scxml.initial).toBe('start');
      expect(doc.scxml.datamodel).toBe('ecmascript');
      expect(doc.scxml.datamodel_element!.data).toHaveLength(2);
      expect(doc.scxml.state).toHaveLength(2);
    });

    it('should handle builder reuse correctly', () => {
      // Note: Builders are mutable, so reusing them will share state
      // Create separate builders for different variations
      const baseConfig = { name: 'base-machine', initial: 'idle' };

      const variant1 = SCXMLBuilder.create()
        .name(baseConfig.name)
        .initial(baseConfig.initial)
        .addState(StateBuilder.create('idle').build())
        .addState(StateBuilder.create('active').build());

      const variant2 = SCXMLBuilder.create()
        .name(baseConfig.name)
        .initial(baseConfig.initial)
        .addState(StateBuilder.create('idle').build())
        .addState(StateBuilder.create('working').build());

      const doc1 = variant1.build();
      const doc2 = variant2.build();

      expect(doc1.scxml.state![1].id).toBe('active');
      expect(doc2.scxml.state![1].id).toBe('working');
    });
  });

  describe('state builder edge cases', () => {
    it('should handle states with maximum complexity', () => {
      const complexState = StateBuilder.create('complex')
        .initial('child1')
        .addState(StateBuilder.create('child1').build())
        .addState(StateBuilder.create('child2').build())
        .addParallel(ParallelBuilder.create('parallel-region')
          .addState(StateBuilder.create('branch1').build())
          .addState(StateBuilder.create('branch2').build())
          .build())
        .addFinal({ id: 'final-child' })
        .addTransition(TransitionBuilder.create()
          .event('event1')
          .cond('condition1')
          .target('child2')
          .type('external')
          .addRaise({ event: 'raised' })
          .addLog({ label: 'Transitioning' })
          .addAssign({ location: 'x', expr: 'x + 1' })
          .addSend({ event: 'sent', target: 'parent' })
          .addScript({ content: 'console.log("script");' })
          .build())
        .addTransition(TransitionBuilder.create()
          .event('event2')
          .target('parallel-region')
          .build())
        .addOnEntry(OnEntryBuilder.create()
          .addLog({ label: 'Entering complex state' })
          .addAssign({ location: 'entryCount', expr: 'entryCount + 1' })
          .addRaise({ event: 'entered' })
          .addSend({ event: 'notification', target: 'supervisor' })
          .addScript({ content: 'performEntryActions();' })
          .build())
        .addOnExit(OnExitBuilder.create()
          .addLog({ label: 'Exiting complex state' })
          .build())
        .addInvoke(InvokeBuilder.create()
          .type('http')
          .src('/api/service')
          .id('complex-service')
          .autoforward(true)
          .addParam({ name: 'stateId', expr: "'complex'" })
          .build())
        .addHistory({
          id: 'complex-history',
          type: 'deep',
          transition: {
            target: 'child1'
          }
        })
        .addDataModel(DataModelBuilder.create()
          .addData(DataBuilder.create('localVar').expr('42').build())
          .build())
        .build();

      expect(complexState.id).toBe('complex');
      expect(complexState.initial).toBe('child1');
      expect(complexState.state).toHaveLength(2);
      expect(complexState.parallel).toHaveLength(1);
      expect(complexState.final).toHaveLength(1);
      expect(complexState.transition).toHaveLength(2);
      expect(complexState.onentry).toHaveLength(1);
      expect(complexState.onexit).toHaveLength(1);
      expect(complexState.invoke).toHaveLength(1);
      expect(complexState.history).toHaveLength(1);
      expect(complexState.datamodel).toBeDefined();

      // Verify transition complexity
      const firstTransition = complexState.transition![0];
      expect(firstTransition.raise).toHaveLength(1);
      expect(firstTransition.log).toHaveLength(1);
      expect(firstTransition.assign).toHaveLength(1);
      expect(firstTransition.send).toHaveLength(1);
      expect(firstTransition.script).toHaveLength(1);

      // Verify entry actions
      const entry = complexState.onentry![0];
      expect(entry.log).toHaveLength(1);
      expect(entry.assign).toHaveLength(1);
      expect(entry.raise).toHaveLength(1);
      expect(entry.send).toHaveLength(1);
      expect(entry.script).toHaveLength(1);
    });

    it('should handle empty states correctly', () => {
      const emptyState = StateBuilder.create('empty').build();

      expect(emptyState.id).toBe('empty');
      expect(emptyState.initial).toBeUndefined();
      expect(emptyState.state).toBeUndefined();
      expect(emptyState.transition).toBeUndefined();
      expect(emptyState.onentry).toBeUndefined();
      expect(emptyState.onexit).toBeUndefined();
    });

    it('should handle deeply nested state hierarchies', () => {
      let currentBuilder = StateBuilder.create('root').initial('level1');

      for (let i = 1; i <= 10; i++) {
        const childBuilder = StateBuilder.create(`level${i}`);
        if (i < 10) {
          childBuilder.initial(`level${i + 1}`);
        }
        currentBuilder.addState(childBuilder.build());
        currentBuilder = childBuilder;
      }

      const rootState = StateBuilder.create('root').initial('level1')
        .addState(buildNestedState(1, 10))
        .build();

      expect(rootState.id).toBe('root');
      expect(rootState.initial).toBe('level1');
      expect(rootState.state).toHaveLength(1);

      // Navigate through nested structure
      let current = rootState.state![0];
      for (let i = 1; i <= 9; i++) {
        expect(current.id).toBe(`level${i}`);
        if (i < 9) {
          expect(current.initial).toBe(`level${i + 1}`);
          current = current.state![0];
        }
      }
    });
  });

  // Helper function for building nested states
  function buildNestedState(level: number, maxLevel: number): any {
    const builder = StateBuilder.create(`level${level}`);
    if (level < maxLevel) {
      builder.initial(`level${level + 1}`)
        .addState(buildNestedState(level + 1, maxLevel));
    }
    return builder.build();
  }

  describe('parallel builder edge cases', () => {
    it('should handle complex parallel structures', () => {
      const parallel = ParallelBuilder.create('complex-parallel')
        .addState(StateBuilder.create('branch1')
          .initial('b1s1')
          .addState(StateBuilder.create('b1s1').build())
          .addState(StateBuilder.create('b1s2').build())
          .build())
        .addState(StateBuilder.create('branch2')
          .initial('b2s1')
          .addState(StateBuilder.create('b2s1').build())
          .build())
        .addParallel(ParallelBuilder.create('nested-parallel')
          .addState(StateBuilder.create('np1').build())
          .addState(StateBuilder.create('np2').build())
          .build())
        .addTransition(TransitionBuilder.create()
          .event('parallel-event')
          .target('external-state')
          .build())
        .addOnEntry(OnEntryBuilder.create()
          .addLog({ label: 'Entering parallel region' })
          .build())
        .addOnExit(OnExitBuilder.create()
          .addLog({ label: 'Exiting parallel region' })
          .build())
        .build();

      expect(parallel.id).toBe('complex-parallel');
      expect(parallel.state).toHaveLength(2);
      expect(parallel.parallel).toHaveLength(1);
      expect(parallel.transition).toHaveLength(1);
      expect(parallel.onentry).toHaveLength(1);
      expect(parallel.onexit).toHaveLength(1);
    });

    it('should handle parallel with many branches', () => {
      let builder = ParallelBuilder.create('many-branches');

      for (let i = 1; i <= 20; i++) {
        builder = builder.addState(StateBuilder.create(`branch${i}`)
          .addState(StateBuilder.create(`b${i}s1`).build())
          .build());
      }

      const parallel = builder.build();
      expect(parallel.state).toHaveLength(20);
      expect(parallel.state![19].id).toBe('branch20');
    });
  });

  describe('transition builder edge cases', () => {
    it('should handle all possible transition configurations', () => {
      const transition = TransitionBuilder.create()
        .event('complex-event')
        .cond('complex && condition')
        .target('target-state')
        .type('internal')
        .addRaise({ event: 'event1' })
        .addRaise({ event: 'event2' })
        .addLog({ label: 'Log1' })
        .addLog({ expr: '"Log2"' })
        .addAssign({ location: 'var1', expr: 'value1' })
        .addAssign({ location: 'var2', expr: 'value2' })
        .addSend({ event: 'sent1', target: 'target1' })
        .addSend({ event: 'sent2', target: 'target2', delay: '1s' })
        .addScript({ content: 'script1();' })
        .addScript({ src: '/scripts/script2.js' })
        .build();

      expect(transition.event).toBe('complex-event');
      expect(transition.cond).toBe('complex && condition');
      expect(transition.target).toBe('target-state');
      expect(transition.type).toBe('internal');
      expect(transition.raise).toHaveLength(2);
      expect(transition.log).toHaveLength(2);
      expect(transition.assign).toHaveLength(2);
      expect(transition.send).toHaveLength(2);
      expect(transition.script).toHaveLength(2);

      expect(transition.send![0].event).toBe('sent1');
      expect(transition.send![1].delay).toBe('1s');
      expect(transition.script![0].content).toBe('script1();');
      expect(transition.script![1].src).toBe('/scripts/script2.js');
    });

    it('should handle eventless transitions', () => {
      const transition = TransitionBuilder.create()
        .cond('timeout')
        .target('timeout-state')
        .addLog({ label: 'Timeout occurred' })
        .build();

      expect(transition.event).toBeUndefined();
      expect(transition.cond).toBe('timeout');
      expect(transition.target).toBe('timeout-state');
      expect(transition.log).toHaveLength(1);
    });

    it('should handle targetless transitions', () => {
      const transition = TransitionBuilder.create()
        .event('internal-event')
        .type('internal')
        .addAssign({ location: 'counter', expr: 'counter + 1' })
        .build();

      expect(transition.event).toBe('internal-event');
      expect(transition.target).toBeUndefined();
      expect(transition.type).toBe('internal');
      expect(transition.assign).toHaveLength(1);
    });

    it('should handle empty transitions', () => {
      const transition = TransitionBuilder.create().build();

      expect(transition.event).toBeUndefined();
      expect(transition.cond).toBeUndefined();
      expect(transition.target).toBeUndefined();
      expect(transition.type).toBeUndefined();
    });
  });

  describe('data model builder edge cases', () => {
    it('should handle various data types', () => {
      const dataModel = DataModelBuilder.create()
        .addData(DataBuilder.create('string').expr("'hello world'").build())
        .addData(DataBuilder.create('number').expr('42.5').build())
        .addData(DataBuilder.create('boolean').expr('true').build())
        .addData(DataBuilder.create('null').expr('null').build())
        .addData(DataBuilder.create('undefined').expr('undefined').build())
        .addData(DataBuilder.create('object').expr('{ key: "value", nested: { prop: 123 } }').build())
        .addData(DataBuilder.create('array').expr('[1, 2, "three", { four: 4 }]').build())
        .addData(DataBuilder.create('function').expr('function() { return 42; }').build())
        .addData(DataBuilder.create('content-json').content('{"json": "data"}').build())
        .addData(DataBuilder.create('content-xml').content('<xml>data</xml>').build())
        .addData(DataBuilder.create('content-text').content('plain text data').build())
        .addData(DataBuilder.create('external').src('/api/external-data').build())
        .addData(DataBuilder.create('external-json').src('/api/json-data').build())
        .build();

      expect(dataModel.data).toHaveLength(13);

      const stringData = dataModel.data!.find(d => d.id === 'string')!;
      expect(stringData.expr).toBe("'hello world'");

      const objectData = dataModel.data!.find(d => d.id === 'object')!;
      expect(objectData.expr).toBe('{ key: "value", nested: { prop: 123 } }');

      const contentData = dataModel.data!.find(d => d.id === 'content-json')!;
      expect(contentData.content).toBe('{"json": "data"}');

      const externalData = dataModel.data!.find(d => d.id === 'external')!;
      expect(externalData.src).toBe('/api/external-data');
    });

    it('should handle empty data model', () => {
      const dataModel = DataModelBuilder.create().build();
      expect(dataModel.data).toBeUndefined();
    });

    it('should handle data with all three sources', () => {
      const data = DataBuilder.create('comprehensive')
        .expr('defaultValue')
        .content('fallback content')
        .src('/api/primary-source')
        .build();

      expect(data.id).toBe('comprehensive');
      expect(data.expr).toBe('defaultValue');
      expect(data.content).toBe('fallback content');
      expect(data.src).toBe('/api/primary-source');
    });
  });

  describe('invoke builder edge cases', () => {
    it('should handle complex invoke configurations', () => {
      const invoke = InvokeBuilder.create()
        .type('http')
        .src('/api/complex-service')
        .id('complex-invoke')
        .srcexpr('dynamicUrl')
        .autoforward(true)
        .addParam({ name: 'param1', expr: 'value1' })
        .addParam({ name: 'param2', location: 'dataLocation' })
        .addParam({ name: 'param3', expr: 'complexExpression()' })
        .content({
          expr: 'dynamicContent',
          content: 'static content fallback'
        })
        .build();

      expect(invoke.type).toBe('http');
      expect(invoke.src).toBe('/api/complex-service');
      expect(invoke.id).toBe('complex-invoke');
      expect(invoke.srcexpr).toBe('dynamicUrl');
      expect(invoke.autoforward).toBe(true);
      expect(invoke.param).toHaveLength(3);
      expect(invoke.content).toBeDefined();

      expect(invoke.param![0].name).toBe('param1');
      expect(invoke.param![0].expr).toBe('value1');
      expect(invoke.param![1].location).toBe('dataLocation');
      expect(invoke.content!.expr).toBe('dynamicContent');
      expect(invoke.content!.content).toBe('static content fallback');
    });

    it('should handle minimal invoke configuration', () => {
      const invoke = InvokeBuilder.create().build();

      expect(invoke.type).toBeUndefined();
      expect(invoke.src).toBeUndefined();
      expect(invoke.id).toBeUndefined();
      expect(invoke.autoforward).toBeUndefined();
      expect(invoke.param).toBeUndefined();
      expect(invoke.content).toBeUndefined();
    });

    it('should handle invoke with only params', () => {
      const invoke = InvokeBuilder.create()
        .addParam({ name: 'key1', expr: 'val1' })
        .addParam({ name: 'key2', expr: 'val2' })
        .build();

      expect(invoke.param).toHaveLength(2);
      expect(invoke.type).toBeUndefined();
    });
  });

  describe('action builder edge cases', () => {
    it('should handle complex entry actions', () => {
      const onEntry = OnEntryBuilder.create()
        .addRaise({ event: 'entered' })
        .addLog({ label: 'Entry log' })
        .addLog({ expr: '"Dynamic entry log"' })
        .addAssign({ location: 'entryTime', expr: 'Date.now()' })
        .addAssign({ location: 'entryCount', expr: 'entryCount + 1' })
        .addSend({ event: 'entry-notification', target: 'parent' })
        .addSend({ event: 'delayed-entry', target: 'self', delay: '100ms' })
        .addScript({ content: 'onEntryCustomScript();' })
        .addScript({ src: '/scripts/entry.js' })
        .build();

      expect(onEntry.raise).toHaveLength(1);
      expect(onEntry.log).toHaveLength(2);
      expect(onEntry.assign).toHaveLength(2);
      expect(onEntry.send).toHaveLength(2);
      expect(onEntry.script).toHaveLength(2);

      expect(onEntry.log![0].label).toBe('Entry log');
      expect(onEntry.log![1].expr).toBe('"Dynamic entry log"');
      expect(onEntry.send![1].delay).toBe('100ms');
      expect(onEntry.script![1].src).toBe('/scripts/entry.js');
    });

    it('should handle complex exit actions', () => {
      const onExit = OnExitBuilder.create()
        .addRaise({ event: 'exiting' })
        .addLog({ label: 'Exit log' })
        .addAssign({ location: 'exitTime', expr: 'Date.now()' })
        .addSend({ event: 'exit-notification', target: 'parent' })
        .addScript({ content: 'onExitCleanup();' })
        .build();

      expect(onExit.raise).toHaveLength(1);
      expect(onExit.log).toHaveLength(1);
      expect(onExit.assign).toHaveLength(1);
      expect(onExit.send).toHaveLength(1);
      expect(onExit.script).toHaveLength(1);
    });

    it('should handle empty action builders', () => {
      const emptyEntry = OnEntryBuilder.create().build();
      const emptyExit = OnExitBuilder.create().build();

      expect(Object.keys(emptyEntry)).toHaveLength(0);
      expect(Object.keys(emptyExit)).toHaveLength(0);
    });
  });

  describe('builder immutability and isolation', () => {
    it('should not share references between built objects', () => {
      const sharedTransition = TransitionBuilder.create()
        .event('shared')
        .addLog({ label: 'shared' })
        .build();

      const state1 = StateBuilder.create('state1')
        .addTransition(sharedTransition)
        .build();

      const state2 = StateBuilder.create('state2')
        .addTransition(sharedTransition)
        .build();

      // Modify one transition's log
      state1.transition![0].log![0].label = 'modified';

      // Other should be unchanged
      expect(state2.transition![0].log![0].label).toBe('shared');
    });

    it('should create deep copies in builders', () => {
      const originalData = DataBuilder.create('test').expr('original').build();

      const dataModel1 = DataModelBuilder.create()
        .addData(originalData)
        .build();

      const dataModel2 = DataModelBuilder.create()
        .addData(originalData)
        .build();

      // Modify original
      originalData.expr = 'modified';

      // Built objects should be unaffected
      expect(dataModel1.data![0].expr).toBe('original');
      expect(dataModel2.data![0].expr).toBe('original');
    });

    it('should handle circular references in complex structures', () => {
      // This tests that deep copying works correctly even with complex nested structures
      const complexState = StateBuilder.create('complex')
        .addState(StateBuilder.create('child1')
          .addTransition(TransitionBuilder.create()
            .event('to-parent')
            .target('complex')
            .build())
          .build())
        .addState(StateBuilder.create('child2')
          .addTransition(TransitionBuilder.create()
            .event('to-sibling')
            .target('child1')
            .build())
          .build())
        .build();

      // Should build without stack overflow
      expect(complexState.id).toBe('complex');
      expect(complexState.state).toHaveLength(2);
      expect(complexState.state![0].transition![0].target).toBe('complex');
      expect(complexState.state![1].transition![0].target).toBe('child1');
    });
  });

  describe('builder validation and constraints', () => {
    it('should handle edge cases in builder method calls', () => {
      // Test calling methods multiple times
      const state = StateBuilder.create('test')
        .initial('first')
        .initial('second') // Second call should override
        .build();

      expect(state.initial).toBe('second');
    });

    it('should handle null and undefined inputs gracefully', () => {
      // These should not throw but may create invalid structures
      const state = StateBuilder.create('')
        .addState(null as any)
        .addTransition(undefined as any)
        .build();

      expect(state.id).toBe('');
      // Null/undefined should be filtered out or handled gracefully
    });

    it('should handle very long strings and special characters', () => {
      const longString = 'a'.repeat(10000);
      const specialChars = '!@#$%^&*()_+-=[]{}|;":,./<>?`~\n\t\r';

      const state = StateBuilder.create(longString)
        .initial(specialChars)
        .addTransition(TransitionBuilder.create()
          .event(specialChars)
          .cond(longString)
          .target(specialChars)
          .build())
        .build();

      expect(state.id).toBe(longString);
      expect(state.initial).toBe(specialChars);
      expect(state.transition![0].event).toBe(specialChars);
    });
  });
});