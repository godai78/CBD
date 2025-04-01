let translations = {};
let currentLanguage = localStorage.getItem('selectedLanguage') || 'en';

// Function to load translations
async function loadTranslations(lang = currentLanguage) {
	try {
		const response = await fetch(`/translations/${lang}.json`);
		if (!response.ok) throw new Error('Failed to load translations');
		translations = await response.json();
		currentLanguage = lang;
		localStorage.setItem('selectedLanguage', lang);
		document.documentElement.lang = lang;
		updatePageTranslations();
	} catch (error) {
		console.error('Error loading translations:', error);
	}
}

// Function to get a translated string
function t(key) {
	const keys = key.split('.');
	let value = translations;
	
	for (const k of keys) {
		if (value && value[k]) {
			value = value[k];
		} else {
			console.warn(`Translation missing for key: ${key}`);
			return key;
		}
	}
	
	return value;
}

// Function to set the current language
async function setLanguage(lang) {
	await loadTranslations(lang);
}

// Function to update all translations on the page
function updatePageTranslations() {
	// Update all elements with data-translate attribute
	document.querySelectorAll('[data-translate]').forEach(element => {
		const key = element.getAttribute('data-translate');
		const translation = t(key);
		
		if (element.tagName === 'INPUT') {
			if (element.type === 'text') {
				element.placeholder = translation;
			} else if (element.type === 'submit') {
				element.value = translation;
			}
		} else if (element.tagName === 'BUTTON' || element.tagName === 'A') {
			element.textContent = translation;
		} else {
			element.textContent = translation;
		}
	});
	
	// Update all elements with data-translate-attr attribute
	document.querySelectorAll('[data-translate-attr]').forEach(element => {
		const attrs = JSON.parse(element.getAttribute('data-translate-attr'));
		Object.entries(attrs).forEach(([attr, key]) => {
			element.setAttribute(attr, t(key));
		});
	});
}

// Function to create language switcher
async function createLanguageSwitcher() {
	try {
		const response = await fetch('/api/languages');
		if (!response.ok) throw new Error('Failed to load languages');
		const languages = await response.json();
		
		const switcher = document.querySelector('.language-switcher');
		if (!switcher) {
			console.error('Language switcher container not found');
			return;
		}
		
		const select = document.createElement('select');
		select.onchange = (e) => setLanguage(e.target.value);
		
		languages.forEach(lang => {
			const option = document.createElement('option');
			option.value = lang.code;
			option.textContent = lang.name;
			option.selected = lang.code === currentLanguage;
			select.appendChild(option);
		});
		
		switcher.appendChild(select);
	} catch (error) {
		console.error('Error creating language switcher:', error);
	}
}

// Initialize translations when the page loads
document.addEventListener('DOMContentLoaded', async () => {
	await loadTranslations();
	// Only create language switcher on the main page (index.html)
	if (document.querySelector('.search-section')) {
		await createLanguageSwitcher();
	}
}); 