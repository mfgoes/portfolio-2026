class ThemeManager {
    constructor() {
        this.THEME_KEY = 'uxfolio-theme';
        // First-time users always get light mode
        this.currentTheme = localStorage.getItem(this.THEME_KEY) || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme, false);

        // Wait for footer component to load (event-driven, no polling)
        window.UXFolio.EventBus.waitForComponent('footer')
            .then(() => {
                this.attachToggleListener();
                this.attachEmailCopyListener();
                this.updateToggleUI();
            })
            .catch(error => {
                console.error('Footer did not load:', error);
                // Fallback: still try to attach if element exists
                const toggleBtn = document.getElementById('theme-toggle');
                if (toggleBtn) {
                    this.attachToggleListener();
                    this.attachEmailCopyListener();
                    this.updateToggleUI();
                }
            });
    }

    applyTheme(theme, animate = true) {
        document.documentElement.setAttribute('data-bs-theme', theme);

        if (theme === 'dark') {
            document.body.classList.add('theme-dark');
        } else {
            document.body.classList.remove('theme-dark');
        }

        this.updateDitheringColor(theme);
        localStorage.setItem(this.THEME_KEY, theme);
        this.currentTheme = theme;
    }

    updateDitheringColor(theme) {
        if (window.ditheringUniforms) {
            const color = theme === 'dark' ? '#2a2a3e' : '#e8e8ff';
            window.ditheringUniforms.uColor.value.setStyle(color);
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.updateToggleUI();
    }

    updateToggleUI() {
        // Update desktop toggle
        const lightIcon = document.getElementById('theme-icon-light');
        const darkIcon = document.getElementById('theme-icon-dark');
        const text = document.getElementById('theme-text');

        // Update mobile toggle
        const lightIconMobile = document.getElementById('theme-icon-light-mobile');
        const darkIconMobile = document.getElementById('theme-icon-dark-mobile');
        const textMobile = document.getElementById('theme-text-mobile');

        if (this.currentTheme === 'dark') {
            // Desktop
            if (lightIcon) lightIcon.style.display = 'inline-block';
            if (darkIcon) darkIcon.style.display = 'none';
            if (text) text.textContent = 'Light Mode';

            // Mobile
            if (lightIconMobile) lightIconMobile.style.display = 'inline-block';
            if (darkIconMobile) darkIconMobile.style.display = 'none';
            if (textMobile) textMobile.textContent = 'Light Mode';
        } else {
            // Desktop
            if (lightIcon) lightIcon.style.display = 'none';
            if (darkIcon) darkIcon.style.display = 'inline-block';
            if (text) text.textContent = 'Dark Mode';

            // Mobile
            if (lightIconMobile) lightIconMobile.style.display = 'none';
            if (darkIconMobile) darkIconMobile.style.display = 'inline-block';
            if (textMobile) textMobile.textContent = 'Dark Mode';
        }
    }

    attachToggleListener() {
        const toggleBtn = document.getElementById('theme-toggle');
        const toggleBtnMobile = document.getElementById('theme-toggle-mobile');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleTheme());
        }
        if (toggleBtnMobile) {
            toggleBtnMobile.addEventListener('click', () => this.toggleTheme());
        }
    }

    attachEmailCopyListener() {
        const emailBtn = document.getElementById('copy-email-btn');
        const feedback = document.getElementById('copy-feedback');

        if (emailBtn) {
            emailBtn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText('mischavdgoes@gmail.com');

                    // Show feedback
                    if (feedback) {
                        feedback.style.display = 'inline-block';

                        // Hide after 2 seconds
                        setTimeout(() => {
                            feedback.style.display = 'none';
                        }, 2000);
                    }
                } catch (err) {
                    console.error('Failed to copy email:', err);
                }
            });
        }
    }
}

// Initialize theme manager immediately
new ThemeManager();
