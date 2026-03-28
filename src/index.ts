export { encodeMixState, decodeMixState, migrateMixHash } from './utils/encoding';

export { mixSubstances, mixFromHash } from './core/mixer';

export { products, productAbbreviations } from './data/products';
export { effectRulesBySubstance } from './data/rules';
export { substances } from './data/substances';
export { effects } from './data/effects';

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
