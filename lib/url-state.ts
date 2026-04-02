/**
 * URL-based State Sharing
 *
 * This module provides functionality to encode and decode builder state
 * into URL parameters for sharing.
 */

import type { Block } from './types';

// Generate unique ID for blocks
export function generateId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Encode blocks and username into a URL-safe string
 * Uses base64 encoding with URL-safe replacements
 */
export function encodeStateToUrl(blocks: Block[], username: string): string {
  // Create a minimal state object
  const state = {
    b: blocks,
    u: username,
  };

  try {
    // Serialize to JSON
    const json = JSON.stringify(state);

    // Convert to base64 with URL-safe replacements
    const base64 = btoa(unescape(encodeURIComponent(json)));

    // Make URL-safe: replace + with -, / with _, remove padding
    const urlSafe = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    return urlSafe;
  } catch (error) {
    console.error('Failed to encode state to URL:', error);
    return '';
  }
}

/**
 * Decode a URL-safe string back to blocks and username
 */
export function decodeStateFromUrl(encoded: string): {
  blocks: Block[];
  username: string;
} | null {
  if (!encoded || encoded.length === 0) {
    return null;
  }

  try {
    // Restore base64 from URL-safe format
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if needed
    const padLength = (4 - (base64.length % 4)) % 4;
    base64 += '='.repeat(padLength);

    // Decode from base64
    const json = decodeURIComponent(escape(atob(base64)));

    // Parse JSON
    const state = JSON.parse(json);

    // Validate and return
    if (state.b && Array.isArray(state.b)) {
      return {
        blocks: state.b,
        username: state.u || '',
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to decode state from URL:', error);
    return null;
  }
}

/**
 * Check if URL has state parameter
 */
export function hasUrlState(): boolean {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  return params.has('s') || params.has('state');
}

/**
 * Get state from URL
 */
export function getUrlState(): {
  blocks: Block[];
  username: string;
} | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('s') || params.get('state');

  if (!encoded) return null;

  return decodeStateFromUrl(encoded);
}

/**
 * Generate a shareable URL with current state
 */
export function generateShareUrl(blocks: Block[], username: string): string {
  const encoded = encodeStateToUrl(blocks, username);

  if (!encoded) {
    // Return current URL without state if encoding failed
    return window.location.href.split('?')[0];
  }

  const baseUrl = window.location.origin;
  return `${baseUrl}?s=${encoded}`;
}

/**
 * Clear state from URL (return to clean URL)
 */
export function clearUrlState(): void {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  url.searchParams.delete('s');
  url.searchParams.delete('state');

  // Use replace to avoid adding to history
  window.history.replaceState({}, '', url.toString());
}

/**
 * Update URL with state without reloading
 */
export function updateUrlWithState(blocks: Block[], username: string): void {
  const encoded = encodeStateToUrl(blocks, username);

  if (!encoded) return;

  const url = new URL(window.location.href);
  url.searchParams.set('s', encoded);

  window.history.replaceState({}, '', url.toString());
}
