#!/usr/bin/env node

/**
 * Test SCXML Submodule Resolution
 *
 * This example demonstrates:
 * 1. Loading external JSON data sources
 * 2. Invoking external SCXML sub-modules
 * 3. Using the enhanced parser with module resolution
 */

const path = require('path');
const { SCXMLParser, SCXMLModuleResolver } = require('../../../../dist/index.js');

async function testSubmodules() {
  console.log('🔗 SCXML Submodule Resolution Test');
  console.log('==================================\n');

  try {
    // 1. Create parser with resolver
    const parser = new SCXMLParser();
    const resolver = new SCXMLModuleResolver({
      basePath: __dirname,
      cache: true,
      maxDepth: 5
    });

    parser.setResolver(resolver);

    console.log('📂 Loading main SCXML with external references...');

    // 2. Load SCXML file with external references
    const fs = require('fs').promises;
    const mainScxmlPath = path.join(__dirname, 'main-with-submodules.scxml');
    const scxmlContent = await fs.readFile(mainScxmlPath, 'utf-8');

    console.log('🔄 Parsing with resolution...');

    // 3. Parse with external reference resolution
    const document = await parser.parseWithResolution(scxmlContent, mainScxmlPath);

    console.log('✅ Parsing completed!\n');

    // 4. Show resolved external references
    console.log('📊 Resolution Results:');
    console.log('===================');

    // Check resolved data
    if (document.scxml.datamodel_element?.data) {
      for (const data of document.scxml.datamodel_element.data) {
        if (data.src?.startsWith('[resolved]')) {
          console.log(`✅ Data "${data.id}": ${data.src}`);
          console.log(`   Content: ${data.content?.substring(0, 100)}...`);
        }
      }
    }

    // Check resolved invokes
    const checkInvokes = (states) => {
      if (!states) return;

      for (const state of states) {
        if (state.invoke) {
          for (const invoke of state.invoke) {
            if (invoke.src?.startsWith('[resolved]')) {
              console.log(`✅ Invoke "${invoke.id}": ${invoke.src}`);
              console.log(`   Type: ${invoke.type}`);
            }
          }
        }

        if (state.state) {
          checkInvokes(state.state);
        }
      }
    };

    if (document.scxml.state) {
      checkInvokes(document.scxml.state);
    }

    // 5. Show cache statistics
    console.log('\n📈 Cache Statistics:');
    const stats = resolver.getCacheStats();
    console.log(`   Cached items: ${stats.size}`);
    console.log(`   Cache keys: ${stats.keys.join(', ')}`);

    // 6. Show document structure
    console.log('\n🏗️  Document Structure:');
    console.log('====================');
    console.log(`Machine: ${document.scxml.name}`);
    console.log(`Initial: ${document.scxml.initial}`);
    console.log(`States: ${document.scxml.state?.length || 0}`);
    console.log(`Data elements: ${document.scxml.datamodel_element?.data?.length || 0}`);

    console.log('\n🎉 Submodule resolution test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing submodules:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testSubmodules();
}