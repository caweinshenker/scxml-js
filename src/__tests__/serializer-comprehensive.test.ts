import { SCXMLSerializer } from "../serializer";
import { SCXMLParser } from "../parser";
import {
  SCXMLBuilder,
  StateBuilder,
  TransitionBuilder,
  DataModelBuilder,
  DataBuilder,
  OnEntryBuilder,
  OnExitBuilder,
  ParallelBuilder,
} from "../builder";

describe("SCXML Serializer Comprehensive Tests", () => {
  let serializer: SCXMLSerializer;
  let parser: SCXMLParser;

  beforeEach(() => {
    serializer = new SCXMLSerializer();
    parser = new SCXMLParser();
  });

  describe("complex document serialization", () => {
    it("should serialize deeply nested state hierarchies", () => {
      const doc = SCXMLBuilder.create()
        .name("nested-machine")
        .initial("root")
        .datamodel("ecmascript")
        .addState(
          StateBuilder.create("root")
            .initial("level1")
            .addState(
              StateBuilder.create("level1")
                .initial("level2")
                .addState(
                  StateBuilder.create("level2")
                    .initial("level3")
                    .addState(
                      StateBuilder.create("level3")
                        .addTransition(
                          TransitionBuilder.create()
                            .event("deep-event")
                            .target("../../level1alt")
                            .addLog({ expr: '"Deep transition executed"' })
                            .build()
                        )
                        .build()
                    )
                    .addState(StateBuilder.create("level2alt").build())
                    .build()
                )
                .build()
            )
            .addState(StateBuilder.create("level1alt").build())
            .build()
        )
        .build();

      const xml = serializer.serialize(doc);

      expect(xml).toContain('name="nested-machine"');
      expect(xml).toContain('initial="root"');
      expect(xml).toContain('datamodel="ecmascript"');
      expect(xml).toContain('<state id="root" initial="level1"');
      expect(xml).toContain('<state id="level1" initial="level2"');
      expect(xml).toContain('<state id="level2" initial="level3"');
      expect(xml).toContain('<state id="level3"');
      expect(xml).toContain('target="../../level1alt"');
      expect(xml).toContain('expr="&quot;Deep transition executed&quot;"');

      // Verify round-trip
      const parsedDoc = parser.parse(xml);
      expect(parsedDoc.scxml.name).toBe("nested-machine");
      expect(parsedDoc.scxml.initial).toBe("root");

      const level3 = findStateRecursive(parsedDoc.scxml.state!, "level3");
      expect(level3).toBeDefined();
      expect(level3!.transition![0].target).toBe("../../level1alt");
    });

    it("should serialize complex parallel hierarchies", () => {
      const doc = SCXMLBuilder.create()
        .name("parallel-machine")
        .initial("concurrent")
        .addParallel(
          ParallelBuilder.create("concurrent")
            .addState(
              StateBuilder.create("ui-branch")
                .initial("idle")
                .addState(
                  StateBuilder.create("idle")
                    .addTransition(
                      TransitionBuilder.create()
                        .event("user-action")
                        .target("processing")
                        .build()
                    )
                    .build()
                )
                .addState(
                  StateBuilder.create("processing")
                    .addOnEntry(
                      OnEntryBuilder.create()
                        .addSend({ event: "ui-busy", target: "#status-branch" })
                        .build()
                    )
                    .addTransition(
                      TransitionBuilder.create()
                        .event("done")
                        .target("idle")
                        .build()
                    )
                    .build()
                )
                .build()
            )
            .addState(
              StateBuilder.create("status-branch")
                .initial("ready")
                .addState(
                  StateBuilder.create("ready")
                    .addTransition(
                      TransitionBuilder.create()
                        .event("ui-busy")
                        .target("busy")
                        .build()
                    )
                    .build()
                )
                .addState(
                  StateBuilder.create("busy")
                    .addTransition(
                      TransitionBuilder.create()
                        .event("ui-ready")
                        .target("ready")
                        .build()
                    )
                    .build()
                )
                .build()
            )
            .addParallel(
              ParallelBuilder.create("nested-parallel")
                .addState(StateBuilder.create("monitor1").build())
                .addState(StateBuilder.create("monitor2").build())
                .build()
            )
            .build()
        )
        .build();

      const xml = serializer.serialize(doc);

      expect(xml).toContain('<parallel id="concurrent"');
      expect(xml).toContain('<state id="ui-branch"');
      expect(xml).toContain('<state id="status-branch"');
      expect(xml).toContain('<parallel id="nested-parallel"');
      expect(xml).toContain('target="#status-branch"');

      // Verify round-trip maintains structure
      const parsedDoc = parser.parse(xml);
      expect(parsedDoc.scxml.parallel![0].id).toBe("concurrent");
      expect(parsedDoc.scxml.parallel![0].state).toHaveLength(2);
      expect(parsedDoc.scxml.parallel![0].parallel).toHaveLength(1);
    });
  });

  describe("comprehensive data model serialization", () => {
    it("should serialize complex data models with various content types", () => {
      const dataModel = DataModelBuilder.create()
        .addData(
          DataBuilder.create("simpleString").expr('"hello world"').build()
        )
        .addData(
          DataBuilder.create("complexObject")
            .expr('{ name: "test", values: [1, 2, 3], nested: { prop: true } }')
            .build()
        )
        .addData(
          DataBuilder.create("jsonContent")
            .content(
              '{"config": {"timeout": 5000, "retries": 3}, "features": ["a", "b", "c"]}'
            )
            .build()
        )
        .addData(
          DataBuilder.create("xmlContent")
            .content(
              "<configuration><timeout>5000</timeout><features><feature>a</feature><feature>b</feature></features></configuration>"
            )
            .build()
        )
        .addData(
          DataBuilder.create("textContent")
            .content("Plain text configuration with special chars: <>&\"'")
            .build()
        )
        .addData(
          DataBuilder.create("externalRef")
            .src("/api/dynamic-config?v=1.0")
            .build()
        )
        .addData(
          DataBuilder.create("multilineContent")
            .content(
              `{
  "multiline": "json",
  "with": {
    "nested": "structure",
    "and": ["array", "elements"]
  }
}`
            )
            .build()
        )
        .build();

      const doc = SCXMLBuilder.create()
        .name("data-rich-machine")
        .initial("idle")
        .addDataModel(dataModel)
        .addState(StateBuilder.create("idle").build())
        .build();

      const xml = serializer.serialize(doc);

      expect(xml).toContain("<datamodel>");
      expect(xml).toContain(
        '<data id="simpleString" expr="&quot;hello world&quot;"'
      );
      expect(xml).toContain(
        '<data id="complexObject" expr="{ name: &quot;test&quot;'
      );
      expect(xml).toContain('<data id="jsonContent">{&quot;config&quot;');
      expect(xml).toContain('<data id="xmlContent">&lt;configuration&gt;');
      expect(xml).toContain('id="textContent"');
      expect(xml).toContain(
        "Plain text configuration with special chars: &lt;&gt;&amp;&quot;&apos;"
      );
      expect(xml).toContain(
        '<data id="externalRef" src="/api/dynamic-config?v=1.0"'
      );
      expect(xml).toContain("multiline");

      // Verify round-trip preserves all data
      const parsedDoc = parser.parse(xml);
      expect(parsedDoc.scxml.datamodel_element!.data).toHaveLength(7);

      const jsonData = parsedDoc.scxml.datamodel_element!.data!.find(
        (d) => d.id === "jsonContent"
      );
      expect(jsonData!.content).toContain("timeout");
      expect(jsonData!.content).toContain("5000");
    });

    it("should handle data with special characters and encoding", () => {
      const dataModel = DataModelBuilder.create()
        .addData(
          DataBuilder.create("specialChars").expr('"<>&\\"\\\'"').build()
        )
        .addData(
          DataBuilder.create("unicode")
            .content("Unicode: 日本語 🚀 ñáéíóú")
            .build()
        )
        .addData(
          DataBuilder.create("cdata")
            .content("<![CDATA[Raw content with <special> &chars;]]>")
            .build()
        )
        .addData(
          DataBuilder.create("quotes")
            .expr('{ "single": \'value\', "double": "value" }')
            .build()
        )
        .build();

      const doc = SCXMLBuilder.create()
        .name("encoding-test")
        .initial("test")
        .addDataModel(dataModel)
        .addState(StateBuilder.create("test").build())
        .build();

      const xml = serializer.serialize(doc);

      expect(xml).toContain("&lt;&gt;&amp;"); // Note: the serializer may output &quot; as " which is valid
      expect(xml).toContain("Unicode: 日本語 🚀 ñáéíóú");
      expect(xml).toContain("CDATA");

      // Verify round-trip preserves special characters
      const parsedDoc = parser.parse(xml);
      const unicodeData = parsedDoc.scxml.datamodel_element!.data!.find(
        (d) => d.id === "unicode"
      );
      expect(unicodeData!.content).toContain("日本語");
      expect(unicodeData!.content).toContain("🚀");
    });
  });

  describe("comprehensive action serialization", () => {
    it("should serialize all executable content types", () => {
      const complexEntry = OnEntryBuilder.create()
        .addRaise({ event: "internal.entered" })
        .addLog({ label: "Entry log", expr: '"Dynamic: " + Date.now()' })
        .addAssign({ location: "state.entryTime", expr: "Date.now()" })
        .addSend({
          event: "entry-notification",
          target: "parent",
          delay: "100ms",
          id: "entry-send",
        })
        .addScript({ content: 'console.log("Entry script");' })
        .build();

      const complexTransition = TransitionBuilder.create()
        .event("COMPLEX_EVENT")
        .cond("enabled && ready")
        .target("target-state")
        .type("external")
        .addRaise({ event: "transition-started" })
        .addLog({ expr: '"Transition: " + _event.type' })
        .addAssign({ location: "lastEvent", expr: "_event" })
        .addSend({
          event: "transition-notify",
          target: "supervisor",
          delay: "50ms",
        })
        .addScript({ src: "/scripts/transition.js" })
        .build();

      const doc = SCXMLBuilder.create()
        .name("action-test")
        .initial("source")
        .addState(
          StateBuilder.create("source")
            .addOnEntry(complexEntry)
            .addTransition(complexTransition)
            .addOnExit(
              OnExitBuilder.create().addLog({ label: "Exiting source" }).build()
            )
            .build()
        )
        .addState(StateBuilder.create("target-state").build())
        .build();

      const xml = serializer.serialize(doc);

      // Entry actions
      expect(xml).toContain("<onentry>");
      expect(xml).toContain('<raise event="internal.entered"');
      expect(xml).toContain(
        '<log label="Entry log" expr="&quot;Dynamic: &quot; + Date.now()"'
      );
      expect(xml).toContain(
        '<assign location="state.entryTime" expr="Date.now()"'
      );
      expect(xml).toContain('event="entry-notification"');
      expect(xml).toContain('target="parent"');
      expect(xml).toContain('delay="100ms"');
      expect(xml).toContain('id="entry-send"');
      expect(xml).toContain(
        "<script>console.log(&quot;Entry script&quot;);</script>"
      );

      // Transition actions
      expect(xml).toContain('event="COMPLEX_EVENT"');
      expect(xml).toContain('cond="enabled &amp;&amp; ready"');
      expect(xml).toContain('type="external"');
      expect(xml).toContain('<raise event="transition-started"');
      expect(xml).toContain('<script src="/scripts/transition.js"');

      // Exit actions
      expect(xml).toContain("<onexit>");
      expect(xml).toContain('<log label="Exiting source"');

      // Verify round-trip
      const parsedDoc = parser.parse(xml);
      const sourceState = parsedDoc.scxml.state!.find(
        (s) => s.id === "source"
      )!;
      expect(sourceState.onentry![0].raise).toHaveLength(1);
      expect(sourceState.onentry![0].log).toHaveLength(1);
      expect(sourceState.onentry![0].assign).toHaveLength(1);
      expect(sourceState.onentry![0].send).toHaveLength(1);
      expect(sourceState.onentry![0].script).toHaveLength(1);
    });

    it("should serialize complex send elements with parameters", () => {
      const doc = SCXMLBuilder.create()
        .name("send-test")
        .initial("sender")
        .addState(
          StateBuilder.create("sender")
            .addTransition(
              TransitionBuilder.create()
                .event("SEND_COMPLEX")
                .addSend({
                  event: "complex-message",
                  eventexpr: "dynamicEvent",
                  target: "receiver",
                  targetexpr: "dynamicTarget",
                  type: "http",
                  typeexpr: "dynamicType",
                  id: "complex-send",
                  idlocation: "sendIdVar",
                  delay: "1s",
                  delayexpr: "dynamicDelay",
                  namelist: "var1 var2 var3",
                  param: [
                    { name: "param1", expr: "value1" },
                    { name: "param2", location: "dataLocation" },
                  ],
                  content: {
                    expr: "dynamicContent",
                    content: "static content",
                  },
                })
                .build()
            )
            .build()
        )
        .build();

      const xml = serializer.serialize(doc);

      expect(xml).toContain("<send");
      expect(xml).toContain('event="complex-message"');
      expect(xml).toContain('eventexpr="dynamicEvent"');
      expect(xml).toContain('target="receiver"');
      expect(xml).toContain('targetexpr="dynamicTarget"');
      expect(xml).toContain('type="http"');
      expect(xml).toContain('typeexpr="dynamicType"');
      expect(xml).toContain('id="complex-send"');
      expect(xml).toContain('idlocation="sendIdVar"');
      expect(xml).toContain('delay="1s"');
      expect(xml).toContain('delayexpr="dynamicDelay"');
      expect(xml).toContain('namelist="var1 var2 var3"');
      expect(xml).toContain('<param name="param1" expr="value1"');
      expect(xml).toContain('<param name="param2" location="dataLocation"');
      expect(xml).toContain(
        '<content expr="dynamicContent">static content</content>'
      );

      // Verify round-trip
      const parsedDoc = parser.parse(xml);
      const send = parsedDoc.scxml.state![0].transition![0].send![0];
      expect(send.param).toHaveLength(2);
      expect(send.content!.expr).toBe("dynamicContent");
      expect(send.content!.content).toBe("static content");
    });
  });

  // TODO: Invoke serialization tests will be implemented in feature branch
  // See GitHub issue for invoke implementation

  describe("history state serialization", () => {
    it("should serialize history states with transitions", () => {
      const doc = SCXMLBuilder.create()
        .name("history-test")
        .initial("compound")
        .addState(
          StateBuilder.create("compound")
            .initial("child1")
            .addHistory({
              id: "shallow-history",
              type: "shallow",
              transition: {
                target: "child1",
                cond: "defaultToChild1",
              },
            })
            .addHistory({
              id: "deep-history",
              type: "deep",
              transition: {
                target: "child2",
              },
            })
            .addState(
              StateBuilder.create("child1")
                .addTransition(
                  TransitionBuilder.create()
                    .event("next")
                    .target("child2")
                    .build()
                )
                .build()
            )
            .addState(
              StateBuilder.create("child2")
                .addTransition(
                  TransitionBuilder.create()
                    .event("back")
                    .target("shallow-history")
                    .build()
                )
                .build()
            )
            .build()
        )
        .build();

      const xml = serializer.serialize(doc);

      expect(xml).toContain('<history id="shallow-history" type="shallow"');
      expect(xml).toContain('<history id="deep-history" type="deep"');
      expect(xml).toContain('target="child1"');
      expect(xml).toContain('cond="defaultToChild1"');
      expect(xml).toContain('target="shallow-history"');

      const parsedDoc = parser.parse(xml);
      const compound = parsedDoc.scxml.state![0];
      expect(compound.history).toHaveLength(2);
      expect(compound.history![0].type).toBe("shallow");
      expect(compound.history![1].type).toBe("deep");
    });
  });

  describe("final state serialization", () => {
    it("should serialize final states with done data", () => {
      const doc = SCXMLBuilder.create()
        .name("final-test")
        .initial("working")
        .addState(
          StateBuilder.create("working")
            .addTransition(
              TransitionBuilder.create()
                .event("complete")
                .target("success")
                .build()
            )
            .build()
        )
        .addFinal({
          id: "success",
          onentry: [
            OnEntryBuilder.create()
              .addLog({ label: "Success achieved" })
              .addAssign({ location: "completedAt", expr: "Date.now()" })
              .build(),
          ],
          onexit: [
            OnExitBuilder.create().addLog({ label: "Final exit" }).build(),
          ],
          donedata: {
            content: {
              expr: "{ success: true, timestamp: completedAt }",
              content: '{"fallback": "data"}',
            },
            param: [
              { name: "result", expr: "finalResult" },
              { name: "duration", location: "processingTime" },
            ],
          },
        })
        .build();

      const xml = serializer.serialize(doc);

      expect(xml).toContain('<final id="success"');
      expect(xml).toContain("<onentry>");
      expect(xml).toContain("<onexit>");
      expect(xml).toContain("<donedata>");
      expect(xml).toContain(
        '<content expr="{ success: true, timestamp: completedAt }">{&quot;fallback&quot;: &quot;data&quot;}</content>'
      );
      expect(xml).toContain('<param name="result" expr="finalResult"');
      expect(xml).toContain('<param name="duration" location="processingTime"');

      const parsedDoc = parser.parse(xml);
      const finalState = parsedDoc.scxml.final![0];
      expect(finalState.onentry).toHaveLength(1);
      expect(finalState.onexit).toHaveLength(1);
      expect(finalState.donedata!.param).toHaveLength(2);
    });
  });

  describe("serialization options and formatting", () => {
    it("should respect different spacing options", () => {
      const doc = SCXMLBuilder.create()
        .name("formatting-test")
        .initial("test")
        .addState(
          StateBuilder.create("test")
            .addState(StateBuilder.create("nested").build())
            .build()
        )
        .build();

      const compactSerializer = new SCXMLSerializer({ format: false });
      const tabSerializer = new SCXMLSerializer({
        format: true,
        indentBy: "\t",
      });
      const fourSpaceSerializer = new SCXMLSerializer({
        format: true,
        indentBy: "    ",
      });

      const compactXml = compactSerializer.serialize(doc);
      const tabXml = tabSerializer.serialize(doc);
      const fourSpaceXml = fourSpaceSerializer.serialize(doc);

      // Compact should have minimal whitespace
      expect(compactXml.split("\n").length).toBeLessThan(
        tabXml.split("\n").length
      );

      // Tab version should contain tabs
      expect(tabXml).toContain("\t");

      // Four space version should contain 4-space indentation
      const fourSpaceLines = fourSpaceXml.split("\n");
      const indentedLine = fourSpaceLines.find((line) =>
        line.startsWith("    <state")
      );
      expect(indentedLine).toBeDefined();
    });

    it("should handle custom serialization options", () => {
      const customSerializer = new SCXMLSerializer({
        indentBy: "  ",
        format: true,
        suppressEmptyNode: true,
      });

      const doc = SCXMLBuilder.create()
        .name("custom-options")
        .initial("test")
        .addState(StateBuilder.create("test").build())
        .build();

      const xml = customSerializer.serialize(doc);

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain("<scxml");
    });
  });

  describe("round-trip fidelity tests", () => {
    it("should maintain perfect fidelity for comprehensive SCXML documents", () => {
      const originalXml = `<?xml version="1.0" encoding="UTF-8"?>
<scxml name="comprehensive-test" version="1.0" datamodel="ecmascript" initial="start" xmlns="http://www.w3.org/2005/07/scxml">
  <datamodel>
    <data id="counter" expr="0"/>
    <data id="config">{"timeout": 5000, "enabled": true}</data>
    <data id="external" src="/api/config"/>
  </datamodel>

  <script>
    function initialize() {
      console.log("Machine initialized");
    }
  </script>

  <state id="start">
    <onentry>
      <log label="Starting"/>
      <assign location="counter" expr="counter + 1"/>
      <script>initialize();</script>
    </onentry>

    <transition event="begin" cond="config.enabled" target="processing" type="external">
      <log expr="'Beginning processing'"/>
      <send event="started" target="supervisor" delay="100ms"/>
    </transition>

    <onexit>
      <log label="Leaving start"/>
    </onexit>
  </state>

  <state id="processing">
    <invoke id="processor" type="http" src="/api/process" autoforward="true">
      <param name="input" expr="currentInput"/>
      <param name="config" location="processingConfig"/>
    </invoke>

    <state id="waiting" initial="idle">
      <state id="idle">
        <transition event="data" target="busy"/>
      </state>
      <state id="busy">
        <transition event="done" target="idle"/>
      </state>
      <history id="waitHistory" type="shallow">
        <transition target="idle"/>
      </history>
    </state>

    <transition event="complete" target="finished"/>
    <transition event="error" target="error-handling"/>
  </state>

  <parallel id="monitoring">
    <state id="heartbeat">
      <state id="alive"/>
      <state id="dead"/>
    </state>
    <state id="logging">
      <state id="normal"/>
      <state id="verbose"/>
    </state>
  </parallel>

  <state id="error-handling">
    <onentry>
      <log expr="'Error: ' + _event.data.error"/>
      <assign location="errorCount" expr="errorCount + 1"/>
    </onentry>
    <transition event="retry" cond="errorCount &lt; 3" target="processing"/>
    <transition event="abort" target="finished"/>
  </state>

  <final id="finished">
    <onentry>
      <log label="Process completed"/>
    </onentry>
    <donedata>
      <content expr="{ counter: counter, success: true }"/>
    </donedata>
  </final>
</scxml>`;

      // Parse -> Serialize -> Parse cycle
      const parsedDoc = parser.parse(originalXml);
      const serializedXml = serializer.serialize(parsedDoc);
      const reparsedDoc = parser.parse(serializedXml);

      // Verify structure is maintained
      expect(reparsedDoc.scxml.name).toBe("comprehensive-test");
      expect(reparsedDoc.scxml.datamodel_element!.data).toHaveLength(3);
      expect(reparsedDoc.scxml.script).toHaveLength(1);
      expect(reparsedDoc.scxml.state).toHaveLength(3);
      expect(reparsedDoc.scxml.parallel).toHaveLength(1);
      expect(reparsedDoc.scxml.final).toHaveLength(1);

      // Verify nested structure
      const processing = reparsedDoc.scxml.state!.find(
        (s) => s.id === "processing"
      )!;
      expect(processing.invoke).toHaveLength(1);
      expect(processing.state![0].id).toBe("waiting");
      expect(processing.state![0].history).toHaveLength(1);

      // Verify parallel structure
      expect(reparsedDoc.scxml.parallel![0].state).toHaveLength(2);

      // Verify actions are preserved
      const start = reparsedDoc.scxml.state!.find((s) => s.id === "start")!;
      expect(start.onentry![0].log).toHaveLength(1);
      expect(start.onentry![0].assign).toHaveLength(1);
      expect(start.onentry![0].script).toHaveLength(1);
    });

    it("should handle edge cases in round-trip serialization", () => {
      // Test with empty elements, special characters, and edge cases
      const edgeCaseXml = `<scxml xmlns="http://www.w3.org/2005/07/scxml">
  <datamodel>
    <data id="empty"/>
    <data id="special">&lt;&gt;&amp;&quot;'</data>
    <data id="unicode">🚀 Test 日本語</data>
  </datamodel>
  <state id="test">
    <transition event="" target=""/>
    <transition cond=""/>
  </state>
  <state id="empty-state"/>
  <parallel id="empty-parallel"/>
  <final id="empty-final"/>
</scxml>`;

      const parsedDoc = parser.parse(edgeCaseXml);
      const serializedXml = serializer.serialize(parsedDoc);
      const reparsedDoc = parser.parse(serializedXml);

      expect(reparsedDoc.scxml.state).toHaveLength(2);
      expect(reparsedDoc.scxml.parallel).toHaveLength(1);
      expect(reparsedDoc.scxml.final).toHaveLength(1);

      const specialData = reparsedDoc.scxml.datamodel_element!.data!.find(
        (d) => d.id === "special"
      );
      expect(specialData!.content).toContain("<>&\"'");

      const unicodeData = reparsedDoc.scxml.datamodel_element!.data!.find(
        (d) => d.id === "unicode"
      );
      expect(unicodeData!.content).toContain("🚀");
      expect(unicodeData!.content).toContain("日本語");
    });
  });

  describe("performance and scalability", () => {
    it("should serialize large documents efficiently", () => {
      const builder = SCXMLBuilder.create()
        .name("large-machine")
        .initial("state_0");

      // Create a large state machine
      for (let i = 0; i < 500; i++) {
        builder.addState(
          StateBuilder.create(`state_${i}`)
            .addTransition(
              TransitionBuilder.create()
                .event(`event_${i}`)
                .target(`state_${(i + 1) % 500}`)
                .addLog({ expr: `"State ${i} transition"` })
                .addAssign({ location: "currentState", expr: `${i}` })
                .build()
            )
            .build()
        );
      }

      const doc = builder.build();

      const start = Date.now();
      const xml = serializer.serialize(doc);
      const serializationTime = Date.now() - start;

      expect(serializationTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(xml.length).toBeGreaterThan(10000); // Should be substantial
      expect(xml).toContain("state_499");

      // Verify it can be parsed back
      const parseStart = Date.now();
      const parsedDoc = parser.parse(xml);
      const parseTime = Date.now() - parseStart;

      expect(parseTime).toBeLessThan(2000);
      expect(parsedDoc.scxml.state).toHaveLength(500);
    });

    it("should handle deeply nested structures efficiently", () => {
      // Build from inside out to create proper nesting
      let currentState = StateBuilder.create("level_50").build();

      // Create 50 levels of nesting, working backwards
      for (let i = 49; i >= 1; i--) {
        const parentBuilder = StateBuilder.create(`level_${i}`).initial(
          `level_${i + 1}`
        );
        parentBuilder.addState(currentState);
        currentState = parentBuilder.build();
      }

      // Create root state
      const rootBuilder = StateBuilder.create("root").initial("level_1");
      rootBuilder.addState(currentState);

      const doc = SCXMLBuilder.create()
        .name("deep-nesting")
        .initial("root")
        .addState(rootBuilder.build())
        .build();

      const start = Date.now();
      const xml = serializer.serialize(doc);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000);
      expect(xml).toContain("level_50");

      // Verify parsing still works
      const parsedDoc = parser.parse(xml);
      expect(parsedDoc.scxml.state![0].id).toBe("root");
    });
  });

  // Helper function for finding states recursively
  function findStateRecursive(states: any[], id: string): any {
    for (const state of states) {
      if (state.id === id) return state;
      if (state.state) {
        const found = findStateRecursive(state.state, id);
        if (found) return found;
      }
    }
    return null;
  }
});
