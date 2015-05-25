'use strict';

/**********************************************************************************************************************/
/* Require Section                                                                                                    */
/**********************************************************************************************************************/

try {

    var _ = require("lodash");
    var buffer = require("vinyl-buffer");
    var browserify = require("browserify");
    var concat = require("gulp-concat");
    var file = require("read-file");
    var forEach = require("gulp-foreach");
    var gulp = require("gulp");
    var jshint = require("gulp-jshint");
    var log = require("npmlog");
    var rename = require("gulp-rename");
    var runSequence = require("run-sequence");
    var shell = require("shelljs");
    var size = require("gulp-size");
    var source = require("vinyl-source-stream");
    var sourcemaps = require("gulp-sourcemaps");
    var uglify = require("gulp-uglify");
    var util = require("gulp-util");
    var watchify = require("watchify");
    var minifyHTML = require('gulp-minify-html');
    var jsmin = require('gulp-jsmin');
    var concatCss = require('gulp-concat-css');
    var gulpDoxx = require('gulp-doxx');


    var del = require('del');
    var browserSync = require('browser-sync');
    var reload = browserSync.reload;

} catch (e) {
    // Unknown error, rethrow it.
    if (e.code !== "MODULE_NOT_FOUND") {
        throw e;
    }

    // Otherwise, we have a missing dependency. If the module is in the dependency list, the user just needs to run `npm install`.
    // Otherwise, they need to install and save it.
    var dependencies = require("./package.json").devDependencies;
    var module = e.toString().match(/'(.*?)'/)[1];
    var command = "npm install";

    if (typeof dependencies[module] === "undefined") {
        command += " --save-dev " + module;
    }

    console.error(e.toString() + ". Fix this by executing:\n\n" + command + "\n");
    process.exit(1);
}


/**********************************************************************************************************************/
/* Config Section                                                                                                     */
/**********************************************************************************************************************/

// Directories
var LIB_BASE = "./lib/";
var DEMO_BASE = "./app/";
var DIST_BASE = "./dist/";
var TEST_BASE = LIB_BASE  + "tests/";

// These libraries will be compiled into common.min.js
var EXTERNAL_LIBS = {
    jquery: "./node_modules/jquery/dist/jquery.min.js",
    bootstrap: "./node_modules/bootstrap/dist/js/bootstrap.min.js",
    d3: "./node_modules/d3/d3.min.js",
    snap: "./assets/lib/snap.svg-min.js",
    dagre: "./node_modules/dagre/dist/dagre.min.js"
};

var EXTERNAL_CSS = {
    bootstrap: "./node_modules/bootstrap/dist/css/bootstrap.min.css"
};

// This causes min.js files to be gzipped and their size output during build
var SIZE_OPTS = {
    showFiles: true,
    gzip: true
};
// These are options for jshint (a javascript linter)
var LINT_OPTS = {
    unused: true,
    eqnull: true,
    jquery: true
};

// Other flags
var BROWSERIFY_TRANSFORMS = ["brfs"];
var LAST_DEPENDENCY_UPDATE_ID_FILE = ".npmDependenciesLastCommitId";
var ALLOW_NPM_MODULE_MANAGEMENT = true;

// Pretty, pretty log messages.
log.enableColor();


/**********************************************************************************************************************/
/* Housekeeping Section                                                                                               */
/**********************************************************************************************************************/

/**
 * Ensure that our project is always setup correctly.  So far this includes making sure npm dependencies are current.
 * This is achieved by keeping track of the last commit ID in which we updated dependencies.  If the current state of
 * the repo does not have that commit ID, then we will update dependencies and the ID in that file.  It's a naive
 * approach, but it works for now.
 */
gulp.task("housekeeping", function() {
    // If we are not allowed to manage npm modules, there is nothing else to do.
    if (!ALLOW_NPM_MODULE_MANAGEMENT) {
        return;
    }

    // Get the current repo ID.
    var currentId = shell.exec("git rev-parse HEAD", {silent: true}).output,
        lastId = null;

    // Get the last repo ID at which we updated the npm dependencies.
    try {
        lastId = file.readFileSync(LAST_DEPENDENCY_UPDATE_ID_FILE);
    } catch (e) { }

    // IDs match, nothing to do.
    if (lastId != null && lastId == currentId) {
        log.info("housekeeping", "npm dependencies are current since the last commit");
        return;
    }

    // IDs do not match, make sure everything is installed and up to date
    log.info("housekeeping", "Executing `npm install`");
    shell.exec("npm install");

    log.info("housekeeping", "Executing `npm-check-updates -u`");
    shell.exec("npm-check-updates -u");

    // Update our ID tracking file.
    shell.exec("git rev-parse HEAD > " + LAST_DEPENDENCY_UPDATE_ID_FILE, {async: true, silent: true});
});


