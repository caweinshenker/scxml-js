import { SCXMLParser } from '../parser';

describe('SCXML Parser Edge Cases', () => {
  let parser: SCXMLParser;

  beforeEach(() => {
    parser = new SCXMLParser();
  });

  describe('malformed XML handling', () => {
    it('should throw on unclosed tags', () => {
      const xml = '<scxml><state id="test">';
      expect(() => parser.parse(xml)).toThrow();
    });

    it('should throw on mismatched tags', () => {
      const xml = '<scxml><state></transition></scxml>';
      expect(() => parser.parse(xml)).toThrow();
    });

    it('should throw on invalid XML characters', () => {
      const xml = '<scxml><state id="test\x00"/></scxml>';
      expect(() => parser.parse(xml)).toThrow();
    });

    it('should handle XML with BOM', () => {
      const xml = '\uFEFF<scxml xmlns="http://www.w3.org/2005/07/scxml"><state id="test"/></scxml>';
      const doc = parser.parse(xml);
      expect(doc.scxml.state![0].id).toBe('test');
    });
  });

  describe('empty and whitespace handling', () => {
    it('should handle empty states', () => {
      const xml = '<scxml xmlns="http://www.w3.org/2005/07/scxml"><state id="empty"/></scxml>';
      const doc = parser.parse(xml);
      expect(doc.scxml.state![0].id).toBe('empty');
    });

    it('should handle whitespace-only content', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <state id="test">

          </state>
        </scxml>
      `;
      const doc = parser.parse(xml);
      expect(doc.scxml.state![0].id).toBe('test');
    });

    it('should preserve significant whitespace in data content', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <datamodel>
            <data id="text">  Hello World  </data>
          </datamodel>
          <state id="test"/>
        </scxml>
      `;
      const doc = parser.parse(xml);
      expect(doc.scxml.datamodel_element!.data![0].content).toBe('  Hello World  ');
    });

    it('should handle mixed content with whitespace', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <script>
            function test() {
              return "hello world";
            }
          </script>
          <state id="test"/>
        </scxml>
      `;
      const doc = parser.parse(xml);
      expect(doc.scxml.script![0].content).toContain('function test()');
    });
  });

  describe('special characters and encoding', () => {
    it('should handle XML entities', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <state id="test">
            <onentry>
              <log expr="'&lt;Hello &amp; Goodbye&gt;'"/>
            </onentry>
          </state>
        </scxml>
      `;
      const doc = parser.parse(xml);
      expect(doc.scxml.state![0].onentry![0].log![0].expr).toBe("'<Hello & Goodbye>'");
    });

    it('should handle CDATA sections', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <script><![CDATA[
            if (x < y && a > b) {
              return "complex expression";
            }
          ]]></script>
          <state id="test"/>
        </scxml>
      `;
      const doc = parser.parse(xml);
      expect(doc.scxml.script![0].content).toContain('x < y && a > b');
    });

    it('should handle unicode characters', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <state id="测试">
            <onentry>
              <log expr="'🚀 Unicode content 日本語'"/>
            </onentry>
          </state>
        </scxml>
      `;
      const doc = parser.parse(xml);
      expect(doc.scxml.state![0].id).toBe('测试');
      expect(doc.scxml.state![0].onentry![0].log![0].expr).toBe("'🚀 Unicode content 日本語'");
    });
  });

  describe('namespace handling', () => {
    it('should handle default SCXML namespace', () => {
      const xml = '<scxml xmlns="http://www.w3.org/2005/07/scxml"><state id="test"/></scxml>';
      const doc = parser.parse(xml);
      expect(doc.scxml.xmlns).toBe('http://www.w3.org/2005/07/scxml');
    });

    it('should handle prefixed namespaces', () => {
      const xml = `
        <scxml:scxml xmlns:scxml="http://www.w3.org/2005/07/scxml">
          <scxml:state id="test"/>
        </scxml:scxml>
      `;
      expect(() => parser.parse(xml)).toThrow('No scxml root element found');
    });

    it('should handle mixed namespaces', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml" xmlns:custom="http://example.com/custom">
          <state id="test">
            <custom:metadata>custom data</custom:metadata>
          </state>
        </scxml>
      `;
      const doc = parser.parse(xml);
      expect(doc.scxml.state![0].id).toBe('test');
    });
  });

  describe('deeply nested structures', () => {
    it('should handle deeply nested states', () => {
      let xml = '<scxml xmlns="http://www.w3.org/2005/07/scxml">';
      for (let i = 0; i < 20; i++) {
        xml += `<state id="level${i}">`;
      }
      xml += '<state id="deepest"/>';
      for (let i = 0; i < 20; i++) {
        xml += '</state>';
      }
      xml += '</scxml>';

      const doc = parser.parse(xml);
      expect(doc.scxml.state![0].id).toBe('level0');

      // Navigate to deepest state
      let currentState = doc.scxml.state![0];
      for (let i = 1; i < 20; i++) {
        currentState = currentState.state![0];
        expect(currentState.id).toBe(`level${i}`);
      }
      expect(currentState.state![0].id).toBe('deepest');
    });

    it('should handle many parallel branches', () => {
      let xml = '<scxml xmlns="http://www.w3.org/2005/07/scxml"><parallel id="root">';
      for (let i = 0; i < 50; i++) {
        xml += `<state id="branch${i}"/>`;
      }
      xml += '</parallel></scxml>';

      const doc = parser.parse(xml);
      expect(doc.scxml.parallel![0].state).toHaveLength(50);
      expect(doc.scxml.parallel![0].state![49].id).toBe('branch49');
    });
  });

  describe('complex executable content', () => {
    it('should parse deeply nested if-else structures', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <state id="test">
            <onentry>
              <if cond="level1">
                <if cond="level2">
                  <if cond="level3">
                    <log label="deeply nested"/>
                  </if>
                </if>
              </if>
            </onentry>
          </state>
        </scxml>
      `;
      const doc = parser.parse(xml);
      const onentry = doc.scxml.state![0].onentry![0];
      expect(onentry.if).toHaveLength(1);
      expect(onentry.if![0].if).toHaveLength(1);
      expect(onentry.if![0].if![0].if).toHaveLength(1);
      expect(onentry.if![0].if![0].if![0].log![0].label).toBe('deeply nested');
    });

    it('should parse complex foreach with nested content', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <state id="test">
            <onentry>
              <foreach array="items" item="item" index="i">
                <if cond="item.active">
                  <foreach array="item.children" item="child">
                    <assign location="processed" expr="processed.concat(child)"/>
                    <log expr="'Processing: ' + child.name"/>
                  </foreach>
                </if>
              </foreach>
            </onentry>
          </state>
        </scxml>
      `;
      const doc = parser.parse(xml);
      const foreach = doc.scxml.state![0].onentry![0].foreach![0];
      expect(foreach.array).toBe('items');
      expect(foreach.if).toHaveLength(1);
      expect(foreach.if![0].foreach).toHaveLength(1);
      expect(foreach.if![0].foreach![0].assign).toHaveLength(1);
      expect(foreach.if![0].foreach![0].log).toHaveLength(1);
    });
  });

  describe('attribute edge cases', () => {
    it('should handle empty attribute values', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <state id="">
            <transition event="" target="" cond=""/>
          </state>
        </scxml>
      `;
      const doc = parser.parse(xml);
      const state = doc.scxml.state![0];
      expect(state.id).toBe('');
      expect(state.transition![0].event).toBe('');
      expect(state.transition![0].target).toBe('');
      expect(state.transition![0].cond).toBe('');
    });

    it('should handle attributes with special characters', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <state id="test">
            <transition event="user.action&amp;more" cond="x &gt; 0 &amp;&amp; y &lt; 100"/>
          </state>
        </scxml>
      `;
      const doc = parser.parse(xml);
      expect(doc.scxml.state![0].transition![0].event).toBe('user.action&more');
      expect(doc.scxml.state![0].transition![0].cond).toBe('x > 0 && y < 100');
    });

    it('should handle boolean attributes correctly', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <state id="test">
            <invoke type="http" src="/api" autoforward="true"/>
            <invoke type="http" src="/api2" autoforward="false"/>
          </state>
        </scxml>
      `;
      const doc = parser.parse(xml);
      expect(doc.scxml.state![0].invoke![0].autoforward).toBe(true);
      expect(doc.scxml.state![0].invoke![1].autoforward).toBe(false);
    });
  });

  describe('edge case element combinations', () => {
    it('should handle states with all possible child elements', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <state id="comprehensive" initial="child1">
            <datamodel>
              <data id="local" expr="42"/>
            </datamodel>
            <onentry>
              <log label="entering comprehensive"/>
            </onentry>
            <onexit>
              <log label="exiting comprehensive"/>
            </onexit>
            <transition event="test" target="child2"/>
            <state id="child1"/>
            <state id="child2"/>
            <parallel id="par">
              <state id="p1"/>
              <state id="p2"/>
            </parallel>
            <final id="done"/>
            <history id="hist" type="shallow">
              <transition target="child1"/>
            </history>
            <invoke id="service" type="http" src="/test"/>
          </state>
        </scxml>
      `;
      const doc = parser.parse(xml);
      const state = doc.scxml.state![0];

      expect(state.id).toBe('comprehensive');
      expect(state.initial).toBe('child1');
      expect(state.datamodel).toBeDefined();
      expect(state.onentry).toHaveLength(1);
      expect(state.onexit).toHaveLength(1);
      expect(state.transition).toHaveLength(1);
      expect(state.state).toHaveLength(2);
      expect(state.parallel).toHaveLength(1);
      expect(state.final).toHaveLength(1);
      expect(state.history).toHaveLength(1);
      expect(state.invoke).toHaveLength(1);
    });

    it('should handle transitions with all executable content types', () => {
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <state id="test">
            <transition event="complex">
              <raise event="internal"/>
              <if cond="true">
                <log label="condition met"/>
              </if>
              <foreach array="items" item="item">
                <assign location="item.processed" expr="true"/>
              </foreach>
              <log expr="'processing complete'"/>
              <assign location="done" expr="true"/>
              <send event="completed" target="parent"/>
              <cancel sendid="timer"/>
              <script>console.log('custom script');</script>
            </transition>
          </state>
        </scxml>
      `;
      const doc = parser.parse(xml);
      const transition = doc.scxml.state![0].transition![0];

      expect(transition.raise).toHaveLength(1);
      expect(transition.if).toHaveLength(1);
      expect(transition.foreach).toHaveLength(1);
      expect(transition.log).toHaveLength(1);
      expect(transition.assign).toHaveLength(1);
      expect(transition.send).toHaveLength(1);
      expect(transition.cancel).toHaveLength(1);
      expect(transition.script).toHaveLength(1);
    });
  });

  describe('performance edge cases', () => {
    it('should handle many transitions on single state', () => {
      let xml = '<scxml xmlns="http://www.w3.org/2005/07/scxml"><state id="busy">';
      for (let i = 0; i < 100; i++) {
        xml += `<transition event="event${i}" target="target${i}"/>`;
      }
      xml += '</state>';
      for (let i = 0; i < 100; i++) {
        xml += `<state id="target${i}"/>`;
      }
      xml += '</scxml>';

      const doc = parser.parse(xml);
      expect(doc.scxml.state![0].transition).toHaveLength(100);
      expect(doc.scxml.state).toHaveLength(101); // busy state + 100 targets
    });

    it('should handle large data content', () => {
      const largeContent = 'x'.repeat(10000);
      const xml = `
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <datamodel>
            <data id="large">${largeContent}</data>
          </datamodel>
          <state id="test"/>
        </scxml>
      `;
      const doc = parser.parse(xml);
      expect(doc.scxml.datamodel_element!.data![0].content).toHaveLength(10000);
    });
  });

  describe('XML processing instructions and comments', () => {
    it('should ignore XML comments', () => {
      const xml = `
        <!-- This is a comment -->
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <!-- Another comment -->
          <state id="test">
            <!-- Inline comment -->
          </state>
          <!-- Final comment -->
        </scxml>
      `;
      const doc = parser.parse(xml);
      expect(doc.scxml.state![0].id).toBe('test');
    });

    it('should ignore processing instructions', () => {
      const xml = `
        <?xml version="1.0" encoding="UTF-8"?>
        <?xml-stylesheet type="text/xsl" href="scxml.xsl"?>
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <state id="test"/>
        </scxml>
      `;
      const doc = parser.parse(xml);
      expect(doc.scxml.state![0].id).toBe('test');
    });

    it('should handle DOCTYPE declarations', () => {
      const xml = `
        <?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE scxml PUBLIC "-//W3C//DTD SCXML 1.0//EN" "http://www.w3.org/TR/scxml/scxml.dtd">
        <scxml xmlns="http://www.w3.org/2005/07/scxml">
          <state id="test"/>
        </scxml>
      `;
      const doc = parser.parse(xml);
      expect(doc.scxml.state![0].id).toBe('test');
    });
  });
});