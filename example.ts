// reverseSolver.ts
import { effects } from "./src/data/effects";
import { products } from "./src/data/products";
import { substances } from "./src/data/substances";
import { effectRulesBySubstance } from "./src/data/rules";
import type { EffectCode, Product, Substance, EffectRule } from "./src/types";

const MAX_DEPTH = 20;
const MAX_EFFECTS = 8;

// ---------- bitmask utilities (34 effects -> two uint32) ----------
type Mask = { lo: number; hi: number }; // bits 0..31 in lo, 32..63 in hi

const effectCodes = Object.keys(effects) as EffectCode[];
export const effectIndex = new Map<EffectCode, number>(effectCodes.map((c, i) => [c, i]));

export function bit(idx: number): Mask {
  if (idx < 32) return { lo: (1 << idx) >>> 0, hi: 0 };
  return { lo: 0, hi: (1 << (idx - 32)) >>> 0 };
}
export function or(a: Mask, b: Mask): Mask { return { lo: (a.lo | b.lo) >>> 0, hi: (a.hi | b.hi) >>> 0 }; }
export function and(a: Mask, b: Mask): Mask { return { lo: (a.lo & b.lo) >>> 0, hi: (a.hi & b.hi) >>> 0 }; }
export function has(a: Mask, idx: number): boolean {
  if (idx < 32) return ((a.lo >>> idx) & 1) === 1;
  return ((a.hi >>> (idx - 32)) & 1) === 1;
}
export function add(a: Mask, idx: number): Mask { return or(a, bit(idx)); }
export function remove(a: Mask, idx: number): Mask {
  if (idx < 32) return { lo: (a.lo & (~(1 << idx))) >>> 0, hi: a.hi };
  return { lo: a.lo, hi: (a.hi & (~(1 << (idx - 32)))) >>> 0 };
}
export function isSuperset(state: Mask, target: Mask): boolean {
  // Ensure unsigned comparison for bit 31 (which can be negative if interpreted as signed)
  const stateLoAnd = (state.lo & target.lo) >>> 0;
  const targetLo = target.lo >>> 0;
  const stateHiAnd = (state.hi & target.hi) >>> 0;
  const targetHi = target.hi >>> 0;
  return (stateLoAnd === targetLo) && (stateHiAnd === targetHi);
}
function popcount32(x: number): number {
  x >>>= 0;
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}
function size(a: Mask): number { return popcount32(a.lo) + popcount32(a.hi); }
// Use BigInt for efficient state keys (much faster than string concatenation)
export function key(a: Mask): bigint {
  return (BigInt(a.hi) << 32n) | BigInt(a.lo >>> 0);
}
function keyToString(k: bigint): string {
  return k.toString(16);
}

// ---------- compile rules for faster checks ----------
type Pair = [number, number];

type CompiledRule = {
  ifPresent: Mask;
  ifNotPresent: Mask;
  replacePairs: Pair[];
  replaceOldMask: Mask; // OR of all "old" effects in replacePairs
};

type CompiledSubstance = {
  code: Substance;
  price: number;
  addEffects: number[]; // effect indices
  rules: CompiledRule[];
};

export function maskOf(codes: EffectCode[]): Mask {
  let m: Mask = { lo: 0, hi: 0 };
  for (const c of codes) {
    const idx = effectIndex.get(c);
    if (idx !== undefined) m = add(m, idx);
  }
  return m;
}

function compileRule(rule: EffectRule): CompiledRule {
  const ifPresent = maskOf(rule.ifPresent);
  const ifNotPresent = maskOf(rule.ifNotPresent);
  const replacePairs: Pair[] = [];

  let replaceOldMask: Mask = { lo: 0, hi: 0 };
  for (const [oldC, newC] of Object.entries(rule.replace) as [EffectCode, EffectCode][]) {
    const oldIdx = effectIndex.get(oldC)!;
    const newIdx = effectIndex.get(newC)!;
    replacePairs.push([oldIdx, newIdx]);
    replaceOldMask = or(replaceOldMask, bit(oldIdx));
  }

  return { ifPresent, ifNotPresent, replacePairs, replaceOldMask };
}

