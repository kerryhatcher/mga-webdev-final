'use strict';
// =======================================================================
// Gulp Plugins
// =======================================================================
var gulp = require('gulp'),
    connect = require('gulp-connect'),
    source = require('vinyl-source-stream'),
    //angularTemplates = require('gulp-angular-templates'),
    open = require('gulp-open'),
    less = require('gulp-less'),
    nunjucksRender = require('gulp-nunjucks-render'),
    deploy = require('gulp-deploy-git'),
    usemin = require('gulp-usemin'),
    uglify = require('gulp-uglify'),
    ghPages = require('gulp-gh-pages'),
    rename = require('gulp-rename'),
    transform = require('vinyl-transform'),
    map = require('map-stream'),
    htmlv = require('gulp-html-validator'),
    jscs = require('gulp-jscs'),
    buffer = require('vinyl-buffer'),
    jshint = require('gulp-jshint');

var browserify = require('browserify');
var tsify = require('tsify');
var babelify = require('babelify');

// =======================================================================
// ENV Vars
// =======================================================================
var sourcecode = 'src',
    compiledcode = 'public';

var jsFiles = ['*.js', 'src/**/*.js'];

gulp.task('browserify', function () {
    return browserify(['./src/app/main.ts'])
        .plugin(tsify)
        .bundle()
        .pipe(source('main.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('public/js'));
});

gulp.task('inject', ['compile'], function() {
    var wiredep = require('wiredep').stream;
    var inject = require('gulp-inject');

    var injectSrc = gulp.src(['./public/css/*.css', './public/js/*.js'], {read: false});

    var injectOptions = {
        ignorePath: '/public/'
    };

    var options = {
        bowerJson: require('./bower.json'),
        directory: './public/lib',
        ignorePath: '../../public'
    };

    return gulp.src('./public/**/*.html')
        .pipe(wiredep(options))
        .pipe(inject(injectSrc, injectOptions))
        .pipe(gulp.dest('./public/'));
});

gulp.task('style', function () {
    return gulp.src(jsFiles)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish', {
            verbose: true
        }))
        .pipe(jscs());
});

// =======================================================================
// JS Compile Task (takes the main.js and bundles it with depeneces, then writes that out to dest)
// =======================================================================
gulp.task('js', function () {
    return gulp.src('src/js/*.js')
        .pipe(gulp.dest(compiledcode + '/js/'));
});

// =======================================================================
// Index Task (Generate index.html from template)
// =======================================================================
gulp.task('html', function () {
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
        .pipe(gulp.dest(compiledcode));
});

// =======================================================================
// Index Task (Generate index.html from template)
// =======================================================================
gulp.task('validator', function () {
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
        .pipe(gulp.dest(compiledcode + '/test/'));
});

// =======================================================================
// CSS Task (Generate CSS file from Less source files)
// =======================================================================
gulp.task('less', function () {
    return gulp.src(['src/**/app.less'])
        .pipe(less())
        .pipe(gulp.dest(compiledcode));
});

gulp.task('css', ['less']);

// =======================================================================
// Images Task
// =======================================================================
gulp.task('images', function () {
    return gulp.src('src/img/*')
        .pipe(gulp.dest(compiledcode.concat('/img/')));
});

// =======================================================================
// Cal Task
// =======================================================================
gulp.task('cal', function () {
    return gulp.src('src/cal/*')
        .pipe(gulp.dest(compiledcode.concat('/cal/')));
});

// =======================================================================
// Bower Task
// =======================================================================
gulp.task('Bower', function () {
    return gulp.src('bower_components/**/*')
        .pipe(gulp.dest(compiledcode.concat('/bower_components/')));
});

// =======================================================================
// Fonts Task
// =======================================================================
gulp.task('Fonts', function () {
    return gulp.src('bower_components/bootstrap/fonts/*')
        .pipe(gulp.dest(compiledcode.concat('/fonts/')));
});

// =======================================================================
// Files Task
// =======================================================================
gulp.task('files', function () {
    return gulp.src('src/files/*')
        .pipe(gulp.dest(compiledcode.concat('/files/')));
});

// =======================================================================
// Bower Task (read src/templates/jscss.src to compile bower components)
// =======================================================================
gulp.task('bower', function () {
    gulp.src('src/jscss.src')
        .pipe(usemin({
            assetsDir: 'bower_components',
            js: [uglify(), 'concat']
        }))
        .pipe(gulp.dest(compiledcode));
});

gulp.task('watch', function () {
    var watchFiles = [
        'src/css/*.less',
        'src/templates/*',
        'src/**/**/*',
        'src/**/*',
        'src/*',
        'src'
    ];
    gulp.watch(watchFiles, ['compile', 'inject']);
});

// =======================================================================
// Deploy Task (take compiled app and send it to branch for ghe-pages)
// =======================================================================
gulp.task('deploy', ['bower', 'compile', 'cname'], function () {
    return gulp.src('./dist/**/*')
        .pipe(ghPages());
});

gulp.task('cname', function () {
    var uppercaser = transform(function (filename) {
        return map(function (chunk, next) {
            return next(null, chunk.toString().toUpperCase());
        });
    });

    return gulp.src('CNAME')
        .pipe(uppercaser)
        .pipe(gulp.dest('dist/'));
});

// =======================================================================
// Connect Task (starts dev webserver on local host)
// =======================================================================
gulp.task('connect', ['inject'], function () {
    connect.server({
        root: compiledcode,
        port: 4000,
        livereload: true
    });
});

// =======================================================================
// Browser Task (opens default browser)
// =======================================================================
gulp.task('browser', ['connect', 'watch'], function () {
    gulp.src(__filename)
        .pipe(open({uri: 'http://localhost:4000'}));
});

gulp.task('compile', ['html', 'less', 'images', 'js', 'cal', 'Fonts', 'Bower']);

gulp.task('defualt', ['compile']);
