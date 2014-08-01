var gulp = require('gulp'),
  jade = require('gulp-jade');

gulp.task('default', function () {

  return gulp.src([
      'src/**/*.jade',
      '!src/layouts/*.jade',
      '!src/templates/*.jade'
    ])
    .pipe(jade())
    .pipe(gulp.dest('www'));
});
