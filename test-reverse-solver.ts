import { findBestMixersForEffects } from './example';
import { mixSubstances } from './src/core/mixer';
import { effects } from './src/data/effects';

// Map effect names to codes
const effectNameToCode: Record<string, string> = {};
for (const [code, data] of Object.entries(effects)) {
  effectNameToCode[data.name] = code;
}

// Requested effects
const requestedEffectNames = [
  'Bright-Eyed',
  'Glowing',
  'Anti-Gravity',
  'Cyclopean',
  'Electrifying',
  'Long Faced',
  'Shrinking',
  'Zombifying',
];

// Convert to effect codes
const requestedEffects = requestedEffectNames.map((name) => {
  const code = effectNameToCode[name];
  if (!code) {
    throw new Error(`Unknown effect name: ${name}`);
  }
  return code as any;
});

console.log('Requested effects:');
requestedEffectNames.forEach((name, i) => {
  console.log(`  ${name} → ${requestedEffects[i]}`);
});
import { products } from './src/data/products';

console.log('\nAvailable products:');
Object.keys(products).forEach((p, i) => {
  console.log(`  ${i + 1}. ${p}`);
});

// For testing, using 'Cocaine' as specified
// In a real application, the user would select this
const selectedProduct: any = 'Cocaine';
console.log(`\nUsing product: ${selectedProduct}`);
console.log('Searching for optimal mix...\n');

// Run the reverse solver with progress tracking
let lastDepth = -1;
const startTime = Date.now();
// Known solution depth: 12 ingredients
const knownSolutionDepth = 12;
// Known solution sequence for verification
const knownSolution: any[] = [
  'Gasoline', 'Cuke', 'Mega Bean', 'Battery', 'Energy Drink', 
  'Banana', 'Cuke', 'Horse Semen', 'Viagor', 'Energy Drink', 
  'Mega Bean', 'Mouth Wash'
];
console.log(`\nOptimizing search for known solution depth: ${knownSolutionDepth} ingredients`);
console.log(`Known solution sequence: ${knownSolution.join(' → ')}\n`);

const solution = findBestMixersForEffects(selectedProduct, requestedEffects, {
  maxDepth: knownSolutionDepth + 3, // Add buffer - solution might need 13-14 steps
  allowExtraEffects: false,
  knownSolutionPath: knownSolution, // Track if we prune the known solution
  onProgress: (depth, frontierSize) => {
    if (depth !== lastDepth) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const remaining = knownSolutionDepth - depth;
      const status = remaining > 0 ? `(~${remaining} steps to target)` : 'at/over target depth';
      console.log(`  Depth ${depth}: ${frontierSize.toLocaleString()} states (${elapsed}s) ${status}`);
      lastDepth = depth;
    }
  },
});

if (solution) {
  console.log('✅ Solution found!');
  console.log(`\nProduct: ${solution.product}`);
  console.log(`Substances: ${solution.mixers.join(', ')}`);
  console.log(`Depth: ${solution.depth} steps`);
  console.log(`Cost: $${solution.cost}`);
  console.log(`\nVerifying with mixer...`);

  // Verify the solution
  const result = mixSubstances(solution.product, solution.mixers);
  console.log(`\nResulting effects: ${result.effects.join(', ')}`);
  console.log(`Total cost: $${result.cost}`);
  console.log(`Sell price: $${result.sellPrice}`);
  console.log(`Profit: $${result.profit}`);
  console.log(`Profit margin: ${(result.profitMargin * 100).toFixed(2)}%`);
  console.log(`Addiction: ${result.addiction}`);

  // Check if all requested effects are present
  const missing = requestedEffects.filter((eff) => !result.effects.includes(eff));
  if (missing.length === 0) {
    console.log('\n✅ All requested effects are present!');
  } else {
    console.log(`\n⚠️  Missing effects: ${missing.join(', ')}`);
  }

  // Check for extra effects
  const extra = result.effects.filter((eff) => !requestedEffects.includes(eff));
  if (extra.length > 0) {
    console.log(`Extra effects: ${extra.join(', ')}`);
  }
} else {
  console.log('❌ No solution found within the search depth.');
}
