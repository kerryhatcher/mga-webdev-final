'use strict';
// =======================================================================
// Gulp Plugins
// =======================================================================
var gulp = require('gulp'),
    connect = require('gulp-connect'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    //angularTemplates = require('gulp-angular-templates'),
    less = require('gulp-less'),
    open = require('gulp-open'),
    nunjucksRender = require('gulp-nunjucks-render'),
    deploy = require('gulp-deploy-git'),
    usemin = require('gulp-usemin'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css'),
    ghPages = require('gulp-gh-pages'),
    rename = require("gulp-rename"),
    transform = require('vinyl-transform'),
    map = require('map-stream'),
    htmlv = require('gulp-html-validator');


// =======================================================================
// ENV Vars
// =======================================================================
var sourcecode = "src",
    compiledcode = "dist";


// =======================================================================
// JS Compile Task (takes the main.js and bundles it with depeneces, then writes that out to dest)
// =======================================================================
gulp.task('js', function () {
    return gulp.src('src/js/app.js')
        .pipe(gulp.dest(compiledcode + '/js/'));
});

// =======================================================================
// Index Task (Generate index.html from template)
// =======================================================================
gulp.task('html', function() {
    // Gets .html and .nunjucks files in pages
    //console.log(sourcecode.concat('/*.nunjucks'));
    //console.log(sourcecode.concat('/templates'));
    //console.log(compiledcode);
    return gulp.src([sourcecode.concat('/templates/*.html'), sourcecode.concat('/templates/**/*.html')])
    // Renders template with nunjucks
        .pipe(nunjucksRender({
            path: [sourcecode.concat('/templates')]
        }))
        .pipe(connect.reload())
        // output files in app folder
        .pipe(gulp.dest(compiledcode))
});

// =======================================================================
// Index Task (Generate index.html from template)
// =======================================================================
gulp.task('validator', function() {
    // Gets .html and .nunjucks files in pages
    //console.log(sourcecode.concat('/*.nunjucks'));
    //console.log(sourcecode.concat('/templates'));
    //console.log(compiledcode);
    return gulp.src([sourcecode.concat('/templates/*.html'), sourcecode.concat('/templates/**/*.html')])
    // Renders template with nunjucks
        .pipe(nunjucksRender({
            path: [sourcecode.concat('/templates')]
        }))
        .pipe(connect.reload())
        .pipe(htmlv({format: 'html'}))
        // output files in app folder
        .pipe(gulp.dest(compiledcode + "/test/"))
});

// =======================================================================
// CSS Task (Generate CSS file from Less source files)
// =======================================================================
gulp.task('less', function() {
    return gulp.src(['src/**/app.less'])
        .pipe(less())
        .pipe(gulp.dest(compiledcode));
});
gulp.task('css', ['less']);

// =======================================================================
// Images Task
// =======================================================================
gulp.task('images', function() {
    return gulp.src('src/img/*')
        .pipe(gulp.dest(compiledcode.concat('/img/')));
});

// =======================================================================
// Cal Task
// =======================================================================
gulp.task('cal', function() {
    return gulp.src('src/cal/*')
        .pipe(gulp.dest(compiledcode.concat('/cal/')));
});

// =======================================================================
// Bower Task
// =======================================================================
gulp.task('Bower', function() {
    return gulp.src('bower_components/**/*')
        .pipe(gulp.dest(compiledcode.concat('/bower_components/')));
});

// =======================================================================
// Fonts Task
// =======================================================================
gulp.task('Fonts', function() {
    return gulp.src('bower_components/bootstrap/fonts/*')
        .pipe(gulp.dest(compiledcode.concat('/fonts/')));
});


// =======================================================================
// Files Task
// =======================================================================
gulp.task('files', function() {
    return gulp.src('src/files/*')
        .pipe(gulp.dest(compiledcode.concat('/files/')));
});


// =======================================================================
// Bower Task (read src/templates/jscss.src to compile bower components)
// =======================================================================
gulp.task('bower', function() {
    gulp.src('src/jscss.src')
        .pipe(usemin({
            assetsDir: 'bower_components',
            js: [uglify(), 'concat']
        }))
        .pipe(gulp.dest(compiledcode));
});



gulp.task('watch', function() {
    var watchFiles = [
        'src/css/*.less',
        'src/templates/*',
        'src/**/**/*',
        'src/**/*',
        'src/*',
        'src'
    ];
    gulp.watch(watchFiles, ['compile']);
});

// =======================================================================
// Deploy Task (take compiled app and send it to branch for ghe-pages)
// =======================================================================
gulp.task('deploy', ['bower', 'compile', 'cname'], function() {
    return gulp.src('./dist/**/*')
        .pipe(ghPages());
});
gulp.task('cname', function() {
    var uppercaser = transform(function(filename) {
        return map(function(chunk, next) {
            return next(null, chunk.toString().toUpperCase())
        })
    });
    return gulp.src('CNAME')
        .pipe(uppercaser)
        .pipe(gulp.dest('dist/'))
});


// =======================================================================
// Connect Task (starts dev webserver on local host)
// =======================================================================
gulp.task('connect', ['compile'], function () {
    connect.server({
        root: compiledcode,
        port: 4000,
        livereload: true
    })
});


// =======================================================================
// Browser Task (opens default browser)
// =======================================================================
gulp.task('browser', ['connect', 'watch'], function(){
    gulp.src(__filename)
        .pipe(open({uri: 'http://localhost:4000'}));
});


gulp.task('compile', ['html', 'less', 'images', 'js', 'cal', 'Fonts', 'Bower']);

gulp.task('defualt', ['compile']);