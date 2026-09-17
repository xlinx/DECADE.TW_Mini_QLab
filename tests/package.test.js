// @vitest-environment node
import { existsSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

test('library entry and stylesheet export resolve to emitted build artifacts', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  // main 指向 Electron 主进程入口；library 入口由 module / exports 承载
  expect(pkg.main).toBe('electron/main.js');
  expect(pkg.module).toBe('./dist/mini-qlab.js');
  expect(pkg.exports['.']).toBe('./dist/mini-qlab.js');
  expect(pkg.exports['./styles.css']).toBe('./dist/style.css');
  expect(existsSync('dist/mini-qlab.js')).toBe(true);
  expect(existsSync('dist/style.css')).toBe(true);
  expect(existsSync('electron/main.js')).toBe(true);
  expect(readFileSync(new URL('../electron/main.js', import.meta.url), 'utf8')).toContain('backgroundThrottling: false');
});
