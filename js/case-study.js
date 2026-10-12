// Case study pages: "On this page" rail, scroll reveal, stat count-up, reading progress, contents highlight.
// Everything degrades to a static page without JS or with prefers-reduced-motion.
(function () {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    root.classList.add('cs-js');

    // "On this page" rail. Drop an empty <aside class="cs-rail"> on a case
    // study and it builds itself from the page:
    //   contents  every .cs-section[id] and any [data-toc][id], in page order.
    //             Label: data-toc, else the section eyebrow, else its h2.
    //   share     add data-share to show email / LinkedIn / X / copy link.
    //   byline    add data-byline="Role" (and data-date="Month Year").
    // Add the cs-rail--float class for pages built from full-width bands.
    const SITE = 'https://mischavdgoes.com/';
    const AUTHOR = 'Mischa van der Goes';

    function el(tag, attrs = {}, children = []) {
        const node = document.createElement(tag);
        Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
        children.forEach(child => node.append(child));
        return node;
    }

    function sectionLabel(section) {
        if (section.dataset.toc) return section.dataset.toc;
        const eyebrow = section.querySelector('.cs-eyebrow');
        if (eyebrow) {
            const copy = eyebrow.cloneNode(true);
            copy.querySelectorAll('.cs-num').forEach(n => n.remove());
            return copy.textContent.trim();
        }
        return section.querySelector('h2')?.textContent.trim() ?? section.id;
    }

    function shareLinks() {
        const page = window.location.pathname.split('/').pop() || 'index.html';
        const url = SITE + page;
        const title = document.title.replace(/^Mischa vd Goes\s*-\s*/, '');
        const enc = encodeURIComponent;
        const link = (href, label, icon, external = true) => el('a', {
            href, title: label, 'aria-label': label,
            ...(external ? { target: '_blank', rel: 'noopener' } : {}),
        }, [el('i', { class: icon, 'aria-hidden': 'true' })]);

        return el('div', { class: 'cs-share' }, [
            link(`mailto:?subject=${enc(title)}&body=${enc(url)}`, 'Share via email', 'fas fa-envelope', false),
            link(`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`, 'Share on LinkedIn', 'fab fa-linkedin-in'),
            link(`https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`, 'Share on X', 'fab fa-x-twitter'),
            el('button', { type: 'button', 'data-copy-link': '', title: 'Copy link', 'aria-label': 'Copy link' },
                [el('i', { class: 'fas fa-link', 'aria-hidden': 'true' })]),
        ]);
    }

    function initRail() {
        document.querySelectorAll('.cs-rail').forEach(rail => {
            if (rail.children.length) return; // hand-written rail: leave it alone
            const sections = Array.from(document.querySelectorAll('.cs-section[id], [data-toc][id]'));
            if (!sections.length) return;

            if (!rail.hasAttribute('aria-label')) rail.setAttribute('aria-label', 'On this page');
            const inner = el('div', { class: 'cs-rail-inner' }, [
                el('p', { class: 'cs-rail-label' }, ['On this page']),
                el('ul', { class: 'cs-toc' }, sections.map(section =>
                    el('li', {}, [el('a', { href: `#${section.id}` }, [sectionLabel(section)])]))),
            ]);

            if (rail.hasAttribute('data-share')) {
                inner.append(el('p', { class: 'cs-rail-label' }, ['Share']), shareLinks());
            }
            if (rail.dataset.byline) {
                const byline = el('p', { class: 'cs-byline' }, [el('strong', {}, [AUTHOR]), rail.dataset.byline]);
                if (rail.dataset.date) byline.append(el('br'), rail.dataset.date);
                inner.append(byline);
            }
            rail.append(inner);
        });
    }

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

    // Tabs: <div data-tabs> wrapping .cs-tabpanel[data-tab="Label"] children.
    // Without JS every panel simply shows in order.
    function initTabs() {
        document.querySelectorAll('[data-tabs]').forEach((group, g) => {
            const panels = Array.from(group.querySelectorAll(':scope > .cs-tabpanel'));
            if (panels.length < 2) return;

            const list = el('div', { class: 'cs-tablist', role: 'tablist' });
            if (group.getAttribute('aria-label')) list.setAttribute('aria-label', group.getAttribute('aria-label'));
            group.removeAttribute('aria-label');

            const tabs = panels.map((panel, i) => {
                const id = `cs-tab-${g}-${i}`;
                const tab = el('button', { class: 'cs-tab', type: 'button', role: 'tab', id, 'aria-controls': `${id}-panel` });
                tab.textContent = panel.dataset.tab;
                panel.id = `${id}-panel`;
                panel.setAttribute('role', 'tabpanel');
                panel.setAttribute('aria-labelledby', id);
                list.appendChild(tab);
                return tab;
            });

            const select = (index, focus = false) => {
                tabs.forEach((tab, i) => {
                    const on = i === index;
                    tab.setAttribute('aria-selected', on);
                    tab.tabIndex = on ? 0 : -1;
                    panels[i].hidden = !on;
                });
                if (focus) tabs[index].focus();
            };

            tabs.forEach((tab, i) => tab.addEventListener('click', () => select(i)));
            list.addEventListener('keydown', (event) => {
                const current = tabs.indexOf(document.activeElement);
                if (current < 0) return;
                const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
                if (step) { event.preventDefault(); select((current + step + tabs.length) % tabs.length, true); }
                if (event.key === 'Home') { event.preventDefault(); select(0, true); }
                if (event.key === 'End') { event.preventDefault(); select(tabs.length - 1, true); }
            });

            group.prepend(list);
            group.classList.add('is-ready');
            select(0);
        });
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
        initRail(); // first: the contents and copy-link hooks below look for its markup
        initReveal();
        initCountUp();
        initProgress();
        initContents();
        initCopyLink();
        initTabs();
    });
})();
