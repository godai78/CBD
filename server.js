const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');
const fetch = require('node-fetch');
const { importFromGoogleSheets } = require('./googleSheets');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Data file path
const dataFilePath = path.join(__dirname, 'comicDatabase.json');

// Initialize data file if it doesn't exist
async function initializeDataFile() {
	try {
		await fs.access(dataFilePath);
	} catch {
		const initialData = [
			{
				id: 1,
				seriesTitle: "The Amazing Spider-Man",
				issueTitle: "Spider-Man!",
				issueNumber: 1,
				writers: ["Stan Lee"],
				artists: ["Steve Ditko"],
				language: "English",
				publisher: "Marvel Comics",
				publicationYear: 1963
			},
			{
				id: 2,
				seriesTitle: "Batman",
				issueTitle: "The Case of the Chemical Syndicate",
				issueNumber: 1,
				writers: ["Bill Finger"],
				artists: ["Bob Kane", "Jerry Robinson"],
				language: "English",
				publisher: "DC Comics",
				publicationYear: 1940
			},
			{
				id: 3,
				seriesTitle: "Akira",
				issueTitle: "The Beginning",
				issueNumber: 1,
				writers: ["Katsuhiro Otomo"],
				artists: ["Katsuhiro Otomo"],
				language: "Japanese",
				publisher: "Kodansha",
				publicationYear: 1982
			},
			{
				id: 4,
				seriesTitle: "Watchmen",
				issueTitle: "At Midnight, All the Agents...",
				issueNumber: 1,
				writers: ["Alan Moore"],
				artists: ["Dave Gibbons"],
				language: "English",
				publisher: "DC Comics",
				publicationYear: 1986
			},
			{
				id: 5,
				seriesTitle: "Tintin",
				issueTitle: "Tintin in the Land of the Soviets",
				issueNumber: 1,
				writers: ["Hergé"],
				artists: ["Hergé"],
				language: "French",
				publisher: "Casterman",
				publicationYear: 1929
			}
		];
		await fs.writeFile(dataFilePath, JSON.stringify(initialData, null, 2));
	}
}

// Initialize data file
initializeDataFile();

// Get all comics
app.get('/api/comics', async (req, res) => {
	try {
		const data = await fs.readFile(dataFilePath, 'utf8');
		res.json(JSON.parse(data));
	} catch (error) {
		console.error('Error reading comics:', error);
		res.status(500).json({ error: 'Error reading comics data' });
	}
});

// Get a single comic by ID
app.get('/api/comics/:id', async (req, res) => {
	const id = parseInt(req.params.id);
	try {
		const data = await fs.readFile(dataFilePath, 'utf8');
		const comics = JSON.parse(data);
		const comic = comics.find(c => c.id === id);
		if (!comic) {
			return res.status(404).json({ error: 'Comic not found' });
		}
		res.json(comic);
	} catch (error) {
		res.status(500).json({ error: 'Error reading comics data' });
	}
});

// Add a new comic
app.post('/api/comics', async (req, res) => {
	try {
		const data = await fs.readFile(dataFilePath, 'utf8');
		const comics = JSON.parse(data);
		const newComic = {
			...req.body,
			id: Math.max(...comics.map(c => c.id), 0) + 1
		};
		comics.push(newComic);
		await fs.writeFile(dataFilePath, JSON.stringify(comics, null, 2));
		res.status(201).json(newComic);
	} catch (error) {
		console.error('Error adding comic:', error);
		res.status(500).json({ error: 'Error adding comic' });
	}
});

// Update a comic
app.put('/api/comics/:id', async (req, res) => {
	const id = parseInt(req.params.id);
	try {
		const data = await fs.readFile(dataFilePath, 'utf8');
		const comics = JSON.parse(data);
		const index = comics.findIndex(c => c.id === id);
		
		if (index === -1) {
			return res.status(404).json({ error: 'Comic not found' });
		}

		const updatedComic = {
			...comics[index],
			...req.body,
			id: id // Ensure ID remains unchanged
		};

		// Ensure writers and artists are always arrays
		if (typeof updatedComic.writers === 'string') {
			updatedComic.writers = [updatedComic.writers];
		}
		if (typeof updatedComic.artists === 'string') {
			updatedComic.artists = [updatedComic.artists];
		}

		comics[index] = updatedComic;
		await fs.writeFile(dataFilePath, JSON.stringify(comics, null, 2));
		res.json(updatedComic);
	} catch (error) {
		console.error('Error updating comic:', error);
		res.status(500).json({ error: 'Error updating comic' });
	}
});

// Delete a comic
app.delete('/api/comics/:id', async (req, res) => {
	const id = parseInt(req.params.id);
	try {
		const data = await fs.readFile(dataFilePath, 'utf8');
		const comics = JSON.parse(data);
		const index = comics.findIndex(c => c.id === id);
		
		if (index === -1) {
			return res.status(404).json({ error: 'Comic not found' });
		}

		comics.splice(index, 1);
		await fs.writeFile(dataFilePath, JSON.stringify(comics, null, 2));
		res.json({ message: 'Comic deleted successfully' });
	} catch (error) {
		console.error('Error deleting comic:', error);
		res.status(500).json({ error: 'Error deleting comic' });
	}
});

// Get unique languages
app.get('/api/languages', async (req, res) => {
	try {
		const data = await fs.readFile(dataFilePath, 'utf8');
		const comics = JSON.parse(data);
		const languages = [...new Set(comics.map(comic => comic.language))];
		res.json(languages);
	} catch (error) {
		console.error('Error getting languages:', error);
		res.status(500).json({ error: 'Error getting languages' });
	}
});

// Get unique publishers
app.get('/api/publishers', async (req, res) => {
	try {
		const data = await fs.readFile(dataFilePath, 'utf8');
		const comics = JSON.parse(data);
		const publishers = [...new Set(comics.map(comic => comic.publisher))];
		res.json(publishers);
	} catch (error) {
		console.error('Error getting publishers:', error);
		res.status(500).json({ error: 'Error getting publishers' });
	}
});

// Import comics from Google Sheets
app.post('/api/import', async (req, res) => {
	try {
		// Clear existing data
		await fs.writeFile(dataFilePath, JSON.stringify([], null, 2));

		// Import new data from Google Sheets
		const comics = await importFromGoogleSheets();
		
		// Add IDs to imported comics
		const comicsWithIds = comics.map((comic, index) => ({
			...comic,
			id: index + 1
		}));

		// Write to file
		await fs.writeFile(dataFilePath, JSON.stringify(comicsWithIds, null, 2));
		
		res.json({ message: `Successfully imported ${comicsWithIds.length} comics` });
	} catch (error) {
		console.error('Error importing comics:', error);
		res.status(500).json({ error: 'Error importing comics' });
	}
});

// Start server
app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
}); 