export const compiledSubstances: CompiledSubstance[] = (Object.keys(substances) as Substance[]).map((code) => {
  const s = substances[code];
  return {
    code,
    price: s.price,
    addEffects: (s.effect ?? []).map(e => effectIndex.get(e)!).filter(x => x !== undefined),
    rules: (effectRulesBySubstance[code] ?? []).map(compileRule),
  };
});

// ---------- transition function: state + substance -> next state ----------
export function step(initialState: Mask, sub: CompiledSubstance): Mask {
  const initial = initialState;
  let current = initialState;

  let removed: Mask = { lo: 0, hi: 0 };
  const applied = new Uint8Array(sub.rules.length);

  // Phase 1
  for (let i = 0; i < sub.rules.length; i++) {
    const r = sub.rules[i];

    // checkRulePreconditions(rule, initialEffects)
    if (!isSuperset(initial, r.ifPresent)) continue;
    if (and(initial, r.ifNotPresent).lo !== 0 || and(initial, r.ifNotPresent).hi !== 0) continue;
    if (and(initial, r.replaceOldMask).lo === 0 && and(initial, r.replaceOldMask).hi === 0) continue;

    // applyReplaceEffects(...) based on INITIAL membership
    for (const [oldIdx, newIdx] of r.replacePairs) {
      if (has(initial, oldIdx)) {
        current = remove(current, oldIdx);
        current = add(current, newIdx);
        removed = or(removed, bit(oldIdx));
      }
    }
    applied[i] = 1;
  }

  // Phase 2
  for (let i = 0; i < sub.rules.length; i++) {
    if (applied[i]) continue;
    const r = sub.rules[i];

    // meetsPhaseTwo(rule, initial, current, removed)
    if (!isSuperset(initial, r.ifPresent)) continue;

    // at least one forbidden effect must have been removed
    const removedForbidden = and(removed, r.ifNotPresent);
    if (removedForbidden.lo === 0 && removedForbidden.hi === 0) continue;

    // all forbidden effects must be absent from current
    const forbiddenNow = and(current, r.ifNotPresent);
    if (forbiddenNow.lo !== 0 || forbiddenNow.hi !== 0) continue;

    // canApplyTransformation(replace, current)
    const can = and(current, r.replaceOldMask);
    if (can.lo === 0 && can.hi === 0) continue;

    // applyTransformations(...) based on CURRENT membership
    for (const [oldIdx, newIdx] of r.replacePairs) {
      if (has(current, oldIdx)) {
        current = remove(current, oldIdx);
        current = add(current, newIdx);
      }
    }
  }

  // Add substance base effects up to MAX_EFFECTS
  let count = size(current);
  if (count < MAX_EFFECTS) {
    for (const eIdx of sub.addEffects) {
      if (count >= MAX_EFFECTS) break;
      if (!has(current, eIdx)) {
        current = add(current, eIdx);
        count++;
      }
    }
  }

  return current;
}

// ---------- BFS solver ----------
type Solution = { product: Product; mixers: Substance[]; depth: number; cost: number };

// Count how many target effects are missing from a state
function missingTargetCount(state: Mask, target: Mask): number {
  const missing = and(target, { lo: (~state.lo) >>> 0, hi: (~state.hi) >>> 0 });
  return size(missing);
}

// Estimate if we can reach the target in remaining steps (optimistic heuristic)
// Each step can add effects and transform existing ones, so we're more permissive
function canReachTargetInSteps(state: Mask, target: Mask, remainingSteps: number): boolean {
  if (remainingSteps < 0) return false;
  const missing = missingTargetCount(state, target);
  // Very optimistic: transformations can help a lot, so allow more missing effects
  // Each step can potentially add 1-2 effects AND transform others
  // For 12-step solution, be very permissive
  return missing <= remainingSteps * 3 || remainingSteps >= 3;
}

