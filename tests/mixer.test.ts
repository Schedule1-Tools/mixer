import { mixSubstances } from '../src/core/mixer';

describe('mixSubstances', () => {
  test('should calculate basic mix correctly', () => {
    const result = mixSubstances('OG Kush', ['Cuke']);
    expect(result.effects).toContain('Ca');
    expect(result.effects).toContain('En');
    expect(result.cost).toBe(2);
    expect(result.sellPrice).toBe(46);
    expect(result.profit).toBe(44);
    expect(result.profitMargin).toBeCloseTo(0.96, 2);
  });

  test('should apply transformation rules correctly', () => {
    const result = mixSubstances('OG Kush', ['Flu Medicine', 'Cuke']);

    expect(result.effects).toContain('Se');
    expect(result.effects).toContain('En');
    expect(result.effects).not.toContain('Ca');
    expect(result.effects).toContain('Be');
  });

  test('should respect maximum effects limit', () => {
    const result = mixSubstances('OG Kush', [
      'Cuke',
      'Flu Medicine',
      'Gasoline',
      'Donut',
      'Energy Drink',
      'Mouth Wash',
      'Motor Oil',
      'Banana',
      'Chili',
    ]);
    expect(result.effects.length).toBeLessThanOrEqual(8);
  });
});

describe('mixSubstances edge cases', () => {
  test('should handle empty substances array', () => {
    const result = mixSubstances('OG Kush', []);
    expect(result.effects).toEqual(['Ca']);
    expect(result.cost).toBe(0);
  });

  test('should handle invalid substances gracefully', () => {
    // @ts-ignore - Testing runtime behavior with invalid input
    const result = mixSubstances('OG Kush', ['Cuke', 'Z', 'Flu Medicine']);

    // Should ignore invalid substance 'Z' but still process 'Cuke' and 'Flu Medicine'
    expect(result.effects).toContain('En'); // From 'Cuke'
    expect(result.effects).toContain('Se'); // From 'Flu Medicine'
  });

  test('should process Shrooms product correctly', () => {
    const result = mixSubstances('Shrooms', []);
    expect(result.effects).toEqual([]);
    expect(result.cost).toBe(0);
    expect(result.sellPrice).toBe(65);
    expect(result.profit).toBe(65);
    expect(result.addiction).toBe(0.05);
  });

  test('should process Shrooms with substances', () => {
    const result = mixSubstances('Shrooms', ['Cuke']);
    expect(result.effects).toContain('En');
    expect(result.cost).toBe(2);
    expect(result.sellPrice).toBeGreaterThan(65);
    expect(result.addiction).toBeGreaterThanOrEqual(0.05);
  });
});
