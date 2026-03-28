import type { EffectCode } from '../types';

// All 34 effect codes in alphabetical order.
// Effects 0-31 map to `lo`, effects 32-33 (Tt, Zo) map to `hi`.
const EFFECT_CODES: EffectCode[] = [
  'Ag',
  'At',
  'Ba',
  'Be',
  'Ca',
  'Cd',
  'Cy',
  'Di',
  'El',
  'En',
  'Eu',
  'Ex',
  'Fc',
  'Fo',
  'Gi',
  'Gl',
  'Je',
  'La',
  'Lf',
  'Mu',
  'Pa',
  'Re',
  'Sc',
  'Se',
  'Sh',
  'Si',
  'Sl',
  'Sm',
  'Sn',
  'Sp',
  'To',
  'Tp',
  'Tt',
  'Zo',
];

export const EFFECT_INDEX: Record<EffectCode, number> = Object.create(null);
for (let i = 0; i < EFFECT_CODES.length; i++) {
  EFFECT_INDEX[EFFECT_CODES[i]] = i;
}

export class EffectSet {
  /** bitmask for effects 0-31 */
  lo = 0;
  /** bitmask for effects 32-33 (Tt, Zo) */
  hi = 0;
  private _size = 0;
  /** effect indices in insertion order, used by toArray() */
  private _order: number[] = [];

  constructor(initialEffects: EffectCode[] = []) {
    for (const e of initialEffects) this.add(e);
  }

  has(effect: EffectCode): boolean {
    return this.hasBit(EFFECT_INDEX[effect]);
  }

  hasBit(idx: number): boolean {
    return idx < 32 ? (this.lo & (1 << idx)) !== 0 : (this.hi & (1 << (idx - 32))) !== 0;
  }

  add(effect: EffectCode): boolean {
    return this.addBit(EFFECT_INDEX[effect]);
  }

  addBit(idx: number): boolean {
    if (idx < 32) {
      const bit = 1 << idx;
      if (this.lo & bit) return false;
      this.lo |= bit;
    } else {
      const bit = 1 << (idx - 32);
      if (this.hi & bit) return false;
      this.hi |= bit;
    }
    this._size++;
    this._order.push(idx);
    return true;
  }

  remove(effect: EffectCode): boolean {
    return this.removeBit(EFFECT_INDEX[effect]);
  }

  removeBit(idx: number): boolean {
    if (idx < 32) {
      const bit = 1 << idx;
      if (!(this.lo & bit)) return false;
      this.lo &= ~bit;
    } else {
      const bit = 1 << (idx - 32);
      if (!(this.hi & bit)) return false;
      this.hi &= ~bit;
    }
    this._size--;
    const i = this._order.indexOf(idx);
    if (i !== -1) this._order.splice(i, 1);
    return true;
  }

  size(): number {
    return this._size;
  }

  toArray(): EffectCode[] {
    return this._order.map((i) => EFFECT_CODES[i]);
  }

  clone(): EffectSet {
    const c = new EffectSet();
    c.lo = this.lo;
    c.hi = this.hi;
    c._size = this._size;
    c._order = this._order.slice();
    return c;
  }
}
