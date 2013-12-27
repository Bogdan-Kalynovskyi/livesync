/*
 * Copyright (c) 2013
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    var rmdir = require('rimraf'),
        fs = require('fs'),
        ncp = require('ncp').ncp,
        chokidar = require('chokidar');



    grunt.registerMultiTask('livesync', 'Watches SOURCE for changes and copies them to TARGET', function () {
        var done = this.async();

        var options = this.options();
        if (!options.source || !options.target) {
            console.log('LiveSync Fatal: Missing options. You have to provide "source" and "target"');
            done(false);
        }

        var watcher,
            source = options.source.replace(/\\/g, "/"),
            target = options.target.replace(/\\/g, "/"),
            ignorePattern = options.ignore;

        if (source.substr(0, 2) === './') { // unnecessary ./ at the beginning
            source = source.substr(2);      // of the address causes problems
        }                                   // when replacing strings
        if (target.substr(0, 2) === './') {
            target = target.substr(2);
        }

        try {
            if (options.initialRemove) {
                console.log('Removing ' + target + ' dir...');
                console.log('PROMT REMOVE ALL');
                removeDirSync(target);
            }
            if (options.initialCopy) {
                console.log('Copying ' + source + ' content to ' + target);
                copyDir();
            }

            watcher = chokidar.watch(source, {
                ignored: options.ignore,
                persistent: true,
                ignoreInitial: true
            });

            watcher
                .on('add', copyFile)
                .on('addDir', copyDir)
                .on('change', copyFile)
                .on('unlink', removeFile)
                .on('unlinkDir', removeDir)
                .on('error', function(e) {
                    console.log(e);
                });

            console.log('Watching ' + source);

        } catch (e) {
            console.log(e);
            done(false);
        }


        function removeDirSync (target) {
            try {
                rmdir.sync(target);
            } catch (e) {
                console.log(e);
            }
        }


        function removeDir (path) {
            var destination = target + path.replace(/\\/g, "/").replace(source, '');
            console.log('detected dir removal ' + path);

            rmdir(destination, function (e) {
                if (e) {
                    console.log(e);
                } else {
                    console.log('removed dir ' + path);
                }
            });
        }


        function copyDir (path) {
            var opts = {},
                destination;

            if (!path) {
                path = source;
                destination = target;
            } else {
                destination = target + path.replace(/\\/g, "/").replace(source, '');
                console.log('detected dir creation ' + path);
            }

            if (ignorePattern) {
                opts = {
                    filter: function (filename) {
                        return !ignorePattern.test(filename);
                    }
                };
            }

            ncp(path, destination, opts, function (e) {
                if (e) {
                    console.log(e);
                } else {
                    console.log('copied dir ' + path);
                }
            });
        }


        function removeFile (path) {
            var destination = target + path.replace(/\\/g, "/").replace(source, '');
            console.log('detected file removal ' + path);

            fs.unlink(destination, function (e) {
                if (e) {
                    console.log(e);
                }
                console.log('deleted file ' + path);
            });
        }


        function copyFile (path) {
            var destination = target + path.replace(/\\/g, "/").replace(source, ''),
                readStream = fs.createReadStream(path),
                writeStream = fs.createWriteStream(destination);
            console.log('detected file creaton or change ' + path);

            readStream.on('error', function (e) {
                console.log(e);
            });
            writeStream.on('error', function (e) {
                console.log(e);
            });
            writeStream.on('close', function () {
                console.log('copied file ' + path);
            });

            readStream.pipe(writeStream);
        }


    });
};