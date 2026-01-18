import { effects } from './src/data/effects';
import { effectIndex, maskOf, has, isSuperset } from './example';

const effectCodes = Object.keys(effects) as any[];

console.log('Effect index mapping:');
for (let i = 0; i < effectCodes.length; i++) {
  const code = effectCodes[i];
  const idx = effectIndex.get(code);
  console.log(`  ${code}: index ${idx} (expected ${i})`);
  if (idx !== i) {
    console.log(`    ⚠️  MISMATCH!`);
  }
}

console.log('\nTesting Cy mask:');
const cyMask = maskOf(['Cy']);
const cyIdx = effectIndex.get('Cy');
console.log(`Cy index: ${cyIdx}`);
console.log(`Cy mask: lo=${cyMask.lo.toString(2)}, hi=${cyMask.hi.toString(2)}`);

console.log('\nTesting state with Cy:');
const stateWithCy = maskOf(['Cy', 'Eu', 'Fo']);
console.log(`State mask: lo=${stateWithCy.lo.toString(2)}, hi=${stateWithCy.hi.toString(2)}`);
console.log(`Has Cy: ${has(stateWithCy, cyIdx!)}`);
console.log(`isSuperset check: ${isSuperset(stateWithCy, cyMask)}`);

console.log('\nTesting isSuperset logic:');
const stateLo = stateWithCy.lo;
const targetLo = cyMask.lo;
const stateHi = stateWithCy.hi;
const targetHi = cyMask.hi;
console.log(`state.lo & target.lo = ${(stateLo & targetLo).toString(2)}`);
console.log(`target.lo = ${targetLo.toString(2)}`);
console.log(`Match lo: ${(stateLo & targetLo) === targetLo}`);
console.log(`state.hi & target.hi = ${(stateHi & targetHi).toString(2)}`);
console.log(`target.hi = ${targetHi.toString(2)}`);
console.log(`Match hi: ${(stateHi & targetHi) === targetHi}`);
