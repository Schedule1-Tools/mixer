import type { Substance, SubstanceData } from '../types';

export const substances: Record<Substance, SubstanceData> = {
  Cuke: {
    abbreviation: 'A',
    rank: '1',
    price: 2,
    effect: ['En'],
  },
  'Flu Medicine': {
    abbreviation: 'B',
    rank: '9',
    price: 5,
    effect: ['Se'],
  },
  Gasoline: {
    abbreviation: 'C',
    rank: '10',
    price: 5,
    effect: ['To'],
  },
  Donut: {
    abbreviation: 'D',
    rank: '1',
    price: 3,
    effect: ['Cd'],
  },
  'Energy Drink': {
    abbreviation: 'E',
    rank: '11',
    price: 6,
    effect: ['At'],
  },
  'Mouth Wash': {
    abbreviation: 'F',
    rank: '8',
    price: 4,
    effect: ['Ba'],
  },
  'Motor Oil': {
    abbreviation: 'G',
    rank: '12',
    price: 6,
    effect: ['Sl'],
  },
  Banana: {
    abbreviation: 'H',
    rank: '1',
    price: 2,
    effect: ['Gi'],
  },
  Chili: {
    abbreviation: 'I',
    rank: '14',
    price: 7,
    effect: ['Sp'],
  },
  Iodine: {
    abbreviation: 'J',
    rank: '16',
    price: 8,
    effect: ['Je'],
  },
  Paracetamol: {
    abbreviation: 'K',
    rank: '1',
    price: 3,
    effect: ['Sn'],
  },
  Viagor: {
    abbreviation: 'L',
    rank: '7',
    price: 4,
    effect: ['Tt'],
  },
  'Horse Semen': {
    abbreviation: 'M',
    rank: '18',
    price: 9,
    effect: ['Lf'],
  },
  'Mega Bean': {
    abbreviation: 'N',
    rank: '13',
    price: 7,
    effect: ['Fo'],
  },
  Addy: {
    abbreviation: 'O',
    rank: '17',
    price: 9,
    effect: ['Tp'],
  },
  Battery: {
    abbreviation: 'P',
    rank: '15',
    price: 8,
    effect: ['Be'],
  },
};

export const substanceAbbreviations: Record<string, Substance> = Object.entries(substances).reduce(
  (acc, [substance, data]) => {
    acc[data.abbreviation] = substance as Substance;
    return acc;
  },
  {} as Record<string, Substance>
);
