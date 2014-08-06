var
  ext = require('gulp-ext-replace'),
  frontMatter = require('gulp-front-matter'),
  gulp = require('gulp'),
  jade = require('jade'),
  marked = require('gulp-marked'),
  through = require('through2');

/*globals Buffer*/

var site = require('./config');

var applyTemplate = function () {

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

gulp.task('default', ['markdown']);
