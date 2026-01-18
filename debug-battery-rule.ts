import { effectRulesBySubstance } from './src/data/rules';
import { maskOf, isSuperset, and, has, add, remove, bit, or } from './example';
import { effects } from './src/data/effects';
import { effectIndex } from './example';

const effectCodes = Object.keys(effects) as any[];

// Get Battery's rules
const batteryRules = effectRulesBySubstance['Battery'];
console.log('Battery rules:', JSON.stringify(batteryRules, null, 2));

// State before Battery: Cy, Eu, Fo
const stateBefore = maskOf(['Cy', 'Eu', 'Fo']);
console.log('\nState before Battery: Cy, Eu, Fo');

// Check each rule
for (let i = 0; i < batteryRules.length; i++) {
  const rule = batteryRules[i];
  console.log(`\nRule ${i + 1}:`, JSON.stringify(rule));
  
  const ifPresentMask = maskOf(rule.ifPresent);
  const ifNotPresentMask = maskOf(rule.ifNotPresent);
  
  const hasIfPresent = isSuperset(stateBefore, ifPresentMask);
  const hasIfNotPresent = (and(stateBefore, ifNotPresentMask).lo !== 0 || and(stateBefore, ifNotPresentMask).hi !== 0);
  
  console.log(`  ifPresent check (${rule.ifPresent.join(', ')}): ${hasIfPresent}`);
  console.log(`  ifNotPresent check (${rule.ifNotPresent.join(', ')}): ${!hasIfNotPresent} (should be true)`);
  
  // Check if any replaceable effect is present
  let hasReplaceable = false;
  for (const oldEffect of Object.keys(rule.replace) as any[]) {
    const oldIdx = effectIndex.get(oldEffect);
    if (oldIdx !== undefined && has(stateBefore, oldIdx)) {
      hasReplaceable = true;
      console.log(`  Replaceable effect ${oldEffect} is present`);
      break;
    }
  }
  console.log(`  Has replaceable: ${hasReplaceable}`);
  
  const canApply = hasIfPresent && !hasIfNotPresent && hasReplaceable;
  console.log(`  Can apply: ${canApply}`);
}
