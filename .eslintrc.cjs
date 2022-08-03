module.exports = {
    extends: ['eslint:recommended', 'plugin:prettier/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    overrides: [
        {
            files: ['*.ts'],
        },
    ],
    root: true,
    env: {
        node: true,
    },
    rules: {
        'no-console': 'off',
        'no-unused-vars': 'off',
        'no-undef': 'off',
        'no-unused-expressions': 'off',
        'no-empty': 'off',
        'no-trailing-spaces': 'off',
        'ban-ts-comment': 'off',
        'no-sparse-arrays': 'off',
        'require-yield': 'off',
    },
};
