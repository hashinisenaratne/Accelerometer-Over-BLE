module.exports = function (grunt) {
	'use strict';

	grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
		browserify: {
			browser: {
				options: {
					alias: [ '<%= pkg.main %>:<%= pkg.name %>' ]
				},
				src: [],
				dest: 'browser/<%= pkg.name %>.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-browserify');

	grunt.registerTask('default', ['browserify']);
};