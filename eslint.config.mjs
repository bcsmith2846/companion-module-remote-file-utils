import { generateEslintConfig } from '@companion-module/tools/eslint/config.mjs'

const base = await generateEslintConfig({
	enableTypescript: true,
})

export default [
	...base,
	{
		rules: {
			'n/no-missing-import': 'off',
		},
	},
]
