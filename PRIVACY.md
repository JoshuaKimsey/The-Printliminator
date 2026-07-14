# Privacy Policy — The Printliminator

**Last updated:** July 13, 2026

## Data Collection

The Printliminator **does not collect, store, or transmit any personal data or user information.**

## How the Extension Works

The Printliminator is a client-side tool that runs entirely in your browser. When you click the toolbar button:

1. The extension injects a stylesheet and script into the **active tab only** (via the `activeTab` and `scripting` permissions).
2. You interact with the page directly — clicking elements to remove them, removing graphics, or applying print-friendly styling.
3. All changes are made to the DOM in your current tab. Nothing is saved, sent, or shared.

**No data ever leaves your browser.** There is no server, no analytics, no telemetry, no tracking, and no remote code execution.

## Permissions

| Permission | Why it's needed |
|------------|-----------------|
| `activeTab` | Access the current tab's content when you click the toolbar button, so you can select and remove page elements. |
| `scripting` | Inject the content script (`printliminator.js`) and stylesheet (`printliminator.css`) into the active tab on your click. All code is bundled in the extension — no remote code is loaded or executed. |

## Third-Party Services

None. The extension does not communicate with any external service.

## Data Storage

None. The extension does not use `localStorage`, `sessionStorage`, `chrome.storage`, cookies, or any other storage mechanism.

## Children's Privacy

The extension is directed at a general audience and does not knowingly collect any data from anyone, including children under 13.

## Changes to This Policy

If this policy ever changes, the updated version will be posted in this repository.

## Contact

To report a privacy concern or ask a question, please [open an issue](https://github.com/JoshuaKimsey/The-Printliminator/issues) on the GitHub repository.

## Source Code

The full source code is available at https://github.com/JoshuaKimsey/The-Printliminator and can be audited to verify the claims in this policy.
