// Helper function to get nested translation
function getTranslation(translations, key) {
    return key.split('.').reduce((obj, k) => obj && obj[k], translations);
}

// Translate the page
function translatePage() {
    const currentLang = localStorage.getItem('selectedLanguage') || 'en';
    const translations = window.translations[currentLang];

    if (!translations) {
        console.error('No translations found for language:', currentLang);
        return;
    }

    // Translate all elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        const translation = getTranslation(translations, key);
        if (translation) {
            element.textContent = translation;
        }
    });

    // Translate all elements with data-translate-placeholder attribute
    document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
        const key = element.getAttribute('data-translate-placeholder');
        const translation = getTranslation(translations, key);
        if (translation) {
            element.placeholder = translation;
        }
    });

    // Translate all elements with data-translate-attr attribute
    document.querySelectorAll('[data-translate-attr]').forEach(element => {
        const attrs = JSON.parse(element.getAttribute('data-translate-attr'));
        Object.entries(attrs).forEach(([attr, key]) => {
            const translation = getTranslation(translations, key);
            if (translation) {
                element.setAttribute(attr, translation);
            }
        });
    });
}

// Initialize translations
async function initializeTranslations() {
    try {
        const response = await fetch('/translations');
        if (!response.ok) throw new Error('Failed to load translations');
        const data = await response.json();
        window.translations = data.translations;
        window.availableLanguages = data.availableLanguages;
        
        // Get saved language or default to English
        const savedLang = localStorage.getItem('selectedLanguage') || 'en';
        
        // Initial translation
        translatePage();
    } catch (error) {
        console.error('Error loading translations:', error);
    }
}

// Call initialization when the page loads
document.addEventListener('DOMContentLoaded', initializeTranslations); 