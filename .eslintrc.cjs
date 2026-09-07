module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:astro/recommended',
    'plugin:import/recommended',
    'prettier'
  ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: 'detect' } },
  overrides: [
    {
      // React rules belong to React files only. Applied globally they fired on
      // every .astro template, which legitimately uses `class` and needs no
      // React import — 250 false positives that hid the real findings.
      files: ['**/*.jsx', '**/*.tsx'],
      extends: [
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended'
      ]
    },
    {
      // TypeScript sources were previously not linted at all: `eslint .` only
      // picks up .js by default, so nothing under src/lib or scripts was checked.
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        // tsc already resolves modules and unused symbols.
        'import/no-unresolved': 'off',
        'no-unused-vars': 'off'
      }
    },
    {
      files: ['**/*.d.ts'],
      rules: {
        // Ambient declaration files need triple-slash references.
        '@typescript-eslint/triple-slash-reference': 'off'
      }
    },
    {
      files: ['**/*.astro'],
      parser: 'astro-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro']
      },
      rules: {
        'import/no-unresolved': 'off'
      }
    }
  ]
};
