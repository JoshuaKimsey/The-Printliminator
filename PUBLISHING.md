# Publishing to the Chrome Web Store — Guide for The Printliminator

This file contains pre-written copy for every Chrome Web Store dashboard field, so the
submission process is copy-paste + drag-drop. Read this alongside the
[official publish docs](https://developer.chrome.com/docs/webstore/publish/).

---

## Before You Start

### 1. Developer account ($5 one-time fee)
- Go to https://chrome.google.com/webstore/devconsole/
- Sign in with your Google account
- Pay the $5 registration fee
- Set your publisher name (e.g., "Joshua Kimsey")

### 2. Build the package
```
npm install
npm run package
```
This produces `dist/printliminator-v5.0.0.zip` with `manifest.json` at the zip root
(the #1 packaging gotcha — the Web Store rejects zips where the manifest is nested
in a folder).

### 3. Screenshots (you must create these)
The Web Store requires at least one 1280x800 px screenshot. Take 1-5 of these:

1. Load the unpacked extension (`chrome://extensions/` → Developer mode → Load unpacked → select `dist/chrome/`)
2. Navigate to a content-heavy page (news article, Wikipedia, etc.)
3. Take screenshots showing:
   - The popup open with the 4 command buttons
   - An element highlighted (red outline) on the page
   - The page after "Remove Graphics" has been applied
   - The page after "Add Print Styles" has been applied

Save them as `screenshot-1.png`, `screenshot-2.png`, etc. (1280x800, PNG or JPEG).

### 4. Store icon
`dist/chrome/icon128.png` — already 128x128 px, ready to use.

### 5. Small promo tile
`src/images/web-store-tile.png` — already 440x280 px, ready to use.

### 6. Privacy policy URL
Point the Web Store to:
```
https://github.com/JoshuaKimsey/The-Printliminator/blob/master/PRIVACY.md
```
(Or use the raw URL if the dashboard rejects the GitHub blob URL:
`https://raw.githubusercontent.com/JoshuaKimsey/The-Printliminator/master/PRIVACY.md`)

---

## Upload the Extension

1. Go to https://chrome.google.com/webstore/devconsole/
2. Click **"Add new item"**
3. Choose `dist/printliminator-v5.0.0.zip` → **Upload**
4. If valid, you'll proceed to the listing editor

---

## Store Listing Tab

### Item name
```
The Printliminator
```
*(This comes from `_locales/en/messages.json` → `printliminatorName`, but the dashboard may ask you to confirm it.)*

### Detailed description
```
The Printliminator is a simple tool that lets you clean up web pages before printing them. One click activates the toolbar popup, then you can:

• Click any element on the page to remove it
• Alt-click to remove everything EXCEPT what you clicked
• Remove all graphics (images, iframes, video, backgrounds) in one click
• Apply a print-friendly stylesheet (serif fonts, proper margins, clean tables)
• Adjust font size with keyboard shortcuts
• Undo any action with Backspace
• Print the cleaned-up page

All processing happens locally in your browser — no data is sent anywhere.

Keyboard commands:
• Arrow keys / PageUp / PageDown — navigate the element hierarchy
• Enter — remove the highlighted element
• Backspace — undo last action
• + / - — increase / decrease font size
• * — reset font size
• Shift+click — make element full width
• Alt+click — remove everything except the clicked element
• Esc — disable Printliminator
• F1 — toggle on-screen action messages

This is a community-maintained fork of the original Printliminator by Chris Coyier, updated for Manifest V3 compatibility so it works in modern Chrome. Original project: https://github.com/CSS-Tricks/The-Printliminator
```

### Category
```
Productivity
```

### Language
```
English
```
*(You can add localized listings for de, fr, pt_BR, sr later if you provide translated descriptions.)*

### Graphic assets
| Field | File | Status |
|-------|------|--------|
| Store icon (128x128) | `dist/chrome/icon128.png` | Ready |
| Screenshot 1-5 (1280x800) | `screenshot-1.png` etc. | **You create these** |
| Small promo tile (440x280) | `src/images/web-store-tile.png` | Ready |
| Marquee promo tile (1400x560) | — | Optional, skip |
| YouTube video | — | Optional, skip |

---

## Privacy Tab

### Single purpose description
```
The Printliminator lets users clean up web pages before printing by removing unwanted elements, removing graphics, and applying print-friendly styling. All processing happens locally in the browser on the active tab only, triggered by an explicit user click on the toolbar button.
```

### Permission justifications

**`activeTab`:**
```
Needed to access the current tab's DOM when the user clicks the extension's toolbar button. The user interactively selects and removes page elements, adjusts styling, and prints the cleaned-up page. No access is requested beyond the active tab and only after the user explicitly clicks the toolbar icon.
```

**`scripting`:**
```
Used to inject the bundled content script (printliminator.js) and stylesheet (printliminator.css) into the active tab on user click. This is what enables the interactive element-removal and print-styling features. All code is bundled inside the extension — no remote code is loaded or executed.
```

### Remote code declaration
```
Select: "No, I am not using remote code."
```
*(This is true — all JS/CSS is bundled in the extension. This is a core MV3 requirement and you're already compliant.)*

### Data usage certification
Check these boxes:
- [x] I do **not** sell or transfer user data to third parties
- [x] I do **not** use or transfer user data for purposes unrelated to my item's single purpose
- [x] I do **not** use or transfer user data to determine creditworthiness or for lending purposes

And under "Data collected" — **leave all unchecked**. The extension collects nothing.

### Privacy policy URL
```
https://github.com/JoshuaKimsey/The-Printliminator/blob/master/PRIVACY.md
```

---

## Distribution Tab

### Price
```
Free
```

### Visibility
```
Public
```

### Regions
```
All regions (default)
```

---

## Test Instructions Tab

Leave blank — the extension is self-explanatory and requires no credentials or special setup. Reviewers can test it by loading any public web page and clicking the toolbar button.

---

## Submit for Review

1. Click **"Submit for Review"**
2. Confirm the dialog
3. Wait for review (typically a few days to a couple weeks for a new extension)
4. You'll get an email when it's approved or if changes are requested

### If the review requests changes
Common reasons for rejection and how to handle them:
- **"Permission X is not needed"** — unlikely, but if so, remove it from the manifest and rebuild
- **"Single purpose not clear"** — expand the single-purpose description
- **"Privacy policy not sufficient"** — expand PRIVACY.md with more detail
- **Screenshots don't match the extension** — re-take them

---

## After Publication

- The extension will get a Web Store listing URL — add it to the README
- If you publish updates later: bump the version in `package.json` + `src/chrome/manifest.json`, run `npm run package`, upload the new zip to the dashboard (version must be higher than the previous one)
- The v5.0.0 tag on your fork should match the first published version
