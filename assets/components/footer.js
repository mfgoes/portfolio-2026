document.addEventListener('DOMContentLoaded', async function() {
    try {
        await window.UXFolio.ComponentLoader.load('footer', '#footer-container');
        revealWordmark();
    } catch (error) {
        console.error('Error loading footer:', error);
    }
});

// The wordmark rises out of its mask the first time the footer scrolls into view.
function revealWordmark() {
    const wordmark = document.querySelector('.footer-wordmark');
    if (!wordmark || !('IntersectionObserver' in window)) return;
    wordmark.classList.add('is-armed');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            wordmark.classList.add('is-in');
            observer.disconnect();
        });
    }, { threshold: 0.3 });
    observer.observe(wordmark);
}
