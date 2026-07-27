// Mock for Jest tests - reads from globalThis.__ENV__ or falls back to defaults
declare const globalThis: Record<string, unknown>;

const testEnv = (globalThis as Record<string, Record<string, string>>).__ENV__ ?? {};

export const API_URL: string = testEnv.VITE_API_URL || 'http://localhost:3000';

export const WOMPI_PUBLIC_KEY: string = testEnv.VITE_WOMPI_PUBLIC_KEY || '';

export const WOMPI_BASE_URL: string = testEnv.VITE_WOMPI_BASE_URL || '';