module.exports = {
    env: {
      browser: true,
      es2021: true,
    },
    extends: [
      'plugin:vue/vue3-essential',
      'eslint:recommended'
    ],
    parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
    },
    rules: {
      'vue/no-setup-props-destructure': 'off'
    },
    globals: {
      defineProps: 'readonly',
      defineEmits: 'readonly'
    }
  };
  