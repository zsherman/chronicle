var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  livereload = require('gulp-livereload'),
  sass = require('gulp-sass');

gulp.task('sass', function () {
  gulp.src('./public/css/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./public/css'))
    .pipe(livereload());
});

gulp.task('watch', function() {
  gulp.watch('./public/css/*.scss', ['sass']);
});

gulp.task('develop', function () {
  livereload.listen();
  console.log('listening to', __dirname);
  nodemon({
    script: 'server.js',
    ext: 'js html css',
    env: {
      'NODE_ENV': 'development'
    }
  })
  .on('change', function() {
    console.log('changed');
    setTimeout(function () {
      livereload.changed(__dirname);
    }, 500);
  })
  .on('restart', function () {
    console.log('restarted')
    setTimeout(function () {
      livereload.changed(__dirname);
    }, 500);
  });
});

gulp.task('default', [
  'sass',
  'develop',
  'watch'
]);
