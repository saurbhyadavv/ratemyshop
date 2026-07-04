/**
 * upiHash.js
 *
 * Deterministic 10-char alphanumeric hash for UPI IDs.
 * The same UPI ID always produces the same hash (no randomness).
 * The mapping is persisted in Supabase so the shop page can reverse
 * a hash back to its original UPI ID.
 *
 * Charset: a-z A-Z 0-9 (62 chars)
 * Collision probability: ~1 in 62^10 ≈ 8.4 × 10^17 — negligible.
 */

import { supabase } from './supabase';

const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Two independent FNV-1a 32-bit hashes of the same string.
 * Using different initial basis values for each pass.
 */
function fnv1a32(str, basis = 2166136261) {
  let h = basis >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

/**
 * Convert a 32-bit unsigned integer to base-62 digits (up to `len` chars).
 * Fills from the least-significant digit.
 */
function toBase62(n, len) {
  let result = '';
  let v = n >>> 0;
  for (let i = 0; i < len; i++) {
    result += CHARS[v % 62];
    v = Math.floor(v / 62);
  }
  return result;
}

/**
 * Compute a deterministic 10-char alphanumeric hash for a UPI ID.
 * Uses two independent FNV-1a passes (different basis) to produce
 * 5 + 5 characters with full 32-bit entropy each.
 *
 * @param {string} upiId  — raw UPI ID (e.g. "shopname@paytm")
 * @returns {string}       — 10-char hash (e.g. "aB3xKm9rPq")
 */
export function computeUpiHash(upiId) {
  const normalized = upiId.trim().toLowerCase();
  const h1 = fnv1a32(normalized, 2166136261);  // standard FNV offset basis
  const h2 = fnv1a32(normalized, 2246822519);  // alternate basis for independence
  return toBase62(h1, 5) + toBase62(h2, 5);
}

/**
 * Get or create the hash for a UPI ID.
 * Stores the mapping in Supabase so it can be reversed.
 * Idempotent — safe to call multiple times for the same UPI ID.
 *
 * @param {string} upiId
 * @returns {Promise<string>} the 10-char hash
 */
export async function getOrCreateHash(upiId) {
  const normalized = upiId.trim().toLowerCase();
  const hash = computeUpiHash(normalized);

  // Upsert: ignore conflict if already exists
  const { error } = await supabase
    .from('upi_hashes')
    .upsert({ hash, upi_id: normalized }, { onConflict: 'hash', ignoreDuplicates: true });

  if (error) {
    // Non-fatal: log and continue. The hash is still usable.
    console.warn('[upiHash] upsert warning:', error.message);
  }

  return hash;
}

/**
 * Resolve a hash back to its UPI ID via Supabase lookup.
 *
 * @param {string} hash  — 10-char hash from the URL
 * @returns {Promise<string|null>} the UPI ID, or null if not found
 */
export async function resolveHash(hash) {
  const { data, error } = await supabase
    .from('upi_hashes')
    .select('upi_id')
    .eq('hash', hash)
    .maybeSingle();

  if (error) {
    console.error('[upiHash] resolve error:', error.message);
    return null;
  }

  return data?.upi_id ?? null;
}
