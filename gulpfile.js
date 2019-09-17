const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const gcmq = require('gulp-group-css-media-queries');
//const less = require('gulp-less');
const sass = require('gulp-sass');
const smartgrid = require('smart-grid');
const gridOptPath = './smartgrid.js';
const path = require('path');

const isDev = (process.argv.indexOf('--dev') !== -1);
const isProd = !isDev;
const isSync = (process.argv.indexOf('--sync') !== -1);

sass.compiler = require('node-sass');


function clear(){
	return del('build/*');
}

function styles(){
	return gulp.src('./src/css/styles.scss')
			   .pipe(gulpif(isDev, sourcemaps.init()))
			   //.pipe(less())
			   .pipe(sass().on('error', sass.logError))
			   //.pipe(concat('style.css'))
			   .pipe(gcmq())
			   .pipe(autoprefixer({
		            browsers: ['> 0.1%'],
		            cascade: false
		        }))
			   //.on('error', console.error.bind(console))
			   .pipe(gulpif(isProd, cleanCSS({
			   		level: 2
			   })))
			   .pipe(gulpif(isDev, sourcemaps.write()))
			   .pipe(gulp.dest('./build/css'))
			   .pipe(gulpif(isSync, browserSync.stream()));
}

function img(){
	return gulp.src('./src/img/**/*')
			   .pipe(gulp.dest('./build/img'))
			   .pipe(gulpif(isSync, browserSync.stream()));
}

function html(){
	return gulp.src('./src/*.html')
			   .pipe(gulp.dest('./build'))
			   .pipe(gulpif(isSync, browserSync.stream()));
}

function scripts() {
	return gulp.src(['./src/js/jquery.min.js', './src/js/slick.min.js', './src/js/scripts.js'])
			   .pipe(concat('scripts.js'))
			   .pipe(uglify())
			   .pipe(gulp.dest('./build/js'))
			   .pipe(gulpif(isSync, browserSync.stream()));
}



function grid(done){
	delete require.cache[path.resolve(gridOptPath)];
	let options = require(gridOptPath);
	smartgrid('./src/css', options);
	done();
}

function watch(){
	gulp.watch(gridOptPath, grid);
	if(isSync){
		browserSync.init({
	        server: {
	            baseDir: "./build/",
	        }
	    });
	}

	gulp.watch('./src/css/**/*', styles);
	gulp.watch('./src/js/**/*.js', scripts);
	gulp.watch('./src/**/*.html', html);
	
}

let build = gulp.series(clear, 
	gulp.parallel(styles, img, scripts, html)
);


gulp.task('build', build);
gulp.task('grid', grid);
gulp.task('watch', gulp.series(build, grid, watch));

