import { mixSubstances } from './src/core/mixer';

// Known solution sequence
const knownSolution: any[] = [
  'Gasoline', 'Cuke', 'Mega Bean', 'Battery', 'Energy Drink', 
  'Banana', 'Cuke', 'Horse Semen', 'Viagor', 'Energy Drink', 
  'Mega Bean', 'Mouth Wash'
];

const requestedEffects = ['Be', 'Gl', 'Ag', 'Cy', 'El', 'Lf', 'Sh', 'Zo'];

console.log('Verifying known solution...');
console.log(`Sequence: ${knownSolution.join(' → ')}\n`);

const result = mixSubstances('Cocaine', knownSolution);

console.log('Resulting effects:', result.effects.join(', '));
console.log('Requested effects:', requestedEffects.join(', '));

const allPresent = requestedEffects.every(eff => result.effects.includes(eff));
const extra = result.effects.filter(eff => !requestedEffects.includes(eff));

console.log(`\nAll requested effects present: ${allPresent ? '✅' : '❌'}`);
if (extra.length > 0) {
  console.log(`Extra effects: ${extra.join(', ')}`);
}

// Track progress through the sequence
console.log('\nProgress through sequence:');
let currentEffects: string[] = [];
for (let i = 0; i < knownSolution.length; i++) {
  const prefix = knownSolution.slice(0, i + 1);
  const stepResult = mixSubstances('Cocaine', prefix);
  const missing = requestedEffects.filter(eff => !stepResult.effects.includes(eff));
  console.log(`  Depth ${i + 1} (${knownSolution[i]}): missing ${missing.length}/8 - ${missing.join(', ') || 'none'}`);
  currentEffects = stepResult.effects;
}
