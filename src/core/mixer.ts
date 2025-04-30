import type { EffectCode, EffectRule, MixResult, Product, Substance } from '../types';

import { effects } from '../data/effects';
import { products } from '../data/products';
import { effectRulesBySubstance } from '../data/rules';
import { substances } from '../data/substances';
import { decodeMixState } from '../utils/encoding';
import { EffectSet } from './effectSet';

const MAX_EFFECTS = 8;

/**
 * Calculate the result of mixing substances with a product
 * @param product - The product to mix
 * @param substanceCodes - The substances to mix
 * @returns The result of the mix
 */
export function mixSubstances(product: Product, substanceCodes: Substance[]): MixResult {
  if (!products[product]) {
    throw new Error(`Unknown product: ${product}`);
  }

  const productInfo = products[product];
  const effectsSet = new EffectSet(productInfo.effects);
  let totalCost = 0;

  for (const code of substanceCodes) {
    const substance = substances[code];
    if (!substance) continue;

    totalCost += substance.price;

    const rules = effectRulesBySubstance[code];
    if (rules && rules.length > 0) {
      const initialEffects = effectsSet.clone();
      const processedEffects = new EffectSet();
      const removedEffects = new EffectSet();
      const appliedRules = new Set<number>();

      // Phase 1: Apply rules where conditions are met in the initial state
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];

        if (checkRulePreconditions(rule, initialEffects)) {
          applyReplaceEffects(
            rule.replace,
            initialEffects,
            effectsSet,
            processedEffects,
            removedEffects
          );
          appliedRules.add(i);
        }
      }

      // Phase 2: Apply rules where conditions are met after phase 1
      for (let i = 0; i < rules.length; i++) {
        if (appliedRules.has(i)) continue;

        const rule = rules[i];

        if (meetsPhaseTwo(rule, initialEffects, effectsSet, removedEffects)) {
          if (canApplyTransformation(rule.replace, effectsSet)) {
            applyTransformations(rule.replace, effectsSet, processedEffects);
          }
        }
      }
    }

    if (effectsSet.size() < MAX_EFFECTS && substance.effect) {
      for (const effect of substance.effect) {
        if (!effectsSet.has(effect)) {
          effectsSet.add(effect);
          if (effectsSet.size() >= MAX_EFFECTS) break;
        }
      }
    }
  }

  const finalEffects = effectsSet.toArray().slice(0, MAX_EFFECTS);
  const effectValue = calculateEffectValue(finalEffects);
  const addictionValue = calculateAddiction(product, finalEffects);
  const addiction = Math.round(addictionValue * 100) / 100;
  const sellPrice = Math.round(productInfo.price * (1 + effectValue));
  const profit = sellPrice - totalCost;
  const profitMargin = Math.round((profit / sellPrice) * 100) / 100;

  return {
    effects: finalEffects,
    cost: totalCost,
    sellPrice,
    profit,
    profitMargin,
    addiction,
  };
}

/**
 * Mix substances from a hash
 * @param hash - The hash to mix
 * @returns The result of the mix
 */
export function mixFromHash(hash: string): MixResult {
  const state = decodeMixState(hash);
  if (!state) {
    throw new Error(`Invalid hash: ${hash}`);
  }
  return mixSubstances(state.product, state.substances);
}

/**
 * Check if a rule's preconditions are met
 * @param rule - The rule to check
 * @param initialEffects - The initial effects
 * @returns True if the preconditions are met, false otherwise
 */
function checkRulePreconditions(rule: EffectRule, initialEffects: EffectSet): boolean {
  // Check if all required effects are present
  for (const effect of rule.ifPresent) {
    if (!initialEffects.has(effect)) return false;
  }

  // Check if all forbidden effects are absent
  for (const effect of rule.ifNotPresent) {
    if (initialEffects.has(effect)) return false;
  }

  // Check if at least one replaceable effect is present
  for (const oldEffect of Object.keys(rule.replace) as EffectCode[]) {
    if (initialEffects.has(oldEffect)) return true;
  }

  return false;
}

/**
 * Check if a rule meets phase two conditions
 * @param rule - The rule to check
 * @param initialEffects - The initial effects
 * @param currentEffects - The current effects
 * @param removedEffects - The removed effects
 * @returns True if the rule meets the conditions, false otherwise
 */
function meetsPhaseTwo(
  rule: EffectRule,
  initialEffects: EffectSet,
  currentEffects: EffectSet,
  removedEffects: EffectSet
): boolean {
  // All required effects must have been initially present
  for (const effect of rule.ifPresent) {
    if (!initialEffects.has(effect)) return false;
  }

  // At least one forbidden effect must have been removed
  let hasRemovedForbidden = false;
  for (const effect of rule.ifNotPresent) {
    if (removedEffects.has(effect)) {
      hasRemovedForbidden = true;
      break;
    }
  }
  if (!hasRemovedForbidden) return false;

  // All forbidden effects must be absent from current set
  for (const effect of rule.ifNotPresent) {
    if (currentEffects.has(effect)) return false;
  }

  return true;
}

/**
 * Apply effect replacements
 * @param replace - The replacements to apply
 * @param initialEffects - The initial effects
 * @param effectsSet - The effects set
 * @param processedEffects - The processed effects
 * @param removedEffects - The removed effects
 */
function applyReplaceEffects(
  replace: Partial<Record<EffectCode, EffectCode>>,
  initialEffects: EffectSet,
  effectsSet: EffectSet,
  processedEffects: EffectSet,
  removedEffects: EffectSet
): void {
  for (const [oldEffect, newEffect] of Object.entries(replace) as [EffectCode, EffectCode][]) {
    if (initialEffects.has(oldEffect)) {
      effectsSet.remove(oldEffect);
      effectsSet.add(newEffect);
      processedEffects.add(oldEffect);
      removedEffects.add(oldEffect);
    }
  }
}

/**
 * Check if a transformation can be applied
 * @param replace - The replacements to apply
 * @param effectsSet - The effects set
 * @returns True if the transformation can be applied, false otherwise
 */
function canApplyTransformation(
  replace: Partial<Record<EffectCode, EffectCode>>,
  effectsSet: EffectSet
): boolean {
  for (const oldEffect of Object.keys(replace) as EffectCode[]) {
    if (effectsSet.has(oldEffect)) return true;
  }
  return false;
}

/**
 * Apply transformations to effects
 * @param replace - The replacements to apply
 * @param effectsSet - The effects set
 * @param processedEffects - The processed effects
 */
function applyTransformations(
  replace: Partial<Record<EffectCode, EffectCode>>,
  effectsSet: EffectSet,
  processedEffects: EffectSet
): void {
  for (const [oldEffect, newEffect] of Object.entries(replace) as [EffectCode, EffectCode][]) {
    if (effectsSet.has(oldEffect)) {
      effectsSet.remove(oldEffect);
      effectsSet.add(newEffect);
      processedEffects.add(oldEffect);
    }
  }
}

/**
 * Calculate the total value multiplier from effects
 * @param effectCodes - The effects to calculate the value for
 * @returns The total value multiplier
 */
function calculateEffectValue(effectCodes: EffectCode[]): number {
  let value = 0;
  for (const code of effectCodes) {
    value += effects[code]?.price || 0;
  }
  return value;
}

/**
 * Calculate the total addiction value from effects
 * @param effectCodes - The effects to calculate the value for
 * @returns The total addiction value
 */
function calculateAddiction(product: Product, effectCodes: EffectCode[]): number {
  let value = products[product]?.addiction || 0;
  for (const code of effectCodes) {
    value += effects[code]?.addiction || 0;
  }
  return value;
}
