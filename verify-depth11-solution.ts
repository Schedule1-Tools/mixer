import { mixSubstances } from './src/core/mixer';
import { step, maskOf, isSuperset } from './example';
import { compiledSubstances } from './example';
import { products } from './src/data/products';
import { effects } from './src/data/effects';

// The solution found at depth 11
const foundSolution = ['Cuke', 'Battery', 'Gasoline', 'Iodine', 'Mega Bean', 'Addy', 'Horse Semen', 'Energy Drink', 'Mega Bean', 'Motor Oil'];
const requestedEffects = ['Be', 'Gl', 'Ag', 'Cy', 'El', 'Lf', 'Sh', 'Zo'];

console.log('Testing depth 11 solution:');
console.log(`Sequence: ${foundSolution.join(' → ')}\n`);

const result = mixSubstances('Cocaine', foundSolution);
console.log('Mixer result:', result.effects.sort().join(', '));
console.log('Requested:', requestedEffects.sort().join(', '));
console.log('Has all requested:', requestedEffects.every(eff => result.effects.includes(eff)));

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

// Check what's missing
const missing = requestedEffects.filter(eff => !stepEffects.includes(eff));
console.log('Missing effects:', missing.join(', '));

// Check isSuperset manually
console.log('\nManual isSuperset check:');
const targetBits = target;
const stateBits = state;
console.log(`Target lo: 0x${targetBits.lo.toString(16)}, hi: 0x${targetBits.hi.toString(16)}`);
console.log(`State lo:  0x${stateBits.lo.toString(16)}, hi: 0x${stateBits.hi.toString(16)}`);
const andLo = (stateBits.lo & targetBits.lo) >>> 0;
const andHi = (stateBits.hi & targetBits.hi) >>> 0;
console.log(`AND lo:    0x${andLo.toString(16)}, hi: 0x${andHi.toString(16)}`);
console.log(`Match lo: ${andLo === (targetBits.lo >>> 0)}`);
console.log(`Match hi: ${andHi === (targetBits.hi >>> 0)}`);
