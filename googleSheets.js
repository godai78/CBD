const { google } = require('googleapis');
const path = require('path');
const fs = require('fs').promises;
const fetch = require('node-fetch');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate();
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

async function authenticate() {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const client = new google.auth.OAuth2(
        key.client_id,
        key.client_secret,
        key.redirect_uris[0]
    );
    return client;
}

async function listMajors(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: 'YOUR_SPREADSHEET_ID', // Replace with your spreadsheet ID
        range: 'Sheet1!A2:H', // Adjust range as needed
    });
    return response.data.values;
}

async function importFromGoogleSheets() {
    try {
        const spreadsheetId = '1vqLZmGwyw61KHiQ9krTdZU24Og3DuAbV1_EVBdNnVo4';
        const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv`;
        
        const response = await fetch(url);
        const csvText = await response.text();
        
        // Split into rows and remove the header row
        const rows = csvText.split('\n').slice(1);
        
        return rows.map(row => {
            // Split by comma, handling quoted values
            const values = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
            const cleanValues = values.map(v => v.replace(/^"|"$/g, '').trim());
            
            return {
                issueTitle: cleanValues[0] || '', // tytuł
                seriesTitle: cleanValues[1] || '', // seria
                issueNumber: parseInt(cleanValues[2]) || 0, // tom serii
                writer: cleanValues[3] || '', // scenariusz
                artists: (cleanValues[4] || '').split(',').map(artist => artist.trim()), // rysunki
                publicationYear: parseInt(cleanValues[5]) || 0, // data
                language: cleanValues[6] || '', // język
                publisher: cleanValues[7] || '' // wydawca
            };
        });
    } catch (error) {
        console.error('Error importing from Google Sheets:', error);
        throw error;
    }
}

module.exports = {
    importFromGoogleSheets
}; 