#!/usr/bin/env node

/**
 * Working FizzBuzz Example using SCXML -> XState Conversion
 */

const path = require('path');
const { createMachine, createActor, assign } = require('xstate');
const { Converter } = require('../../dist/index.js');

async function runFizzBuzzDemo() {
  console.log('🎯 Working FizzBuzz SCXML -> XState Demo');
  console.log('=======================================\n');

  try {
    // 1. Load and convert SCXML
    console.log('📂 Loading working FizzBuzz SCXML...');
    const scxmlPath = path.join(__dirname, 'fizzbuzz-working.scxml');
    const result = await Converter.load(scxmlPath);

    console.log('✅ Conversion successful!');
    console.log(`   Machine: ${result.machine.id}`);
    console.log(`   Actions: ${Object.keys(result.actions).length}`);
    console.log(`   Guards: ${Object.keys(result.guards).length}\n`);

    // 2. Create XState machine
    const machine = createMachine({
      ...result.machine
    }, {
      actions: {
        // Convert our function-based actions to XState actions
        ...Object.fromEntries(
          Object.entries(result.actions).map(([key, fn]) => [
            key,
            typeof fn === 'function' ?
              assign((context, event) => {
                try {
                  const result = fn(context, event);
                  if (typeof result === 'string') {
                    // This is a log action
                    console.log(result);
                    return {};
                  } else if (typeof result === 'object' && result !== null) {
                    // This is an assign action
                    return result;
                  }
                  return {};
                } catch (error) {
                  console.error('Action error:', error);
                  return {};
                }
              }) :
              fn
          ])
        )
      },
      guards: {
        // Convert our function-based guards to XState guards
        ...Object.fromEntries(
          Object.entries(result.guards).map(([key, fn]) => [
            key,
            typeof fn === 'function' ? fn : () => false
          ])
        )
      }
    });

    // 3. Run the machine
    console.log('🚀 Running FizzBuzz...\n');

    let stepCount = 0;
    const maxSteps = 100; // Safety limit

    const actor = createActor(machine);

    actor.subscribe((snapshot) => {
      stepCount++;
      const { value, context } = snapshot;

      console.log(`Step ${stepCount}: State=${value}, Counter=${context.counter}, Max=${context.max}`);

      if (stepCount >= maxSteps) {
        console.log('\n⚠️  Reached maximum step limit (safety stop)');
        actor.stop();
      }

      if (snapshot.status === 'done') {
        console.log('\n🎉 FizzBuzz completed!');
        actor.stop();
      }
    });

    actor.start();

    // Manual demonstration of FizzBuzz logic
    console.log('\n🧮 Manual FizzBuzz verification (1-20):');
    for (let i = 1; i <= 20; i++) {
      const output = i % 15 === 0 ? 'FizzBuzz' :
                    i % 3 === 0 ? 'Fizz' :
                    i % 5 === 0 ? 'Buzz' : i;
      console.log(`${i}: ${output}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

runFizzBuzzDemo();