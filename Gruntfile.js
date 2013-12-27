var config = require('./config');

var src = config.repoSrc + 'sites/',
    dst = config.serverSrc + (config.devsites || 'devsites/');


module.exports = function (grunt) {

    grunt.initConfig({
        livesync: {
            main: {
                options: {
                    source: src,
                    target: dst,
                    initialCopy: true,
                    ignored: /^(?!.*\.js$)/  //all but javascript files
                }
            }
        }
    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    grunt.registerTask('default', ['livesync']);
};