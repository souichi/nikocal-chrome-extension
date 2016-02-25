var gulp = require("gulp");
var typescript = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('build', function () {
  return gulp.src( ['./**/*.ts', '!./node_modules/**'])
  .pipe(sourcemaps.init())
  .pipe(typescript({
    target: 'ES6',
    module: 'commonjs',
  }))
  .js
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('./'));
});
