
module.exports = function (grunt) {

    grunt.initConfig({
        livecopy: {
            main: {
                options: {
                    source: "path/to/source/",
                    target: "path/to/destination/",
                    ignored: undefined
                }
            }
        }
    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    grunt.registerTask('default', ['livesync']);
};