// Check if a state can potentially reach the target (optimistic check)
function canReachTarget(state: Mask, target: Mask): boolean {
  // Even if we have MAX_EFFECTS, we can still transform effects to reach the target
  // So we don't prune based on having MAX_EFFECTS alone
  // The only case where we can't reach the target is if we've explored this state before
  // (handled by the seen map)
  return true;
}

export function findBestMixersForEffects(
  product: Product,
  requested: EffectCode[],
  opts: { 
    maxDepth?: number; 
    allowExtraEffects?: boolean; 
    onProgress?: (depth: number, frontierSize: number) => void;
    knownSolutionPath?: Substance[]; // For debugging: track if we prune the known solution
  } = {}
): Solution | null {
  const maxDepth = opts.maxDepth ?? MAX_DEPTH;
  const target = maskOf(requested);
  const targetSize = size(target);
  const requestedEffects = requested; // Store for debugging

  if (!products[product]) {
    throw new Error(`Unknown product: ${product}`);
  }

  const start = maskOf(products[product].effects ?? []);

  // visited: state -> best cost at a given depth (we stop at minimal depth anyway)
  // Use BigInt keys for efficiency
  const seen = new Map<bigint, { depth: number; cost: number; prevKey: bigint | null; prevSub: Substance | null }>();

  let frontier: { state: Mask; cost: number }[] = [{ state: start, cost: 0 }];
  const startKey = key(start);
  seen.set(startKey, { depth: 0, cost: 0, prevKey: null, prevSub: null });

  let best: Solution | null = null;

  for (let depth = 0; depth <= maxDepth; depth++) {
    if (opts.onProgress) {
      opts.onProgress(depth, frontier.length);
    }
    
    // check goals at this depth (minimal-depth guarantee)
    // Note: Effect order doesn't matter - isSuperset checks if all target effects are present
    // regardless of order or what other effects exist
    for (const node of frontier) {
      const nodeIsSolution = isSuperset(node.state, target);
      if (nodeIsSolution) {
        // Double-check: verify this is actually a complete solution
        const missing = missingTargetCount(node.state, target);
        if (missing === 0) {
          if (!best) {
            console.log(`    ✅ Goal reached at depth ${depth}, cost ${node.cost}`);
          }
          // reconstruct sequence
          const seq: Substance[] = [];
          let k = key(node.state);
          while (true) {
            const rec = seen.get(k)!;
            if (!rec.prevKey || !rec.prevSub) break;
            seq.push(rec.prevSub);
            k = rec.prevKey;
          }
          seq.reverse();

          const candidate: Solution = { product, mixers: seq, depth, cost: node.cost };

          // pick best: minimal depth, then minimal cost
          // But always prefer complete solutions over incomplete ones
          if (!best) {
            best = candidate;
          } else {
            // Verify current best is actually complete
            let bestState = start;
            for (const sub of best.mixers) {
              const subData = compiledSubstances.find(s => s.code === sub);
              if (subData) {
                bestState = step(bestState, subData);
              }
            }
            const bestMissing = missingTargetCount(bestState, target);
            const candidateMissing = 0; // We already verified it's complete
            
            // Prefer complete solutions
            if (bestMissing > 0 && candidateMissing === 0) {
              best = candidate; // Candidate is complete, best is not
            } else if (bestMissing === 0 && candidateMissing === 0) {
              // Both complete - prefer lower depth, then lower cost
              if (
                candidate.depth < best.depth ||
                (candidate.depth === best.depth && candidate.cost < best.cost)
              ) {
                best = candidate;
              }
            } else if (bestMissing === 0 && candidateMissing > 0) {
              // Best is complete, candidate is not - keep best
            } else {
              // Both incomplete - prefer lower depth, then lower cost
              if (
                candidate.depth < best.depth ||
                (candidate.depth === best.depth && candidate.cost < best.cost)
              ) {
                best = candidate;
              }
            }
          }
        } else {
          // False positive from isSuperset - log it
          if (depth <= 12) {
            console.log(`    ⚠️  False positive at depth ${depth}: isSuperset=true but missing=${missing}`);
          }
        }
      }
    }
    
    // Debug: Check if known solution state is in frontier and is a solution
    if (opts.knownSolutionPath && depth === opts.knownSolutionPath.length) {
      let knownState = start;
      for (let i = 0; i < depth && i < opts.knownSolutionPath.length; i++) {
        const subName = opts.knownSolutionPath[i];
        const sub = compiledSubstances.find(s => s.code === subName);
        if (sub) {
          knownState = step(knownState, sub);
        }
      }
      const knownKey = key(knownState);
      const inFrontier = frontier.some(n => key(n.state) === knownKey);
      const isSolution = isSuperset(knownState, target);
      if (isSolution && inFrontier) {
        console.log(`    🔍 Known solution state IS in frontier and IS a solution - checking why it wasn't found...`);
        // Check if it was found in the goal check
        const foundInGoalCheck = frontier.some(n => {
          if (key(n.state) === knownKey) {
            return isSuperset(n.state, target);
          }
          return false;
        });
        console.log(`    Found in goal check: ${foundInGoalCheck}`);
      }
    }
    
    // Debug: Check if known path state at this depth is a solution
    if (opts.knownSolutionPath && depth === opts.knownSolutionPath.length) {
      let knownState = start;
      for (let i = 0; i < depth && i < opts.knownSolutionPath.length; i++) {
        const subName = opts.knownSolutionPath[i];
        const sub = compiledSubstances.find(s => s.code === subName);
        if (sub) {
          knownState = step(knownState, sub);
        }
      }
      const isSolution = isSuperset(knownState, target);
      const missing = missingTargetCount(knownState, target);
      if (isSolution) {
        console.log(`    🎯 Known solution path IS a solution at depth ${depth}!`);
        // Check if it's in the frontier
        const knownKey = key(knownState);
        const inFrontier = frontier.some(n => key(n.state) === knownKey);
        if (!inFrontier) {
          console.log(`    ⚠️  But it's NOT in the frontier! This is a bug.`);
        } else {
          console.log(`    ✓ And it's in the frontier - should be found!`);
        }
      } else {
        console.log(`    ⚠️  Known solution path is NOT a solution at depth ${depth} (missing: ${missing}/${targetSize})`);
      }
    }
    
    // Debug: check how close we are to the target at key depths
    if (depth === 12 && frontier.length > 0) {
      let closestMissing = 999;
      let closestState: Mask | null = null;
      for (const node of frontier.slice(0, 1000)) { // Sample first 1000
        const missing = missingTargetCount(node.state, target);
        if (missing < closestMissing) {
          closestMissing = missing;
          closestState = node.state;
        }
      }
      if (closestState) {
        const missingEffects: EffectCode[] = [];
        for (let i = 0; i < effectCodes.length; i++) {
          if (has(target, i) && !has(closestState!, i)) {
            missingEffects.push(effectCodes[i]);
          }
        }
        console.log(`    Closest state at depth 12: missing ${closestMissing}/${targetSize} effects`);
        if (missingEffects.length > 0) {
          console.log(`    Missing effect(s): ${missingEffects.map(e => effects[e]?.name || e).join(', ')}`);
        }
      }
    }

    if (best && best.depth === depth) {
      // we've found at least one solution at minimal depth
      // But if we're tracking a known solution path and haven't reached its depth yet, continue
      // Also, verify the solution is actually complete before stopping
      const bestMissing = missingTargetCount(
        frontier.find(n => {
          // Reconstruct state to verify
          let testState = start;
          for (const sub of best.mixers) {
            const subData = compiledSubstances.find(s => s.code === sub);
            if (subData) {
              testState = step(testState, subData);
            }
          }
          return key(testState) === key(n.state);
        })?.state || start,
        target
      );
      
      if (bestMissing === 0 && (!opts.knownSolutionPath || depth >= opts.knownSolutionPath.length)) {
        // Complete solution found and we've reached known solution depth (if tracking)
        break;
      }
      // Otherwise continue - either solution is incomplete or we need to reach known solution depth
    }

    if (depth === maxDepth) break;

    // Calculate remaining steps
    const remainingSteps = maxDepth - depth - 1;

    // Pre-compute the expected state for the known solution path at depth+1
    // We need to ensure this state is always preserved
    let knownPathState: Mask | null = null;
    let knownPathCost = 0;
    if (opts.knownSolutionPath && depth < opts.knownSolutionPath.length) {
      // Compute state after depth+1 steps (what should be in frontier at depth+1)
      knownPathState = start;
      for (let i = 0; i <= depth && i < opts.knownSolutionPath.length; i++) {
        const subName = opts.knownSolutionPath[i];
        const sub = compiledSubstances.find(s => s.code === subName);
        if (sub) {
          knownPathState = step(knownPathState, sub);
          knownPathCost += sub.price;
        }
      }
    }

    // expand - we rely on frontier size limits and sorting for efficiency
    const nextFrontier: { state: Mask; cost: number; missing: number }[] = [];
    const knownPathKey = knownPathState !== null ? key(knownPathState) : null;
    
    for (const node of frontier) {
      for (const sub of compiledSubstances) {
        const nextState = step(node.state, sub);
        const nextCost = node.cost + sub.price;
        const k = key(nextState);
        const missing = missingTargetCount(nextState, target);

        // Check if this is the known solution path state (regardless of how we got here)
        const isKnownPathState = knownPathKey !== null && k === knownPathKey;

        // Pruning: if we can't reach the target in remaining steps, skip this state
        // BUT: always keep the known solution path
        if (!isKnownPathState && remainingSteps >= 0 && !canReachTargetInSteps(nextState, target, remainingSteps)) {
          continue;
        }

        const prev = seen.get(k);
        // Only add if we haven't seen this state, or if we found a better path (same depth, lower cost)
        // BUT: always keep the known solution path even if we've seen it before with better cost
        if (!prev || prev.depth > depth + 1 || (prev.depth === depth + 1 && nextCost < prev.cost) || isKnownPathState) {
          if (isKnownPathState && prev && prev.depth === depth + 1 && nextCost >= prev.cost) {
            // Known path has higher cost - still keep it but don't update seen map
            nextFrontier.push({ state: nextState, cost: nextCost, missing });
          } else {
            seen.set(k, { depth: depth + 1, cost: nextCost, prevKey: key(node.state), prevSub: sub.code });
            nextFrontier.push({ state: nextState, cost: nextCost, missing });
          }
        }
      }
    }
    
    // Diversity-preserving bucketed beam search
    // Before finding solution: don't sort by cost at all - preserve all diversity
    // After finding solution: sort by missing then cost to optimize
    if (!best) {
      // No solution found yet - preserve maximum diversity
      // Just sort by missing count, ignore cost completely
      nextFrontier.sort((a, b) => a.missing - b.missing);
    } else {
      // Solution found - now optimize for cost
      nextFrontier.sort((a, b) => {
        if (a.missing !== b.missing) return a.missing - b.missing;
        return a.cost - b.cost;
      });
    }
    
    // Keep quotas per missing-count bucket to preserve diversity
    // This prevents pruning valid paths that temporarily increase missing count
    // (e.g., rules that require creating a "bad" effect, then removing it, then transforming)
    // Use very large caps to ensure we don't prune valid solution paths
    // The known solution path shows we need to preserve states even when they temporarily get worse
    const perMissingCap = depth < 10 ? 400000 : depth < 12 ? 300000 : depth < 15 ? 200000 : 100000;
    const buckets = new Array(9).fill(0); // missing can be 0-8
    
    const newFrontier: { state: Mask; cost: number }[] = [];
    const knownPathKeyForBucketing = knownPathState !== null ? key(knownPathState) : null;
    let knownPathIncluded = false;
    
    for (const node of nextFrontier) {
      const m = node.missing;
      if (m >= buckets.length) continue; // safety check
      
      const nodeKey = key(node.state);
      const isKnownPathNode = knownPathKeyForBucketing !== null && nodeKey === knownPathKeyForBucketing;
      
      if (isKnownPathNode) {
        knownPathIncluded = true;
      }
      
      // Always keep the known solution path, even if bucket is full
      if (buckets[m] >= perMissingCap && !isKnownPathNode) continue;
      buckets[m]++;
      newFrontier.push({ state: node.state, cost: node.cost });
    }
    
    // If known path state wasn't included, inject it directly (it was pruned earlier)
    // This ensures the known solution path is never lost
    if (!knownPathIncluded && knownPathState !== null && opts.knownSolutionPath) {
      const missing = missingTargetCount(knownPathState, target);
      if (missing < buckets.length) {
        // Add it even if bucket is full - this is the known solution path
        // We need to ensure it's in the seen map too for path reconstruction
        const knownKey = key(knownPathState);
        if (!seen.has(knownKey) || seen.get(knownKey)!.depth > depth + 1) {
          // Find the parent state from the known path
          let parentState = start;
          for (let i = 0; i < depth && i < opts.knownSolutionPath.length; i++) {
            const subName = opts.knownSolutionPath[i];
            const sub = compiledSubstances.find(s => s.code === subName);
            if (sub) {
              parentState = step(parentState, sub);
            }
          }
          const parentSub = opts.knownSolutionPath[depth];
          seen.set(knownKey, { 
            depth: depth + 1, 
            cost: knownPathCost, 
            prevKey: key(parentState), 
            prevSub: parentSub 
          });
        }
        // Force add it to newFrontier - this is the known solution path
        newFrontier.push({ state: knownPathState, cost: knownPathCost });
        // Don't increment bucket count since we're forcing it in
        knownPathIncluded = true;
      }
    }
    
    frontier = newFrontier;

    // Debug: Check if known solution path is still in frontier
    // Check AFTER we've built the new frontier for this depth (which contains states at depth+1)
    if (opts.knownSolutionPath && depth < opts.knownSolutionPath.length) {
      // Simulate the known path: after depth+1 steps (what should be in frontier now)
      let knownState = start;
      let knownCost = 0;
      for (let i = 0; i <= depth && i < opts.knownSolutionPath.length; i++) {
        const subName = opts.knownSolutionPath[i];
        const sub = compiledSubstances.find(s => s.code === subName);
        if (sub) {
          knownState = step(knownState, sub);
          knownCost += sub.price;
        }
      }
      const knownKey = key(knownState);
      const inFrontier = frontier.some(n => key(n.state) === knownKey);
      const missing = missingTargetCount(knownState, target);
      if (!inFrontier) {
        // Check which bucket it would be in and if that bucket is full
        const bucketIndex = missing;
        const bucketCount = nextFrontier.filter(n => n.missing === missing).length;
        const perMissingCap = depth < 10 ? 400000 : depth < 12 ? 300000 : depth < 15 ? 200000 : 100000;
        console.log(`    ⚠️  Known solution path PRUNED at depth ${depth + 1} (missing: ${missing}/${targetSize}, cost: ${knownCost}, bucket[${bucketIndex}]: ${bucketCount}/${perMissingCap})`);
      } else if (depth % 3 === 0 || depth >= 9) {
        console.log(`    ✓ Known solution path present at depth ${depth + 1} (missing: ${missing}/${targetSize}, cost: ${knownCost})`);
      }
    }

    if (frontier.length === 0) break;
  }

  return best;
}
