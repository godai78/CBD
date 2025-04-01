# Comic Collection Manager

A web application for managing your comic collection. Built with Node.js and vanilla JavaScript. Vibe-coded by godai using Cursor.

## Features

- View and search your comic collection
- Add new comics with detailed information
- Edit existing comic entries
- Sort by any column
- Dynamic search suggestions
- Import from Google Sheets
- Export to CSV (compatible with Google Docs/Sheets)
- Record count display

## Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd comic-collection-manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
node server.js
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Data Structure

Each comic entry contains:
- Series Title
- Issue Title
- Issue Number
- Writers (multiple)
- Artists (multiple)
- Language
- Publisher
- Publication Year

## Technologies Used

- Node.js
- Express.js
- Vanilla JavaScript
- Google Sheets API 

## Translations

The application supports multiple languages through a translation system. Currently available languages:
- English (en)
- Polish (pl)
- German (de)
- Swedish (sv)

### Adding New Translations

To add a new language:

1. Create a new JSON file in the `translations` directory with the language code (e.g., `fr.json` for French)
2. Copy the structure from `en.json` and translate all values
3. Add the language name to the mapping in `server.js`:
```javascript
const name = {
    'en': 'English',
    'pl': 'Polski',
    'de': 'Deutsch',
    'sv': 'Svenska',
    'fr': 'Français'  // Add your new language here
}[code] || code;
```
### Using Translations in HTML

To make an element translatable, add the `data-translate` attribute with the appropriate translation key:
```html
<label for="seriesTitle" data-translate="comic.fields.series">Series:</label>
```

For input placeholders:
```html
<input type="text" id="seriesSearch" data-translate="search.seriesPlaceholder" placeholder="Search by series name...">
``` 