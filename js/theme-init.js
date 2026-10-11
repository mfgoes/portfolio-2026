// Runs in <head>, before first paint, so a dark page never flashes light.
// A shared link can force the theme with ?theme=dark (or ?theme=light); the
// choice is saved, so it sticks as the visitor moves between pages.
(function () {
    var KEY = 'uxfolio-theme';
    var theme = null;
    try {
        var param = new URLSearchParams(window.location.search).get('theme');
        if (param === 'dark' || param === 'light') {
            theme = param;
            localStorage.setItem(KEY, theme);
        } else {
            theme = localStorage.getItem(KEY);
        }
    } catch (error) {
        // Storage can be blocked (private mode); fall back to the default light theme
    }
    if (theme === 'dark') document.documentElement.setAttribute('data-bs-theme', 'dark');
})();
