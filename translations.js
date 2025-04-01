// Helper function to get nested translation
function getTranslation(translations, key) {
    return key.split('.').reduce((obj, k) => obj && obj[k], translations);
}

// Translate the page
function translatePage() {
    const currentLang = document.getElementById('languageSelect').value;
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

    // Save selected language
    localStorage.setItem('selectedLanguage', currentLang);
}

// Initialize translations
async function initializeTranslations() {
    try {
        const response = await fetch('/translations');
        if (!response.ok) throw new Error('Failed to load translations');
        const data = await response.json();
        window.translations = data.translations;
        window.availableLanguages = data.availableLanguages;
        
        // Populate language dropdown
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.innerHTML = ''; // Clear existing options
            window.availableLanguages.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang.code;
                option.textContent = lang.name;
                languageSelect.appendChild(option);
            });
            
            // Set initial language
            const savedLang = localStorage.getItem('selectedLanguage') || 'en';
            if (window.availableLanguages.find(lang => lang.code === savedLang)) {
                languageSelect.value = savedLang;
            } else {
                languageSelect.value = 'en';
            }
            
            // Initial translation
            translatePage();
        }
    } catch (error) {
        console.error('Error loading translations:', error);
    }
}

// Call initialization when the page loads
document.addEventListener('DOMContentLoaded', initializeTranslations); 