import { mixSubstances } from './src/core/mixer';
import { findBestMixersForEffects } from './example';
import { effects } from './src/data/effects';

// Test with a simpler case first
console.log('Testing with a simpler case: OG Kush + 2 effects\n');

const simpleEffects = ['Be', 'Se']; // Bright-Eyed, Sedating
const simpleSolution = findBestMixersForEffects('OG Kush', simpleEffects, {
  maxDepth: 10,
  onProgress: (depth, size) => {
    if (depth <= 5) console.log(`  Depth ${depth}: ${size} states`);
  },
});

if (simpleSolution) {
  console.log('\n✅ Simple solution found!');
  console.log(`Substances: ${simpleSolution.mixers.join(', ')}`);
  const result = mixSubstances('OG Kush', simpleSolution.mixers);
  console.log(`Resulting effects: ${result.effects.join(', ')}`);
  console.log(`Requested: ${simpleEffects.join(', ')}`);
  console.log(`All present: ${simpleEffects.every(e => result.effects.includes(e))}`);
} else {
  console.log('❌ No simple solution found');
}

console.log('\n\nNow testing the complex case...\n');
