export { encodeMixState, decodeMixState, migrateMixHash } from './utils/encoding';
export { mixSubstances, mixFromHash } from './core/mixer';

export { effects } from './data/effects';
export { products, productAbbreviations } from './data/products';
export { substances } from './data/substances';
export { effectRulesBySubstance } from './data/rules';

export type {
  EffectCode,
  Substance,
  Product,
  RankCode,
  EffectData,
  SubstanceData,
  ProductData,
  EffectRule,
  MixResult,
  MixState,
} from './types';
