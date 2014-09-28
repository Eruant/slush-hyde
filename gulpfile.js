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
  browserSync = require('browser-sync'),

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
      console.log('applying...', data);

      this.push(file);
      cb();
    });

  },
  
  collectPosts = function () {

    var posts = [],
      tags = [];

    return through.obj(function (file, enc, cb) {

      posts.push(file.page);
      posts[posts.length - 1].content = file.contents.toString();

      if (file.page.tags) {
        file.page.tags.forEach(function (tag) {
          if (tags.indexOf(tag) === -1) {
            tags.push(tag);
          }
        });
      }

      console.log('collecting...');

      this.push(file);
      cb();
    }, function (cb) {
      console.log('sorting...');

      posts.sort(function (a, b) {
        return b.date - a.date;
      });
      site.posts = posts;
      site.tags = tags;
      cb();
    });
  },
  
  collectPages = function () {

    var pages = [];

    return through.obj(function (file, enc, cb) {

      pages.push({
        title: file.page.title,
        link: file.page.link
      });

      cb();

    }, function (cb) {

      site.pages = pages;
      cb();

    });

  };

gulp.task('collectPosts', function () {
  return gulp.src('src/posts/**/*.md')
    .pipe(frontMatter({
      property: 'page',
      remove: true
    }))
    .pipe(marked())
    .pipe(collectPosts());
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
    .pipe(collectPages());

});

gulp.task('markdown', ['collectPosts', 'collectPages'], function () {

  return gulp.src('src/**/*.md')
    .pipe(frontMatter({
      property: 'page',
      remove: true
    }))
    .pipe(marked())
    .pipe(applyTemplate())
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
