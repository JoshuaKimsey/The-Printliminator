The Printliminator is a simple tool you can use to make websites print better.
One click to activate, and then click to remove elements from the page, remove graphics, and apply
better print styling.

> **This is a community-maintained fork** by [Joshua Kimsey](https://github.com/JoshuaKimsey),
> updated for Manifest V3 compatibility. The original project (last released 2015) no longer loads
> in modern Chrome. See **Recent Changes** below for migration details.

![screenshot](https://cloud.githubusercontent.com/assets/136959/10418826/4ccd60c6-702b-11e5-8ed8-f4d4df66e6d5.png)

Get the:
* [Bookmarklet](//css-tricks.github.io/The-Printliminator/)
* [Chrome Extension](//chrome.google.com/webstore/detail/the-printliminator/nklechikgnfoonbfmcalddjcpmcmgapf?hl=en-US&gl=US) (original MV2 listing — no longer loads in modern Chrome; build from source for the MV3 version)
* [Opera Extension](//addons.opera.com/en/extensions/details/the-printliminator/?display=en)

### Building from source

Requires Node.js and npm:

```
npm install
npm run build
```

Then load `dist/chrome/` as an unpacked extension in Chrome
(`chrome://extensions/` → enable Developer mode → Load unpacked).

### Limitations

* Bookmarklet: due to Content Security Policy directives on some sites, the Printliminator bookmarklet script is not able to load on some sites (e.g. GitHub). To get around this problem, use the Chrome or Opera extension. Hopefully, Firefox &amp; Safari extensions/addons will quickly follow.
* Chrome/Opera extension: if a popup window is opened for printing, like Yahoo mail does, then the extension will not work in the popup. The MV3 `chrome.scripting` API has no `matchAboutBlank` equivalent; restoring this would require the `webNavigation` permission and explicit frame targeting.

### To Do

* Support more languages: waiting for willing users to help!
* Create Firefox & Safari extensions.

### Credits

* By [Chris Coyier](http://chriscoyier.net) and [Devon Govett](http://devongovett.wordpress.com/).
* Updates & extensions by [Rob Garrison](http://wowmotty.blogspot.com/).
* Icons by [Function](http://wefunction.com/2008/07/function-free-icon-set/).
* Print stylesheet based on [Hartija](http://code.google.com/p/hartija/).
* Translations provided by [Transifex](https://www.transifex.com).

### Contributing

* Pull requests are welcome!
* Provide additional translations via [Transifex](https://www.transifex.com/css-tricks/the-printliminator/) or with a pull request.

### Recent Changes

#### Version 5.0.0 (7/13/2026)

Major version bump for Manifest V3 compatibility — the extension now loads in modern Chrome again.

* **Manifest V3 migration:**
  * `manifest_version` 2 → 3; `browser_action` → `action`.
  * Added `scripting` permission; `web_accessible_resources` converted to object form with `matches`.
* **API migration in `popup.js`:**
  * `chrome.tabs.executeScript` → `chrome.scripting.executeScript`.
  * `chrome.tabs.insertCSS` → `chrome.scripting.insertCSS`.
  * `code:` string injection → `func:` arrow functions; `file:` → `files:` arrays.
  * Result reads updated from `result[0]` → `result[0].result` (affects the print ready-state polling loop).
  * Implicit active-tab targeting (`null` tabId) → explicit `target: { tabId }`.
  * `matchAboutBlank` dropped (no MV3 equivalent — see Limitations).
* **Build tooling modernization:**
  * Replaced the 2015 Grunt 0.4 + `grunt-preprocess` pipeline with a zero-dependency `build.js` (Node).
  * Single dev dependency: `sass` (Dart Sass) for SCSS compilation.
  * `npm run build` / `npm run clean` scripts; outputs `dist/chrome/`.
  * Bookmarklet build path is untouched (unaffected by MV3).
* Locales: the build now includes all available locales (`de`, `en`, `fr`, `pt_BR`, `sr`); the previous committed `dist/` only shipped `en` and `fr`.
* Functionally identical to 4.0.5 on normal pages; verified in Chrome MV3.

#### Version 4.0.5 (10/11/2015)

* Readme:
  * Add link to Opera extension.
  * Fix link to Transifex.
* Demo: Add video & repo link.
* Locales:
  * Add French locale. See [pull #7](https://github.com/CSS-Tricks/The-Printliminator/pull/7); thanks [yukulele](https://github.com/yukulele)!
  * Update missing locale string & fix button overflow issues
* Include non-numpad keys for font-resizing. Fixes [issue #8](https://github.com/CSS-Tricks/The-Printliminator/issues/8).
* Fix extension messaging options.

#### Version 4.0.4 (9/30/2015)

* Add screenshots of Opera extesion.
* Rename Chrome screenshots.
* Version bump to resubmit Opera extension.

#### Version 4.0.3 (9/28/2015)

* Fix icon file name in Chrome manifest which was preventing the extension from working.
* Added, then removed Chrome extension autoupdating code... no longer supported :(

#### Version 4.0.1 (9/28/2015)

* Update your Bookmarklets as the code to execute the loaded Printliminator code has changed!
* Big lumped changes...
  * Created Chrome & Opera extensions (no change needed to support both).
  * Grunt build to include all code for the bookmarklet & extension code in one file.
  * Added English locale file which make it easy to add additional language support.
  * A main `src/options.json` file now contains settings & class names used across all files.
  * Converted all css to SCSS.
  * New The Printliminator logo designed by Chris!
  * Add some basic unit testing for DOM traversing.
  * All production files are now located in the `dist` folder; `printliminator.min.js` is still located in the root.
  * Added [wiki documentation](https://github.com/CSS-Tricks/The-Printliminator/wiki).
