import type { EffectCode, EffectRule, MixResult, Product, Substance } from '../types';

import { effects } from '../data/effects';
import { products } from '../data/products';
import { effectRulesBySubstance } from '../data/rules';
import { substances } from '../data/substances';
import { decodeMixState } from '../utils/encoding';
import { EFFECT_INDEX, EffectSet } from './effectSet';

const MAX_EFFECTS = 8;

// Rules are stored as string codes in rules.ts for readability.
// At load time we compile them to integer indices so the hot path is pure bit ops.
interface CompiledRule {
  ifPresent: number;
  ifNotPresent: number;
  replaceFrom: number;
  replaceTo: number;
}

const compiledRulesBySubstance = (() => {
  const out = Object.create(null) as Record<Substance, CompiledRule[]>;
  for (const sub in effectRulesBySubstance) {
    const rules = effectRulesBySubstance[sub as Substance] as EffectRule[];
    out[sub as Substance] = rules.map((r) => ({
      ifPresent: EFFECT_INDEX[r.ifPresent[0]],
      ifNotPresent: EFFECT_INDEX[r.ifNotPresent[0]],
      replaceFrom: EFFECT_INDEX[Object.keys(r.replace)[0] as EffectCode],
      replaceTo: EFFECT_INDEX[Object.values(r.replace)[0] as EffectCode],
    }));
  }
  return out;
})();

const substanceEffectIndices = (() => {
  const out = Object.create(null) as Record<Substance, number[]>;
  for (const sub in substances) {
    out[sub as Substance] = substances[sub as Substance].effect.map((e) => EFFECT_INDEX[e]);
  }
  return out;
})();

// Typed arrays for cache-friendly price/addiction lookups by effect index.
const EFFECT_COUNT = 34;
const effectPrices = new Float64Array(EFFECT_COUNT);
const effectAddictions = new Float64Array(EFFECT_COUNT);
for (const code in effects) {
  const idx = EFFECT_INDEX[code as EffectCode];
  effectPrices[idx] = effects[code as EffectCode].price;
  effectAddictions[idx] = effects[code as EffectCode].addiction;
}

function hasBit(lo: number, hi: number, idx: number): boolean {
  return idx < 32 ? (lo & (1 << idx)) !== 0 : (hi & (1 << (idx - 32))) !== 0;
}

/**
 * Mixes a list of substances into a product and returns the resulting effects,
 * sell price, profit, and addiction value.
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

    const rules = compiledRulesBySubstance[code];
    if (rules && rules.length > 0) {
      // Snapshot the current state as plain ints to avoid a clone() allocation.
      const initLo = effectsSet.lo;
      const initHi = effectsSet.hi;
      let removedLo = 0;
      let removedHi = 0;
      let appliedRules = 0; // bit i = rule i fired in phase 1

      // Phase 1: apply rules whose conditions are met right now.
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        if (
          hasBit(initLo, initHi, rule.ifPresent) &&
          !hasBit(initLo, initHi, rule.ifNotPresent) &&
          hasBit(initLo, initHi, rule.replaceFrom)
        ) {
          effectsSet.removeBit(rule.replaceFrom);
          effectsSet.addBit(rule.replaceTo);
          if (rule.replaceFrom < 32) removedLo |= 1 << rule.replaceFrom;
          else removedHi |= 1 << (rule.replaceFrom - 32);
          appliedRules |= 1 << i;
        }
      }

      // Phase 2: apply rules that were blocked by a now-removed effect.
      for (let i = 0; i < rules.length; i++) {
        if (appliedRules & (1 << i)) continue;
        const rule = rules[i];
        if (
          hasBit(initLo, initHi, rule.ifPresent) &&
          hasBit(removedLo, removedHi, rule.ifNotPresent) &&
          !hasBit(effectsSet.lo, effectsSet.hi, rule.ifNotPresent) &&
          hasBit(effectsSet.lo, effectsSet.hi, rule.replaceFrom)
        ) {
          effectsSet.removeBit(rule.replaceFrom);
          effectsSet.addBit(rule.replaceTo);
        }
      }
    }

    if (effectsSet.size() < MAX_EFFECTS) {
      for (const idx of substanceEffectIndices[code]) {
        if (!effectsSet.hasBit(idx)) {
          effectsSet.addBit(idx);
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
 * Decodes a hash and runs it through mixSubstances.
 * Throws if the hash is invalid.
 */
export function mixFromHash(hash: string): MixResult {
  const state = decodeMixState(hash);
  if (!state) {
    throw new Error(`Invalid hash: ${hash}`);
  }
  return mixSubstances(state.product, state.substances);
}

function calculateEffectValue(effectCodes: EffectCode[]): number {
  let value = 0;
  for (const code of effectCodes) value += effectPrices[EFFECT_INDEX[code]];
  return value;
}

function calculateAddiction(product: Product, effectCodes: EffectCode[]): number {
  let value = products[product]?.addiction || 0;
  for (const code of effectCodes) value += effectAddictions[EFFECT_INDEX[code]];
  return value;
}
