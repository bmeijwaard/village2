/// <binding AfterBuild='default' Clean='clean' />

// Include gulp
const gulp = require('gulp');

// Include plugins for gulp into an object array
const plugins = require('gulp-load-plugins')({
  pattern: ['*', 'gulp-*', 'gulp.*'],
  replaceString: /\bgulp[\-.]/
});

// set logger
const log = require('npmlog');
log.enableColor();

// Set config for directories
const config = require('./config.json');
// const packageJson = require('./package.json');
const tsconfig = require('./tsconfig.json');
// const dependencies = Object.keys(packageJson && packageJson.dependencies || {});

// typescript config (angularjs)
// todo, will this override tsconfig?
// tsconfig = {
//  module: 'commonjs',
//  target: 'es2015',
//  keepTree: false
// };

/**
 * Internal helper functions
 */

// Error logger
let restartWatch;

function swallowError(error) {
  log.error(error.toString());
  if (restartWatch) {
    return gulp.start('watch');
  } else {
    this.emit('end');
  }
}

// Trigger
let production = false;

/**
 * Gulp development tasks
 */

// Task: Clean
// Description: Removing assets files before running other tasks
gulp.task('clean', () => {
  return gulp
    .src(config.assets.clean, {
      allowEmpty: true
    })
    .pipe(
      plugins.clean({
        force: true
      })
    );
});
gulp.task('enable:prod', (done) => {
  production = true;
  done();
});
gulp.task('disable:prod', (done) => {
  production = false;
  done();
});

// Task: TypeScript compiler for CI purposes only
const typescript = require('gulp-tsc');
gulp.task('compile_typescript', (done) => {
  gulp
    .src('./components/**/*.ts')
    .pipe(typescript(tsconfig))
    .pipe(gulp.dest('./components/'));
  done();
});

// Task: Handle SASS
gulp.task('sass', () => {
  return (
    gulp
      .src(config.stylesheets.base)
      .pipe(plugins.sass())
      .on('error', swallowError)

      // TODO deze gaat fout
      // .pipe(plugins.autoprefixer({
      // browsers: ['last 2 versions', 'ie >= 10', 'safari >= 8', 'firefox >= 41',
      //      'chrome >= 45', 'ios >= 8', 'android >= 4.1']
      // }))

      // If producion
      .pipe(plugins.if(production, plugins.cssnano()))
      .pipe(gulp.dest(config.stylesheets.dest))
      .pipe(
        plugins.browserSync.reload({
          stream: true
        })
      )
  );
});

// Task: Handle Javascripts
gulp.task('javascript', () => {
  return (
    gulp
      .src(config.assets.js.source.concat([config.javascript.source]))
      // angularjs heeft een specifieke volgorde nodig voor compilatie.
      // TODO indien 'gewone' JS en AngularJS conflicten geven moeten deze worden gescheiden.
      .pipe(plugins.angularFilesort())
      .pipe(plugins.concat('main.js'))
      .on('error', swallowError)

      // If production
      .pipe(plugins.if(production, plugins.uglify()))
      .pipe(gulp.dest(config.javascript.dest))
      .pipe(
        plugins.browserSync.reload({
          stream: true
        })
      )
  );
});

// Task: Handle Javascript libraries
// Description: Get all libs and concat to libs.js
gulp.task('plugins_javascript', () => {
  return gulp
    .src(config.plugins.javascript)
    .pipe(plugins.concat('vendor.js'))
    .on('error', swallowError)
    .pipe(plugins.if(production, plugins.uglify()))
    .pipe(gulp.dest(config.javascript.dest));
});
gulp.task('plugins_styles', () => {
  return gulp
    .src(config.assets.scss.source)
    .pipe(plugins.sass())
    .on('error', swallowError)
    .pipe(plugins.if(production, plugins.cssnano()))
    .pipe(gulp.dest(config.stylesheets.dest));
});

// Task: Handle assets
// Description: Copy all images, videos, fonts etc to build folder
gulp.task('assets_img', () => {
  return gulp.src(config.assets.img.source).pipe(gulp.dest(config.assets.img.dest));
});
gulp.task('assets_fonts', () => {
  return gulp.src(config.assets.fonts.source).pipe(gulp.dest(config.assets.fonts.dest));
});
gulp.task('assets', gulp.parallel('assets_fonts', 'assets_img'));

// Task: BrowserSync
gulp.task('reload', (done) => {
  plugins.browserSync.reload();
  done();
});

gulp.task('browser_sync', (done) => {
  plugins.browserSync.init({
    injectChanges: true,
    proxy: config.dotnet.https,
    https: config.dotnet.useHttps,
    port: config.dotnet.port
  });
  done();
});

// Task: Watch files
gulp.task(
  'watch',
  gulp.parallel(
    'browser_sync',
    gulp.series(() => {
      gulp.watch(config.stylesheets.files + '.scss', gulp.series('sass')).on('change', plugins.browserSync.reload);
      gulp.watch(config.javascript.source, gulp.series('javascript')).on('change', plugins.browserSync.reload);
      gulp.watch('./views/**/*.cshtml').on('change', plugins.browserSync.reload);
      gulp.watch('Assets/**/*', gulp.series('compile')).on('change', plugins.browserSync.reload);
    })
  )
);

// Task: Default
// Description: Build all stuff of the project once
gulp.task(
  'default',
  gulp.series('clean', gulp.parallel('javascript', 'sass', 'plugins_styles', 'plugins_javascript', 'assets'))
);

gulp.task('vendor', gulp.parallel('plugins_styles', 'plugins_javascript'));

// Task: Compile
// Description: Build all dev code upon dotnet build
gulp.task('compile', gulp.parallel('javascript', 'sass', 'plugins_styles', 'plugins_javascript', 'assets'));

// Task: Start your production process
// Description: Build, enable browsersync and watch
gulp.task(
  'serve',
  gulp.series('default', () => {
    production = false;
    return gulp.start('watch');
  })
);

// Task: Release
// Description: Build and minify
gulp.task(
  'release:dev',
  gulp.series('disable:prod', gulp.parallel('plugins_styles', 'sass', 'plugins_javascript', 'javascript', 'assets'))
);
gulp.task(
  'release',
  gulp.series('enable:prod', gulp.parallel('plugins_styles', 'sass', 'plugins_javascript', 'javascript', 'assets'))
);
