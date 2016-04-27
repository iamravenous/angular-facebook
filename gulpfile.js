var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');

gulp.task('clean', function() {
  return del('dist/**/*');
});
gulp.task('copy', function() {
  return gulp.src('src/*.js')
    .pipe(gulp.dest('dist/'))
});
gulp.task('uglify', function() {
  return gulp.src(['dist/*.js', '!dist/*.min.js'])
    .pipe($.uglify())
    .pipe($.rename({suffix: '.min'}))
    .pipe(gulp.dest(function(f) {
      return f.base;
    }));
});

gulp.task('build', function() {
  runSequence('clean', 'copy', 'uglify');
});
