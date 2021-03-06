'use strict';

import plugins from 'gulp-load-plugins';
import yargs from 'yargs';
import browser from 'browser-sync';
import gulp from 'gulp';
import panini from 'panini';
import rimraf from 'rimraf';
import sherpa from 'style-sherpa';
import yaml from 'js-yaml';
import fs from 'fs';
import webpackStream from 'webpack-stream';
import webpack2 from 'webpack';
import named from 'vinyl-named';

// Load all Gulp plugins into one variable
const $ = plugins();

// Check for --production flag
const PRODUCTION = !!(yargs.argv.production);

// Load settings from settings.yml
const {
  COMPATIBILITY,
  PORT,
  UNCSS_OPTIONS,
  PATHS
} = loadConfig();

function loadConfig() {
  let ymlFile = fs.readFileSync('config.yml', 'utf8');
  return yaml.load(ymlFile);
}

// Build the "dist" folder by running all of the below tasks
gulp.task('build',
  gulp.series(clean, gulp.parallel(svgSprite, jsES5, jsES6), pages, sass, images, injectSvgSprite, javascript, styleGuide, copy));

// Build the site, run the server, and watch for file changes
gulp.task('default',
  gulp.series('build', server, watch));

// Delete the "dist" folder
// This happens every time a build starts
function clean(done) {
  rimraf(PATHS.dist, done);
}

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
function copy() {
  return gulp.src(PATHS.assets)
    .pipe(gulp.dest(PATHS.distAssets));
}

// Copy page templates into finished HTML files
function pages() {
  return gulp.src(PATHS.srcPages)
    .pipe(panini({
      root: 'src/pages/',
      layouts: 'src/layouts/',
      partials: 'src/partials/',
      data: 'src/data/',
      helpers: 'src/helpers/'
    }))
    .pipe(gulp.dest(PATHS.dist));
}

// Load updated HTML templates and partials into Panini
function resetPages(done) {
  panini.refresh();
  done();
}

// Generate a style guide from the Markdown content and HTML template in styleguide/
function styleGuide(done) {
  sherpa('src/styleguide/index.md', {
    output: PATHS.dist + '/styleguide.html',
    template: 'src/styleguide/template.html'
  }, done);
}

// Compile Sass into CSS
// In production, the CSS is compressed
function sass() {
  return gulp.src(PATHS.srcScssApp)
    .pipe($.sourcemaps.init())
    .pipe($.sass({
        includePaths: PATHS.sassLibraries
      })
      .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: COMPATIBILITY
    }))
    // Comment in the pipe below to run UnCSS in production
    //.pipe($.if(PRODUCTION, $.uncss(UNCSS_OPTIONS)))
    .pipe($.if(PRODUCTION, $.cleanCss({
      compatibility: 'ie9'
    })))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(PATHS.distCSS))
    .pipe(browser.reload({
      stream: true
    }));
}

let webpackConfig = {
  module: {
    rules: [{
      test: /.js$/,
      use: [{
        loader: 'babel-loader'
      }]
    }]
  }
}
// Combine JavaScript into one file
// In production, the file is minified
// Combine ES5 scripts without webpack
function jsES5() {
  return gulp.src(PATHS.jsES5)
    .pipe($.sourcemaps.init())
    .pipe($.concat('scripts-es5.js'))
    .pipe($.if(PRODUCTION, $.uglify()
      .on('error', e => {
        console.log(e);
      })
    ))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(PATHS.srcJSConcat));
}
// Combine ES6 scripts through webpack
function jsES6() {
  return gulp.src(PATHS.jsES6)
    .pipe(named())
    .pipe($.sourcemaps.init())
    .pipe(webpackStream(webpackConfig, webpack2))
    .pipe($.if(PRODUCTION, $.uglify()
      .on('error', e => {
        console.log(e);
      })
    ))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(PATHS.srcJSConcat));
}
// Combine JavaScript into one file
// In production, the file is minified
function javascript() {
  return gulp.src(PATHS.javascript)
    .pipe(named())
    .pipe($.sourcemaps.init())
    .pipe($.concat('app.js'))
    .pipe($.if(PRODUCTION, $.uglify()
      .on('error', e => {
        console.log(e);
      })
    ))
    .pipe($.if(!PRODUCTION, $.uglify()
      .on('error', e => {
        console.log(e);
      })
    ))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(PATHS.distJS));
}

// Copy images to the "dist" folder
// In production, the images are compressed
function images() {
  return gulp.src(PATHS.srcFilesImages)
    .pipe($.if(PRODUCTION, $.imagemin({
      progressive: true
    })))
    .pipe(gulp.dest(PATHS.distImages));
}

// Create svg-sprite
function svgSprite() {
  return gulp.src(PATHS.srcFilesSVG)
    .pipe($.svgSymbols({
      id: '%f',
      svgClassname: 'svg-sprite-master',
      // templates: [
      //   path.join(__dirname, 'src/assets/svg/templates/svg-symbols.svg'),
      //   'default-css'
      // ],
      templates: ['default-svg', 'default-css'],
      title: '%f'
    }))
    .pipe(gulp.dest(PATHS.srcSVG));
}

// inject svgSprite
function injectSvgSprite() {
  return gulp.src(PATHS.srcSvgSpriteInjectionInput)
    .pipe($.styleInject({
      encapsulated: false,
      path: 'src/assets/svg/'
    }))
    .pipe($.rename('svg-sprite-master.html'))
    .pipe(gulp.dest(PATHS.srcSvgSpriteInjectionOutput))
    .pipe(browser.reload({
      stream: true
    }));
}

// Start a server with BrowserSync to preview the site in
function server(done) {
  browser.init({
    server: PATHS.dist,
    port: PORT
  });
  done();
}

// Reload the browser with BrowserSync
function reload(done) {
  browser.reload();
  done();
}

// Watch for changes to static assets, pages, Sass, and JavaScript
function watch() {
  gulp.watch(PATHS.assets, copy);
  gulp.watch(PATHS.srcPages).on('all', gulp.series(pages, browser.reload));
  gulp.watch(PATHS.srcPagesData).on('all', gulp.series(resetPages, pages, browser.reload));
  gulp.watch(PATHS.srcFilesScss).on('all', gulp.series(sass, browser.reload));
  gulp.watch(PATHS.jsES5).on('all', gulp.series(jsES5, javascript, browser.reload));
  gulp.watch(PATHS.jsES6).on('all', gulp.series(jsES6, javascript, browser.reload));
  gulp.watch(PATHS.srcFilesImages).on('all', gulp.series(images, browser.reload));
  gulp.watch(PATHS.srcFilesSVG).on('all', gulp.series(svgSprite, injectSvgSprite, browser.reload));
  gulp.watch(PATHS.srcStyleguideFiles).on('all', gulp.series(styleGuide, browser.reload));
}