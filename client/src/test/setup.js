import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Desmonta el arbol de React entre tests para que no se filtre estado
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});
