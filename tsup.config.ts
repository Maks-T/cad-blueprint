import { defineConfig } from 'tsup';

// ESM + .d.ts для npm и IIFE-сборка вьюпорта для <script> (window.CadBlueprint).
export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      svg: 'src/svg/index.ts',
      dxf: 'src/dxf/index.ts',
      format: 'src/format/index.ts',
      viewer: 'src/viewer/index.ts',
      three: 'src/three/index.ts',
    },
    format: ['esm'],
    target: 'es2022',
    platform: 'neutral',
    dts: true,
    tsconfig: 'tsconfig.build.json',
    sourcemap: true,
    splitting: true,
    treeshake: true,
    clean: true,
    external: ['three', 'fflate'],
  },
  {
    entry: { 'cad-blueprint.iife': 'src/viewer/global.ts' },
    format: ['iife'],
    globalName: 'CadBlueprint',
    target: 'es2020',
    platform: 'browser',
    minify: true,
    sourcemap: true,
    dts: false,
    tsconfig: 'tsconfig.build.json',
    noExternal: ['fflate'],
    outExtension: () => ({ js: '.js' }),
  },
]);
