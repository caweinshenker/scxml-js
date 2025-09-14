import { XStateConverter } from '../xstate-converter';
import { SCXMLBuilder, StateBuilder, TransitionBuilder, DataModelBuilder, DataBuilder, OnEntryBuilder, OnExitBuilder } from '../builder';

describe('XState Converter', () => {
  let converter: XStateConverter;

  beforeEach(() => {
    converter = new XStateConverter();
  });

  describe('basic conversion', () => {
    it('should convert simple state machine', () => {
      const doc = SCXMLBuilder.create()
        .name('simple-machine')
        .initial('idle')
        .addState(StateBuilder.create('idle').build())
        .addState(StateBuilder.create('active').build())
        .build();

      const xstateConfig = converter.convertToXState(doc);

      expect(xstateConfig.id).toBe('simple-machine');
      expect(xstateConfig.initial).toBe('idle');
      expect(xstateConfig.states).toHaveProperty('idle');
      expect(xstateConfig.states).toHaveProperty('active');
    });

    it('should convert state machine with transitions', () => {
      const doc = SCXMLBuilder.create()
        .initial('idle')
        .addState(StateBuilder.create('idle')
          .addTransition(TransitionBuilder.create()
            .event('START')
            .target('active')
            .build())
          .build())
        .addState(StateBuilder.create('active')
          .addTransition(TransitionBuilder.create()
            .event('STOP')
            .target('idle')
            .build())
          .build())
        .build();

      const xstateConfig = converter.convertToXState(doc);

      expect(xstateConfig.states!.idle.on).toHaveProperty('START');
      expect(xstateConfig.states!.active.on).toHaveProperty('STOP');

      const startTransition = (xstateConfig.states!.idle.on as any).START[0];
      expect(startTransition.target).toBe('active');

      const stopTransition = (xstateConfig.states!.active.on as any).STOP[0];
      expect(stopTransition.target).toBe('idle');
    });

    it('should convert conditional transitions', () => {
      const doc = SCXMLBuilder.create()
        .initial('idle')
        .addState(StateBuilder.create('idle')
          .addTransition(TransitionBuilder.create()
            .event('START')
            .cond('enabled')
            .target('active')
            .build())
          .build())
        .addState(StateBuilder.create('active').build())
        .build();

      const xstateConfig = converter.convertToXState(doc);
      const startTransition = (xstateConfig.states!.idle.on as any).START[0];

      expect(startTransition.cond).toBe('enabled');
      expect(startTransition.target).toBe('active');
    });

    it('should convert internal transitions', () => {
      const doc = SCXMLBuilder.create()
        .initial('active')
        .addState(StateBuilder.create('active')
          .addTransition(TransitionBuilder.create()
            .event('INTERNAL')
            .type('internal')
            .build())
          .build())
        .build();

      const xstateConfig = converter.convertToXState(doc);
      const internalTransition = (xstateConfig.states!.active.on as any).INTERNAL[0];

      expect(internalTransition.internal).toBe(true);
    });
  });

  describe('nested states conversion', () => {
    it('should convert hierarchical states', () => {
      const doc = SCXMLBuilder.create()
        .initial('parent')
        .addState(StateBuilder.create('parent')
          .initial('child1')
          .addState(StateBuilder.create('child1').build())
          .addState(StateBuilder.create('child2').build())
          .build())
        .build();

      const xstateConfig = converter.convertToXState(doc);

      expect(xstateConfig.states!.parent.initial).toBe('child1');
      expect(xstateConfig.states!.parent.states).toHaveProperty('child1');
      expect(xstateConfig.states!.parent.states).toHaveProperty('child2');
    });
  });

  describe('parallel states conversion', () => {
    it('should convert parallel regions', () => {
      const doc = SCXMLBuilder.create()
        .initial('concurrent')
        .addParallel({
          id: 'concurrent',
          state: [
            { id: 'branch1' },
            { id: 'branch2' }
          ]
        })
        .build();

      const xstateConfig = converter.convertToXState(doc);

      expect(xstateConfig.states!.concurrent.type).toBe('parallel');
      expect(xstateConfig.states!.concurrent.states).toHaveProperty('branch1');
      expect(xstateConfig.states!.concurrent.states).toHaveProperty('branch2');
    });
  });

  describe('final states conversion', () => {
    it('should convert final states', () => {
      const doc = SCXMLBuilder.create()
        .initial('active')
        .addState(StateBuilder.create('active').build())
        .addFinal({ id: 'done' })
        .build();

      const xstateConfig = converter.convertToXState(doc);

      expect(xstateConfig.states!.done.type).toBe('final');
    });

    it('should convert final states with data', () => {
      const doc = SCXMLBuilder.create()
        .initial('active')
        .addState(StateBuilder.create('active').build())
        .addFinal({
          id: 'done',
          donedata: {
            content: {
              content: '{"result": "success"}'
            }
          }
        })
        .build();

      const xstateConfig = converter.convertToXState(doc);

      expect(xstateConfig.states!.done.type).toBe('final');
      expect(xstateConfig.states!.done.data).toBe('{"result": "success"}');
    });
  });

  describe('context conversion', () => {
    it('should convert datamodel to initial context', () => {
      const dataModel = DataModelBuilder.create()
        .addData(DataBuilder.create('counter').expr('0').build())
        .addData(DataBuilder.create('flag').expr('true').build())
        .addData(DataBuilder.create('config').content('{"timeout": 5000}').build())
        .build();

      const doc = SCXMLBuilder.create()
        .initial('idle')
        .addDataModel(dataModel)
        .addState(StateBuilder.create('idle').build())
        .build();

      const xstateConfig = converter.convertToXState(doc);

      expect(xstateConfig.context).toEqual({
        counter: 0,
        flag: true,
        config: { timeout: 5000 }
      });
    });
  });

  describe('actions conversion', () => {
    it('should convert entry and exit actions', () => {
      const onEntry = OnEntryBuilder.create()
        .addLog({ label: 'entering' })
        .addAssign({ location: 'count', expr: 'count + 1' })
        .build();

      const onExit = OnExitBuilder.create()
        .addLog({ label: 'exiting' })
        .build();

      const doc = SCXMLBuilder.create()
        .initial('test')
        .addState(StateBuilder.create('test')
          .addOnEntry(onEntry)
          .addOnExit(onExit)
          .build())
        .build();

      const xstateConfig = converter.convertToXState(doc);

      expect(xstateConfig.states!.test.entry).toHaveLength(2);
      expect(xstateConfig.states!.test.exit).toHaveLength(1);

      expect(xstateConfig.states!.test.entry[0]).toEqual({
        type: 'log',
        label: 'entering',
        expr: undefined
      });

      expect(xstateConfig.states!.test.entry[1]).toEqual({
        type: 'xstate.assign',
        assignment: {
          count: 'count + 1'
        }
      });
    });

    it('should convert transition actions', () => {
      const transition = TransitionBuilder.create()
        .event('CLICK')
        .target('next')
        .addRaise({ event: 'internal.clicked' })
        .addLog({ expr: '"Button clicked"' })
        .addAssign({ location: 'clicks', expr: 'clicks + 1' })
        .addSend({ event: 'notify', target: 'parent' })
        .build();

      const doc = SCXMLBuilder.create()
        .initial('current')
        .addState(StateBuilder.create('current')
          .addTransition(transition)
          .build())
        .addState(StateBuilder.create('next').build())
        .build();

      const xstateConfig = converter.convertToXState(doc);
      const clickTransition = (xstateConfig.states!.current.on as any).CLICK[0];

      expect(clickTransition.actions).toHaveLength(4);

      expect(clickTransition.actions[0]).toEqual({
        type: 'xstate.raise',
        event: 'internal.clicked'
      });

      expect(clickTransition.actions[1]).toEqual({
        type: 'log',
        label: undefined,
        expr: '"Button clicked"'
      });

      expect(clickTransition.actions[2]).toEqual({
        type: 'xstate.assign',
        assignment: {
          clicks: 'clicks + 1'
        }
      });

      expect(clickTransition.actions[3]).toEqual({
        type: 'xstate.send',
        event: 'notify',
        to: 'parent',
        delay: undefined
      });
    });
  });

  describe('invoke conversion', () => {
    it('should convert invoke elements', () => {
      const doc = SCXMLBuilder.create()
        .initial('calling')
        .addState(StateBuilder.create('calling')
          .addInvoke({
            id: 'service1',
            src: '/api/service',
            autoforward: true,
            param: [
              { name: 'userId', expr: 'user.id' },
              { name: 'action', location: 'currentAction' }
            ]
          })
          .build())
        .build();

      const xstateConfig = converter.convertToXState(doc);
      const invoke = xstateConfig.states!.calling.invoke![0];

      expect(invoke.id).toBe('service1');
      expect(invoke.src).toBe('/api/service');
      expect(invoke.autoForward).toBe(true);
      expect(invoke.data).toEqual({
        userId: 'user.id',
        action: { _location: 'currentAction' }
      });
    });
  });

  describe('machine creation', () => {
    it('should create XState machine from SCXML document', () => {
      const doc = SCXMLBuilder.create()
        .name('test-machine')
        .initial('idle')
        .addState(StateBuilder.create('idle')
          .addTransition(TransitionBuilder.create()
            .event('START')
            .target('active')
            .build())
          .build())
        .addState(StateBuilder.create('active').build())
        .build();

      const machine = converter.createMachine(doc);

      expect(machine.id).toBe('test-machine');
      expect(machine.initialState.value).toBe('idle');
    });

    it('should create machine with custom actions and guards', () => {
      const customConverter = new XStateConverter({
        customActions: {
          customLog: (context: any, event: any) => {
            console.log('Custom log:', event);
          }
        },
        customGuards: {
          isEnabled: (context: any, event: any) => context.enabled
        }
      });

      const doc = SCXMLBuilder.create()
        .initial('test')
        .addState(StateBuilder.create('test').build())
        .build();

      const machine = customConverter.createMachine(doc);
      expect(machine).toBeDefined();
    });
  });

  describe('complex conversion scenarios', () => {
    it('should convert complete traffic light example', () => {
      const dataModel = DataModelBuilder.create()
        .addData(DataBuilder.create('timer').expr('0').build())
        .addData(DataBuilder.create('pedestrianWaiting').expr('false').build())
        .build();

      const doc = SCXMLBuilder.create()
        .name('traffic-light')
        .initial('red')
        .addDataModel(dataModel)
        .addState(StateBuilder.create('red')
          .addOnEntry(OnEntryBuilder.create()
            .addAssign({ location: 'timer', expr: '5000' })
            .addLog({ label: 'Red light on' })
            .build())
          .addTransition(TransitionBuilder.create()
            .event('timer.expired')
            .target('green')
            .build())
          .build())
        .addState(StateBuilder.create('green')
          .addOnEntry(OnEntryBuilder.create()
            .addAssign({ location: 'timer', expr: '3000' })
            .build())
          .addTransition(TransitionBuilder.create()
            .event('timer.expired')
            .target('yellow')
            .build())
          .build())
        .addState(StateBuilder.create('yellow')
          .addOnEntry(OnEntryBuilder.create()
            .addAssign({ location: 'timer', expr: '1000' })
            .build())
          .addTransition(TransitionBuilder.create()
            .event('timer.expired')
            .target('red')
            .build())
          .build())
        .build();

      const xstateConfig = converter.convertToXState(doc);

      expect(xstateConfig.id).toBe('traffic-light');
      expect(xstateConfig.initial).toBe('red');
      expect(xstateConfig.context).toEqual({
        timer: 0,
        pedestrianWaiting: false
      });

      expect(xstateConfig.states!.red.entry).toHaveLength(2);
      expect(xstateConfig.states!.red.on).toHaveProperty('timer.expired');

      const machine = converter.createMachine(doc);
      expect(machine.initialState.value).toBe('red');
      expect(machine.initialState.context).toEqual({
        timer: 0,
        pedestrianWaiting: false
      });
    });
  });

  describe('error handling', () => {
    it('should handle conversion of incomplete documents', () => {
      const doc = SCXMLBuilder.create().build();

      const xstateConfig = converter.convertToXState(doc);

      expect(xstateConfig.id).toBe('scxml-machine');
      expect(xstateConfig.states).toEqual({});
    });
  });
});