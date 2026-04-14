import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/**/*.ts', '!src/**/*.test.ts'],
  outDir: 'dist',
  format: 'cjs',
  unbundle: true,
  clean: true,
  dts: false,
  sourcemap: false,
  target: 'node22',
})
