import type { Product, ProductData } from '../types';

export const products: Record<Product, ProductData> = {
  'OG Kush': {
    price: 35,
    rank: '1',
    effects: ['Ca'],
    abbreviation: 'OH',
  },
  'Sour Diesel': {
    price: 35,
    rank: '4',
    effects: ['Re'],
    abbreviation: 'SL',
  },
  'Green Crack': {
    price: 35,
    rank: '7',
    effects: ['En'],
    abbreviation: 'GK',
  },
  'Grandaddy Purple': {
    price: 35,
    rank: '9',
    effects: ['Se'],
    abbreviation: 'GE',
  },
  Meth: {
    price: 70,
    rank: '6',
    effects: [],
    abbreviation: 'MH',
    addiction: 0.6,
  },
  Cocaine: {
    price: 150,
    rank: '26',
    effects: [],
    abbreviation: 'CE',
    addiction: 0.4,
  },
};

export const productAbbreviations: Record<string, Product> = Object.entries(products).reduce(
  (acc, [product, data]) => {
    acc[data.abbreviation] = product as Product;
    return acc;
  },
  {} as Record<string, Product>
);
