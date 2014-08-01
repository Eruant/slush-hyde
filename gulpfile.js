var gulp = require('gulp'),
  frontMatter = require('gulp-front-matter'),
  marked = require('gulp-marked'),
  jade = require('jade'),
  through = require('through2');

/*globals Buffer*/

var site = {
  name: 'Test'
};

var applyTemplate = function (templateFile) {

  return through.obj(function (file, enc, cb) {

    var data = {
      site: site,
      page: file.page,
      content: file.contents.toString()
    };

    file.contents = new Buffer(jade.renderFile(templateFile, data), 'utf8');

    this.push(file);
    cb();
  });

};

gulp.task('old', function () {

  return gulp.src([
      'src/**/*.jade',
      '!src/layouts/*.jade',
      '!src/templates/*.jade'
    ])
    .pipe(jade())
    .pipe(gulp.dest('www'));
});

gulp.task('md', function () {

  return gulp.src('src/posts/*.md')
    .pipe(frontMatter({
      property: 'page',
      remove: true
    }))
    .pipe(marked())
    .pipe(applyTemplate('src/templates/post.jade'))
    .pipe(gulp.dest('tmp'));

});
