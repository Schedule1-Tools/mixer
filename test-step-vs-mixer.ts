import { mixSubstances } from './src/core/mixer';
import { step, maskOf, key } from './example';
import { compiledSubstances } from './example';
import { products } from './src/data/products';
import { effects } from './src/data/effects';

// Test the known solution sequence
const knownSolution: any[] = [
  'Gasoline', 'Cuke', 'Mega Bean', 'Battery', 'Energy Drink', 
  'Banana', 'Cuke', 'Horse Semen', 'Viagor', 'Energy Drink', 
  'Mega Bean', 'Mouth Wash'
];

console.log('Testing step function vs mixer...\n');

// Use mixer
const mixerResult = mixSubstances('Cocaine', knownSolution);
console.log('Mixer result:', mixerResult.effects.sort().join(', '));

// Use step function
let state = maskOf(products['Cocaine'].effects ?? []);
for (const subName of knownSolution) {
  const sub = compiledSubstances.find(s => s.code === subName);
  if (sub) {
    state = step(state, sub);
  }
}

// Convert state back to effect codes
const effectCodes = Object.keys(effects) as any[];
const stepEffects: string[] = [];
for (let i = 0; i < effectCodes.length; i++) {
  // Check if bit is set
  const bitIdx = i;
  let isSet = false;
  if (bitIdx < 32) {
    isSet = ((state.lo >>> bitIdx) & 1) === 1;
  } else {
    isSet = ((state.hi >>> (bitIdx - 32)) & 1) === 1;
  }
  if (isSet) {
    stepEffects.push(effectCodes[i]);
  }
}

console.log('Step function result:', stepEffects.sort().join(', '));
console.log('\nMatch:', JSON.stringify(mixerResult.effects.sort()) === JSON.stringify(stepEffects.sort()));

// Check each step
console.log('\nStep-by-step comparison:');
let stepState = maskOf(products['Cocaine'].effects ?? []);
for (let i = 0; i < knownSolution.length; i++) {
  const prefix = knownSolution.slice(0, i + 1);
  const mixerStep = mixSubstances('Cocaine', prefix);
  const sub = compiledSubstances.find(s => s.code === knownSolution[i]);
  if (sub) {
    stepState = step(stepState, sub);
  }
  
  const stepEffects: string[] = [];
  for (let j = 0; j < effectCodes.length; j++) {
    const bitIdx = j;
    let isSet = false;
    if (bitIdx < 32) {
      isSet = ((stepState.lo >>> bitIdx) & 1) === 1;
    } else {
      isSet = ((stepState.hi >>> (bitIdx - 32)) & 1) === 1;
    }
    if (isSet) {
      stepEffects.push(effectCodes[j]);
    }
  }
  
  const match = JSON.stringify(mixerStep.effects.sort()) === JSON.stringify(stepEffects.sort());
  console.log(`  Step ${i + 1} (${knownSolution[i]}): ${match ? '✅' : '❌'} - Mixer: ${mixerStep.effects.length}, Step: ${stepEffects.length}`);
  if (!match) {
    console.log(`    Mixer: ${mixerStep.effects.sort().join(', ')}`);
    console.log(`    Step:  ${stepEffects.sort().join(', ')}`);
  }
}
