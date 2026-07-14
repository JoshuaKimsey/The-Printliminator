#!/usr/bin/env node
'use strict';

// Printliminator build script (replaces the old Grunt pipeline).
//
// Produces a Manifest V3 Chrome extension in dist/chrome/ from src/.
// The bookmarklet distribution path is untouched by this build.
//
// Handles the grunt-preprocess directives used in the original source:
//   @echo settings.X   (block-comment form)  -> value from src/options.json
//   @echo X            (block-comment form)  -> top-level key in options.json
//   @echo X            (HTML comment form)   -> same, in HTML files
//   @if MODE='EXT' ... @endif                -> conditional block (kept for ext)
//   {version}                                -> version from package.json

var fs = require('fs');
var path = require('path');

var ROOT = __dirname;
var SRC = path.join(ROOT, 'src');
var DIST = path.join(ROOT, 'dist', 'chrome');
var MODE = 'EXT';

var pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
var SETTINGS = JSON.parse(fs.readFileSync(path.join(SRC, 'options.json'), 'utf8'));
var VERSION = pkg.version;

// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------

function rmrf(dir) {
    if (!fs.existsSync(dir)) return;
    for (var entry of fs.readdirSync(dir)) {
        var full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) {
            rmrf(full);
        } else {
            fs.unlinkSync(full);
        }
    }
    fs.rmdirSync(dir);
}

function mkdirp(dir) {
    if (fs.existsSync(dir)) return;
    mkdirp(path.dirname(dir));
    fs.mkdirSync(dir);
}

function read(file) {
    return fs.readFileSync(file, 'utf8');
}

function write(file, content) {
    mkdirp(path.dirname(file));
    fs.writeFileSync(file, content, 'utf8');
}

function copyFile(src, dest) {
    mkdirp(path.dirname(dest));
    fs.copyFileSync(src, dest);
}

function copyDir(srcDir, destDir) {
    if (!fs.existsSync(srcDir)) return;
    mkdirp(destDir);
    for (var entry of fs.readdirSync(srcDir)) {
        var src = path.join(srcDir, entry);
        var dest = path.join(destDir, entry);
        if (fs.statSync(src).isDirectory()) {
            copyDir(src, dest);
        } else {
            copyFile(src, dest);
        }
    }
}

// ---------------------------------------------------------------------------
// Preprocessor (replicates grunt-preprocess semantics for the subset used here)
// ---------------------------------------------------------------------------

function resolveKey(context, key) {
    var parts = key.split('.');
    var val = context;
    for (var i = 0; i < parts.length; i++) {
        if (val == null) return '';
        val = val[parts[i]];
    }
    return val === undefined ? '' : String(val);
}

function stripIfBlocks(code, targetMode) {
    var lines = code.split('\n');
    var result = [];
    var skipping = false;
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var ifMatch = line.match(/@if\s+MODE\s*=\s*['"](\w+)['"]/);
        if (ifMatch) {
            skipping = (ifMatch[1] !== targetMode);
            continue; // drop the directive line itself
        }
        if (/@endif/.test(line)) {
            skipping = false;
            continue; // drop the directive line itself
        }
        if (!skipping) {
            result.push(line);
        }
    }
    return result.join('\n');
}

function substituteEcho(code, context) {
    code = code.replace(/\/\*\s*@echo\s+([\w.]+)\s*\*\//g, function (m, key) {
        return resolveKey(context, key);
    });
    code = code.replace(/<!--\s*@echo\s+([\w.]+)\s*-->/g, function (m, key) {
        return resolveKey(context, key);
    });
    return code;
}

function preprocess(code, context) {
    code = stripIfBlocks(code, MODE);
    code = substituteEcho(code, context);
    code = code.replace(/\{version\}/g, VERSION);
    return code;
}

// ---------------------------------------------------------------------------
// SCSS compilation
// ---------------------------------------------------------------------------

function compileScss(preprocessedScss) {
    var sass;
    try {
        sass = require('sass');
    } catch (e) {
        throw new Error(
            'sass is not installed. Run "npm install" first.\n' + e.message
        );
    }
    // Use modern API where available, fall back to legacy renderSync.
    if (typeof sass.compileString === 'function') {
        return sass.compileString(preprocessedScss, { style: 'expanded' }).css;
    }
    return sass.renderSync({
        data: preprocessedScss,
        outputStyle: 'expanded',
        sourceMap: false
    }).css.toString('utf8');
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

function build() {
    var started = Date.now();
    console.log('Building Printliminator v' + VERSION + ' (Chrome MV3)...');

    // 1. Clean output
    rmrf(DIST);

    // Contexts for the preprocessor.
    // popup.* use flat settings; printliminator.* use { MODE, settings }.
    var flatCtx = Object.assign({}, SETTINGS);
    var extCtx = { MODE: MODE, settings: SETTINGS };

    // 2. popup.js
    write(
        path.join(DIST, 'popup.js'),
        preprocess(read(path.join(SRC, 'chrome', 'popup.js')), flatCtx)
    );

    // 3. popup.html
    write(
        path.join(DIST, 'popup.html'),
        preprocess(read(path.join(SRC, 'chrome', 'popup.html')), flatCtx)
    );

    // 4. popup.css (preprocess SCSS -> sass)
    var popupScss = preprocess(read(path.join(SRC, 'chrome', 'popup.scss')), flatCtx);
    write(path.join(DIST, 'popup.css'), compileScss(popupScss));

    // 5. printliminator.css (preprocess SCSS with MODE=EXT -> sass)
    var mainScss = preprocess(read(path.join(SRC, 'printliminator.scss')), extCtx);
    write(path.join(DIST, 'printliminator.css'), compileScss(mainScss));

    // 6. printliminator.js (preprocess with MODE=EXT)
    write(
        path.join(DIST, 'printliminator.js'),
        preprocess(read(path.join(SRC, 'printliminator.js')), extCtx)
    );

    // 7. manifest.json (copy as-is; version already set in source)
    copyFile(path.join(SRC, 'chrome', 'manifest.json'), path.join(DIST, 'manifest.json'));

    // 8. Icons (src/icons/*.png)
    var iconsDir = path.join(SRC, 'icons');
    for (var icon of fs.readdirSync(iconsDir)) {
        if (icon.endsWith('.png')) {
            copyFile(path.join(iconsDir, icon), path.join(DIST, icon));
        }
    }

    // 9. Locales (_locales/** -> dist/chrome/_locales/)
    copyDir(path.join(ROOT, '_locales'), path.join(DIST, '_locales'));

    var ms = Date.now() - started;
    console.log('Done in ' + ms + 'ms -> ' + path.relative(ROOT, DIST) + '/');
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (process.argv.includes('--clean')) {
    rmrf(DIST);
    console.log('Cleaned ' + path.relative(ROOT, DIST) + '/');
} else {
    build();
}
