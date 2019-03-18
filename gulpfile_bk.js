/*global require*/
'use strict';

const gulp = require('gulp');
const pug = require('gulp-pug'); // Pug template engine
// const prefix = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create(); // Sync withn browser
const uglify = require('gulp-uglify'); // Minify javascript
const babel = require('gulp-babel'); // Complie ES6 => ES5
const del = require('del'); // Remove file after complie source
const cache = require('gulp-cache'); // Clear cache
const plumber = require("gulp-plumber"); // next work if have message error
const imagemin = require('gulp-imagemin'); // Compress images
const sass = require('gulp-sass'); // Sass 
const autoprefixer = require("autoprefixer");
const postcss = require("gulp-postcss"); // ...
const cssnano = require("cssnano"); // minify css
const rename = require("gulp-rename"); // rename file
const sourcemaps = require("gulp-sourcemaps"); // sourcemap
const gulpIf = require("gulp-if"); // gulpIf

const optionCSS = {
  browsers: [
    'last 2 versions',
    'ie 11'
  ]
}

/*
 * Directories here
 */
const paths = {
  public: './public/',
  src: './src/',
  fonts: './public/fonts/'
};

const config = {
  //...
  vendorNotMinified: {
    src: [
      './src/vendor/**/*.css',
      './src/vendor/**/*.js',
      './src/fonts/**/*.*',
    ]
  },
};

/**
 * Wait for pug and sass tasks, then launch the browser-sync Server
 */
// BrowserSync
function browser_sync(done) {
  browserSync.init({
    server: {
      baseDir: paths.public
    },
    open: false,
    watchOptions: {
      debounceDelay: 1000    // Wait one second before refreshing.
    }
  });
  done();
}
// BrowserSync Reload
function browserSyncReload(done) {
  browserSync.reload();
  done();
}

// Clean assets
function clean() {
  return del(paths.public)
}


/**
 * Complie vendor folder
 */
function vendors() {
  for (var i = 0; i < config.vendorNotMinified.src.length; i++)
    gulp.src(config.vendorNotMinified.src[i])
    .pipe(gulp.dest('./src/vendor/'));

  return gulp.src(config.vendorNotMinified.src);
};

/**
 * Compile image jpg and png ..
 */

function images() {
  return gulp
    .src(['./src/**/*.+(png|jpg|jpeg|gif|svg|ico)'])
    // Caching images that ran through imagemin
    .pipe(cache(imagemin([
      imagemin.gifsicle({
        interlaced: true
      }),
      imagemin.jpegtran({
        progressive: true,
        optimizationLevel: 5
      }),
      imagemin.optipng({
        optimizationLevel: 8
      }),
      imagemin.svgo({
        plugins: [{
            removeViewBox: true
          },
          {
            cleanupIDs: false
          },
          {
            removeAttrs: {
              attrs: ['data-.*', 'fill']
            }
          },
          {
            removeDimensions: true
          },
          {
            minifyStyles: false
          },
        ]
      })
    ])))
    .pipe(gulp.dest(paths.public))
    .pipe(browserSync.stream())
};

/**
 * Compile .pug files and pass in data from json file
 * matching file . index.pug - index.pug.json
 */
function jade() {
  return gulp
    .src(['./src/**/*.pug', '!./src/_pug/**/*.pug'])
    .pipe(plumber())
    .pipe(pug({
      pretty: true
    }))
    .on('error', function (err) {
      process.stderr.write(err.message + '\n');
      this.emit('end');
    })
    .pipe(gulp.dest(paths.public))
    .pipe(browserSync.stream())
};


/**
 * Compile .scss files into public css directory With autoprefixer no
 * need for vendor prefixes then live reload the browser.
 */
function css() {
  return gulp
    .src(['./src/**/*.{scss,sass}', './src/**/*.css'])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    // Compile Sass using LibSass.
    .pipe(sass({
      outputStyle: "expanded",
      errLogToConsole: true, // Log errors.
    }))
    // .pipe(gulp.dest(paths.public))
    // .pipe(rename({ suffix: ".min" }))
    .pipe(rename(function (path) {
      function removeLastDirectory (curPath) {
        var curPath = path.dirname.split('/');
        curPath.pop();
        return(curPath.join('/'));
      }
      var newPath = removeLastDirectory(path.dirname);
      path.dirname = newPath+ "/css/"
    }))
    // Parse with PostCSS plugins.
    .pipe(postcss([autoprefixer(optionCSS), cssnano()]))
    // Create sourcemap.
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.public))
    .pipe(browserSync.stream());
};

function html() {
  return gulp
    .src('./src/**/*.html')
    .pipe(plumber())
    .pipe(gulp.dest(paths.public))
    .pipe(browserSync.stream())
};

function js() {
  return gulp.src(['./src/**/*.js', '!./src/vendor/*.js', './src/components/**/*.js'])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: [
        ['@babel/env', {
          modules: false
        }]
      ]
    }))
    // .pipe(gulpIf('!**/*.min.js', uglify({mangle: false})))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.public))
    .pipe(browserSync.stream())
};

/**
 * Watch scss files for changes & recompile
 * Watch .pug files run pug-rebuild then reload BrowserSync
 */
function watchFiles() {
  gulp.watch('./src/**/*.html', html);
  gulp.watch('./src/**/*.pug', jade);
  gulp.watch(['./src/**/*.{scss,sass}', './src/**/*.css'], css);
  gulp.watch('./src/**/*.js', js);
  gulp.watch(['./src/**/*.+(png|jpg|jpeg|gif|svg|ico)'], images);
  gulp.watch(['./src/fonts/**/*.+(eot|ttf|woff|woff2|svg)'], fonts);
  gulp.series(browserSyncReload)
};


function fonts() {
  return gulp.src(['./src/fonts/**/*.+(eot|ttf|woff|woff2|svg)'])
    .pipe(gulp.dest(paths.fonts))
    .pipe(browserSync.stream())
}
/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync then watch
 * files for changes
 */


const build = gulp.series(clean, gulp.parallel(vendors, jade, css, images, js, html, fonts));
const watch = gulp.parallel(watchFiles, browser_sync);

exports.vendors = vendors;
exports.jade = jade;
exports.css = css;
exports.images = images;
exports.clean = clean;
exports.html = html;
exports.fonts = fonts;
exports.js = js;
exports.build = build;
exports.watch = watch;
exports.default = build;