import type { Product, ProductData } from '../types';

export const products: Record<Product, ProductData> = {
  'OG Kush': {
    price: 35,
    effects: ['Ca'],
    abbreviation: 'OH',
  },
  'Sour Diesel': {
    price: 35,
    effects: ['Re'],
    abbreviation: 'SL',
  },
  'Green Crack': {
    price: 35,
    effects: ['En'],
    abbreviation: 'GK',
  },
  'Grandaddy Purple': {
    price: 35,
    effects: ['Se'],
    abbreviation: 'GE',
  },
  Meth: {
    price: 70,
    effects: [],
    abbreviation: 'MH',
    addiction: 0.6,
  },
  Cocaine: {
    price: 150,
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
