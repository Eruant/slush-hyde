var gulp = require('gulp'),
  install = require('gulp-install'),
  conflict = require('gulp-conflict'),
  template = require('gulp-template'),
  rename = require('gulp-rename'),
  inquirer = require('inquirer');

gulp.task('default', function (done) {

  inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Name the site'
    },
    {
      type: 'input',
      name: 'packageName',
      message: 'package name (e.g. example-site)',
      validate: function (input) {
        var pass = input.match(/^[A-Za-z0-9\-]+$/);
        return (pass) ? true : 'You may only use letters, numbers and hyphens (-)'
      }
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description'
    },
    {
      type: 'confirm',
      name: 'moveon',
      message: 'Continue?',
      default: true
    }
  ],
  function (answers) {

    if(!answers.moveon) {
      return done();
    }

    gulp.src([__dirname + '/templates/**'])
      .pipe(template(answers))
      .pipe(rename(function (file) {
        if (file.basename === '_jshintrc' || file.basename === '_gitignore') {
          file.basename = '.' + file.basename.slice(1);
        }
      }))
      .pipe(conflict('./'))
      .pipe(gulp.dest('./'))
      .pipe(install())
      .on('finish', function () {
        done();
      });
  });

});
