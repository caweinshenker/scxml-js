#!/usr/bin/env node

const path = require('path');
const { Converter } = require('../../dist/index.js');

async function testSimple() {
  try {
    console.log('Testing simple SCXML conversion...\n');

    const scxmlPath = path.join(__dirname, 'simple-test.scxml');
    const result = await Converter.load(scxmlPath);

    console.log('✅ Conversion successful!');
    console.log('Machine:', JSON.stringify(result.machine, null, 2));
    console.log('Actions:', Object.keys(result.actions));
    console.log('Guards:', Object.keys(result.guards));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSimple();