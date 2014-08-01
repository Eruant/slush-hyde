var
  ext = require('gulp-ext-replace'),
  frontMatter = require('gulp-front-matter'),
  gulp = require('gulp'),
  gulpJade = require('gulp-jade'),
  nodeJade = require('jade'),
  marked = require('gulp-marked'),
  through = require('through2');

/*globals Buffer*/

var site = {
  title: 'Test'
};

var applyTemplate = function (templateFile) {

  return through.obj(function (file, enc, cb) {

    var data = {
      site: site,
      page: file.page,
      content: file.contents.toString()
    };

    file.contents = new Buffer(nodeJade.renderFile(templateFile, data), 'utf8');

    this.push(file);
    cb();
  });

};

gulp.task('staticFiles', function () {

  return gulp.src([
      'src/**/*.jade',
      '!src/layouts/*.jade',
      '!src/templates/*.jade'
    ])
    .pipe(gulpJade())
    .pipe(gulp.dest('www'));
});

gulp.task('posts', function () {

  return gulp.src('src/posts/*.md')
    .pipe(frontMatter({
      property: 'page',
      remove: true
    }))
    .pipe(marked())
    .pipe(applyTemplate('src/templates/post.jade'))
    .pipe(ext('.html'))
    .pipe(gulp.dest('www/posts'));

});

gulp.task('default', ['staticFiles', 'posts']);
