var gulp 	= require('gulp'),
	jshint	= require('gulp-jshint'),
	uglify	= require('gulp-uglify'),
	rename	= require('gulp-rename');

gulp.task('lint', function() {
	gulp.src('./knockout.parsley.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('uglify', function() {
	gulp.src('./knockout.parsley.js')
		.pipe(uglify())
		.pipe(rename('knockout.parsley.min.js'))
		.pipe(gulp.dest('./'));
});

gulp.task('default', ['lint', 'uglify']);
