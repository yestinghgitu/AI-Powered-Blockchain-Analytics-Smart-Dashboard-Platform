import { useCallback, useRef } from 'react';
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  clusterApiUrl,
} from '@solana/web3.js';

// Solana Devnet RPC
const SOLANA_NETWORK = clusterApiUrl('devnet');
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

// ─── SHA-256 HASHING ──────────────────────────────────────────────────────────

/** Convert ArrayBuffer to hex string */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** SHA-256 hash a File via Web Crypto API */
export async function hashFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  return '0x' + bufferToHex(hashBuffer);
}

/** SHA-256 hash an arbitrary string */
export async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return '0x' + bufferToHex(hashBuffer);
}

/** Truncate a hash/address for display: 0xA3F4...91C2 */
export function truncateHash(hash: string, front = 6, back = 4): string {
  if (!hash || hash.length < front + back + 2) return hash;
  return `${hash.slice(0, front)}...${hash.slice(-back)}`;
}

/** Truncate a wallet address */
export function truncateAddress(addr: string, n = 4): string {
  if (!addr || addr.length < n * 2 + 3) return addr;
  return `${addr.slice(0, n)}...${addr.slice(-n)}`;
}

// ─── NETWORK LATENCY ─────────────────────────────────────────────────────────

/** Ping Solana Devnet RPC and return latency in ms */
export async function fetchNetworkLatency(): Promise<number> {
  const start = performance.now();
  try {
    const connection = new Connection(SOLANA_NETWORK, 'confirmed');
    await connection.getRecentBlockhash();
    return Math.round(performance.now() - start);
  } catch {
    return -1;
  }
}

// ─── STORE HASH ON-CHAIN VIA MEMO PROGRAM ────────────────────────────────────

export interface StoreResult {
  success: boolean;
  txSignature?: string;
  error?: string;
  explorerUrl?: string;
}

/**
 * Store a SHA-256 hash as a Solana Devnet memo transaction.
 * Requires the Phantom provider to be connected.
 */
export async function storeHashOnChain(
  hash: string,
  phantomProvider: any
): Promise<StoreResult> {
  if (!phantomProvider?.publicKey) {
    return { success: false, error: 'Wallet not connected.' };
  }

  try {
    const connection = new Connection(SOLANA_NETWORK, 'confirmed');
    const publicKey = phantomProvider.publicKey;

    const { blockhash } = await connection.getRecentBlockhash();

    const memoInstruction = new TransactionInstruction({
      keys: [{ pubkey: publicKey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(hash, 'utf-8'),
    });

    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: publicKey,
    });
    transaction.add(memoInstruction);

    // Sign via Phantom
    const signed = await phantomProvider.signTransaction(transaction);

    // Send raw
    const rawTx = signed.serialize();
    const txSignature = await connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });

    // Confirm
    await connection.confirmTransaction(txSignature, 'confirmed');

    return {
      success: true,
      txSignature,
      explorerUrl: `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Transaction failed.',
    };
  }
}

// ─── VERIFY HASH ─────────────────────────────────────────────────────────────

export type VerifyResult = 'verified' | 'tampered' | 'unverified';

/**
 * Compare the current computed hash with the stored on-chain hash.
 */
export function verifyHash(currentHash: string, storedHash: string): VerifyResult {
  if (!currentHash || !storedHash) return 'unverified';
  return currentHash.toLowerCase() === storedHash.toLowerCase() ? 'verified' : 'tampered';
}

// ─── HASH HISTORY ─────────────────────────────────────────────────────────────

export interface HashRecord {
  hash: string;
  timestamp: string;
  filename?: string;
  txSignature?: string;
  verifyStatus?: VerifyResult;
}

const HISTORY_KEY = 'blockchain_hash_history';
const MAX_HISTORY = 5;

export function loadHashHistory(): HashRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHashToHistory(record: HashRecord): HashRecord[] {
  const history = loadHashHistory();
  const updated = [record, ...history].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}
