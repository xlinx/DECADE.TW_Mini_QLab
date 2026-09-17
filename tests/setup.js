import '@testing-library/jest-dom/vitest';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

afterAll(() => {
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
});

afterEach(() => {
  if (typeof document !== 'undefined') {
    cleanup();
    if (typeof localStorage !== 'undefined') localStorage.clear();
    document.documentElement.classList.remove('dark');
    const next = document.getElementById('root');
    next?.replaceChildren();
  }
});
