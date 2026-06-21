/**
 * Git-like diff protocol for resume data (server-side).
 * Applies patches received from the frontend and computes hashes.
 * Must stay in sync with resume-ai/src/utils/diff.ts
 */

// ── Patch operations (must match frontend format) ─────────────────────

export interface ReplaceOp {
  op: 'replace';
  path: string;
  value: unknown;
}

export interface AddOp {
  op: 'add';
  path: string;
  value: unknown;
}

export interface RemoveOp {
  op: 'remove';
  path: string;
}

export type PatchOp = ReplaceOp | AddOp | RemoveOp;

// ── Hashing (FNV-1a 32-bit, matches frontend) ────────────────────────

function stableStringify(obj: unknown): string {
  if (obj === null || obj === undefined) return JSON.stringify(obj);
  if (typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    return '[' + obj.map(stableStringify).join(',') + ']';
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + stableStringify((obj as Record<string, unknown>)[k])).join(',') + '}';
}

export function computeHash(value: unknown): string {
  const str = stableStringify(value);
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

// ── Patch application ─────────────────────────────────────────────────

function setByPath(obj: unknown, path: string, value: unknown): void {
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return;
  let current = obj as Record<string, unknown>;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const nextKey = parts[i + 1];
    const isArrayIndex = /^\d+$/.test(nextKey);
    if (!(key in current)) {
      current[key] = isArrayIndex ? [] : {};
    }
    current = current[key] as Record<string, unknown>;
  }
  const lastKey = parts[parts.length - 1];
  current[lastKey] = value;
}

function deleteByPath(obj: unknown, path: string): void {
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return;
  let current = obj as Record<string, unknown>;
  for (let i = 0; i < parts.length - 1; i++) {
    current = current[parts[i]] as Record<string, unknown>;
  }
  const lastKey = parts[parts.length - 1];
  if (Array.isArray(current)) {
    current.splice(Number(lastKey), 1);
  } else {
    delete current[lastKey];
  }
}

/**
 * Apply a series of patch operations to an object.
 * IMPORTANT: Removals must be in descending index order to avoid index shifting.
 * Returns a new object (does not mutate the original).
 */
export function applyPatch<T>(base: T, ops: PatchOp[]): T {
  const result: T = JSON.parse(JSON.stringify(base));

  for (const op of ops) {
    switch (op.op) {
      case 'replace':
        setByPath(result, op.path, op.value);
        break;
      case 'add':
        setByPath(result, op.path, op.value);
        break;
      case 'remove':
        deleteByPath(result, op.path);
        break;
    }
  }

  return result;
}
