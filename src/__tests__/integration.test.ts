import { SCXML } from '../index';

describe('SCXML Library Integration', () => {
  describe('complete workflow demonstration', () => {
    it('should demonstrate the full library workflow', () => {
      // 1. Create an SCXML document using the builder API
      const originalDocument = SCXML.create()
        .name('ai-agent-world-model')
        .initial('initializing')
        .datamodel('ecmascript')
        .addDataModel(SCXML.dataModel()
          .addData(SCXML.data('currentTask').expr('null').build())
          .addData(SCXML.data('confidence').expr('0.0').build())
          .addData(SCXML.data('worldState').content('{}').build())
          .build())
        .addState(SCXML.state('initializing')
          .addOnEntry(SCXML.onEntry()
            .addLog({ label: 'Agent initializing' })
            .addAssign({ location: 'confidence', expr: '0.1' })
            .build())
          .addTransition(SCXML.transition()
            .event('ready')
            .cond('confidence > 0')
            .target('idle')
            .addLog({ expr: '"Agent ready to receive tasks"' })
            .build())
          .build())
        .addState(SCXML.state('idle')
          .addTransition(SCXML.transition()
            .event('task.assigned')
            .target('processing')
            .addAssign({ location: 'currentTask', expr: '_event.data.task' })
            .build())
          .build())
        .addState(SCXML.state('processing')
          .addOnEntry(SCXML.onEntry()
            .addLog({ expr: '"Processing task: " + currentTask' })
            .addAssign({ location: 'confidence', expr: 'confidence + 0.1' })
            .build())
          .addParallel(SCXML.parallel('analysis')
            .addState(SCXML.state('understanding')
              .initial('parsing')
              .addState(SCXML.state('parsing')
                .addTransition(SCXML.transition()
                  .event('parsed')
                  .target('analyzing')
                  .build())
                .build())
              .addState(SCXML.state('analyzing')
                .addTransition(SCXML.transition()
                  .event('understood')
                  .target('../../planning')
                  .build())
                .build())
              .build())
            .addState(SCXML.state('monitoring')
              .addInvoke(SCXML.invoke()
                .type('http')
                .src('/api/system-monitor')
                .id('monitor')
                .build())
              .build())
            .build())
          .addTransition(SCXML.transition()
            .event('task.completed')
            .target('reporting')
            .build())
          .build())
        .addState(SCXML.state('planning')
          .addOnEntry(SCXML.onEntry()
            .addLog({ label: 'Creating execution plan' })
            .build())
          .addTransition(SCXML.transition()
            .event('plan.ready')
            .target('executing')
            .build())
          .build())
        .addState(SCXML.state('executing')
          .addOnEntry(SCXML.onEntry()
            .addAssign({ location: 'confidence', expr: 'Math.min(confidence + 0.2, 1.0)' })
            .build())
          .addTransition(SCXML.transition()
            .event('execution.complete')
            .target('reporting')
            .build())
          .addTransition(SCXML.transition()
            .event('error')
            .target('error-handling')
            .build())
          .build())
        .addState(SCXML.state('error-handling')
          .addOnEntry(SCXML.onEntry()
            .addLog({ expr: '"Handling error: " + _event.data.error' })
            .addAssign({ location: 'confidence', expr: 'Math.max(confidence - 0.3, 0.0)' })
            .build())
          .addTransition(SCXML.transition()
            .event('retry')
            .cond('confidence > 0.3')
            .target('processing')
            .build())
          .addTransition(SCXML.transition()
            .event('abort')
            .target('idle')
            .addAssign({ location: 'currentTask', expr: 'null' })
            .build())
          .build())
        .addState(SCXML.state('reporting')
          .addOnEntry(SCXML.onEntry()
            .addLog({ label: 'Generating report' })
            .addSend({ event: 'task.report', target: 'supervisor' })
            .build())
          .addTransition(SCXML.transition()
            .event('report.sent')
            .target('idle')
            .addAssign({ location: 'currentTask', expr: 'null' })
            .build())
          .build())
        .addFinal({
          id: 'shutdown',
          onentry: [SCXML.onEntry()
            .addLog({ label: 'Agent shutting down' })
            .build()],
          donedata: {
            content: {
              expr: '{ "finalConfidence": confidence, "completedTasks": completedTasks }'
            }
          }
        })
        .build();

      // 2. Validate the document
      const validationErrors = SCXML.validate(originalDocument);
      expect(validationErrors).toHaveLength(0);

      // 3. Serialize to XML
      const xmlString = SCXML.serialize(originalDocument, { spaces: 2 });
      expect(xmlString).toContain('<scxml');
      expect(xmlString).toContain('name="ai-agent-world-model"');
      expect(xmlString).toContain('<state id="initializing"');

      // 4. Parse the XML back to a document
      const parsedDocument = SCXML.parse(xmlString);
      expect(parsedDocument.scxml.name).toBe('ai-agent-world-model');
      expect(parsedDocument.scxml.initial).toBe('initializing');

      // 5. Modify the parsed document
      const modifier = SCXML.modify(parsedDocument)
        .addState(SCXML.state('maintenance')
          .addOnEntry(SCXML.onEntry()
            .addLog({ label: 'Entering maintenance mode' })
            .build())
          .build())
        .addTransitionToState('idle', SCXML.transition()
          .event('maintenance.required')
          .target('maintenance')
          .build());

      const modifiedDocument = modifier.getDocument();

      // Verify the modification worked
      const maintenanceState = modifier.findState('maintenance');
      expect(maintenanceState).toBeDefined();
      expect(maintenanceState!.id).toBe('maintenance');

      const idleState = modifier.findState('idle');
      expect(idleState!.transition).toHaveLength(2); // Original + new transition

      // 6. Convert to XState
      const xstateConfig = SCXML.toXState(modifiedDocument);
      expect(xstateConfig.id).toBe('ai-agent-world-model');
      expect(xstateConfig.initial).toBe('initializing');
      expect(xstateConfig.context).toHaveProperty('currentTask');
      expect(xstateConfig.context).toHaveProperty('confidence');
      expect(xstateConfig.states).toHaveProperty('initializing');
      expect(xstateConfig.states).toHaveProperty('maintenance');

      // 7. Create XState machine
      const machine = SCXML.createMachine(modifiedDocument);
      expect(machine.id).toBe('ai-agent-world-model');
      expect(machine.initialState.value).toBe('initializing');
      expect(machine.initialState.context.confidence).toBe(0.0);

      // Test some state transitions
      let currentState = machine.initialState;
      expect(currentState.value).toBe('initializing');

      currentState = machine.transition(currentState, 'ready');
      expect(currentState.value).toBe('idle');

      currentState = machine.transition(currentState, {
        type: 'task.assigned',
        data: { task: 'analyze-data' }
      });
      expect(currentState.value).toEqual({ processing: 'analysis' });

      // 8. Validate the modified document
      const modifiedValidationErrors = SCXML.validate(modifiedDocument);
      expect(modifiedValidationErrors).toHaveLength(0);

      // 9. Serialize the modified document
      const modifiedXml = SCXML.serialize(modifiedDocument);
      expect(modifiedXml).toContain('<state id="maintenance"');
    });

    it('should handle real-world SCXML parsing and conversion', () => {
      // Example of parsing an existing SCXML document that might come from an external system
      const externalScxml = `
        <scxml name="chatbot-dialogue" version="1.0" datamodel="ecmascript" initial="greeting" xmlns="http://www.w3.org/2005/07/scxml">
          <datamodel>
            <data id="userName" expr="null"/>
            <data id="conversationContext" expr="{}"/>
            <data id="confidenceScore" expr="0.8"/>
          </datamodel>

          <state id="greeting">
            <onentry>
              <log label="Bot: Hello! How can I help you today?"/>
              <send event="bot.message" target="ui">
                <param name="text" expr="'Hello! How can I help you today?'"/>
              </send>
            </onentry>

            <transition event="user.message" target="understanding">
              <assign location="conversationContext.lastUserMessage" expr="_event.data.text"/>
            </transition>
          </state>

          <state id="understanding">
            <invoke id="nlp-service" type="http" src="/api/nlp/understand" autoforward="false">
              <param name="text" expr="conversationContext.lastUserMessage"/>
              <param name="context" expr="conversationContext"/>
            </invoke>

            <transition event="nlp.understood" target="responding">
              <assign location="conversationContext.intent" expr="_event.data.intent"/>
              <assign location="conversationContext.entities" expr="_event.data.entities"/>
              <assign location="confidenceScore" expr="_event.data.confidence"/>
            </transition>

            <transition event="nlp.error" target="fallback">
              <log expr="'NLP service error: ' + _event.data.error"/>
            </transition>
          </state>

          <state id="responding">
            <onentry>
              <if cond="confidenceScore > 0.7">
                <raise event="high.confidence"/>
              </if>
              <if cond="confidenceScore <= 0.7 && confidenceScore > 0.3">
                <raise event="medium.confidence"/>
              </if>
              <if cond="confidenceScore <= 0.3">
                <raise event="low.confidence"/>
              </if>
            </onentry>

            <transition event="high.confidence" target="generating-response">
              <assign location="conversationContext.strategy" expr="'direct'"/>
            </transition>

            <transition event="medium.confidence" target="clarifying">
              <assign location="conversationContext.strategy" expr="'clarify'"/>
            </transition>

            <transition event="low.confidence" target="fallback">
              <assign location="conversationContext.strategy" expr="'fallback'"/>
            </transition>
          </state>

          <state id="clarifying">
            <onentry>
              <send event="bot.message" target="ui">
                <param name="text" expr="'I want to make sure I understand. Are you asking about ' + conversationContext.intent + '?'"/>
              </send>
            </onentry>

            <transition event="user.confirmed" target="generating-response"/>
            <transition event="user.denied" target="fallback"/>
            <transition event="user.message" target="understanding"/>
          </state>

          <state id="generating-response">
            <invoke id="response-generator" type="http" src="/api/response/generate">
              <param name="intent" expr="conversationContext.intent"/>
              <param name="entities" expr="conversationContext.entities"/>
              <param name="strategy" expr="conversationContext.strategy"/>
            </invoke>

            <transition event="response.generated" target="delivering">
              <assign location="conversationContext.botResponse" expr="_event.data.response"/>
            </transition>

            <transition event="response.error" target="fallback"/>
          </state>

          <state id="delivering">
            <onentry>
              <send event="bot.message" target="ui">
                <param name="text" expr="conversationContext.botResponse"/>
              </send>
              <log expr="'Bot: ' + conversationContext.botResponse"/>
            </onentry>

            <transition event="message.delivered" target="waiting"/>
          </state>

          <state id="waiting">
            <transition event="user.message" target="understanding"/>
            <transition event="conversation.end" target="goodbye"/>
            <transition event="timeout" target="prompting" cond="confidenceScore > 0.5"/>
          </state>

          <state id="prompting">
            <onentry>
              <send event="bot.message" target="ui">
                <param name="text" expr="'Is there anything else I can help you with?'"/>
              </send>
            </onentry>

            <transition event="user.message" target="understanding"/>
            <transition event="timeout" target="goodbye"/>
          </state>

          <state id="fallback">
            <onentry>
              <log label="Using fallback response"/>
              <send event="bot.message" target="ui">
                <param name="text" expr="'I apologize, but I did not quite understand that. Could you please rephrase your question?'"/>
              </send>
            </onentry>

            <transition event="user.message" target="understanding"/>
            <transition event="escalate" target="human-handoff"/>
          </state>

          <state id="human-handoff">
            <onentry>
              <log label="Escalating to human agent"/>
              <send event="escalate.request" target="human-service">
                <param name="conversationContext" expr="conversationContext"/>
                <param name="reason" expr="'bot-confidence-low'"/>
              </send>
            </onentry>

            <transition event="human.available" target="goodbye">
              <send event="bot.message" target="ui">
                <param name="text" expr="'I am connecting you with a human agent who can better assist you.'"/>
              </send>
            </transition>
          </state>

          <state id="goodbye">
            <onentry>
              <send event="bot.message" target="ui">
                <param name="text" expr="'Thank you for chatting with me today. Have a great day!'"/>
              </send>
              <log label="Conversation ended"/>
            </onentry>

            <transition event="message.delivered" target="ended"/>
          </state>

          <final id="ended">
            <donedata>
              <content expr="{ conversationContext: conversationContext, finalConfidence: confidenceScore }"/>
            </donedata>
          </final>
        </scxml>
      `;

      // Parse the external SCXML
      const document = SCXML.parse(externalScxml);

      // Validate it
      const errors = SCXML.validate(document);
      expect(errors).toHaveLength(0);

      // Convert to XState machine
      const machine = SCXML.createMachine(document);
      expect(machine.id).toBe('chatbot-dialogue');
      expect(machine.initialState.value).toBe('greeting');

      // Test the conversation flow
      let state = machine.initialState;

      // Start conversation
      expect(state.value).toBe('greeting');
      expect(state.context.userName).toBeNull();
      expect(state.context.confidenceScore).toBe(0.8);

      // User sends a message
      state = machine.transition(state, {
        type: 'user.message',
        data: { text: 'Hello, I need help with my account' }
      });
      expect(state.value).toBe('understanding');
      expect(state.context.conversationContext.lastUserMessage).toBe('Hello, I need help with my account');

      // NLP service responds
      state = machine.transition(state, {
        type: 'nlp.understood',
        data: {
          intent: 'account_help',
          entities: { account_type: 'checking' },
          confidence: 0.85
        }
      });
      expect(state.value).toBe('responding');

      // High confidence path
      state = machine.transition(state, 'high.confidence');
      expect(state.value).toBe('generating-response');
      expect(state.context.conversationContext.strategy).toBe('direct');

      // Modify the document to add new capabilities
      const modifier = SCXML.modify(document);

      // Add a new state for handling special requests
      modifier.addState(SCXML.state('special-handling')
        .addOnEntry(SCXML.onEntry()
          .addLog({ label: 'Handling special request' })
          .build())
        .addTransition(SCXML.transition()
          .event('special.handled')
          .target('delivering')
          .build())
        .build());

      // Add transition from understanding to special handling
      modifier.addTransitionToState('understanding', SCXML.transition()
        .event('special.request.detected')
        .cond('conversationContext.intent === "special_request"')
        .target('special-handling')
        .build());

      const modifiedDoc = modifier.getDocument();

      // Validate modified document
      const modifiedErrors = SCXML.validate(modifiedDoc);
      expect(modifiedErrors).toHaveLength(0);

      // Verify modifications
      const specialState = modifier.findState('special-handling');
      expect(specialState).toBeDefined();

      const understandingState = modifier.findState('understanding');
      expect(understandingState!.transition).toHaveLength(3); // Original 2 + new 1

      // Serialize back to XML
      const serialized = SCXML.serialize(modifiedDoc, { spaces: 2 });
      expect(serialized).toContain('<state id="special-handling"');
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle malformed SCXML gracefully', () => {
      const malformedXml = '<scxml><state id="test"</scxml>';

      expect(() => SCXML.parse(malformedXml)).toThrow();
    });

    it('should validate and report errors in invalid SCXML', () => {
      const invalidDocument = SCXML.create()
        .initial('nonexistent')
        .addState(SCXML.state('test').build())
        .build();

      const errors = SCXML.validate(invalidDocument);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.message.includes('does not exist'))).toBe(true);
    });

    it('should handle empty documents', () => {
      const emptyDoc = SCXML.create().build();

      const errors = SCXML.validate(emptyDoc);
      expect(errors.length).toBeGreaterThan(0);

      const xml = SCXML.serialize(emptyDoc);
      expect(xml).toContain('<scxml');
    });
  });

  describe('performance and scalability', () => {
    it('should handle large state machines efficiently', () => {
      const largeStateMachine = SCXML.create()
        .name('large-machine')
        .initial('state_0');

      // Create 100 states with transitions
      for (let i = 0; i < 100; i++) {
        const state = SCXML.state(`state_${i}`);

        if (i < 99) {
          state.addTransition(SCXML.transition()
            .event('next')
            .target(`state_${i + 1}`)
            .build());
        }

        largeStateMachine.addState(state.build());
      }

      const doc = largeStateMachine.build();

      // Should handle validation efficiently
      const start = Date.now();
      const errors = SCXML.validate(doc);
      const validationTime = Date.now() - start;

      expect(errors).toHaveLength(0);
      expect(validationTime).toBeLessThan(1000); // Should complete within 1 second

      // Should handle serialization efficiently
      const serializeStart = Date.now();
      const xml = SCXML.serialize(doc);
      const serializeTime = Date.now() - serializeStart;

      expect(xml).toContain('state_99');
      expect(serializeTime).toBeLessThan(1000);

      // Should handle XState conversion efficiently
      const xstateStart = Date.now();
      const xstateConfig = SCXML.toXState(doc);
      const xstateTime = Date.now() - xstateStart;

      expect(Object.keys(xstateConfig.states!)).toHaveLength(100);
      expect(xstateTime).toBeLessThan(1000);
    });
  });
});