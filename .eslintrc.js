module.exports = {
	root: true,
	plugins: ["import"],
	extends: "@react-native-community",
	rules: {
		quotes: ["warn", "double"],
		"object-curly-spacing": ["error", "always"],
		"prettier/prettier": 0, // To completely disable prettier
		"keyword-spacing": [
			"warn",
			{
				before: true,
				after: true,
				// overrides: {
				// 	if: { after: false },
				// 	for: { after: false },
				// 	while: { after: false },
				// 	catch: { after: false },
				// 	switch: { after: false },
				// },
			},
		],
		indent: ["error", "tab", { "SwitchCase": 1 }],
		"import/no-cycle": [
			"error",
			{
				"maxDepth": 10,
				"ignoreExternal": true,
			},
		],
	},
};
