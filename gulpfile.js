/*
  Copyright (c) 2015 Jerome Rasky and others. Provided under the MIT License.

  Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
  This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
  The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
  The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
  Code distributed by Google as part of the polymer project is also
  subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

'use strict';

// Include Gulp & tools we'll use
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const del = require('del');
const browserSync = require('browser-sync');
const path = require('path');
const historyApiFallback = require('connect-history-api-fallback');
const Vulcanize = require('vulcanize');
const through = require('through2');
const gutil = require('gulp-util');
const spawn = require('child_process').spawn;
const argv = require('yargs').argv;
const htmlmin = require('gulp-htmlmin');
const gulpCallBack = require('gulp-callback');

// Source and destination directories
const DIST = 'dist';
const SRC = 'src/_site';
const NOTSRC = '!src/_site';

// Helpers for creating paths
function notsrc(subpath) {
    return !subpath ? NOTSRC : path.join(NOTSRC, subpath);
}

function src(subpath) {
    return !subpath ? SRC : path.join(SRC, subpath);
}

function dist(subpath) {
    return !subpath ? DIST : path.join(DIST, subpath);
}

// Build production files, the default task
gulp.task('default', ['copy-resources', 'copy-bower', 'html', 'images', 'imports'], function (cb) {cb()});

// Clean output directory
gulp.task('clean', function () {
    return del([src(), dist()]);
});

// Serve without building, useful for rapid development
gulp.task('serve', function (cb) {
	const args = ['exec', 'jekyll', 'serve', '--incremental'];

	if (argv.port) {
		args.push(`--port=${argv.port}`);
	}

	const jekyll = spawn('bundle', args, {
		stdio: 'inherit', shell: true
	}).on('close', cb);

    jekyll.on('exit', function(code) {
        gulpCallBack(code === 0 ? null : `ERROR: Jekyll process exited with code: ${code}`);
    });

    return jekyll;
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function () {
    browserSync({
        port: 5001,
        notify: false,
        logPrefix: 'PSK',
        snippetOptions: {
            rule: {
                match: '<span id="browser-sync-binding"></span>',
                fn: function(snippet) {
                    return snippet;
                }
            }
        },
        server: {
			baseDir: dist()
		},
        middleware: [historyApiFallback()]
    });
});

// Vulcanize imports file
gulp.task('imports', ['build-jekyll'], function () {
    return gulp.src(src('static/imports.html'))
        .pipe(doVulcanize({
            stripComments: true,
            inlineCss: true,
            inlineScripts: true,
            abspath: src()
        }))
        .pipe(htmlmin({
            collapseWhitespace: true,
            conservativeCollapse: true,
            minifyJS: true,
            minifyCSS: true
        }))
        .pipe(gulp.dest(dist('static')))
        .pipe($.size({title: 'imports'}));
});

// Optimize images
gulp.task('images', ['build-jekyll'], function () {
    return gulp.src(src('static/img/**/*'))
        .pipe($.imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(dist('static/img')))
        .pipe($.size({title: 'images'}));
});

// Scan your HTML for assets & optimize them
gulp.task('html', ['build-jekyll'], function () {
    return gulp.src([
        src('**/*.html'),
        notsrc('bower_components/**/*.html'),
        notsrc('static/**/*.html')
    ])
        .pipe(htmlmin({
            collapseWhitespace: true,
            conservativeCollapse: true,
            minifyJS: true,
            minifyCSS: true
        }))
        .pipe(gulp.dest(dist()));
});

// Copy resource (non-html) files
gulp.task('copy-resources', ['build-jekyll'], function () {
    return gulp.src([
        src('**'),
        notsrc('**/*.html'),
        notsrc('bower_components/**'),
        notsrc('bower_components'),
        notsrc('static/**'),
        notsrc('cache-config.json'),
        notsrc('.DS_Store')
    ], {
        dot: true,
        base: src()
    })
		.pipe(gulp.dest(dist()))
        .pipe($.size({
            title: 'copy'
        }));
});

// Copy certain bower resources to dist
gulp.task('copy-bower', function () {
    return gulp.src([
        'src/bower_components/webcomponentsjs/webcomponents-lite.js',
        'src/bower_components/font-awesome/fonts/*',
        'src/bower_components/roboto-fontface/fonts/roboto/*'
    ], {
        dot: true,
        base: 'src'
    })
        .pipe(gulp.dest(dist()))
        .pipe($.size({
            title: 'static'
        }));
});

gulp.task('build-jekyll', function (cb) {
    const jekyll = spawn('bundle', ['exec', 'jekyll', 'build'], { stdio: 'inherit', shell: true })
        .on('close', cb);

    jekyll.on('exit', function (code) {
        gulpCallBack(code === 0 ? null : `ERROR: Jekyll process exited with code: ${code}`);
    });

    return jekyll
});

function doVulcanize(opts) {
    opts = opts || {};

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
            cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError('gulp-vulcanize', 'Streaming not supported'));
			return;
		}

        // vulcanize expects target path to be relative to abspath
        let filePath = opts.abspath ? path.relative(opts.abspath, file.path) : file.path;

		(new Vulcanize(opts)).process(filePath, function (err, inlinedHtml) {
			if (err) {
				cb(new gutil.PluginError('gulp-vulcanize', err, {fileName: filePath}));
				return;
			}

			file.contents = new Buffer(inlinedHtml);
			cb(null, file);
		});
	});
}
