// Roadmap (Gantt) component: filter chips, a shared detail panel and a
// grow-in reveal. Works on any .rm block; see assets/css/roadmap.css.
(function () {
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	function initRoadmap(root) {
		const filters = Array.from(root.querySelectorAll('.rm-filter'));
		const items = Array.from(root.querySelectorAll('.rm-items > li'));
		const bars = items.map(li => li.querySelector('.rm-bar'));
		const panel = root.querySelector('.rm-detail');
		if (!items.length || !panel) return;

		const kicker = panel.querySelector('.rm-detail-kicker');
		const title = panel.querySelector('h3');
		const body = panel.querySelector('.rm-detail-body');

		function select(li) {
			bars.forEach(bar => bar.setAttribute('aria-expanded', String(bar.parentElement === li)));
			const info = li.querySelector('.rm-info');
			panel.dataset.dim = li.dataset.dim;
			kicker.textContent = `${li.dataset.dimLabel} · ${li.querySelector('.rm-when').textContent}`;
			title.textContent = li.querySelector('.rm-label').textContent;
			body.replaceChildren(info.cloneNode(true));
			body.firstElementChild.classList.remove('rm-info');
			panel.hidden = false;
		}

		bars.forEach(bar => bar.addEventListener('click', () => select(bar.parentElement)));

		filters.forEach(button => button.addEventListener('click', () => {
			const dim = button.dataset.dim;
			filters.forEach(f => f.setAttribute('aria-pressed', String(f === button)));
			items.forEach(li => li.classList.toggle('is-dimmed', dim !== 'all' && li.dataset.dim !== dim));
			// keep the panel on something that's still highlighted
			const current = items.find(li => li.querySelector('[aria-expanded="true"]'));
			if (dim !== 'all' && current && current.dataset.dim !== dim) {
				const first = items.find(li => li.dataset.dim === dim);
				if (first) select(first);
			}
		}));

		select(items[0]);

		if (reduceMotion || !('IntersectionObserver' in window)) return;
		root.classList.add('is-waiting');
		const observer = new IntersectionObserver(entries => {
			if (!entries.some(entry => entry.isIntersecting)) return;
			bars.forEach((bar, i) => { bar.style.transitionDelay = `${i * 70}ms`; });
			root.classList.remove('is-waiting');
			setTimeout(() => bars.forEach(bar => { bar.style.transitionDelay = ''; }), 1200);
			observer.disconnect();
		}, { threshold: 0.35 });
		observer.observe(root);
	}

	document.addEventListener('DOMContentLoaded', () => {
		document.querySelectorAll('.rm').forEach(initRoadmap);
	});
})();
