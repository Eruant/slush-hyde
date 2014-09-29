/*globals console*/

var
  browserify = require('browserify'),
  ext = require('gulp-ext-replace'),
  frontMatter = require('gulp-front-matter'),
  gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  marked = require('gulp-marked'),
  sass = require('gulp-sass'),
  source = require('vinyl-source-stream'),
  browserSync = require('browser-sync'),

  siteFunc = require('./siteFunctions.js');

gulp.task('collectPosts', function () {
  return gulp.src('src/posts/**/*.md')
    .pipe(frontMatter({
      property: 'page',
      remove: true
    }))
    .pipe(marked())
    .pipe(siteFunc.collectPosts());
});

gulp.task('collectPages', function () {

  return gulp.src([
    'src/**/*.md',
    '!src/posts/**/*.md'
  ])
    .pipe(frontMatter({
      property: 'page',
      remove: true
    }))
    .pipe(siteFunc.collectPages());

});

gulp.task('markdown', ['collectPosts', 'collectPages'], function () {

  return gulp.src('src/**/*.md')
    .pipe(frontMatter({
      property: 'page',
      remove: true
    }))
    .pipe(marked())
    .pipe(siteFunc.applyTemplate())
    .pipe(ext('.html'))
    .pipe(gulp.dest('dest/test'))
    .pipe(gulp.dest('dest/www'));

});

gulp.task('scripts-hints', function () {
  return gulp.src(['src/js/**/*.js', '!src/js/**/*_spec.js'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .on('error', function () {
      console.warn('Error: JSHint encountered an error');
    });
});

gulp.task('scripts-compile', ['scripts-hints'], function () {
  var bundleStream = browserify('./src/js/base.js').bundle();

  bundleStream
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dest/test/js'))
    .pipe(gulp.dest('dest/www/js'));
});

gulp.task('styles', function () {
  return gulp.src('src/scss/root.scss')
    .pipe(sass())
    .pipe(gulp.dest('dest/test/css'))
    .pipe(gulp.dest('dest/www/css'));
});

gulp.task('watch', ['compile'], function () {
  gulp.watch('src/js/**/*.js', ['scripts']);
  gulp.watch('src/**/*.md', ['markdown']);
  gulp.watch('src/**/*.jade', ['markdown']);
  gulp.watch('src/scss/**/*.scss', ['styles']);
});

gulp.task('localhost', ['compile'], function () {

  return browserSync.init([
    'dest/test/*.html',
    'dest/test/js/*.js',
    'dest/test/css/*.css'
  ], {
    server: './dest/test'
  });
});

gulp.task('test', ['scripts-hints']);
gulp.task('scripts', ['scripts-hints', 'scripts-compile']);
gulp.task('compile', ['markdown', 'scripts', 'styles']);
gulp.task('default', ['localhost']);
