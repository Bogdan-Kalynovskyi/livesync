
module.exports = function (grunt) {

    grunt.initConfig({
        nodeunit: {
            tests: ['test/test.js']
        }
    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    grunt.registerTask('default', ['nodeunit']);
};