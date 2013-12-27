
module.exports = function (grunt) {

    grunt.initConfig({
        livesync: {
            main: {
                options: {
                    source: "path/to/source/",
                    target: "path/to/destination/",
                    ignored: undefined //regexp or undefined
                }
            }
        }
    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');  //todo load from npm sometime

    grunt.registerTask('default', ['livesync']);
};