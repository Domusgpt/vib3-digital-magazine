// digital-magazine/js/content-loader.js
import { navigateWithSimpleFade, geometricWipeNavigate } from './article-transitions.js';

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
                const listItem = document.createElement('li');
                const link = document.createElement('a');
                const categoryUrl = `category.html?id=${category.id}`;
                link.href = categoryUrl;
                link.textContent = category.name;
                link.setAttribute('data-vib3-interaction-preset', 'category-link-pulse');
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    navigateWithSimpleFade(categoryUrl);
                });
                listItem.appendChild(link);
                navListElement.appendChild(listItem);
            });
        }
        return meta;
    } catch (error) {
        console.error('Error loading site metadata:', error);
        return null;
    }
}

/**
 * Loads and displays the featured article on the homepage.
 * @param {string} articleSlug - The slug identifier for the article.
 */
export async function loadFeaturedArticle(articleSlug) {
    try {
        const response = await fetch(`${CONTENT_BASE_PATH}articles/${articleSlug}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const article = await response.json();

        const featuredContainer = document.getElementById('featured-article-placeholder');
        if (featuredContainer) {
            featuredContainer.innerHTML = `
                <article class="featured-article">
                    <h3 class="featured-title"><a href="article.html?slug=${article.slug}">${article.title}</a></h3>
                    <p class="featured-excerpt">${article.excerpt}</p>
                    <div class="featured-meta">
                        <span class="category-badge" style="background-color: ${article.category.color}">${article.category.name}</span>
                        <span class="article-date">${new Date(article.date).toLocaleDateString()}</span>
                    </div>
                </article>
            `;
            
            // Add navigation transition to featured article link
            const featuredLink = featuredContainer.querySelector('.featured-title a');
            if (featuredLink) {
                featuredLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    geometricWipeNavigate(featuredLink.href, 'article');
                });
            }
        }
    } catch (error) {
        console.error('Error loading featured article:', error);
        const featuredContainer = document.getElementById('featured-article-placeholder');
        if (featuredContainer) {
            featuredContainer.innerHTML = '<p>Error loading featured article.</p>';
        }
    }
}

/**
 * Loads the full article content for the article page.
 * @param {string} articleSlug - The slug identifier for the article.
 */
export async function loadFullArticle(articleSlug) {
    try {
        const response = await fetch(`${CONTENT_BASE_PATH}articles/${articleSlug}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const article = await response.json();

        // Update page title
        document.title = `${article.title} - Vib3code`;

        // Populate article header
        const titleEl = document.getElementById('article-title');
        const metaEl = document.getElementById('article-meta');
        const bodyEl = document.getElementById('article-body');

        if (titleEl) titleEl.textContent = article.title;
        if (metaEl) {
            metaEl.innerHTML = `
                <span class="article-author">By ${article.author}</span>
                <span class="article-date">${new Date(article.date).toLocaleDateString()}</span>
                <span class="category-badge" style="background-color: ${article.category.color}">${article.category.name}</span>
            `;
        }
        if (bodyEl) {
            bodyEl.innerHTML = article.content;
        }

        // Update VIB3 background based on article category
        if (window.Vib3codeApp && window.Vib3codeApp.vib3System && article.category.stylePreset) {
            const bgEl = document.getElementById('vib3-global-background');
            if (bgEl) {
                bgEl.setAttribute('data-vib3-style', article.category.stylePreset);
                window.Vib3codeApp.vib3System.processElement(bgEl);
            }
        }
    } catch (error) {
        console.error('Error loading article:', error);
        const bodyEl = document.getElementById('article-body');
        if (bodyEl) {
            bodyEl.innerHTML = '<p>Error loading article content.</p>';
        }
    }
}

/**
 * Loads articles for a specific category page.
 * @param {string} categoryId - The category identifier.
 */
export async function loadCategoryPage(categoryId) {
    try {
        // In a real implementation, this would fetch articles filtered by category
        // For now, we'll load all articles and filter client-side
        const articleSlugs = ['ema-report-monolith']; // In production, fetch from an index
        const articles = [];
        
        for (const slug of articleSlugs) {
            const response = await fetch(`${CONTENT_BASE_PATH}articles/${slug}.json`);
            if (response.ok) {
                const article = await response.json();
                if (article.category.id === categoryId) {
                    articles.push(article);
                }
            }
        }

        // Update page title based on category
        const categoryName = articles.length > 0 ? articles[0].category.name : categoryId;
        document.title = `${categoryName} - Vib3code`;
        
        const categoryTitleEl = document.getElementById('category-title');
        if (categoryTitleEl) categoryTitleEl.textContent = categoryName;

        // Display articles
        const gridEl = document.getElementById('category-articles-grid');
        if (gridEl) {
            if (articles.length === 0) {
                gridEl.innerHTML = '<p>No articles found in this category.</p>';
            } else {
                gridEl.innerHTML = articles.map(article => `
                    <article class="article-card" data-vib3-style="glass-panel-primary" data-vib3-interaction-preset="glass-panel-hover">
                        <h3 class="article-title"><a href="article.html?slug=${article.slug}">${article.title}</a></h3>
                        <p class="article-excerpt">${article.excerpt}</p>
                        <div class="article-meta">
                            <span class="article-date">${new Date(article.date).toLocaleDateString()}</span>
                        </div>
                    </article>
                `).join('');
                
                // Add navigation transitions to article links
                gridEl.querySelectorAll('.article-title a').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        geometricWipeNavigate(link.href, 'article');
                    });
                });
            }
        }
    } catch (error) {
        console.error('Error loading category page:', error);
        const gridEl = document.getElementById('category-articles-grid');
        if (gridEl) {
            gridEl.innerHTML = '<p>Error loading category articles.</p>';
        }
    }
}