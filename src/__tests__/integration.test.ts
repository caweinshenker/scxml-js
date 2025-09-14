/**
 * Integration tests for the SCXML parser library
 * Tests the complete workflow of parsing, creating, modifying, validating, and serializing SCXML documents
 */

import { SCXML } from '../index';

describe('SCXML Parser Integration Tests', () => {
  it('should complete a full workflow: create -> modify -> validate -> serialize', () => {
    // 1. Create a document using the builder API
    const document = SCXML.create()
      .name('workflow-test')
      .initial('start')
      .datamodel('ecmascript')
      .addDataModel(SCXML.dataModel()
        .addData(SCXML.data('counter').expr('0').build())
        .build())
      .addState(SCXML.state('start')
        .addOnEntry(SCXML.onEntry()
          .addLog({ label: 'Starting workflow' })
          .build())
        .addTransition(SCXML.transition()
          .event('begin')
          .target('processing')
          .build())
        .build())
      .addState(SCXML.state('processing')
        .addOnEntry(SCXML.onEntry()
          .addAssign({ location: 'counter', expr: 'counter + 1' })
          .build())
        .addTransition(SCXML.transition()
          .event('complete')
          .target('end')
          .build())
        .build())
      .addState(SCXML.state('end').build())
      .build();

    // 2. Validate the created document
    const errors = SCXML.validate(document);
    expect(errors).toHaveLength(0);

    // 3. Modify the document
    const modifier = SCXML.modify(document);
    modifier.addState(SCXML.state('error')
      .addOnEntry(SCXML.onEntry()
        .addLog({ label: 'Error occurred' })
        .build())
      .build());

    // Add error transitions to existing states
    const processingState = modifier.findState('processing');
    expect(processingState).toBeDefined();

    modifier.addTransitionToState('processing', SCXML.transition()
      .event('error')
      .target('error')
      .build());

    const modifiedDocument = modifier.getDocument();

    // 4. Validate the modified document
    const modifiedErrors = SCXML.validate(modifiedDocument);
    expect(modifiedErrors).toHaveLength(0);

    // 5. Serialize the document to XML
    const xml = SCXML.serialize(modifiedDocument, {
      spaces: 2
    });

    expect(xml).toContain('workflow-test');
    expect(xml).toContain('counter');
    expect(xml).toContain('error');

    // 6. Parse the serialized XML back to document
    const parsedDocument = SCXML.parse(xml);
    expect(parsedDocument.scxml.name).toBe('workflow-test');
    expect(parsedDocument.scxml.initial).toBe('start');
    expect(parsedDocument.scxml.state).toHaveLength(4); // start, processing, end, error

    // 7. Final validation
    const finalErrors = SCXML.validate(parsedDocument);
    expect(finalErrors).toHaveLength(0);
  });

  it('should handle complex nested state machines', () => {
    // Create a hierarchical state machine
    const document = SCXML.create()
      .name('nested-machine')
      .initial('application')
      .addState(SCXML.state('application')
        .initial('loading')
        .addState(SCXML.state('loading')
          .addTransition(SCXML.transition()
            .event('loaded')
            .target('menu')
            .build())
          .build())
        .addState(SCXML.state('menu')
          .addTransition(SCXML.transition()
            .event('start_game')
            .target('game')
            .build())
          .build())
        .addState(SCXML.state('game')
          .initial('playing')
          .addState(SCXML.state('playing')
            .addTransition(SCXML.transition()
              .event('pause')
              .target('paused')
              .build())
            .build())
          .addState(SCXML.state('paused')
            .addTransition(SCXML.transition()
              .event('resume')
              .target('playing')
              .build())
            .build())
          .build())
        .build())
      .build();

    // Validate the nested structure
    const errors = SCXML.validate(document);
    expect(errors).toHaveLength(0);

    // Test serialization and parsing
    const xml = SCXML.serialize(document);
    const parsed = SCXML.parse(xml);

    expect(parsed.scxml.name).toBe('nested-machine');
    expect(parsed.scxml.state![0].id).toBe('application');
    expect(parsed.scxml.state![0].initial).toBe('loading');
  });

  it('should handle parallel states and complex transitions', () => {
    const document = SCXML.create()
      .name('parallel-test')
      .initial('running')
      .addState(SCXML.parallel('running')
        .addState(SCXML.state('network')
          .initial('connected')
          .addState(SCXML.state('connected')
            .addTransition(SCXML.transition()
              .event('disconnect')
              .target('disconnected')
              .build())
            .build())
          .addState(SCXML.state('disconnected')
            .addTransition(SCXML.transition()
              .event('connect')
              .target('connected')
              .build())
            .build())
          .build())
        .addState(SCXML.state('ui')
          .initial('idle')
          .addState(SCXML.state('idle')
            .addTransition(SCXML.transition()
              .event('user_input')
              .target('active')
              .build())
            .build())
          .addState(SCXML.state('active')
            .addTransition(SCXML.transition()
              .event('timeout')
              .target('idle')
              .build())
            .build())
          .build())
        .build())
      .build();

    const errors = SCXML.validate(document);
    expect(errors).toHaveLength(0);

    const xml = SCXML.serialize(document);
    expect(xml).toContain('network');
    expect(xml).toContain('ui');

    // Check that the running state contains both network and ui states
    const runningState = document.scxml.state![0];
    expect(runningState.id).toBe('running');
    expect(runningState.state).toHaveLength(2);
  });
});