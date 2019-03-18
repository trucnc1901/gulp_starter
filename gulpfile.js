/*global require*/
'use strict';

const gulp = require('gulp');
const pug = require('gulp-pug'); // Pug template engine
// const prefix = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create(); // Sync withn browser
const uglify = require('gulp-uglify'); // Minify javascript
const saveLicense = require('uglify-save-license');
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
// const path = require('path');
// let webpack = require('webpack-stream');
// const webpackConfig = require('./webpack.config.js');
const rollupEach = require('gulp-rollup-each');
const rollupBuble = require('rollup-plugin-buble');
// const gulpIgnore = require('gulp-ignore');
// const data = require('gulp-data');

const CONFIG = {
  path: require('./configs/path-env.js'),
}

const optionCSS = {
  browsers: [
    'last 2 versions',
    'ie >= 11',
    'ios >= 9',
    'android >= 5'
  ]
}

/**
 * Wait for pug and sass tasks, then launch the browser-sync Server
 */
// BrowserSync
function browser_sync(done) {
  browserSync.init({
    server: {
      baseDir: CONFIG.path.dist
    },
    port: 3000,
    ghostMode: false,
    notify: false,
    ui: false
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
  return del(CONFIG.path.dist)
}

/**
 * Compile image jpg and png ..
 */

function images() {
  return gulp
    .src('./src/**/*.+(png|jpg|jpeg|gif|svg|ico)')
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
    .pipe(gulp.dest(CONFIG.path.dist))
    .pipe(browserSync.stream())
};

/**
 * Compile .pug files and pass in data from json file
 * matching file . index.pug - index.pug.json
 */

function jade() {
  return gulp
    .src(['./src/**/*.pug', '!./src/_pug/**/*.pug'])
    .pipe(plumber({
      errorHandler: (error) => {
        console.log('-------------')
        console.log(`【ERROR】${error.plugin}`)
        console.log(`【file】${error.fileName}`)
        console.log(`【line】${error.lineNumber}`)
        console.log(`【column】${error.columnNumber}`)
        console.log(`【message】${error.message}`)
        console.log('')
      }
    }))
    .pipe(gulpIf('!**/*.html', pug({
      pretty: true,
      basedir: CONFIG.path.src,
    })))
    // .on('error', function (err) {
    //   process.stderr.write(err.message + '\n');
    //   this.emit('end');
    // })
    .pipe(gulp.dest(CONFIG.path.dist))
    .pipe(browserSync.stream())
};

function html() {
  return gulp
    .src('./src/**/*.html')
    .pipe(gulp.dest(CONFIG.path.dist))
    .pipe(browserSync.stream())
}

/**
 * Compile .scss files into dist css directory With autoprefixer no
 * need for vendor prefixes then live reload the browser.
 */
function css() {
  return gulp
    .src('./src/**/*.{scss,sass,css}')
    .pipe(plumber({
      errorHandler: (error) => {
        console.log('-------------')
        console.log(`【ERROR】${error.plugin}`)
        console.log(`【file】${error.fileName}`)
        console.log(`【line】${error.lineNumber}`)
        console.log(`【column】${error.columnNumber}`)
        console.log(`【message】${error.message}`)
        console.log('')
      }
    }))
    .pipe(sourcemaps.init())
    // Compile Sass using LibSass.
    .pipe(sass({
      outputStyle: "expanded",
      errLogToConsole: true, // Log errors.
    }))
    .pipe(rename(function (path) {
      path.dirname = path.dirname.replace('sass', 'css');
      return path;
    }))
    // Parse with PostCSS pluginss.
    .pipe(gulpIf('!**/vendor/**', postcss([autoprefixer(optionCSS), cssnano({colormin: false})])))
    // Create sourcemap.
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(CONFIG.path.dist))
    .pipe(browserSync.stream());
};

function js() {
  return gulp.src([
      './src/**/*.js',
      '!./src/_js/components/*.js'
    ])
    .pipe(plumber({
      errorHandler: (error) => {
        console.log('-------------')
        console.log(`【ERROR】${error.plugin}`)
        console.log(`【file】${error.fileName}`)
        console.log(`【line】${error.lineNumber}`)
        console.log(`【column】${error.columnNumber}`)
        console.log(`【message】${error.message}`)
        console.log('')
      }
    }))
    .pipe(sourcemaps.init())
    .pipe(gulpIf('!**/vendor/**', babel({
      "presets": ["@babel/preset-env"]
    })))
    .pipe(gulpIf('!**/vendor/**', rollupEach({
      // inputOptions
      external: ['jquery'],
      onwarn: function (message) {
        if (/The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten./.test(message)) {
            return;
        }
        // console.error(message);
      },
      plugins: [
        rollupBuble({
          target: {
            ie: 11
          }
        })
      ],
      isCache: true // enable Rollup cache
    }, {
      // outputOptions
      format: 'iife',
      name: 'Share',
      globals: {
        jquery: 'jQuery',
        '@share': 'Share',
        chart: 'Chart',
        google: 'google'
      }
    })))
    .pipe(uglify({
      output: {
        comments: saveLicense
      }
    }))
    .on('error', function (err) {
      process.stderr.write(err.message + '\n');
      this.emit('end');
    })
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(CONFIG.path.dist))
    .pipe(browserSync.stream())
};


function fonts() {
  return gulp.src('./src/**/fonts/*.+(eot|ttf|woff|woff2|svg)')
    .pipe(gulp.dest(CONFIG.path.dist))
    .pipe(browserSync.stream())
}

/**
 * Watch scss files for changes & recompile
 * Watch .pug files run pug-rebuild then reload BrowserSync
 */
function watchFiles() {
  gulp.watch('./src/**/*.pug', jade);
  gulp.watch('./src/**/*.html', html);
  gulp.watch('./src/**/*.{scss,sass,css}', css);
  gulp.watch([
    './src/**/*.js'
  ], js);
  gulp.watch('./src/**/*.+(png|jpg|jpeg|gif|svg|ico)', images);
  gulp.watch('./src/**/fonts/*.+(eot|ttf|woff|woff2|svg)', fonts);
  gulp.series(browserSyncReload)
};

/**
 * Default task, running just `npm run build` will compile the sass,
 * compile the jekyll site, launch BrowserSync then watch
 * files for changes
 */


const build = gulp.series(clean, gulp.parallel(jade, html, css, images, fonts, js));
const watch = gulp.parallel(watchFiles, browser_sync);

exports.css = css;
exports.images = images;
exports.clean = clean;
exports.jade = jade;
exports.html = html;
exports.fonts = fonts;
exports.js = js;
exports.build = build;
exports.watch = watch;
exports.default = build;