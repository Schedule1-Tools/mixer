export type EffectCode =
  | 'Ag'
  | 'At'
  | 'Ba'
  | 'Be'
  | 'Ca'
  | 'Cd'
  | 'Cy'
  | 'Di'
  | 'El'
  | 'En'
  | 'Eu'
  | 'Ex'
  | 'Fc'
  | 'Fo'
  | 'Gi'
  | 'Gl'
  | 'Je'
  | 'La'
  | 'Lf'
  | 'Mu'
  | 'Pa'
  | 'Re'
  | 'Sc'
  | 'Se'
  | 'Sh'
  | 'Si'
  | 'Sl'
  | 'Sm'
  | 'Sn'
  | 'Sp'
  | 'To'
  | 'Tp'
  | 'Tt'
  | 'Zo';

export type Substance =
  | 'Cuke'
  | 'Flu Medicine'
  | 'Gasoline'
  | 'Donut'
  | 'Energy Drink'
  | 'Mouth Wash'
  | 'Motor Oil'
  | 'Banana'
  | 'Chili'
  | 'Iodine'
  | 'Paracetamol'
  | 'Viagor'
  | 'Horse Semen'
  | 'Mega Bean'
  | 'Addy'
  | 'Battery';

export type Product =
  | 'OG Kush'
  | 'Sour Diesel'
  | 'Green Crack'
  | 'Grandaddy Purple'
  | 'Meth'
  | 'Cocaine';

export type RankCode =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12'
  | '13';

export interface EffectData {
  name: string;
  description: string;
  tier: number;
  price: number;
  color: string;
  addiction: number;
}

export interface SubstanceData {
  abbreviation: string;
  rank: RankCode;
  price: number;
  effect: EffectCode[];
}

export interface ProductData {
  price: number;
  effects: EffectCode[];
  abbreviation: string;
  addiction?: number;
}

export interface EffectRule {
  ifPresent: EffectCode[];
  ifNotPresent: EffectCode[];
  replace: Partial<Record<EffectCode, EffectCode>>;
}

export interface MixResult {
  effects: EffectCode[];
  cost: number;
  sellPrice: number;
  profit: number;
  profitMargin: number;
  addiction: number;
}

export interface MixState {
  product: Product;
  substances: Substance[];
}
