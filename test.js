'use strict';

var fs = require('fs'),
    rmdir = require('rimraf'),
    grunt = require('grunt'),
    _ = require('underscore'),
    source = 'test/source/',
    target = 'test/target/',
    params = {
        initialRemove: true,
        initialCopy: true,
        ignore: /\.ignore/i,
        length: 3
    },
    options = [],
    testIndex = 0;


// create options' combinations
for (var i = 0, l = params.length; i < Math.pow(2, l); i++) {
    var key,
        combination = {};

    // create binary combinations of properties
    for (var j = 0; j < l; j++) {
        if ((i >> j) & 1) {
            key = Object.keys(params)[j];
            combination[key] = params[key];
        }
    }

    options.push(combination);
}



function setUpSync (option) {
    var file;

    fs.mkdirSync(source);
    //create 3 files
    file = fs.openSync(source + 'file.css', 'w');
    fs.closeSync(file);
    file = fs.openSync(source + 'file.js', 'w');
    fs.closeSync(file);
    file = fs.openSync(source + 'file.ignore', 'w');
    fs.closeSync(file);
    fs.mkdirSync(source + 'dir');
    fs.mkdirSync(source + 'dir.ignore');

    fs.mkdirSync(target);
    fs.mkdirSync(target + 'dir');
    // put garbage file to target for initialRemove testing
    file = fs.openSync(target + 'file.garbage', 'w');
    fs.closeSync(file);

    // hack to avoid loading a Gruntfile
    // You can skip this and just use a Gruntfile instead
    grunt.task.init = function() {};

    // loading liveSync Grunt config
    grunt.initConfig({
        livesync: {
            main: {
                options: option
            }
        }
    });


    grunt.tasks(['livesync']);

}


function tearDownSync () {
    rmdir.sync(source);
    rmdir.sync(target);
}


function runTestAsync () {

    var option = options[testIndex];
    console.log(option);

    option.source = source;
    option.target = target;

    setUpSync(option);

    // test initial remove/copy. Directory cleanup and initial synchronization.
    var expectedList = ['dir', 'file.garbage'],
        actualList,
        file;

    setTimeout(function(){ //waiting task to finish asynchronously

        if (option.initialRemove) {
            expectedList.pop();
        }
        if (option.initialCopy) {
            expectedList = expectedList.concat(['file.css', 'file.js', 'dir']);
            if (!option.ignore) {
                expectedList = expectedList.concat(['file.ignore', 'dir.ignore']);
            }
        }

        actualList = fs.readdirSync(target);
        if (!_.isEqual(expectedList.sort(), actualList.sort())) console.log('Fail -  test initializing, before any changes take place');


        // test file creation. File should appear if not ignored
        file = fs.openSync(target + 'created.ignore', 'w'); //create file
        fs.closeSync(file);

        setTimeout(function(){ //file should appear after delay

            if (!option.ignore) {
                expectedList = expectedList.concat('created.ignore');
            }

            actualList = fs.readdirSync(target);
            if (!_.isEqual(expectedList.sort(), actualList.sort())) console.log('Fail -  test file creation');


            // test file change. File should appear if not ignored
            // there is no proper teardown, so we're dependent on previous test

            if (!option.ignore && option.initialCopy) {
                fs.unlinkSync(target + 'file.ignore');
            }
            file = fs.openSync(source + 'file.ignore', 'w');
            fs.writeFileSync(source + 'file.ignore', ' ');
            fs.closeSync(file);

            setTimeout(function(){ //file should appear after delay

                actualList = fs.readdirSync(target);
                if (!_.isEqual(expectedList.sort(), actualList.sort())) console.log('Fail -  test file edition');


                // test file removal. File goes away if not ignored
                // there is no proper teardown, so we're dependent on previous test
                fs.unlinkSync(source + 'file.ignore');

                setTimeout(function(){ //file should go away after delay

                    if (!option.ignore) {
                        expectedList.splice(expectedList.indexOf('file.ignore'), 1);
                    }

                    actualList = fs.readdirSync(target);
                    if (!_.isEqual(expectedList.sort(), actualList.sort())) console.log('Fail -  test file deletion');



                    // test file creation. File should appear if not ignored
                    fs.mkdirSync(target + 'dir.created.ignore'); //create dir
                    file = fs.openSync(target + 'dir.created.ignore/' + 'created.ignore', 'w'); //create file
                    fs.closeSync(file);

                    setTimeout(function(){ //dir should appear after delay

                        if (!option.ignore) {
                            expectedList = expectedList.concat('dir.created.ignore');
                        }

                        actualList = fs.readdirSync(target);
                        if (!_.isEqual(expectedList.sort(), actualList.sort())) console.log('Fail -  test dir creation');


                        // test if file has appeared inside 'dir.created.ignore'

                        var expectedList2 = [];
                        if (!option.ignore) {
                            expectedList2 = ['created.ignore'];
                        }

                        actualList = fs.readdirSync(target + 'dir.created.ignore/');
                        if (!_.isEqual(expectedList2.sort(), actualList.sort())) console.log('Fail -  test dir creation recursive');

                        file = fs.openSync(source + 'dir/' + 'created.ignore', 'w');
                        fs.closeSync(file);

                        setTimeout(function(){ //file should appear after delay

                            var expectedList2 = [];
                            if (!option.ignore) {
                                expectedList2 = ['created.ignore'];
                            }

                            actualList = fs.readdirSync(target + 'dir/');
                            if (!_.isEqual(expectedList2.sort(), actualList.sort())) console.log('Fail -  test file creation inside dir');


                            // test dir removal. Dir goes away if not ignored
                            fs.rmdirSync(source + 'dir.ignore');

                            setTimeout(function(){ //dir should go away after delay

                                if (!option.ignore) {
                                    expectedList.splice(expectedList.indexOf('dir.ignore'), 1);
                                }

                                actualList = fs.readdirSync(target);
                                if (!_.isEqual(expectedList.sort(), actualList.sort())) console.log('Fail -  test dir deletion');
            
            
                                grunt.fail.fatal('that\'s ok', 0); //terminate grunt to make next step possible
            
                                setTimeout(function(){ //closing task and waiting to close
            
            
                                    tearDownSync();
            
                                    testIndex++;
                                    runTestAsync();
            

                                }, 20000);
                            }, 20000);
                        }, 20000);
                    }, 20000);
                }, 20000);
            }, 20000);
        }, 20000);
    }, 20000);
}

grunt.loadTasks('tasks');

tearDownSync();

runTestAsync();