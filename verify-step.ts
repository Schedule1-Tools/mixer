import { mixSubstances } from './src/core/mixer';
import { products } from './src/data/products';
import { substances } from './src/data/substances';
import { EffectSet } from './src/core/effectSet';
import { effectRulesBySubstance } from './src/data/rules';
import type { Product, Substance, EffectCode } from './src/types';

// Test the step function logic against the actual mixer
function testStepAgainstMixer(product: Product, substanceList: Substance[]) {
  console.log(`Testing: ${product} + ${substanceList.join(', ')}`);
  
  // Use actual mixer
  const mixerResult = mixSubstances(product, substanceList);
  
  // Simulate step by step
  const productInfo = products[product];
  let effectsSet = new EffectSet(productInfo.effects);
  
  for (const code of substanceList) {
    const substance = substances[code];
    if (!substance) continue;

    const rules = effectRulesBySubstance[code];
    if (rules && rules.length > 0) {
      const initialEffects = effectsSet.clone();
      const processedEffects = new EffectSet();
      const removedEffects = new EffectSet();
      const appliedRules = new Set<number>();

      // Phase 1
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        
        // Check preconditions
        let canApply = true;
        for (const effect of rule.ifPresent) {
          if (!initialEffects.has(effect)) {
            canApply = false;
            break;
          }
        }
        if (!canApply) continue;
        
        for (const effect of rule.ifNotPresent) {
          if (initialEffects.has(effect)) {
            canApply = false;
            break;
          }
        }
        if (!canApply) continue;
        
        let hasReplaceable = false;
        for (const oldEffect of Object.keys(rule.replace) as EffectCode[]) {
          if (initialEffects.has(oldEffect)) {
            hasReplaceable = true;
            break;
          }
        }
        if (!hasReplaceable) continue;

        // Apply replacements
        for (const [oldEffect, newEffect] of Object.entries(rule.replace) as [EffectCode, EffectCode][]) {
          if (initialEffects.has(oldEffect)) {
            effectsSet.remove(oldEffect);
            effectsSet.add(newEffect);
            processedEffects.add(oldEffect);
            removedEffects.add(oldEffect);
          }
        }
        appliedRules.add(i);
      }

      // Phase 2
      for (let i = 0; i < rules.length; i++) {
        if (appliedRules.has(i)) continue;
        const rule = rules[i];

        // Check phase 2 conditions
        let canApply = true;
        for (const effect of rule.ifPresent) {
          if (!initialEffects.has(effect)) {
            canApply = false;
            break;
          }
        }
        if (!canApply) continue;

        let hasRemovedForbidden = false;
        for (const effect of rule.ifNotPresent) {
          if (removedEffects.has(effect)) {
            hasRemovedForbidden = true;
            break;
          }
        }
        if (!hasRemovedForbidden) continue;

        for (const effect of rule.ifNotPresent) {
          if (effectsSet.has(effect)) {
            canApply = false;
            break;
          }
        }
        if (!canApply) continue;

        let hasReplaceable = false;
        for (const oldEffect of Object.keys(rule.replace) as EffectCode[]) {
          if (effectsSet.has(oldEffect)) {
            hasReplaceable = true;
            break;
          }
        }
        if (!hasReplaceable) continue;

        // Apply transformations
        for (const [oldEffect, newEffect] of Object.entries(rule.replace) as [EffectCode, EffectCode][]) {
          if (effectsSet.has(oldEffect)) {
            effectsSet.remove(oldEffect);
            effectsSet.add(newEffect);
            processedEffects.add(oldEffect);
          }
        }
      }
    }

    // Add substance effects
    if (effectsSet.size() < 8 && substance.effect) {
      for (const effect of substance.effect) {
        if (!effectsSet.has(effect)) {
          effectsSet.add(effect);
          if (effectsSet.size() >= 8) break;
        }
      }
    }
  }

  const simulatedEffects = effectsSet.toArray().slice(0, 8).sort();
  const mixerEffects = mixerResult.effects.sort();
  
  if (JSON.stringify(simulatedEffects) === JSON.stringify(mixerEffects)) {
    console.log('✅ Match!');
  } else {
    console.log('❌ Mismatch!');
    console.log('  Simulated:', simulatedEffects);
    console.log('  Mixer:    ', mixerEffects);
  }
  console.log('');
}

// Test a few cases
testStepAgainstMixer('OG Kush', ['Cuke']);
testStepAgainstMixer('OG Kush', ['Flu Medicine', 'Cuke']);
testStepAgainstMixer('OG Kush', ['Gasoline', 'Flu Medicine']);
