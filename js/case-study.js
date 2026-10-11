// Case study page motion: scroll reveal, stat count-up, reading progress, contents highlight.
// Everything degrades to a static page without JS or with prefers-reduced-motion.
(function () {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    root.classList.add('cs-js');

    function initReveal() {
        const items = document.querySelectorAll('.cs-reveal');
        if (reduceMotion || !('IntersectionObserver' in window)) {
            items.forEach(el => el.classList.add('is-in'));
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-in');
                observer.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
        items.forEach(el => observer.observe(el));
    }

    function initCountUp() {
        const counters = document.querySelectorAll('[data-count]');
        if (reduceMotion || !('IntersectionObserver' in window)) return;

        const run = (el) => {
            const target = parseInt(el.dataset.count, 10);
            const duration = 900;
            const start = performance.now();
            const tick = (now) => {
                const t = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - t, 3);
                el.textContent = Math.round(target * eased);
                if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                run(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.6 });
        counters.forEach(el => observer.observe(el));
    }

    function initProgress() {
        const bar = document.querySelector('.cs-progress');
        if (!bar || reduceMotion) return;
        let ticking = false;
        const update = () => {
            const max = root.scrollHeight - window.innerHeight;
            bar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        }, { passive: true });
        update();
    }

    function initContents() {
        const links = Array.from(document.querySelectorAll('.cs-toc a'));
        if (!links.length || !('IntersectionObserver' in window)) return;
        const byId = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                links.forEach(a => a.classList.remove('is-active'));
                byId.get(entry.target.id)?.classList.add('is-active');
            });
        }, { rootMargin: '-20% 0px -70% 0px' });
        const sections = [];
        byId.forEach((_, id) => {
            const section = document.getElementById(id);
            if (!section) return;
            sections.push(section);
            observer.observe(section);
        });

        // The floating rail sits over the page margin, so hide it outside the
        // sections it lists (hero above, CTA and footer below).
        const floating = document.querySelector('.cs-rail--float');
        if (!floating || !sections.length) return;
        const first = sections[0];
        const last = sections[sections.length - 1];
        let ticking = false;
        const update = () => {
            const mid = window.innerHeight / 2;
            const inRange = first.getBoundingClientRect().top < mid && last.getBoundingClientRect().bottom > mid;
            floating.classList.toggle('is-hidden', !inRange);
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        }, { passive: true });
        window.addEventListener('resize', update);
        update();
    }

    function initCopyLink() {
        const button = document.querySelector('[data-copy-link]');
        if (!button) return;
        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(window.location.href.split('#')[0]);
                const icon = button.querySelector('i');
                icon.className = 'fas fa-check';
                setTimeout(() => { icon.className = 'fas fa-link'; }, 2000);
            } catch (error) {
                console.error('Could not copy link:', error);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initReveal();
        initCountUp();
        initProgress();
        initContents();
        initCopyLink();
    });
})();
