import { mixSubstances } from './src/core/mixer';
import { step, maskOf, isSuperset, key } from './example';
import { compiledSubstances } from './example';
import { products } from './src/data/products';
import { effects } from './src/data/effects';

// Test the solution found by the reverse solver
const foundSolution = ['Cuke', 'Battery', 'Gasoline', 'Iodine', 'Mega Bean', 'Addy', 'Horse Semen', 'Energy Drink', 'Mega Bean', 'Motor Oil'];
const requestedEffects = ['Be', 'Gl', 'Ag', 'Cy', 'El', 'Lf', 'Sh', 'Zo'];

console.log('Testing found solution:');
console.log(`Sequence: ${foundSolution.join(' → ')}\n`);

const result = mixSubstances('Cocaine', foundSolution);
console.log('Mixer result:', result.effects.sort().join(', '));
console.log('Requested:', requestedEffects.sort().join(', '));

// Check with step function
let state = maskOf(products['Cocaine'].effects ?? []);
for (const subName of foundSolution) {
  const sub = compiledSubstances.find(s => s.code === subName);
  if (sub) {
    state = step(state, sub);
  }
}

const target = maskOf(requestedEffects);
const isSolution = isSuperset(state, target);
console.log(`\nisSuperset check: ${isSolution}`);

// Convert state to effects
const effectCodes = Object.keys(effects) as any[];
const stepEffects: string[] = [];
for (let i = 0; i < effectCodes.length; i++) {
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

console.log('Step function effects:', stepEffects.sort().join(', '));
console.log('Has all target effects:', requestedEffects.every(eff => stepEffects.includes(eff)));