/**********************************************************************************************************************/
/* Browserify Section                                                                                                 */
/**********************************************************************************************************************/

/**
 * Get a properly configured bundler for manual (browserify) and automatic (watchify) builds.
 *
 * @param {object}      file    The file to bundle (a Vinyl file object).
 * @param {object|null} options Options passed to browserify.
 */
function getBundler(file, options) {
    options = _.extend(options || {}, {
        // Enable source maps.
        debug: true,
        // Configure transforms.
        transform: BROWSERIFY_TRANSFORMS,
        standalone: "FlowViz"
    });

    // Initialize browserify with the file and options provided.
    var bundler = browserify(file.path, options);

    // Exclude externalized libs (those from common).
    Object.keys(EXTERNAL_LIBS).forEach(function(lib) {
        bundler.external(lib);
    });

    return bundler;
}

/**
 * Build a single application with browserify creating two differnt versions: one normal and one minified.
 *
 * @param {object}              file        The file to bundle (a Vinyl file object).
 * @param {browserify|watchify} bundler     The bundler to use.  The "build" task will use browserify, the "autobuild"
 *                                          task will use watchify.
 */
function bundle(file, bundler) {
    // Remove file.base from file.path to create a relative path.
    var relativeFilename = file.path.replace(file.base, "");

    return bundler
        // Log browserify errors
        .on("error", util.log.bind(util, "Browserify Error"))
        // Bundle the application
        .bundle()
        // Rename the bundled file to relativeFilename
        .pipe(source(relativeFilename))
        //.pipe(source(LIB_BASE + "/FlowViz.js"))
        // Convert stream to a buffer
        .pipe(buffer())
        // Save the source map for later (uglify will remove it since it is a comment)
        .pipe(sourcemaps.init({loadMaps: true}))
        // Save normal source (useful for debugging)
        .pipe(gulp.dest(DIST_BASE + "scripts/"))
        // Minify source for production
        //.pipe(uglify())
        // Restore the sourceMap
        .pipe(sourcemaps.write())
        // Add the .min suffix before the extension
        .pipe(rename({suffix: ".min"}))
        // Debuging output
        .pipe(size(SIZE_OPTS))
        // Write the minified file.
        .pipe(gulp.dest(DIST_BASE + "scripts/"));
}


/**********************************************************************************************************************/
/* Build Tasks Section                                                                                                 */
/**********************************************************************************************************************/

/**
 * Externalize all site-wide libraries into one file.  Since these libraries are all sizable, it would be better for the
 * client to request it individually once and then retreive it from the cache than to include all of these files into
 * each and every browserified application.
 */
gulp.task("common", function() {
    var paths = [];

    // Get just the path to each externalizable lib.
    _.forEach(EXTERNAL_LIBS, function(path) {
        paths.push(path);
    });

    return gulp.src(paths)
        // Log each file that will be concatenated into the common.js file.
        .pipe(size(SIZE_OPTS))
        // Concatenate all files.
        .pipe(concat("common.min.js"))
        // Minify the result.
        .pipe(uglify())
        // Log the new file size.
        .pipe(size(SIZE_OPTS))
        // Save that file to the appropriate location.
        .pipe(gulp.dest(DIST_BASE + "lib/"));
});

/**
 * Browserify and minify the flowviz library
 */
gulp.task("build", function() {
    // TODO: Fix this later!
    // Warning: using forEach for a single js file is a hack. Proceed with caution!
    return gulp.src(LIB_BASE + "/FlowViz.js")
        .pipe(forEach(function(stream, file) {
            return bundle(file, getBundler(file));
        }));
});

/**
 * Concatenates CSS files from all modules and outputs them as a single FlowViz CSS file
 */
gulp.task("styles", function() {
    return gulp.src(LIB_BASE + 'styles/**/*.css')
        .pipe(concatCss("FlowViz.css"))
        .pipe(gulp.dest(DIST_BASE + "styles/"));
});

/**
 * Watch applications and their dependencies for changes and automatically rebuild them.
 */
gulp.task("autobuild", function() {
    return gulp.src(LIB_BASE + "/FlowViz.js")
        .pipe(forEach(function(stream, file) {
            var bundler = watchify(getBundler(file, watchify.args));

            function rebundle() {
                return bundle(file, bundler)
                    .pipe(reload({stream:true, once: true}));
            }

            // Rebundle on code updates
            bundler.on("update", function() {
                rebundle();
                gulp.start('docs');
            });

            // Rebundle this application now.
            return rebundle();
        }));
});

