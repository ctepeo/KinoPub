var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var watch = require("gulp-watch");
var minify = require("gulp-minify");
var concat = require('gulp-concat');
var cssimport = require("gulp-cssimport");
var bower = "./bower_components";
var sources = "../src/js/";
var config = {
    libs: {
        css: ['../src/sass',
            bower + '/bootstrap-sass/assets/stylesheets',
            bower + '/font-awesome/scss'
        ],
        js: [
            bower + '/jquery/dist/jquery.js',
            bower + '/bootstrap-sass/assets/javascripts/bootstrap.js',
            bower + '/js-cookie/src/js.cookie.js',
            bower + '/jquery-color-animation/jquery.animate-colors-min.js',
            bower + '/jquery-touchswipe/jquery.touchSwipe.min.js'
        ]
    },
    app: {
        js: [
            sources + 'kinopub.boot.js',
            sources + 'kinopub.lang.js',
            sources + 'kinopub.log.js',
            sources + 'kinopub.data.js',
            sources + 'kinopub.device.js',
            sources + 'kinopub.api.js',
            sources + 'kinopub.user.js',
            sources + 'kinopub.ui.js',
            sources + 'kinopub.auth.js',
            sources + 'kinopub.config.js',
            sources + 'kinopub.modules.js',
            sources + 'kinopub.search.js',
            sources + 'kinopub.grid.js',
            sources + 'kinopub.cache.js',
            // locales
            sources + 'kinopub.lang.ru.js',
        ]
    }
};
gulp.task('kinopub-libs', function() {
    // Stylesheets
    sass('../src/sass/kinopub.libs.scss', {
        style: 'compressed',
        loadPath: config.libs.css
    }) .pipe(cssimport({
        matchPattern: "*.css" // process only css 
    })).pipe(gulp.dest("../css"));
    // JavaScript
    gulp.src(config.libs.js).pipe(concat("../js/kinopub.libs.js")).pipe(minify({
        ext: {
            min: '.min.js'
        }
    })).on('error', swallowError).pipe(gulp.dest("./"));
});
gulp.task('kinopub-app', function() {
    sass('../src/sass/kinopub.app.scss', {
        style: 'compressed',
        loadPath: config.libs.css
    }) .pipe(cssimport({
        matchPattern: "*.css" // process only css 
    })).pipe(gulp.dest("../css"));
    gulp.src(config.app.js).pipe(concat("../js/kinopub.app.js")).pipe(minify({
        ext: {
            min: '.min.js'
        }
    })).on('error', swallowError).pipe(gulp.dest("../js"));
});
gulp.task('icons', function() {
    return gulp.src(bower + '/font-awesome/fonts/**.*') .pipe(gulp.dest("../fonts/"));
});
gulp.task('watch', function() {
    gulp.watch("../src/sass/*.scss", ['kinopub-app']);
    gulp.watch("../src/js/*.js", ['kinopub-app']);
});
gulp.task('default', ['kinopub-libs', 'kinopub-app', 'watch', 'icons']);

function swallowError(error) {
    console.log(error.fileName + ":" + error.lineNumber);
    console.log(error.toString());
    console.log(error);
    this.emit('end')
}