# Comic Collection Manager

A web application for managing your comic collection. Built with Node.js and vanilla JavaScript.

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