/**
 * Linter for the most basic of quality assurance in the library
 */
gulp.task("lint", function() {
    return gulp.src([LIB_BASE + "modules/**/*.js", LIB_BASE + "FlowViz.js"])
        .pipe(jshint(LINT_OPTS))
        .pipe(jshint.reporter('jshint-stylish'));
});

/**
 * Linter for the most basic of quality assurance in the demo app
 */
gulp.task("demo-lint", function() {
    return gulp.src([DEMO_BASE + "**/*.js"])
        .pipe(jshint(LINT_OPTS))
        .pipe(jshint.reporter('jshint-stylish'));
});

/**
 * Minifies and copys the HTML from the demo app into the dist folder
 */
gulp.task("demo-html", function() {
    var opts = {
        conditionals: true,
        spare:true
    };

    return gulp.src([DEMO_BASE + "**/*.html"])
        .pipe(minifyHTML(opts))
        .pipe(gulp.dest(DIST_BASE));
});


/**
 * Copys the CSS from the demo app into the dist folder
 */
gulp.task("demo-styles", function() {
    var paths = [];

    // Get just the path to each externalizable lib.
    _.forEach(EXTERNAL_CSS, function(path) {
        paths.push(path);
    });

    paths.push(DEMO_BASE + "**/*.css");

    return gulp.src(paths)
        .pipe(gulp.dest(DIST_BASE + "styles/"));
});

/**
 * Copies any javascript in the app folder and copies it to the dist folder
 */
gulp.task("demo-js", function() {
    return gulp.src(DEMO_BASE + "**/*.js")
        .pipe(gulp.dest(DIST_BASE + "scripts/"));
});

/**
 * Copies any JSON in the app folder and copies it to the dist folder
 */
gulp.task("demo-json", function() {
    return gulp.src(DEMO_BASE + "**/*.json")
        .pipe(gulp.dest(DIST_BASE));
});

/**
 * Builds the demo test application
 */
gulp.task("demo", function() {
    runSequence(
        'demo-styles',
        'demo-html',
        'demo-js',
        'demo-json'
    );
});

/**
 * Builds the documentation website
 */
gulp.task('docs', function() {

    gulp.src([LIB_BASE + '**/*.js', 'README.md'])
        .pipe(gulpDoxx({
            title: 'FlowViz',
            urlPrefix: '/docs'
        }))
        .pipe(gulp.dest('dist/docs'));

});

/**
 * Cleans the build by deleting the dist/ directory
 */
gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

/**
 * Same as the default task except we use the autobuild task instead of the build task. This ensures that we have the
 * library be recompiled and the browser reloaded on any changes to the library files.
 */
gulp.task("auto-default", ["clean"], function(cb) {
    runSequence(
        "docs",
        ["common", "styles"],
        "autobuild",
        "demo",
        cb);
});

/**
 * Run tests with tape and cleanup the output with faucet.
 */
gulp.task("test", function() {
    shell.exec('\"./node_modules/.bin/tap-prettify\" ' + TEST_BASE + "**/*.js");
});

/**
 * Automatically run tests anytime anything is changed (tests or test subjects) without starting the browser-sync server
 */
gulp.task("autotest", function() {
    gulp.watch(
        [LIB_BASE + "**/*.js", TEST_BASE + "**/*.js"],
        ["test"]
    );
});

/**
 * Run all automatic tasks.
 */
gulp.task("auto", ["autobuild", "autotest"]);




/**
 * Allows for building and serving the demo application to the browser.
 */
gulp.task('serve', ["auto-default"], function () {
    browserSync({
        server: './dist'
    });

    // Only add a watch for the app/ dir files, we already have a watcher on the lib files
    gulp.watch([DEMO_BASE + '*'], function() {
        runSequence('demo', reload);
    });

    gulp.watch(['./lib/styles/**/*.css'], function() {
        runSequence('styles', reload);
    });
});

/**
 * The same as the default task, but done serially so that the output doesn't get all jumbled.
 */
gulp.task("serial", function() {
    runSequence(
        "docs",
        "build",
        "styles",
        "common",
        "lint",
        "build",
        "demo",
        "demo-lint",
        "test"
    );
});

/**
 * Run all tasks in parallel except for "test," which should always come last because errors therein can really mess up the build output.
 */
gulp.task("default", ["clean"], function() {
    runSequence(
        [ "lint", 'demo-lint'],
        ["common", "build", "styles", "demo"],
        "test"
    );
});