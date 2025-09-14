import { SCXMLParser } from '../parser';

describe('SCXML Parser', () => {
  let parser: SCXMLParser;

  beforeEach(() => {
    parser = new SCXMLParser();
  });

  describe('basic parsing', () => {
    it('should parse a minimal SCXML document', () => {
      const xml = `
        <scxml version="1.0" xmlns="http://www.w3.org/2005/07/scxml">
          <state id="idle"/>
        </scxml>
      `;

      const doc = parser.parse(xml);
      expect(doc.scxml.version).toBe('1.0');
      expect(doc.scxml.xmlns).toBe('http://www.w3.org/2005/07/scxml');
      expect(doc.scxml.state).toHaveLength(1);
      expect(doc.scxml.state![0].id).toBe('idle');
    });

    it('should parse SCXML with initial attribute', () => {
      const xml = `
        <scxml initial="start" xmlns="http://www.w3.org/2005/07/scxml">
          <state id="start"/>
          <state id="end"/>
        </scxml>
      `;

      const doc = parser.parse(xml);
      expect(doc.scxml.initial).toBe('start');
      expect(doc.scxml.state).toHaveLength(2);
    });

    it('should parse SCXML with name and datamodel', () => {
      const xml = `
        <scxml name="test-machine" datamodel="ecmascript" xmlns="http://www.w3.org/2005/07/scxml">
          <state id="idle"/>
        </scxml>
      `;

      const doc = parser.parse(xml);
      expect(doc.scxml.name).toBe('test-machine');
      expect(doc.scxml.datamodel).toBe('ecmascript');
    });
  });

  describe('state parsing', () => {
    it('should parse states with transitions', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <state id="idle">
            <transition event="start" target="active"/>
            <transition event="reset" target="idle" type="internal"/>
          </state>
          <state id="active"/>
        </scxml>
      `;

      const doc = parser.parse(xml);
      const idleState = doc.scxml.state![0];
      expect(idleState.id).toBe('idle');
      expect(idleState.transition).toHaveLength(2);
      expect(idleState.transition![0].event).toBe('start');
      expect(idleState.transition![0].target).toBe('active');
      expect(idleState.transition![1].type).toBe('internal');
    });

    it('should parse nested states', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <state id="parent" initial="child1">
            <state id="child1"/>
            <state id="child2"/>
          </state>
        </scxml>
      `;

      const doc = parser.parse(xml);
      const parentState = doc.scxml.state![0];
      expect(parentState.id).toBe('parent');
      expect(parentState.initial).toBe('child1');
      expect(parentState.state).toHaveLength(2);
      expect(parentState.state![0].id).toBe('child1');
      expect(parentState.state![1].id).toBe('child2');
    });

    it('should parse onentry and onexit actions', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <state id="test">
            <onentry>
              <log label="entering"/>
              <assign location="count" expr="count + 1"/>
            </onentry>
            <onexit>
              <log label="exiting"/>
              <send event="exited"/>
            </onexit>
          </state>
        </scxml>
      `;

      const doc = parser.parse(xml);
      const state = doc.scxml.state![0];
      expect(state.onentry).toHaveLength(1);
      expect(state.onexit).toHaveLength(1);
      
      const onentry = state.onentry![0];
      expect(onentry.log).toHaveLength(1);
      expect(onentry.assign).toHaveLength(1);
      expect(onentry.log![0].label).toBe('entering');
      expect(onentry.assign![0].location).toBe('count');
      
      const onexit = state.onexit![0];
      expect(onexit.log).toHaveLength(1);
      expect(onexit.send).toHaveLength(1);
      expect(onexit.log![0].label).toBe('exiting');
      expect(onexit.send![0].event).toBe('exited');
    });
  });

  describe('parallel parsing', () => {
    it('should parse parallel regions', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <parallel id="concurrent">
            <state id="branch1"/>
            <state id="branch2"/>
          </parallel>
        </scxml>
      `;

      const doc = parser.parse(xml);
      expect(doc.scxml.parallel).toHaveLength(1);
      const parallel = doc.scxml.parallel![0];
      expect(parallel.id).toBe('concurrent');
      expect(parallel.state).toHaveLength(2);
      expect(parallel.state![0].id).toBe('branch1');
      expect(parallel.state![1].id).toBe('branch2');
    });
  });

  describe('final state parsing', () => {
    it('should parse final states', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <state id="active">
            <transition event="complete" target="done"/>
          </state>
          <final id="done">
            <onentry>
              <log label="completed"/>
            </onentry>
          </final>
        </scxml>
      `;

      const doc = parser.parse(xml);
      expect(doc.scxml.final).toHaveLength(1);
      const finalState = doc.scxml.final![0];
      expect(finalState.id).toBe('done');
      expect(finalState.onentry).toHaveLength(1);
      expect(finalState.onentry![0].log![0].label).toBe('completed');
    });
  });

  describe('datamodel parsing', () => {
    it('should parse datamodel with data elements', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <datamodel>
            <data id="counter" expr="0"/>
            <data id="config">{"timeout": 5000}</data>
            <data id="external" src="/api/data.json"/>
          </datamodel>
          <state id="idle"/>
        </scxml>
      `;

      const doc = parser.parse(xml);
      expect(doc.scxml.datamodel_element).toBeDefined();
      const dataModel = doc.scxml.datamodel_element!;
      expect(dataModel.data).toHaveLength(3);
      
      expect(dataModel.data![0].id).toBe('counter');
      expect(dataModel.data![0].expr).toBe('0');
      
      expect(dataModel.data![1].id).toBe('config');
      expect(dataModel.data![1].content).toBe('{"timeout": 5000}');
      
      expect(dataModel.data![2].id).toBe('external');
      expect(dataModel.data![2].src).toBe('/api/data.json');
    });
  });

  describe('executable content parsing', () => {
    it('should parse transition actions', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <state id="test">
            <transition event="click">
              <raise event="internal.click"/>
              <assign location="clicks" expr="clicks + 1"/>
              <log expr="'Button clicked'"/>
              <send event="notify" target="parent"/>
            </transition>
          </state>
        </scxml>
      `;

      const doc = parser.parse(xml);
      const transition = doc.scxml.state![0].transition![0];
      
      expect(transition.raise).toHaveLength(1);
      expect(transition.raise![0].event).toBe('internal.click');
      
      expect(transition.assign).toHaveLength(1);
      expect(transition.assign![0].location).toBe('clicks');
      expect(transition.assign![0].expr).toBe('clicks + 1');
      
      expect(transition.log).toHaveLength(1);
      expect(transition.log![0].expr).toBe("'Button clicked'");
      
      expect(transition.send).toHaveLength(1);
      expect(transition.send![0].event).toBe('notify');
      expect(transition.send![0].target).toBe('parent');
    });

    it('should parse if/else conditional logic', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <state id="test">
            <onentry>
              <if cond="count > 0">
                <log expr="'Count is positive'"/>
                <assign location="status" expr="'positive'"/>
              </if>
            </onentry>
          </state>
        </scxml>
      `;

      const doc = parser.parse(xml);
      const onentry = doc.scxml.state![0].onentry![0];
      
      expect(onentry.if).toHaveLength(1);
      const ifElement = onentry.if![0];
      expect(ifElement.cond).toBe('count > 0');
      expect(ifElement.log).toHaveLength(1);
      expect(ifElement.assign).toHaveLength(1);
    });

    it('should parse foreach loops', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <state id="test">
            <onentry>
              <foreach array="items" item="currentItem" index="i">
                <log expr="'Processing item: ' + currentItem"/>
              </foreach>
            </onentry>
          </state>
        </scxml>
      `;

      const doc = parser.parse(xml);
      const onentry = doc.scxml.state![0].onentry![0];
      
      expect(onentry.foreach).toHaveLength(1);
      const foreach = onentry.foreach![0];
      expect(foreach.array).toBe('items');
      expect(foreach.item).toBe('currentItem');
      expect(foreach.index).toBe('i');
      expect(foreach.log).toHaveLength(1);
    });
  });

  describe('invoke parsing', () => {
    it('should parse invoke elements', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <state id="calling">
            <invoke type="http" src="/api/service" id="service1" autoforward="true">
              <param name="userId" expr="currentUser.id"/>
              <param name="action" location="requestedAction"/>
            </invoke>
          </state>
        </scxml>
      `;

      const doc = parser.parse(xml);
      const invoke = doc.scxml.state![0].invoke![0];
      
      expect(invoke.type).toBe('http');
      expect(invoke.src).toBe('/api/service');
      expect(invoke.id).toBe('service1');
      expect(invoke.autoforward).toBe(true);
      expect(invoke.param).toHaveLength(2);
      expect(invoke.param![0].name).toBe('userId');
      expect(invoke.param![0].expr).toBe('currentUser.id');
      expect(invoke.param![1].name).toBe('action');
      expect(invoke.param![1].location).toBe('requestedAction');
    });
  });

  describe('history parsing', () => {
    it('should parse history states', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <state id="compound">
            <history id="hist" type="deep">
              <transition target="default"/>
            </history>
            <state id="default"/>
            <state id="other"/>
          </state>
        </scxml>
      `;

      const doc = parser.parse(xml);
      const history = doc.scxml.state![0].history![0];
      
      expect(history.id).toBe('hist');
      expect(history.type).toBe('deep');
      expect(history.transition).toBeDefined();
      expect(history.transition!.target).toBe('default');
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid XML', () => {
      const invalidXml = '<scxml><state id="test"</scxml>';
      expect(() => parser.parse(invalidXml)).toThrow();
    });

    it('should throw error when no scxml root element', () => {
      const xml = '<root><state id="test"/></root>';
      expect(() => parser.parse(xml)).toThrow('No scxml root element found');
    });
  });

  describe('complex document parsing', () => {
    it('should parse a complete real-world SCXML document', () => {
      const xml = `
        <scxml 
          name="traffic-light" 
          version="1.0" 
          datamodel="ecmascript" 
          initial="red"
          xmlns="http://www.w3.org/2005/07/scxml">
          
          <datamodel>
            <data id="timer" expr="0"/>
            <data id="pedestrianWaiting" expr="false"/>
          </datamodel>
          
          <state id="red">
            <onentry>
              <assign location="timer" expr="5000"/>
              <log label="Red light on"/>
            </onentry>
            <transition event="timer.expired" target="green"/>
            <transition event="pedestrian.request" cond="!pedestrianWaiting">
              <assign location="pedestrianWaiting" expr="true"/>
            </transition>
          </state>
          
          <state id="green">
            <onentry>
              <assign location="timer" expr="3000"/>
              <log label="Green light on"/>
            </onentry>
            <transition event="timer.expired" target="yellow"/>
            <transition event="pedestrian.request" target="yellow" cond="pedestrianWaiting"/>
          </state>
          
          <state id="yellow">
            <onentry>
              <assign location="timer" expr="1000"/>
              <assign location="pedestrianWaiting" expr="false"/>
              <log label="Yellow light on"/>
            </onentry>
            <transition event="timer.expired" target="red"/>
          </state>
        </scxml>
      `;

      const doc = parser.parse(xml);
      
      expect(doc.scxml.name).toBe('traffic-light');
      expect(doc.scxml.initial).toBe('red');
      expect(doc.scxml.datamodel).toBe('ecmascript');
      expect(doc.scxml.datamodel_element!.data).toHaveLength(2);
      expect(doc.scxml.state).toHaveLength(3);
      
      const redState = doc.scxml.state!.find(s => s.id === 'red')!;
      expect(redState.onentry).toHaveLength(1);
      expect(redState.onentry![0].assign).toHaveLength(1);
      expect(redState.onentry![0].log).toHaveLength(1);
      expect(redState.transition).toHaveLength(2);
      
      const greenState = doc.scxml.state!.find(s => s.id === 'green')!;
      expect(greenState.transition![1].cond).toBe('pedestrianWaiting');
      
      const yellowState = doc.scxml.state!.find(s => s.id === 'yellow')!;
      expect(yellowState.onentry![0].assign).toHaveLength(2);
    });
  });
});