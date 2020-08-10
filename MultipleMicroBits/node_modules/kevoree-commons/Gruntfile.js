module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            browser: {
                options: {
                    browserifyOptions: {
                        standalone: 'KevoreeCommons'
                    }
                },
                src: ['<%= pkg.main %>'],
                dest: 'browser/<%= pkg.name %>.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');

    grunt.registerTask('default', 'browserify');
};