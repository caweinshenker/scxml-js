import {
  SCXMLBuilder,
  StateBuilder,
  ParallelBuilder,
  TransitionBuilder,
  DataModelBuilder,
  DataBuilder,
  OnEntryBuilder,
  OnExitBuilder
} from '../builder';

describe('SCXML Builder', () => {
  describe('SCXMLBuilder', () => {
    it('should create a basic SCXML document', () => {
      const doc = SCXMLBuilder.create()
        .name('test-machine')
        .initial('idle')
        .datamodel('ecmascript')
        .build();

      expect(doc.scxml.name).toBe('test-machine');
      expect(doc.scxml.initial).toBe('idle');
      expect(doc.scxml.datamodel).toBe('ecmascript');
      expect(doc.scxml.version).toBe('1.0');
      expect(doc.scxml.xmlns).toBe('http://www.w3.org/2005/07/scxml');
    });

    it('should add states to the document', () => {
      const state = StateBuilder.create('idle').build();
      const doc = SCXMLBuilder.create()
        .addState(state)
        .build();

      expect(doc.scxml.state).toHaveLength(1);
      expect(doc.scxml.state![0].id).toBe('idle');
    });
  });

  describe('StateBuilder', () => {
    it('should create a basic state', () => {
      const state = StateBuilder.create('test-state')
        .initial('child')
        .build();

      expect(state.id).toBe('test-state');
      expect(state.initial).toBe('child');
    });

    it('should add child states', () => {
      const childState = StateBuilder.create('child').build();
      const parentState = StateBuilder.create('parent')
        .addState(childState)
        .build();

      expect(parentState.state).toHaveLength(1);
      expect(parentState.state![0].id).toBe('child');
    });

    it('should add transitions', () => {
      const transition = TransitionBuilder.create()
        .event('click')
        .target('next')
        .build();

      const state = StateBuilder.create('current')
        .addTransition(transition)
        .build();

      expect(state.transition).toHaveLength(1);
      expect(state.transition![0].event).toBe('click');
      expect(state.transition![0].target).toBe('next');
    });

    it('should add onentry and onexit actions', () => {
      const onEntry = OnEntryBuilder.create()
        .addLog({ label: 'entering' })
        .build();

      const onExit = OnExitBuilder.create()
        .addLog({ label: 'exiting' })
        .build();

      const state = StateBuilder.create('test')
        .addOnEntry(onEntry)
        .addOnExit(onExit)
        .build();

      expect(state.onentry).toHaveLength(1);
      expect(state.onexit).toHaveLength(1);
      expect(state.onentry![0].log![0].label).toBe('entering');
      expect(state.onexit![0].log![0].label).toBe('exiting');
    });
  });

  describe('ParallelBuilder', () => {
    it('should create parallel regions', () => {
      const branch1 = StateBuilder.create('branch1').build();
      const branch2 = StateBuilder.create('branch2').build();

      const parallel = ParallelBuilder.create('parallel-region')
        .addState(branch1)
        .addState(branch2)
        .build();

      expect(parallel.id).toBe('parallel-region');
      expect(parallel.state).toHaveLength(2);
      expect(parallel.state![0].id).toBe('branch1');
      expect(parallel.state![1].id).toBe('branch2');
    });
  });

  describe('TransitionBuilder', () => {
    it('should create transitions with actions', () => {
      const transition = TransitionBuilder.create()
        .event('button.click')
        .cond('enabled')
        .target('active')
        .type('external')
        .addLog({ expr: '"Transitioning to active"' })
        .addAssign({ location: 'count', expr: 'count + 1' })
        .build();

      expect(transition.event).toBe('button.click');
      expect(transition.cond).toBe('enabled');
      expect(transition.target).toBe('active');
      expect(transition.type).toBe('external');
      expect(transition.log).toHaveLength(1);
      expect(transition.assign).toHaveLength(1);
      expect(transition.log![0].expr).toBe('"Transitioning to active"');
      expect(transition.assign![0].location).toBe('count');
      expect(transition.assign![0].expr).toBe('count + 1');
    });
  });

  describe('DataModelBuilder', () => {
    it('should create data models with data elements', () => {
      const data1 = DataBuilder.create('counter')
        .expr('0')
        .build();

      const data2 = DataBuilder.create('config')
        .content('{"timeout": 5000}')
        .build();

      const dataModel = DataModelBuilder.create()
        .addData(data1)
        .addData(data2)
        .build();

      expect(dataModel.data).toHaveLength(2);
      expect(dataModel.data![0].id).toBe('counter');
      expect(dataModel.data![0].expr).toBe('0');
      expect(dataModel.data![1].id).toBe('config');
      expect(dataModel.data![1].content).toBe('{"timeout": 5000}');
    });
  });

  describe('Integration test', () => {
    it('should build a complete state machine', () => {
      const dataModel = DataModelBuilder.create()
        .addData(DataBuilder.create('count').expr('0').build())
        .build();

      const idleState = StateBuilder.create('idle')
        .addTransition(
          TransitionBuilder.create()
            .event('start')
            .target('active')
            .addAssign({ location: 'count', expr: 'count + 1' })
            .build()
        )
        .build();

      const activeState = StateBuilder.create('active')
        .addOnEntry(
          OnEntryBuilder.create()
            .addLog({ label: 'Entered active state' })
            .build()
        )
        .addTransition(
          TransitionBuilder.create()
            .event('stop')
            .target('idle')
            .build()
        )
        .build();

      const doc = SCXMLBuilder.create()
        .name('counter-machine')
        .initial('idle')
        .datamodel('ecmascript')
        .addDataModel(dataModel)
        .addState(idleState)
        .addState(activeState)
        .build();

      expect(doc.scxml.name).toBe('counter-machine');
      expect(doc.scxml.initial).toBe('idle');
      expect(doc.scxml.state).toHaveLength(2);
      expect(doc.scxml.datamodel_element?.data).toHaveLength(1);
      
      const idle = doc.scxml.state![0];
      const active = doc.scxml.state![1];
      
      expect(idle.id).toBe('idle');
      expect(idle.transition![0].event).toBe('start');
      expect(idle.transition![0].target).toBe('active');
      
      expect(active.id).toBe('active');
      expect(active.onentry![0].log![0].label).toBe('Entered active state');
      expect(active.transition![0].event).toBe('stop');
      expect(active.transition![0].target).toBe('idle');
    });
  });
});