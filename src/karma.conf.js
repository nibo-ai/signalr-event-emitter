// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
	basePath: '.',
	frameworks: ["jasmine", "karma-typescript"],
	files: [
		{ pattern: "**/*.ts" }
	],

	preprocessors: {
		"**/*.ts": "karma-typescript"
	},

	plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
	  require('karma-coverage-istanbul-reporter'),
	  require('karma-typescript')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, '../coverage'),
      reports: ['html', 'lcovonly'],
      fixWebpackSourcePaths: true
	},

	karmaTypescriptConfig: {
		compilerOptions: {
			module: "commonjs"
		},
		tsconfig: "tsconfig.spec.json"
	},

	reporters: ['progress', 'kjhtml', "karma-typescript"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    singleRun: true
  });
};
