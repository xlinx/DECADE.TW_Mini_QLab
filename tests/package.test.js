import { existsSync, readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

test('stylesheet export resolves to the CSS emitted by the library build', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  expect(pkg.exports['./styles.css']).toBe('./dist/style.css');
  expect(existsSync(pkg.exports['./styles.css'].replace('./', ''))).toBe(true);
});
