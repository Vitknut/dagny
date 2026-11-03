// Lint rules: the recommended JavaScript and TypeScript sets, type-aware.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'android', 'node_modules', 'public', 'scripts', 'src/sw-template.js'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    rules: {
      // Unused things are mistakes – except arguments named _x on purpose.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
);
