"use strict";
/**
 * Git-like diff protocol for resume data (server-side).
 * Applies patches received from the frontend and computes hashes.
 * Must stay in sync with resume-ai/src/utils/diff.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeHash = computeHash;
exports.applyPatch = applyPatch;
// ── Hashing (FNV-1a 32-bit, matches frontend) ────────────────────────
function stableStringify(obj) {
    if (obj === null || obj === undefined)
        return JSON.stringify(obj);
    if (typeof obj !== 'object')
        return JSON.stringify(obj);
    if (Array.isArray(obj)) {
        return '[' + obj.map(stableStringify).join(',') + ']';
    }
    const keys = Object.keys(obj).sort();
    return '{' + keys.map(k => JSON.stringify(k) + ':' + stableStringify(obj[k])).join(',') + '}';
}
function computeHash(value) {
    const str = stableStringify(value);
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = (hash * 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, '0');
}
// ── Patch application ─────────────────────────────────────────────────
function setByPath(obj, path, value) {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0)
        return;
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        const nextKey = parts[i + 1];
        const isArrayIndex = /^\d+$/.test(nextKey);
        if (!(key in current)) {
            current[key] = isArrayIndex ? [] : {};
        }
        current = current[key];
    }
    const lastKey = parts[parts.length - 1];
    current[lastKey] = value;
}
function deleteByPath(obj, path) {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0)
        return;
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
    }
    const lastKey = parts[parts.length - 1];
    if (Array.isArray(current)) {
        current.splice(Number(lastKey), 1);
    }
    else {
        delete current[lastKey];
    }
}
/**
 * Apply a series of patch operations to an object.
 * IMPORTANT: Removals must be in descending index order to avoid index shifting.
 * Returns a new object (does not mutate the original).
 */
function applyPatch(base, ops) {
    const result = JSON.parse(JSON.stringify(base));
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
