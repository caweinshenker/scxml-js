import { SCXMLModifier } from '../modifier';
import { SCXMLBuilder, StateBuilder, TransitionBuilder, DataBuilder, OnEntryBuilder } from '../builder';

describe('SCXML Modifier', () => {
  let basicDocument: any;
  let modifier: SCXMLModifier;

  beforeEach(() => {
    basicDocument = SCXMLBuilder.create()
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

    modifier = SCXMLModifier.from(basicDocument);
  });

  describe('basic properties modification', () => {
    it('should modify name', () => {
      const result = modifier.setName('modified-machine').getDocument();
      expect(result.scxml.name).toBe('modified-machine');
    });

    it('should modify initial state', () => {
      const result = modifier.setInitial('active').getDocument();
      expect(result.scxml.initial).toBe('active');
    });

    it('should modify datamodel', () => {
      const result = modifier.setDatamodel('xpath').getDocument();
      expect(result.scxml.datamodel).toBe('xpath');
    });
  });

  describe('state management', () => {
    it('should add new state', () => {
      const newState = StateBuilder.create('new-state').build();
      const result = modifier.addState(newState).getDocument();

      expect(result.scxml.state).toHaveLength(3);
      expect(result.scxml.state![2].id).toBe('new-state');
    });

    it('should remove state', () => {
      const result = modifier.removeState('active').getDocument();

      expect(result.scxml.state).toHaveLength(1);
      expect(result.scxml.state![0].id).toBe('idle');
    });

    it('should find existing state', () => {
      const state = modifier.findState('idle');
      expect(state).toBeDefined();
      expect(state!.id).toBe('idle');
    });

    it('should return undefined for non-existent state', () => {
      const state = modifier.findState('nonexistent');
      expect(state).toBeUndefined();
    });

    it('should update existing state', () => {
      modifier.updateState('idle', state => {
        state.initial = 'child';
        return state;
      });

      const result = modifier.getDocument();
      const idleState = result.scxml.state!.find(s => s.id === 'idle');
      expect(idleState!.initial).toBe('child');
    });
  });

  describe('nested state operations', () => {
    beforeEach(() => {
      const nestedDoc = SCXMLBuilder.create()
        .addState(StateBuilder.create('parent')
          .initial('child1')
          .addState(StateBuilder.create('child1').build())
          .addState(StateBuilder.create('child2').build())
          .build())
        .build();

      modifier = SCXMLModifier.from(nestedDoc);
    });

    it('should find nested state', () => {
      const child = modifier.findState('child1');
      expect(child).toBeDefined();
      expect(child!.id).toBe('child1');
    });

    it('should update nested state', () => {
      modifier.updateState('child1', state => {
        state.initial = 'grandchild';
        return state;
      });

      const result = modifier.getDocument();
      const child = modifier.findState('child1');
      expect(child!.initial).toBe('grandchild');
    });

    it('should remove nested state', () => {
      modifier.removeState('child2');
      const result = modifier.getDocument();

      const parent = result.scxml.state!.find(s => s.id === 'parent');
      expect(parent!.state).toHaveLength(1);
      expect(parent!.state![0].id).toBe('child1');
    });
  });

  describe('transition management', () => {
    it('should add transition to state', () => {
      const newTransition = TransitionBuilder.create()
        .event('pause')
        .target('paused')
        .build();

      modifier.addTransitionToState('active', newTransition);
      const result = modifier.getDocument();

      const activeState = result.scxml.state!.find(s => s.id === 'active');
      expect(activeState!.transition).toHaveLength(2);
      expect(activeState!.transition![1].event).toBe('pause');
    });

    it('should remove transition from state', () => {
      modifier.removeTransitionFromState('idle', t => t.event === 'start');
      const result = modifier.getDocument();

      const idleState = result.scxml.state!.find(s => s.id === 'idle');
      expect(idleState!.transition).toHaveLength(0);
    });

    it('should update transition in state', () => {
      modifier.updateTransitionInState('idle',
        t => t.event === 'start',
        t => { t.target = 'running'; return t; }
      );

      const result = modifier.getDocument();
      const idleState = result.scxml.state!.find(s => s.id === 'idle');
      expect(idleState!.transition![0].target).toBe('running');
    });
  });

  describe('action management', () => {
    it('should add onentry action to state', () => {
      const onEntry = OnEntryBuilder.create()
        .addLog({ label: 'entering state' })
        .build();

      modifier.addOnEntryToState('idle', onEntry);
      const result = modifier.getDocument();

      const idleState = result.scxml.state!.find(s => s.id === 'idle');
      expect(idleState!.onentry).toHaveLength(1);
      expect(idleState!.onentry![0].log![0].label).toBe('entering state');
    });

    it('should add onexit action to state', () => {
      const onExit = OnEntryBuilder.create()
        .addLog({ label: 'exiting state' })
        .build();

      modifier.addOnExitToState('active', onExit);
      const result = modifier.getDocument();

      const activeState = result.scxml.state!.find(s => s.id === 'active');
      expect(activeState!.onexit).toHaveLength(1);
      expect(activeState!.onexit![0].log![0].label).toBe('exiting state');
    });

    it('should add invoke to state', () => {
      const invoke = {
        type: 'http',
        src: '/api/service',
        id: 'service1'
      };

      modifier.addInvokeToState('active', invoke);
      const result = modifier.getDocument();

      const activeState = result.scxml.state!.find(s => s.id === 'active');
      expect(activeState!.invoke).toHaveLength(1);
      expect(activeState!.invoke![0].type).toBe('http');
    });
  });

  describe('data model management', () => {
    it('should add data to model', () => {
      const data = DataBuilder.create('counter').expr('0').build();

      modifier.addDataToModel(data);
      const result = modifier.getDocument();

      expect(result.scxml.datamodel_element).toBeDefined();
      expect(result.scxml.datamodel_element!.data).toHaveLength(1);
      expect(result.scxml.datamodel_element!.data![0].id).toBe('counter');
    });

    it('should update data in model', () => {
      const data = DataBuilder.create('counter').expr('0').build();
      modifier.addDataToModel(data);

      modifier.updateDataInModel('counter', d => {
        d.expr = '10';
        return d;
      });

      const result = modifier.getDocument();
      expect(result.scxml.datamodel_element!.data![0].expr).toBe('10');
    });

    it('should remove data from model', () => {
      const data1 = DataBuilder.create('counter').expr('0').build();
      const data2 = DataBuilder.create('flag').expr('false').build();

      modifier.addDataToModel(data1).addDataToModel(data2);
      modifier.removeDataFromModel('counter');

      const result = modifier.getDocument();
      expect(result.scxml.datamodel_element!.data).toHaveLength(1);
      expect(result.scxml.datamodel_element!.data![0].id).toBe('flag');
    });
  });

  describe('state renaming', () => {
    it('should rename state and update references', () => {
      modifier.renameState('idle', 'waiting');
      const result = modifier.getDocument();

      // State should be renamed
      const waitingState = result.scxml.state!.find(s => s.id === 'waiting');
      expect(waitingState).toBeDefined();

      // Initial reference should be updated
      expect(result.scxml.initial).toBe('waiting');

      // Transition target should be updated
      const activeState = result.scxml.state!.find(s => s.id === 'active');
      expect(activeState!.transition![0].target).toBe('waiting');
    });

    it('should handle renaming nested states', () => {
      const nestedDoc = SCXMLBuilder.create()
        .initial('parent')
        .addState(StateBuilder.create('parent')
          .initial('child')
          .addState(StateBuilder.create('child')
            .addTransition(TransitionBuilder.create()
              .event('next')
              .target('sibling')
              .build())
            .build())
          .addState(StateBuilder.create('sibling').build())
          .build())
        .build();

      const nestedModifier = SCXMLModifier.from(nestedDoc);
      nestedModifier.renameState('sibling', 'brother');

      const result = nestedModifier.getDocument();
      const parent = result.scxml.state!.find(s => s.id === 'parent');
      const child = parent!.state!.find(s => s.id === 'child');
      const brother = parent!.state!.find(s => s.id === 'brother');

      expect(brother).toBeDefined();
      expect(child!.transition![0].target).toBe('brother');
    });
  });

  describe('utility methods', () => {
    it('should get all state IDs', () => {
      const ids = modifier.getAllStateIds();
      expect(ids).toContain('idle');
      expect(ids).toContain('active');
      expect(ids).toHaveLength(2);
    });

    it('should get all state IDs including nested ones', () => {
      const nestedDoc = SCXMLBuilder.create()
        .addState(StateBuilder.create('parent')
          .addState(StateBuilder.create('child1').build())
          .addState(StateBuilder.create('child2').build())
          .build())
        .addState(StateBuilder.create('sibling').build())
        .build();

      const nestedModifier = SCXMLModifier.from(nestedDoc);
      const ids = nestedModifier.getAllStateIds();

      expect(ids).toContain('parent');
      expect(ids).toContain('child1');
      expect(ids).toContain('child2');
      expect(ids).toContain('sibling');
      expect(ids).toHaveLength(4);
    });

    it('should clone modifier', () => {
      const clone = modifier.clone();

      clone.setName('cloned-machine');

      expect(modifier.getDocument().scxml.name).toBe('test-machine');
      expect(clone.getDocument().scxml.name).toBe('cloned-machine');
    });
  });

  describe('immutability', () => {
    it('should not modify original document', () => {
      modifier.setName('modified-name');

      expect(basicDocument.scxml.name).toBe('test-machine');
    });

    it('should return new document instance on getDocument', () => {
      const doc1 = modifier.getDocument();
      const doc2 = modifier.getDocument();

      expect(doc1).not.toBe(doc2);
      doc1.scxml.name = 'changed';
      expect(doc2.scxml.name).toBe('test-machine');
    });
  });

  describe('complex modifications', () => {
    it('should perform multiple modifications', () => {
      const newState = StateBuilder.create('error')
        .addTransition(TransitionBuilder.create()
          .event('reset')
          .target('idle')
          .build())
        .build();

      const result = modifier
        .setName('complex-machine')
        .addState(newState)
        .addTransitionToState('active', TransitionBuilder.create()
          .event('error')
          .target('error')
          .build())
        .addDataToModel(DataBuilder.create('errorCount').expr('0').build())
        .getDocument();

      expect(result.scxml.name).toBe('complex-machine');
      expect(result.scxml.state).toHaveLength(3);
      expect(result.scxml.datamodel_element!.data).toHaveLength(1);

      const activeState = result.scxml.state!.find(s => s.id === 'active');
      expect(activeState!.transition).toHaveLength(2);
    });
  });
});