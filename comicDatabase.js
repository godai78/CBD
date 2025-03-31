const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, 'comics.json');

// Function to initialize the data file if it doesn't exist
async function initializeDataFile() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
    }
}

// Function to read all comics
async function readComics() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading comics:', error);
        return [];
    }
}

// Function to write comics to file
async function writeComics(comics) {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(comics, null, 2));
    } catch (error) {
        console.error('Error writing comics:', error);
        throw error;
    }
}

// Function to get unique publishers
async function getPublishers() {
    const comics = await readComics();
    return [...new Set(comics.map(comic => comic.publisher))].sort();
}

// Function to get unique languages
async function getLanguages() {
    const comics = await readComics();
    return [...new Set(comics.map(comic => comic.language))].sort();
}

module.exports = {
    initializeDataFile,
    readComics,
    writeComics,
    getPublishers,
    getLanguages
}; 