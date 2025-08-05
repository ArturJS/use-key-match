import { defineConfig } from 'tsdown';

const baseConfig = (outDir: string) => {
  return {
    entry: ['./src/index.ts'],
    outDir,
    format: ['esm'] as Array<'esm' | 'cjs' | 'iife' | 'umd'>,
    platform: 'neutral' as const,
    dts: {
      isolatedDeclarations: true,
    },
  }
}

export default defineConfig([
  baseConfig('dist/'),
  baseConfig('demo/dist/'),
]);
