// digital-magazine/js/content-loader.js
import { navigateWithSimpleFade, geometricWipeNavigate } from './article-transitions.js'; // Updated imports

const CONTENT_BASE_PATH = './content/'; // Relative to root for GitHub Pages

/**
 * Fetches and populates site metadata like site title, tagline,
 * and dynamically generates primary navigation.
 */
export async function loadSiteMeta() {
    try {
        const response = await fetch(`${CONTENT_BASE_PATH}site-meta.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const meta = await response.json();

        // Populate site title and tagline
        const siteTitleElement = document.querySelector('#site-header .site-title a');
        const taglineElement = document.querySelector('#site-header .tagline');
        if (siteTitleElement) siteTitleElement.textContent = meta.siteName;
        if (taglineElement) taglineElement.textContent = meta.tagline;
        document.title = `${meta.siteName} - ${meta.tagline}`;


        // Populate primary navigation
        const navListElement = document.getElementById('nav-list');
        if (navListElement && meta.categories && Array.isArray(meta.categories)) {
            navListElement.innerHTML = ''; // Clear existing placeholders
            meta.categories.forEach(category => {
