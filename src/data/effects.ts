import type { EffectCode, EffectData } from '../types';

export const effects: Record<EffectCode, EffectData> = {
  Pa: {
    name: 'Paranoia',
    description: 'Induces paranoia in the user.',
    tier: 1,
    price: 0,
    color: '#f87171',
    addiction: 0,
  },
  Sm: {
    name: 'Smelly',
    description: 'Makes the user unbearably smelly.',
    tier: 1,
    price: 0,
    color: '#84cc16',
    addiction: 0,
  },
  Ca: {
    name: 'Calming',
    description: 'Induces a slight calmness in the user.',
    tier: 1,
    price: 0.1,
    color: '#fdba74',
    addiction: 0,
  },
  Mu: {
    name: 'Munchies',
    description: 'Makes the user hungry.',
    tier: 1,
    price: 0.12,
    color: '#C96E57',
    addiction: 0.096,
  },
  Re: {
    name: 'Refreshing',
    description: 'Slightly energizes the user.',
    tier: 1,
    price: 0.14,
    color: '#bef264',
    addiction: 0.104,
  },
  Fc: {
    name: 'Focused',
    description: "Focuses the user's mind.",
    tier: 1,
    price: 0.16,
    color: '#75F1FD',
    addiction: 0.104,
  },
  Eu: {
    name: 'Euphoric',
    description: 'Induces mild euphoria in the user.',
    tier: 1,
    price: 0.18,
    color: '#fde68a',
    addiction: 0.235,
  },
  To: {
    name: 'Toxic',
    description: "Damages the user's liver and induces vomiting.",
    tier: 2,
    price: 0,
    color: '#a3e635',
    addiction: 0,
  },
  Di: {
    name: 'Disorienting',
    description: 'Causes unpredictable movement and slight visual impairment in the user.',
    tier: 2,
    price: 0,
    color: '#FE7551',
    addiction: 0,
  },
  Gi: {
    name: 'Gingeritis',
    description: 'After consumption, the user will become a ginger.',
    tier: 2,
    price: 0.2,
    color: '#fb923c',
    addiction: 0,
  },
  En: {
    name: 'Energizing',
    description: 'Increases the users energy.',
    tier: 2,
    price: 0.22,
    color: '#a3e635',
    addiction: 0.34,
  },
  Sn: {
    name: 'Sneaky',
    description: 'Silences the users foot steps.',
    tier: 2,
    price: 0.24,
    color: '#a8a29e',
    addiction: 0.327,
  },
  Se: {
    name: 'Sedating',
    description: 'Induces heavy sleepiness in the user.',
    tier: 2,
    price: 0.26,
    color: '#818cf8',
    addiction: 0,
  },
  Cd: {
    name: 'Calorie-Dense',
    description: 'Results in immediate weight gain.',
    tier: 2,
    price: 0.28,
    color: '#e879f9',
    addiction: 0.1,
  },
  La: {
    name: 'Laxative',
    description: 'Causes the user to fart and shit uncontrollably.',
    tier: 3,
    price: 0,
    color: '#a16207',
    addiction: 0.1,
  },
  Si: {
    name: 'Seizure-Inducing',
    description: 'Consumption results in an instant seizure.',
    tier: 3,
    price: 0,
    color: '#FEE900',
    addiction: 0,
  },
  Ba: {
    name: 'Balding',
    description: 'Causes balding in the user.',
    tier: 3,
    price: 0.3,
    color: '#c79232',
    addiction: 0,
  },
  At: {
    name: 'Athletic',
    description: 'After consumption, the user is only able to run.',
    tier: 3,
    price: 0.32,
    color: '#7dd3fc',
    addiction: 0.607,
  },
  Sl: {
    name: 'Slippery',
    description: "Reduces the user's ability to maintain traction on the ground.",
    tier: 3,
    price: 0.34,
    color: '#7dd3fc',
    addiction: 0.309,
  },
  Fo: {
    name: 'Foggy',
    description: 'Causes a cloud of fog to form around the user.',
    tier: 3,
    price: 0.36,
    color: '#94a3b8',
    addiction: 0.1,
  },
  Sp: {
    name: 'Spicy',
    description: "Consumption results in the user's eyes turning blue.",
    tier: 3,
    price: 0.38,
    color: '#f87171',
    addiction: 0.665,
  },
  Sc: {
    name: 'Schizophrenia',
    description: 'Induces hallucinations and unpredictable behaviour in the user.',
    tier: 4,
    price: 0,
    color: '#645AFD',
    addiction: 0,
  },
  Be: {
    name: 'Bright-Eyed',
    description: "Causes the user's eyes to emit light.",
    tier: 4,
    price: 0.4,
    color: '#67e8f9',
    addiction: 0.2,
  },
  Je: {
    name: 'Jennerising',
    description: "Inverts the user's gender.",
    tier: 4,
    price: 0.42,
    color: '#e879f9',
    addiction: 0.343,
  },
  Tp: {
    name: 'Thought-Provoking',
    description: "Increases the size of the user's head.",
    tier: 4,
    price: 0.44,
    color: '#f9a8d4',
    addiction: 0.37,
  },
  Tt: {
    name: 'Tropic Thunder',
    description: "Inverts the user's skin color.",
    tier: 4,
    price: 0.46,
    color: '#fdba74',
    addiction: 0.803,
  },
  Gl: {
    name: 'Glowing',
    description: 'Imbues a bioluminescence on the user.',
    tier: 4,
    price: 0.48,
    color: '#85E459',
    addiction: 0.472,
  },
  Ex: {
    name: 'Explosive',
    description: 'Causes the user to explode shortly after consumption.',
    tier: 5,
    price: 0,
    color: '#ef4444',
    addiction: 0,
  },
  El: {
    name: 'Electrifying',
    description:
      'Electrifies the user, causing arcs of electricity to be emitted, zapping anyone nearby.',
    tier: 5,
    price: 0.5,
    color: '#22d3ee',
    addiction: 0.235,
  },
  Lf: {
    name: 'Long Faced',
    description: "Considerably increases the size of the user's head and neck.",
    tier: 5,
    price: 0.52,
    color: '#fde047',
    addiction: 0.607,
  },
  Ag: {
    name: 'Anti-Gravity',
    description: 'Weakens the effects of gravity on the user.',
    tier: 5,
    price: 0.54,
    color: '#3b82f6',
    addiction: 0.611,
  },
  Cy: {
    name: 'Cyclopean',
    description: 'Causes the user to see with a single eye in the center of their forehead.',
    tier: 5,
    price: 0.56,
    color: '#FEC174',
    addiction: 0.1,
  },
  Zo: {
    name: 'Zombifying',
    description:
      'Transforms the user into a zombie, causing them to walk with a limp and seek brains.',
    tier: 5,
    price: 0.58,
    color: '#71AB5D',
    addiction: 0.598,
  },
  Sh: {
    name: 'Shrinking',
    description: 'Shrinks the user.',
    tier: 5,
    price: 0.6,
    color: '#B6FEDA',
    addiction: 0.336,
  },
};

export const effectBits: Record<EffectCode, bigint> = Object.keys(effects)
  .sort()
  .reduce(
    (acc, code, idx) => {
      acc[code as EffectCode] = 1n << BigInt(idx);
      return acc;
    },
    {} as Record<EffectCode, bigint>
  );

export const bitToEffect: Record<string, EffectCode> = Object.entries(effectBits).reduce(
  (acc, [code, bit]) => {
    acc[bit.toString()] = code as EffectCode;
    return acc;
  },
  {} as Record<string, EffectCode>
);
