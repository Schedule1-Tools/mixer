import { mixSubstances } from './src/core/mixer';
import { step, maskOf } from './example';
import { compiledSubstances } from './example';
import { products } from './src/data/products';
import { effects } from './src/data/effects';

// Test just the first 4 steps to see where the divergence happens
const prefix = ['Gasoline', 'Cuke', 'Mega Bean', 'Battery'];

console.log('Testing step-by-step up to Battery...\n');

// Use mixer
const mixerResult = mixSubstances('Cocaine', prefix);
console.log('Mixer after Battery:', mixerResult.effects.sort().join(', '));

// Use step function
let state = maskOf(products['Cocaine'].effects ?? []);
console.log('\nStep function progression:');
for (let i = 0; i < prefix.length; i++) {
  const subName = prefix[i];
  const sub = compiledSubstances.find(s => s.code === subName);
  if (sub) {
    console.log(`\nBefore ${subName}:`);
    const beforeEffects: string[] = [];
    const effectCodes = Object.keys(effects) as any[];
    for (let j = 0; j < effectCodes.length; j++) {
      const bitIdx = j;
      let isSet = false;
      if (bitIdx < 32) {
        isSet = ((state.lo >>> bitIdx) & 1) === 1;
      } else {
        isSet = ((state.hi >>> (bitIdx - 32)) & 1) === 1;
      }
      if (isSet) {
        beforeEffects.push(effectCodes[j]);
      }
    }
    console.log('  Effects:', beforeEffects.sort().join(', '));
    
    state = step(state, sub);
    
    console.log(`After ${subName}:`);
    const afterEffects: string[] = [];
    for (let j = 0; j < effectCodes.length; j++) {
      const bitIdx = j;
      let isSet = false;
      if (bitIdx < 32) {
        isSet = ((state.lo >>> bitIdx) & 1) === 1;
      } else {
        isSet = ((state.hi >>> (bitIdx - 32)) & 1) === 1;
      }
      if (isSet) {
        afterEffects.push(effectCodes[j]);
      }
    }
    console.log('  Effects:', afterEffects.sort().join(', '));
    
    // Check what mixer produces at this step
    const mixerStep = mixSubstances('Cocaine', prefix.slice(0, i + 1));
    console.log('  Mixer:  ', mixerStep.effects.sort().join(', '));
    console.log('  Match:  ', JSON.stringify(afterEffects.sort()) === JSON.stringify(mixerStep.effects.sort()) ? '✅' : '❌');
  }
}
