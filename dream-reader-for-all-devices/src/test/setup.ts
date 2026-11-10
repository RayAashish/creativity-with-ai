import 'fake-indexeddb/auto';
import { webcrypto } from 'node:crypto';

// Ensure crypto.subtle exists in test environment
if (!globalThis.crypto?.subtle) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).crypto = webcrypto;
}

