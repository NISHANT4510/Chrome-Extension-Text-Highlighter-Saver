# Text Highlighter & Saver Chrome Extension

A powerful Chrome extension that allows users to highlight and save important text from any webpage with AI-powered summarization capabilities.

## Features

- 🎨 **Text Highlighting**: Select and highlight text on any webpage
- 🎯 **Multiple Colors**: Choose from different highlight colors
- 💾 **Auto-Save**: Automatically saves your highlights
- 🤖 **AI Summarization**: Get smart summaries of highlighted content
- 📱 **Easy Access**: Quick access to all your saved highlights
- 📋 **Copy & Share**: Easily copy and share your highlights

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## How to Use

1. **Highlighting Text**
   - Select any text on a webpage
   - A popup will appear with color options
   - Click your desired highlight color
   - The text will be highlighted and saved automatically

2. **Viewing Saved Highlights**
   - Click the extension icon in your Chrome toolbar
   - See all your highlights organized by website
   - Click on any highlight to see its full context

3. **Managing Highlights**
   - Access all your highlights through the popup
   - Delete unwanted highlights
   - Copy text directly to clipboard
   - Get AI-powered summaries of longer text selections

## Permissions

The extension requires the following permissions:
- `storage`: To save your highlights
- `activeTab`: To interact with the current webpage
- `scripting`: To inject the highlighting functionality
- Access to all URLs for highlighting functionality

## Technical Details

Built using:
- Manifest V3
- HTML/CSS for popup interface
- JavaScript for core functionality
- Chrome Storage API for data persistence

## Project Structure

```
├── manifest.json       # Extension configuration
├── popup.html         # Popup interface
├── popup.js          # Popup functionality
├── popup.css         # Popup styles
├── content.js        # Content script for highlighting
└── content.css       # Highlight styles
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)

## Author

Created by NISHANT4510

## Support

For issues, questions, or suggestions, please [open an issue](https://github.com/NISHANT4510/Chrome-Extension-Text-Highlighter-Saver/issues) on GitHub.
