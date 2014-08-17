/*globals Buffer, console*/

var
  browserify = require('browserify'),
  ext = require('gulp-ext-replace'),
  frontMatter = require('gulp-front-matter'),
  gulp = require('gulp'),
  jade = require('jade'),
  jshint = require('gulp-jshint'),
  marked = require('gulp-marked'),
  sass = require('gulp-sass'),
  source = require('vinyl-source-stream'),
  through = require('through2'),

  site = require('./site'),
  
  applyTemplate = function () {

    return through.obj(function (file, enc, cb) {

      var data = {
        site: site,
        page: file.page,
        content: file.contents.toString()
      },
      template = 'src/_templates/' + file.page.template + '.jade';

      file.contents = new Buffer(jade.renderFile(template, data), 'utf8');

      this.push(file);
      cb();
    });

  };

gulp.task('get-all-data', function () {

  // gather all data from all pages
});

gulp.task('markdown', function () {

  return gulp.src('src/**/*.md')
    .pipe(frontMatter({
      property: 'page',
      remove: true
    }))
    .pipe(marked())
    .pipe(applyTemplate())
    .pipe(ext('.html'))
    .pipe(gulp.dest('www'));

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
    .pipe(gulp.dest('www/js'));
});

gulp.task('styles', function () {
  return gulp.src('src/scss/root.scss')
    .pipe(sass())
    .pipe(gulp.dest('www/css'));
});

gulp.task('watch', ['compile'], function () {
  gulp.watch('src/js/**/*.js', ['scripts']);
  gulp.watch('src/**/*.md', ['markdown']);
  gulp.watch('src/**/*.jade', ['markdown']);
  gulp.watch('src/scss/**/*.scss', ['styles']);
});

gulp.task('test', ['scripts-hints']);
gulp.task('scripts', ['scripts-hints', 'scripts-compile']);
gulp.task('compile', ['markdown', 'scripts', 'styles']);
gulp.task('default', ['compile']);
