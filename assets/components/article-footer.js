document.addEventListener('DOMContentLoaded', async function() {
    try {
        await window.UXFolio.ComponentLoader.load('article-footer', '#article-footer-container');
    } catch (error) {
        console.error('Error loading article footer:', error);
    }
});
