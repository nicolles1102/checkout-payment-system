// Mock Vite's import.meta.env for Jest tests
// ts-jest with commonjs doesn't support import.meta.env
// We expose env vars via globalThis.__ENV__ which api.ts reads first
(globalThis as Record<string, unknown>).__ENV__ = {
  VITE_API_URL: 'http://localhost:3000',
  VITE_WOMPI_PUBLIC_KEY: 'pub_test_key',
  VITE_WOMPI_BASE_URL: 'https://api-sandbox.co.uat.wompi.dev/v1',
};