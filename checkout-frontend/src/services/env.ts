// This file uses import.meta.env directly so Vite can statically replace
// these references during the build. Do NOT use new Function() or dynamic access.
export const API_URL: string =
  (import.meta.env as Record<string, string | undefined>).VITE_API_URL ||
  'http://localhost:3000';

export const WOMPI_PUBLIC_KEY: string =
  (import.meta.env as Record<string, string | undefined>).VITE_WOMPI_PUBLIC_KEY || '';

export const WOMPI_BASE_URL: string =
  (import.meta.env as Record<string, string | undefined>).VITE_WOMPI_BASE_URL || '';