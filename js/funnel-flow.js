// Funnel flow (animated Sankey): draws a traffic funnel from the JSON block
// inside a .ff figure, streams visitor dots through it and traces a step on
// hover, focus or tap. See assets/css/funnel-flow.css.
(function () {
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const canHover = window.matchMedia('(hover: hover)').matches;
	const SVG_NS = 'http://www.w3.org/2000/svg';
	const REVEAL_SECONDS = 1.4;
	let uid = 0;

	function svgEl(name, attrs, parent) {
		const node = document.createElementNS(SVG_NS, name);
		for (const key in attrs) node.setAttribute(key, attrs[key]);
		if (parent) parent.appendChild(node);
		return node;
	}

	const sum = links => links.reduce((total, link) => total + link.value, 0);
	const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

	function formatCount(value) {
		return value < 1000 ? String(value) : `${+(value / 1000).toFixed(1)}k`;
	}

	function formatShare(part, whole) {
		const pct = (part / whole) * 100;
		return `${pct < 10 ? +pct.toFixed(1) : Math.round(pct)}%`;
	}

	// Links are listed in the JSON in the order they should stack on each node.
	function buildModel(data) {
		const nodes = data.nodes.map(node => Object.assign({ in: [], out: [] }, node));
		const byId = new Map(nodes.map(node => [node.id, node]));
		const links = data.links.map(([from, to, value]) => {
			const link = { source: byId.get(from), target: byId.get(to), value };
			link.source.out.push(link);
			link.target.in.push(link);
			return link;
		});
		const columns = [];
		nodes.forEach(node => {
			node.value = Math.max(sum(node.in), sum(node.out));
			(columns[node.col] = columns[node.col] || []).push(node);
		});
		const model = {
			nodes, links, columns,
			headings: data.columns || [],
			unit: data.unit || 'visitors',
			total: columns[0].reduce((total, node) => total + node.value, 0),
			entries: columns[0].flatMap(node => node.out)
		};
		nodes.forEach(node => { node.summary = describe(node, model); });
		return model;
	}

	function describe(node, model) {
		if (node.note) return node.note;
		const parent = node.in.length === 1 ? node.in[0].source : null;
		if (!node.in.length) return `${node.group ? node.group + ' · ' : ''}${formatShare(node.value, model.total)} of traffic`;
		if (!node.out.length) return `${formatShare(node.value, model.total)} of all ${model.unit}`;
		if (parent && node.kind === 'exit') return `${formatShare(node.value, parent.value)} leave the ${parent.label.toLowerCase()} without clicking through`;
		if (parent) return `${formatShare(node.value, parent.value)} CTR from the ${parent.label.toLowerCase()}`;
		const onward = sum(node.out.filter(link => link.target.kind !== 'exit'));
		return `${formatShare(onward, node.value)} click through to a subpage`;
	}

	function layout(model, width) {
		const narrow = width < 440;
		const box = { width, height: narrow ? 340 : 400, top: 24, bottom: 28, bar: narrow ? 8 : 10, gap: narrow ? 8 : 10 };
		const plot = box.height - box.top - box.bottom;
		const scale = Math.min(...model.columns.map(col =>
			(plot - (col.length - 1) * box.gap) / col.reduce((total, node) => total + node.value, 0)));
		// the last gap is the widest: the labels sitting in it are the longest
		const weights = model.columns.slice(1).map((col, i, all) => (i === all.length - 1 ? 1.5 : 1));
		const span = (width - box.bar) / weights.reduce((a, b) => a + b, 0);
		let x = 0;
		model.columns.forEach((col, i) => {
			const used = col.reduce((total, node) => total + node.value * scale, 0) + (col.length - 1) * box.gap;
			let y = box.top + (plot - used) / 2;
			col.forEach(node => {
				node.x = x;
				node.y0 = y;
				node.y1 = y + Math.max(node.value * scale, 2);
				y = node.y1 + box.gap;
			});
			x += span * (weights[i] || 0);
		});
		model.nodes.forEach(node => {
			let out = node.y0;
			let into = node.y0;
			node.out.forEach(link => {
				link.w = Math.max(link.value * scale, 1.5);
				link.x0 = node.x + box.bar;
				link.sy = out;
				out += link.value * scale;
			});
			node.in.forEach(link => {
				link.x1 = node.x;
				link.ty = into;
				into += link.value * scale;
			});
		});
		return box;
	}

	function linkPath(link) {
		const xm = (link.x0 + link.x1) / 2;
		const y0 = link.sy + link.w / 2;
		const y1 = link.ty + link.w / 2;
		return `M${link.x0},${y0}C${xm},${y0} ${xm},${y1} ${link.x1},${y1}`;
	}

	// One visitor: a chain of links from a source to an outcome
	function plan(particle, model, first) {
		const path = [];
		let link = pick(model.entries);
		let f = Math.random();
		while (link) {
			path.push({ link, f });
			const node = link.target;
			if (!node.out.length) break;
			if (node.in.length === 1) {
				// carry the dot's height through the node, so it leaves where it came in
				let at = f * link.value;
				let next = node.out[node.out.length - 1];
				for (const out of node.out) {
					if (at <= out.value) { next = out; break; }
					at -= out.value;
				}
				f = Math.min(at / next.value, 1);
				link = next;
			} else {
				link = pick(node.out);
				f = Math.random();
			}
		}
		const end = path[path.length - 1].link.target;
		particle.path = path;
		particle.ids = new Set(path.map(step => step.link.target.id).concat(path[0].link.source.id));
		particle.win = end.kind === 'win';
		particle.t = 0;
		particle.speed = 0.36 + Math.random() * 0.2;
		particle.wait = Math.random() * (first ? 7 : 1.5);
	}

	function pick(links) {
		let at = Math.random() * sum(links);
		for (const link of links) {
			if (at <= link.value) return link;
			at -= link.value;
		}
		return links[links.length - 1];
	}

	function initFunnel(root) {
		const chart = root.querySelector('.ff-chart');
		const source = root.querySelector('.ff-data');
		if (!chart || !source) return;

		const model = buildModel(JSON.parse(source.textContent));
		const title = root.querySelector('.ff-title');
		const toggle = root.querySelector('.ff-toggle');
		const readout = root.querySelector('.ff-readout');
		const readoutName = document.createElement('span');
		const readoutValue = document.createElement('span');
		const readoutNote = document.createElement('span');
		readoutName.className = 'ff-readout-name';
		readoutValue.className = 'ff-readout-value';
		readoutNote.className = 'ff-readout-note';
		if (readout) readout.replaceChildren(readoutName, readoutValue, readoutNote);

		const clipId = `ff-clip-${++uid}`;
		const particles = [];
		let width = 0;
		let svg = null;
		let clipRect = null;
		let linkEls = [];
		let nodeEls = [];
		let dots = [];
		let hovered = null;
		let pinned = null;
		let revealed = reduceMotion ? 1 : 0;
		let started = reduceMotion;
		let visible = false;
		let paused = false;
		let raf = 0;
		let last = 0;

		// The same figures as a table, for screen readers. The wrapper does the
		// hiding: a table ignores the 1px clip and would widen the page.
		const hidden = document.createElement('div');
		hidden.className = 'visually-hidden';
		const table = hidden.appendChild(document.createElement('table'));
		const caption = table.createCaption();
		caption.textContent = title ? title.textContent : 'Funnel';
		model.nodes.forEach(node => {
			const row = table.insertRow();
			[node.label, `${formatCount(node.value)} ${model.unit}`, node.summary].forEach(text => {
				row.insertCell().textContent = text;
			});
		});
		root.appendChild(hidden);

		function build() {
			const box = layout(model, width);
			chart.replaceChildren();
			svg = svgEl('svg', {
				class: 'ff-svg', width: box.width, height: box.height,
				viewBox: `0 0 ${box.width} ${box.height}`, role: 'group',
				'aria-label': title ? title.textContent : 'Funnel'
			}, chart);
			clipRect = svgEl('rect', { x: 0, y: 0, width: box.width, height: box.height },
				svgEl('clipPath', { id: clipId }, svgEl('defs', {}, svg)));

			const linkLayer = svgEl('g', { 'clip-path': `url(#${clipId})` }, svg);
			linkEls = model.links.map(link => ({
				link,
				el: svgEl('path', {
					class: `ff-link${link.target.kind === 'win' ? ' is-win' : ''}`,
					d: linkPath(link), 'stroke-width': link.w
				}, linkLayer)
			}));

			const dotLayer = svgEl('g', { class: 'ff-dots', 'aria-hidden': 'true' }, svg);
			dots = particles.map(() => svgEl('circle', { class: 'ff-dot', r: 1.9 }, dotLayer));

			const nodeLayer = svgEl('g', {}, svg);
			nodeEls = model.nodes.map(node => {
				const next = model.columns[node.col + 1];
				const h = node.y1 - node.y0;
				const g = svgEl('g', {
					class: `ff-node${node.kind ? ` is-${node.kind}` : ''}`, tabindex: 0, role: 'button',
					'aria-label': `${node.label}: ${formatCount(node.value)} ${model.unit}, ${node.summary}`
				}, nodeLayer);
				svgEl('rect', { class: 'ff-bar', x: node.x, y: node.y0, width: box.bar, height: h, rx: Math.min(2, h / 2) }, g);

				let x = node.x + box.bar + 8;
				let y = h < 20 ? (node.y0 + node.y1) / 2 + 4 : node.y0 + 15;
				if (!next) {
					// outcome labels sit left of the bar, or on top when the bar is a sliver
					x = h < 20 ? box.width : node.x - 8;
					y = h < 20 ? node.y0 - 8 : node.y1 - 9;
				}
				const text = svgEl('text', { class: 'ff-label', x, y, 'text-anchor': next ? 'start' : 'end' }, g);
				svgEl('tspan', { class: 'ff-name' }, text).textContent = node.label;
				const value = svgEl('tspan', { class: 'ff-value', dx: 6 }, text);
				value.textContent = formatCount(node.value);
				if (next && h >= 34 && text.getComputedTextLength() > next[0].x - x - 6) {
					value.removeAttribute('dx');
					value.setAttribute('x', x);
					value.setAttribute('dy', '1.25em');
				}

				const top = Math.min(node.y0, (node.y0 + node.y1) / 2 - 12) - (!next && h < 20 ? 18 : 0);
				svgEl('rect', {
					class: 'ff-hit', rx: 3, y: top, height: Math.max(node.y1 - top, 24),
					x: next ? node.x - 6 : node.x - 76,
					width: next ? (next[0].x - node.x) * 0.62 : 76 + box.bar
				}, g);

				g.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') hover(node); });
				g.addEventListener('pointerleave', () => hover(null));
				g.addEventListener('focus', () => { if (g.matches(':focus-visible')) hover(node); });
				g.addEventListener('blur', () => hover(null));
				g.addEventListener('click', () => pin(node));
				g.addEventListener('keydown', event => {
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault();
						pin(node);
					}
				});
				return { node, el: g };
			});

			model.headings.forEach((label, i) => {
				const col = model.columns[i];
				if (!col) return;
				const end = i === model.columns.length - 1;
				svgEl('text', {
					class: 'ff-col', y: box.height - 6,
					x: end ? box.width : col[0].x, 'text-anchor': end ? 'end' : 'start'
				}, svg).textContent = label;
			});

			applyReveal();
			applyActive();
		}

		function applyReveal() {
			const edge = revealed < 1 ? ease(revealed) * width : width;
			clipRect.setAttribute('width', edge);
			nodeEls.forEach(({ node, el }) => el.classList.toggle('is-in', node.x <= edge));
		}

		function applyActive() {
			const active = hovered || pinned;
			svg.classList.toggle('has-active', !!active);
			linkEls.forEach(({ link, el }) => {
				el.classList.toggle('is-on', !!active && (link.source === active || link.target === active));
			});
			nodeEls.forEach(({ node, el }) => {
				const near = node === active || node.in.some(link => link.source === active) || node.out.some(link => link.target === active);
				el.classList.toggle('is-on', !!active && near);
				el.setAttribute('aria-pressed', String(node === pinned));
			});
			if (!readout) return;
			if (active) {
				readoutName.textContent = active.label;
				readoutValue.textContent = `${formatCount(active.value)} ${model.unit}`;
				readoutNote.textContent = active.summary;
			} else {
				const won = model.nodes.filter(node => node.kind === 'win').reduce((total, node) => total + node.value, 0);
				readoutName.textContent = `${formatCount(model.total)} ${model.unit}`;
				readoutValue.textContent = `${formatShare(won, model.total)} convert`;
				readoutNote.textContent = `${canHover ? 'Hover' : 'Tap'} a step to trace its journey`;
			}
		}

		function hover(node) {
			hovered = node;
			applyActive();
		}

		function pin(node) {
			pinned = pinned === node ? null : node;
			applyActive();
		}

		function move(particle, dot, dt) {
			if (particle.wait > 0) {
				particle.wait -= dt;
				return;
			}
			particle.t += dt * particle.speed;
			if (particle.t >= particle.path.length) {
				plan(particle, model, false);
				dot.style.opacity = 0;
				return;
			}
			const index = Math.floor(particle.t);
			const t = particle.t - index;
			const { link, f } = particle.path[index];
			const xm = (link.x0 + link.x1) / 2;
			const u = 1 - t;
			const x = link.x0 * u * u * u + 3 * xm * u * t + link.x1 * t * t * t;
			const y0 = link.sy + f * link.w;
			const y = y0 + (link.ty - link.sy) * (3 * t * t - 2 * t * t * t);
			const active = hovered || pinned;
			const won = particle.win && index === particle.path.length - 1;
			// fade at each end of a link, so the hop between links is never seen
			let opacity = Math.min(1, t / 0.15, (1 - t) / 0.15) * (won ? 1 : 0.6);
			if (active && !particle.ids.has(active.id)) opacity *= 0.12;
			dot.setAttribute('cx', x);
			dot.setAttribute('cy', y);
			dot.style.opacity = opacity;
			if (won !== particle.shown) {
				particle.shown = won;
				dot.classList.toggle('is-win', won);
				dot.setAttribute('r', won ? 2.8 : 1.9);
			}
		}

		function tick(now) {
			raf = requestAnimationFrame(tick);
			const dt = Math.min((now - last) / 1000, 0.05);
			last = now;
			if (revealed < 1) {
				revealed = Math.min(1, revealed + dt / REVEAL_SECONDS);
				applyReveal();
			}
			if (!paused) particles.forEach((particle, i) => move(particle, dots[i], dt));
			else if (revealed >= 1) sync();
		}

		function sync() {
			const run = started && visible && !reduceMotion && (!paused || revealed < 1);
			if (run && !raf) {
				last = performance.now();
				raf = requestAnimationFrame(tick);
			}
			if (!run && raf) {
				cancelAnimationFrame(raf);
				raf = 0;
			}
		}

		function resize() {
			const next = Math.floor(chart.clientWidth);
			if (!next || next === width) return;
			width = next;
			if (!reduceMotion) {
				particles.length = width < 440 ? 28 : 44;
				for (let i = 0; i < particles.length; i++) {
					if (!particles[i]) plan(particles[i] = { shown: false }, model, true);
					else particles[i].shown = false;
				}
			}
			build();
		}

		new ResizeObserver(resize).observe(chart);
		resize();
		// labels are measured to decide how they wrap, so redo that once the webfont is in
		if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (width) build(); });

		new IntersectionObserver(entries => {
			visible = entries[0].isIntersecting;
			if (visible && entries[0].intersectionRatio >= 0.3) started = true;
			sync();
		}, { threshold: [0, 0.3] }).observe(chart);

		document.addEventListener('click', event => {
			if (pinned && !chart.contains(event.target)) pin(pinned);
		});

		if (toggle && !reduceMotion) {
			toggle.hidden = false;
			toggle.addEventListener('click', () => {
				paused = !paused;
				toggle.textContent = paused ? 'Play' : 'Pause';
				sync();
			});
		}
	}

	document.querySelectorAll('.ff').forEach(initFunnel);
})();
