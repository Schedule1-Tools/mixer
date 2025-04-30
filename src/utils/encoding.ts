import type { MixState, Product, Substance } from '../types';

import LZString from 'lz-string';

import { products } from '../data/products';
import { substanceAbbreviations, substances } from '../data/substances';

/**
 * Encode a mix state into a URL-safe string
 * @param state - The mix state to encode
 * @returns The URL-safe string
 * @throws Error if the product type or any substance code is invalid
 */
export function encodeMixState(state: MixState): string {
  if (!products[state.product]) {
    throw new Error(`Invalid product type: ${state.product}`);
  }

  for (const substance of state.substances) {
    if (!substances[substance]) {
      throw new Error(`Invalid substance code: ${substance}`);
    }
  }

  const abbreviatedSubstances = state.substances.map((s) => {
    const abbr = substances[s].abbreviation;
    if (!abbr) {
      throw new Error(`Missing abbreviation for substance: ${s}`);
    }
    return abbr;
  });

  const encoded = `${state.product}:${abbreviatedSubstances.join('')}`;
  return toBase64Url(encoded);
}

/**
 * Decode a mix state from a URL-safe string
 * @param hash - The URL-safe string to decode
 * @returns The decoded MixState or null if invalid
 */
export function decodeMixState(hash: string): MixState | null {
  if (!hash || typeof hash !== 'string') {
    return null;
  }

  try {
    const decoded = fromBase64Url(hash);
    const parts = decoded.split(':');

    if (parts.length !== 2) {
      return null;
    }

    const [product, substancesStr] = parts;

    if (!product || !products[product as Product]) {
      return null;
    }

    const subs: Substance[] = [];

    if (substancesStr) {
      for (let i = 0; i < substancesStr.length; i++) {
        const abbr = substancesStr[i];
        const fullName = substanceAbbreviations[abbr];

        if (!fullName || !substances[fullName]) {
          return null;
        }

        subs.push(fullName);
      }
    }

    return {
      product: product as Product,
      substances: subs,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Migrates an old format mix hash to the new format
 * @param legacyHash - The old format hash to migrate
 * @returns The mix state in the new hash format, or null if migration failed
 */
export async function migrateMixHash(legacyHash: string): Promise<string | null> {
  try {
    const jsonStr = LZString.decompressFromBase64(legacyHash);
    if (!jsonStr) return null;

    const mixArr = JSON.parse(jsonStr);
    if (!Array.isArray(mixArr) || !mixArr.length) return null;

    const firstMix = mixArr[0];
    const productId = firstMix.weed as Product;
    if (!products[productId]) return null;

    const subsByAbbr = Object.entries(substances).reduce(
      (map, [id, sub]) => {
        if (sub.abbreviation) map[sub.abbreviation] = id as Substance;
        return map;
      },
      {} as Record<string, Substance>
    );

    const substanceIds: Substance[] = [];
    if (Array.isArray(firstMix.substances)) {
      for (const legacySubId of firstMix.substances) {
        const substanceId = substances[legacySubId as Substance]
          ? (legacySubId as Substance)
          : subsByAbbr[legacySubId];

        if (substanceId) substanceIds.push(substanceId);
      }
    }

    return encodeMixState({ product: productId, substances: substanceIds });
  } catch {
    return null;
  }
}

/**
 * Convert a string to a URL-safe base64 string
 * @param str - The string to convert
 * @returns The URL-safe base64 string
 */
function toBase64Url(str: string): string {
  return Buffer.from(str, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Convert a URL-safe base64 string back to a regular string
 * @param str - The URL-safe base64 string to convert
 * @returns The regular string
 */
function fromBase64Url(str: string): string {
  if (typeof str !== 'string') {
    throw new Error('Input must be a string');
  }

  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4;
  const padded = padding ? base64 + '='.repeat(4 - padding) : base64;
  return Buffer.from(padded, 'base64').toString('utf-8');
}
