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
const runSequence = require('run-sequence');
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

function notsrc(subpath) {
    return !subpath ? NOTSRC : path.join(NOTSRC, subpath);
};

function src(subpath) {
    return !subpath ? SRC : path.join(SRC, subpath);
};

function dist(subpath) {
    return !subpath ? DIST : path.join(DIST, subpath);
};

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

function imageOptimizeTask(src, dest) {
    return gulp.src(src)
        .pipe($.imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(dest))
        .pipe($.size({title: 'images'}));
};

function optimizeHtmlTask(src, dest) {
    // TODO: Actually make it minimize or do something to the html
    gulp.src(src)
        .pipe(gulp.dest(dest));
};

// Optimize images
gulp.task('images', ['copy'], function() {
    return imageOptimizeTask(src('static/img/**/*'), dist('static/img'));
});

// Copy select bower scripts to the static directory
gulp.task('static', function() {
    return gulp.src([
        'src/bower_components/webcomponentsjs/webcomponents-lite.min.js'
    ], {
        dot: true
    })
        .pipe(gulp.dest('src/static/js'))
        .pipe($.size({
            title: 'static'
        }));
});

// Copy all files at the root level (app)
gulp.task('copy', ['jekyllbuild'], function() {
    return gulp.src([
        src('**'),
        notsrc('bower_components'),
        notsrc('cache-config.json'),
        notsrc('.DS_Store')
    ], {
        dot: true
    })
		.pipe(gulp.dest(dist()))
        .pipe($.size({
            title: 'copy'
        }));
});

// Copy web fonts to dist
gulp.task('fonts', ['copy'], function() {
    return gulp.src([src('static/fonts/**')])
        .pipe(gulp.dest(dist('static/fonts')))
        .pipe($.size({
            title: 'fonts'
        }));
});

// Scan your HTML for assets & optimize them
gulp.task('html', ['copy'], function() {
    return optimizeHtmlTask(
        // TODO: Changed extension from HTML because JS wasn't getting copied over.
        [src('**/*.html'), notsrc('bower_components/**/*.html'), notsrc('static/**/*.html')],
        dist());
});

// Vulcanize granular configuration
gulp.task('imports', ['images', 'fonts', 'html'], function() {
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

// Clean output directory
gulp.task('clean', function() {
    return del([src(), dist()]);
});

gulp.task('serve', ['static'], function(done) {
	const args = ['exec', 'jekyll', 'serve'];

	if (argv.port) {
		args.push(`--port=${argv.port}`);
	}

	const jekyll = spawn('bundle', args, {
		stdio: 'inherit', shell: true
	}).on('close', done);

    jekyll.on('exit', function(code) {
        gulpCallBack(code === 0 ? null : `ERROR: Jekyll process exited with code: ${code}`);
    });

    return jekyll;
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function() {
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
        // Run as an https by uncommenting 'https: true'
        // Note: this uses an unsigned certificate which on first access
        //       will present a certificate warning in the browser.
        // https: true,
        server: {
			baseDir: dist()
		},
        middleware: [historyApiFallback()]
    });
});

gulp.task('jekyllbuild', ['static'], function(done) {
    const jekyll = spawn('bundle', ['exec', 'jekyll', 'build'], { stdio: 'inherit', shell: true })
        .on('close', done);

    jekyll.on('exit', function(code) {
        gulpCallBack(code === 0 ? null : `ERROR: Jekyll process exited with code: ${code}`);
    });

    return jekyll
});

// Build production files, the default task
gulp.task('default', ['clean'], function(cb) {
    runSequence('imports', cb);
});
