import { SCXMLSerializer } from '../serializer';
import { SCXMLParser } from '../parser';
import { SCXMLBuilder, StateBuilder, TransitionBuilder, DataModelBuilder, DataBuilder, OnEntryBuilder } from '../builder';

describe('SCXML Serializer', () => {
  let serializer: SCXMLSerializer;
  let parser: SCXMLParser;

  beforeEach(() => {
    serializer = new SCXMLSerializer();
    parser = new SCXMLParser();
  });

  describe('basic serialization', () => {
    it('should serialize minimal SCXML document', () => {
      const doc = SCXMLBuilder.create()
        .name('test-machine')
        .initial('idle')
        .addState(StateBuilder.create('idle').build())
        .build();

      const xml = serializer.serialize(doc);

      expect(xml).toContain('<scxml');
      expect(xml).toContain('name="test-machine"');
      expect(xml).toContain('initial="idle"');
      expect(xml).toContain('<state id="idle"');
    });

    it('should serialize states with transitions', () => {
      const doc = SCXMLBuilder.create()
        .initial('idle')
        .addState(StateBuilder.create('idle')
          .addTransition(TransitionBuilder.create()
            .event('START')
            .target('active')
            .build())
          .build())
        .addState(StateBuilder.create('active').build())
        .build();

      const xml = serializer.serialize(doc);

      expect(xml).toContain('<transition event="START" target="active"');
    });

    it('should serialize nested states', () => {
      const doc = SCXMLBuilder.create()
        .initial('parent')
        .addState(StateBuilder.create('parent')
          .initial('child1')
          .addState(StateBuilder.create('child1').build())
          .addState(StateBuilder.create('child2').build())
          .build())
        .build();

      const xml = serializer.serialize(doc);

      expect(xml).toContain('<state id="parent" initial="child1"');
      expect(xml).toContain('<state id="child1"');
      expect(xml).toContain('<state id="child2"');
    });
  });

  describe('datamodel serialization', () => {
    it('should serialize datamodel with data elements', () => {
      const dataModel = DataModelBuilder.create()
        .addData(DataBuilder.create('counter').expr('0').build())
        .addData(DataBuilder.create('config').content('{"timeout": 5000}').build())
        .build();

      const doc = SCXMLBuilder.create()
        .initial('idle')
        .addDataModel(dataModel)
        .addState(StateBuilder.create('idle').build())
        .build();

      const xml = serializer.serialize(doc);

      expect(xml).toContain('<datamodel>');
      expect(xml).toContain('<data id="counter" expr="0"');
      expect(xml).toContain('<data id="config">');
      expect(xml).toContain('{&quot;timeout&quot;: 5000}');
    });
  });

  describe('actions serialization', () => {
    it('should serialize entry and exit actions', () => {
      const onEntry = OnEntryBuilder.create()
        .addLog({ label: 'entering' })
        .addAssign({ location: 'count', expr: 'count + 1' })
        .build();

      const doc = SCXMLBuilder.create()
        .initial('test')
        .addState(StateBuilder.create('test')
          .addOnEntry(onEntry)
          .build())
        .build();

      const xml = serializer.serialize(doc);

      expect(xml).toContain('<onentry>');
      expect(xml).toContain('<log label="entering"');
      expect(xml).toContain('<assign location="count" expr="count + 1"');
    });

    it('should serialize transition actions', () => {
      const transition = TransitionBuilder.create()
        .event('CLICK')
        .target('next')
        .addRaise({ event: 'internal.clicked' })
        .addLog({ expr: '"Button clicked"' })
        .addAssign({ location: 'clicks', expr: 'clicks + 1' })
        .build();

      const doc = SCXMLBuilder.create()
        .initial('current')
        .addState(StateBuilder.create('current')
          .addTransition(transition)
          .build())
        .addState(StateBuilder.create('next').build())
        .build();

      const xml = serializer.serialize(doc);

      expect(xml).toContain('<raise event="internal.clicked"');
      expect(xml).toContain('<log expr="&quot;Button clicked&quot;"');
      expect(xml).toContain('<assign location="clicks" expr="clicks + 1"');
    });
  });

  describe('parallel states serialization', () => {
    it('should serialize parallel regions', () => {
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

      const xml = serializer.serialize(doc);

      expect(xml).toContain('<parallel id="concurrent"');
      expect(xml).toContain('<state id="branch1"');
      expect(xml).toContain('<state id="branch2"');
    });
  });

  describe('final states serialization', () => {
    it('should serialize final states', () => {
      const doc = SCXMLBuilder.create()
        .initial('active')
        .addState(StateBuilder.create('active').build())
        .addFinal({ id: 'done' })
        .build();

      const xml = serializer.serialize(doc);

      expect(xml).toContain('<final id="done"');
    });

    it('should serialize final states with donedata', () => {
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

      const xml = serializer.serialize(doc);

      expect(xml).toContain('<final id="done"');
      expect(xml).toContain('<donedata>');
      expect(xml).toContain('<content>');
      expect(xml).toContain('{&quot;result&quot;: &quot;success&quot;}');
    });
  });

  describe('invoke serialization', () => {
    it('should serialize invoke elements', () => {
      const doc = SCXMLBuilder.create()
        .initial('calling')
        .addState(StateBuilder.create('calling')
          .addInvoke({
            id: 'service1',
            type: 'http',
            src: '/api/service',
            autoforward: true,
            param: [
              { name: 'userId', expr: 'user.id' },
              { name: 'action', location: 'currentAction' }
            ]
          })
          .build())
        .build();

      const xml = serializer.serialize(doc);

      expect(xml).toContain('<invoke');
      expect(xml).toContain('id="service1"');
      expect(xml).toContain('type="http"');
      expect(xml).toContain('src="/api/service"');
      expect(xml).toContain('autoforward="true"');
      expect(xml).toContain('<param name="userId" expr="user.id"');
      expect(xml).toContain('<param name="action" location="currentAction"');
    });
  });

  describe('history serialization', () => {
    it('should serialize history states', () => {
      const doc = SCXMLBuilder.create()
        .initial('compound')
        .addState(StateBuilder.create('compound')
          .addHistory({
            id: 'hist',
            type: 'deep',
            transition: {
              target: 'default'
            }
          })
          .addState(StateBuilder.create('default').build())
          .build())
        .build();

      const xml = serializer.serialize(doc);

      expect(xml).toContain('<history id="hist" type="deep"');
      expect(xml).toContain('<transition target="default"');
    });
  });

  describe('round-trip serialization', () => {
    it('should preserve structure through parse -> serialize cycle', () => {
      const originalDoc = SCXMLBuilder.create()
        .name('traffic-light')
        .initial('red')
        .datamodel('ecmascript')
        .addDataModel(DataModelBuilder.create()
          .addData(DataBuilder.create('timer').expr('0').build())
          .build())
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
          .addTransition(TransitionBuilder.create()
            .event('timer.expired')
            .target('yellow')
            .build())
          .build())
        .addState(StateBuilder.create('yellow')
          .addTransition(TransitionBuilder.create()
            .event('timer.expired')
            .target('red')
            .build())
          .build())
        .build();

      // Serialize to XML
      const xml = serializer.serialize(originalDoc);

      // Parse back to document
      const parsedDoc = parser.parse(xml);

      // Verify structure is preserved
      expect(parsedDoc.scxml.name).toBe(originalDoc.scxml.name);
      expect(parsedDoc.scxml.initial).toBe(originalDoc.scxml.initial);
      expect(parsedDoc.scxml.datamodel).toBe(originalDoc.scxml.datamodel);
      expect(parsedDoc.scxml.state).toHaveLength(3);
      expect(parsedDoc.scxml.datamodel_element?.data).toHaveLength(1);

      const redState = parsedDoc.scxml.state!.find(s => s.id === 'red')!;
      expect(redState.onentry).toHaveLength(1);
      expect(redState.onentry![0].assign).toHaveLength(1);
      expect(redState.onentry![0].log).toHaveLength(1);
      expect(redState.transition).toHaveLength(1);
    });

    it('should handle complex SCXML with all features', () => {
      const xml = `
        <scxml name="complex-machine" version="1.0" datamodel="ecmascript" initial="idle" xmlns="http://www.w3.org/2005/07/scxml">
          <datamodel>
            <data id="counter" expr="0"/>
            <data id="flag" expr="true"/>
            <data id="config">{"timeout": 5000, "enabled": true}</data>
          </datamodel>

          <script>
            function customFunction() { return 'hello'; }
          </script>

          <state id="idle">
            <onentry>
              <log label="Entering idle"/>
              <assign location="counter" expr="counter + 1"/>
              <if cond="counter > 5">
                <raise event="max.reached"/>
              </if>
            </onentry>

            <transition event="start" cond="flag" target="active">
              <log expr="'Starting machine'"/>
              <send event="started" target="parent"/>
            </transition>

            <transition event="max.reached" target="done"/>
          </state>

          <state id="active">
            <invoke id="service" type="http" src="/api/service" autoforward="true">
              <param name="id" expr="counter"/>
            </invoke>

            <state id="working" initial="step1">
              <state id="step1">
                <transition event="next" target="step2"/>
              </state>
              <state id="step2">
                <transition event="complete" target="../idle"/>
              </state>

              <history id="workHistory" type="shallow">
                <transition target="step1"/>
              </history>
            </state>

            <onexit>
              <log label="Exiting active"/>
              <cancel sendid="service"/>
            </onexit>
          </state>

          <parallel id="monitoring">
            <state id="health">
              <state id="ok"/>
              <state id="warning"/>
            </state>
            <state id="performance">
              <state id="normal"/>
              <state id="degraded"/>
            </state>
          </parallel>

          <final id="done">
            <onentry>
              <log label="Machine completed"/>
            </onentry>
            <donedata>
              <content>{"finalCounter": counter, "completed": true}</content>
            </donedata>
          </final>
        </scxml>
      `;

      const parsedDoc = parser.parse(xml);
      const serializedXml = serializer.serialize(parsedDoc);
      const reparsedDoc = parser.parse(serializedXml);

      expect(reparsedDoc.scxml.name).toBe('complex-machine');
      expect(reparsedDoc.scxml.datamodel_element?.data).toHaveLength(3);
      expect(reparsedDoc.scxml.state).toHaveLength(2);
      expect(reparsedDoc.scxml.parallel).toHaveLength(1);
      expect(reparsedDoc.scxml.final).toHaveLength(1);
      expect(reparsedDoc.scxml.script).toHaveLength(1);
    });
  });

  describe('serialization options', () => {
    it('should respect spaces option', () => {
      const compactSerializer = new SCXMLSerializer({ format: false });
      const prettySerializer = new SCXMLSerializer({ format: true, indentBy: '    ' });

      const doc = SCXMLBuilder.create()
        .addState(StateBuilder.create('test').build())
        .build();

      const compactXml = compactSerializer.serialize(doc);
      const prettyXml = prettySerializer.serialize(doc);

      expect(compactXml).not.toContain('    '); // No 4-space indentation
      expect(prettyXml).toContain('    '); // Has 4-space indentation
    });

    it('should handle empty elements correctly', () => {
      const doc = SCXMLBuilder.create()
        .addState(StateBuilder.create('empty').build())
        .build();

      const xml = serializer.serialize(doc);

      expect(xml).toContain('<state id="empty"');
      // Both <state id="empty"/> and <state id="empty"></state> are valid XML
    });
  });
});