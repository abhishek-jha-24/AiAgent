# LeetCode Problem Extractor Chrome Extension

A Chrome extension that extracts problem titles and statements from LeetCode problem pages.

## Features

- **getProblemTitle()**: Extracts the problem title (e.g., "312. Burst Balloons")
- **getProblemStatement()**: Extracts the complete problem description as plain text
- **Automatic extraction**: Runs automatically when visiting LeetCode problem pages
- **Console logging**: Logs extracted data to the browser console
- **Global access**: Makes extracted data available via `window.leetcodeExtractedData`

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the folder containing these files
5. The extension will be installed and ready to use

## Usage

### Automatic Usage
Simply visit any LeetCode problem page (e.g., `https://leetcode.com/problems/burst-balloons/`). The extension will automatically:
- Extract the problem title and statement
- Log the results to the browser console
- Store the data in `window.leetcodeExtractedData`

### Manual Usage
You can also manually call the extraction functions in the browser console:

```javascript
// Get the problem title
const title = window.leetcodeExtractor.getProblemTitle();
console.log(title);

// Get the problem statement
const statement = window.leetcodeExtractor.getProblemStatement();
console.log(statement);

// Run full extraction
window.leetcodeExtractor.extractProblemData();
```

### Accessing Extracted Data
The extracted data is stored in `window.leetcodeExtractedData`:

```javascript
console.log(window.leetcodeExtractedData);
// Output:
// {
//   title: "312. Burst Balloons",
//   statement: "You are given n balloons, indexed from 0 to n - 1...",
//   timestamp: "2024-01-01T12:00:00.000Z"
// }
```

## Testing

To test the extension locally:

1. Open `test.html` in your browser
2. Click the "Test Extraction" button
3. Check the results displayed on the page and in the browser console

## File Structure

```
├── manifest.json          # Extension manifest
├── content.js            # Content script with extraction functions
├── test.html             # Test page for local testing
└── README.md             # This file
```

## Supported Selectors

The extension uses multiple selectors to ensure compatibility with different LeetCode page layouts:

### Title Selectors
- `.text-title`
- `.text-title-large`
- `h1`, `.problem-title`, `[data-testid="problem-title"]`
- Page title pattern matching

### Content Selectors
- `.content__u3I1.question-content__JfgR`
- `.question-content__JfgR`
- `[data-track-load="description_content"]`
- `.elfjS`, `.problem-description`, `.question-content`
- Content containing "You are given" text

## Browser Compatibility

- Chrome (Manifest V3)
- Edge (Chromium-based)
- Other Chromium-based browsers

## Troubleshooting

If the extension doesn't work:

1. Check the browser console for error messages
2. Ensure you're on a LeetCode problem page (URL contains `/problems/`)
3. Try refreshing the page
4. Check if the page has fully loaded before extraction

## Development

To modify the extension:

1. Edit `content.js` to change extraction logic
2. Update `manifest.json` if you need different permissions or matches
3. Test with `test.html` before deploying
4. Reload the extension in `chrome://extensions/` after making changes
