# Schedule1 Mixer

[![npm version](https://img.shields.io/npm/v/@schedule1-tools/mixer.svg)](https://www.npmjs.com/package/@schedule1-tools/mixer)
[![npm downloads](https://img.shields.io/npm/dm/@schedule1-tools/mixer.svg)](https://www.npmjs.com/package/@schedule1-tools/mixer)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Open‑source mixing calculator for _Schedule 1_.

---

## Installation

```bash
# npm
npm install @schedule1-tools/mixer

# yarn
yarn add @schedule1-tools/mixer

# pnpm
pnpm add @schedule1-tools/mixer
```

---

## Quick Start

### 1. Calculate a mix

```typescript
import { mixSubstances } from '@schedule1-tools/mixer';

/**
 * mixSubstances(product: Product, substances: Substance[])
 * → computes cost, effects, profit, profitMargin, addiction
 */
const result = mixSubstances(
  'OG Kush',
  ['Cuke', 'Flu Medicine', 'Gasoline']
);
// result → {
//   effects:      ['Be','Se','Eu','To'],
//   cost:         12,
//   sellPrice:    64,
//   profit:       52,
//   profitMargin: 0.81,
//   addiction:    0.44
// }
```

### 2. Calculate from a hash

```typescript
import { mixFromHash } from '@schedule1-tools/mixer';

/**
 * mixFromHash(hash: string)
 * → decode & compute a mix from its shared hash form
 */
const result = mixFromHash('T0cgS3VzaDpBQkM');
// result → {
//   effects:      ['Be','Se','Eu','To'],
//   cost:         12,
//   sellPrice:    64,
//   profit:       52,
//   profitMargin: 0.81,
//   addiction:    0.44
// }
```

### 3. Encode & decode mix state

```typescript
import {
  encodeMixState,
  decodeMixState
} from '@schedule1-tools/mixer';

/**
 * encodeMixState(state: MixState) → string
 * decodeMixState(hash: string) → MixState
 */
const encoded = encodeMixState({
  product:    'OG Kush',
  substances: ['Cuke','Flu Medicine','Gasoline']
});
// encoded → 'T0cgS3VzaDpBQkM'

const decoded = decodeMixState(encoded);
// decoded → { product: 'OG Kush', substances: [...] }
```

### 4. Migrate an old mix hash

```typescript
import { migrateMixHash } from '@schedule1-tools/mixer';

/**
 * migrateMixHash(legacyHash: string): Promise<string|null>
 * → upgrade legacy LZ‑String hash to the new format
 */
const newHash = await migrateMixHash('OLD_BASE64_HASH_HERE');
// newHash → 'T0cgS3VzaDpBQkM' (or null if invalid)
```

---

## Exports

In addition to the functions above, the package also exports data objects:

- `effects`: All effect definitions  
- `products`: All product definitions  
- `substances`: All substance definitions  
- `effectRulesBySubstance`: Transformation rules for each substance  

```typescript
import {
  effects,
  products,
  substances,
  effectRulesBySubstance
} from '@schedule1-tools/mixer';
```

---

## Contributing

1. Fork the repo  
2. Create a branch (`git checkout -b feat/my-feature`)  
3. Run tests & lint (`pnpm test && pnpm run format`)  
4. Open a PR against `main`  

Please read [CONTRIBUTING.md](CONTRIBUTING.md) (if present) for more details.

---

## License

MIT © Schedule1 Tools  
See [LICENSE](LICENSE) for details.

---

## Notice

This is a fan‑made project and is not affiliated with, authorized, maintained, sponsored, or endorsed by the developers of _Schedule I_ the game. All game‑related content (names, trademarks, etc.) belongs to its respective owners.
