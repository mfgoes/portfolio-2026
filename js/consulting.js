// Consulting page motion: headline word reveal, scroll reveal, statement scrub, stat count, marquee.
// Everything degrades to a static page without JS or with prefers-reduced-motion.
(function () {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    root.classList.add('co-js');

    // Wraps every word of the element's text nodes, keeping inline markup such as <em>.
    function wrapWords(el, build) {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);
        let index = 0;
        textNodes.forEach(node => {
            const fragment = document.createDocumentFragment();
            node.textContent.split(/(\s+)/).forEach(part => {
                if (!part) return;
                if (/^\s+$/.test(part)) {
                    fragment.appendChild(document.createTextNode(' '));
                    return;
                }
                fragment.appendChild(build(part, index++));
            });
            node.replaceWith(fragment);
        });
        return index;
    }

    function initSplit() {
        document.querySelectorAll('[data-split]').forEach(el => {
            wrapWords(el, (word, i) => {
                const mask = document.createElement('span');
                mask.className = 'co-w';
                const inner = document.createElement('span');
                inner.style.setProperty('--i', i);
                inner.textContent = word;
                mask.appendChild(inner);
                return mask;
            });
            el.classList.add('is-split');
        });
    }

    function initReveal() {
        const items = document.querySelectorAll('.co-reveal, .co-clip, [data-split]');
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

    function initScrub() {
        if (reduceMotion) return;
        const blocks = Array.from(document.querySelectorAll('[data-scrub]')).map(el => {
            wrapWords(el, (word) => {
                const span = document.createElement('span');
                span.className = 'co-sw';
                span.textContent = word;
                return span;
            });
            return { el, words: el.querySelectorAll('.co-sw') };
        });
        if (!blocks.length) return;

        let ticking = false;
        const update = () => {
            const vh = window.innerHeight;
            blocks.forEach(({ el, words }) => {
                // 0 when the block's top enters at 85% of the viewport, 1 when its bottom reaches 55%
                const rect = el.getBoundingClientRect();
                const start = vh * 0.85;
                const end = vh * 0.55 - rect.height;
                const progress = Math.min(Math.max((start - rect.top) / (start - end), 0), 1);
                const lit = Math.round(progress * words.length);
                words.forEach((word, i) => word.classList.toggle('is-on', i < lit));
            });
            ticking = false;
        };
        const request = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        };
        window.addEventListener('scroll', request, { passive: true });
        window.addEventListener('resize', request);
        update();
    }

    // Counts from data-count-from to data-count-to, e.g. the old value ticking over to the new one.
    function initCount() {
        const counters = document.querySelectorAll('[data-count-to]');
        if (reduceMotion || !('IntersectionObserver' in window)) return;

        const run = (el) => {
            const from = parseFloat(el.dataset.countFrom);
            const to = parseFloat(el.dataset.countTo);
            const decimals = (el.dataset.countTo.split('.')[1] || '').length;
            const duration = 1400;
            const start = performance.now();
            const tick = (now) => {
                const t = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - t, 4);
                el.textContent = (from + (to - from) * eased).toFixed(decimals);
                if (t < 1) requestAnimationFrame(tick);
            };
            el.textContent = from.toFixed(decimals);
            setTimeout(() => requestAnimationFrame(tick), 500);
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

    function initMarquee() {
        const marquee = document.querySelector('.co-marquee');
        if (!marquee || reduceMotion) return;
        const track = marquee.querySelector('.co-marquee-track');
        const group = track.querySelector('.co-marquee-group');
        // Two halves of two groups each, so the -50% loop is seamless on wide screens too
        for (let i = 0; i < 3; i++) track.appendChild(group.cloneNode(true));
        marquee.classList.add('is-running');
    }

    document.addEventListener('DOMContentLoaded', () => {
        initSplit();
        initReveal();
        initScrub();
        initCount();
        initMarquee();
    });
})();
