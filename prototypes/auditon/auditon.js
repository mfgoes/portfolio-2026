// AuditON prototype. Every screen renders from the one dataset below,
// so names, counts and statuses stay consistent across screens.

const ICONS = {
	menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
	help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.6 2.3c-.8.4-1.2 1-1.2 1.8M12 17h.01"/>',
	user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
	search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
	right: '<path d="m9 6 6 6-6 6"/>',
	left: '<path d="m15 6-6 6 6 6"/>',
	down: '<path d="m6 9 6 6 6-6"/>',
	back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
	file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5"/>',
	check: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>',
	alert: '<path d="M12 4 21 20H3zM12 10v4M12 17h.01"/>',
	calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
	close: '<path d="M6 6l12 12M18 6 6 18"/>',
	plus: '<path d="M12 5v14M5 12h14"/>',
	upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
	download: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
	send: '<path d="m4 12 16-8-6 16-3-7z"/>',
	grid: '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/>',
	list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
	chart: '<path d="M5 20V10M12 20V4M19 20v-7"/>',
	sliders: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
	clipboard: '<rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 3h6v4H9zM9 12h6M9 16h4"/>',
	layers: '<path d="m12 3 9 5-9 5-9-5zM3 13l9 5 9-5"/>',
	priority: '<path d="m7 12 5-5 5 5M7 17l5-5 5 5"/>',
	contact: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M7.5 17a5 5 0 0 1 9 0"/>',
	clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
	up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
	arrowdown: '<path d="M12 5v14M6 13l6 6 6-6"/>',
	shield: '<path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z"/><path d="m8.8 12 2.3 2.3 4.2-4.6"/>',
};

const icon = (name, cls = '') => `<svg class="ao-i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

// ---------- Data ----------
const PEOPLE = {
	SV: { name: 'Sanne de Vries', role: 'Security officer', tone: '' },
	PN: { name: 'Priya Nair', role: 'Security officer', tone: 'alt' },
	LV: { name: 'Lotte Visser', role: 'Security officer', tone: 'warm' },
	JB: { name: 'Jeroen Bakker', role: 'App owner', tone: 'alt' },
	TH: { name: 'Tom Hendriks', role: 'Support lead', tone: 'warm' },
};

const STATUS = {
	progress: 'In progress',
	ready: 'Ready',
	review: 'Under review',
	awaiting: 'Awaiting evidence',
	attention: 'Needs attention',
	active: 'Active',
	draft: 'Draft',
};

const AUDITS = [
	{ name: 'ISO 27001 Surveillance 2023', priority: true, controls: [61, 93], evidence: [148, 240], updated: 'Today', due: '28 Apr 2023', status: 'progress', officer: 'SV' },
	{ name: 'ISAE 3000 Type II', controls: [42, 42], evidence: [118, 118], updated: '03 Apr 2023', due: '14 Apr 2023', status: 'ready', officer: 'SV' },
	{ name: 'SOC 2 Type II', priority: true, controls: [58, 64], evidence: [131, 150], updated: '31 Mar 2023', due: '21 Apr 2023', status: 'review', officer: 'PN' },
	{ name: 'NEN 7510 Healthcare', controls: [12, 33], evidence: [27, 96], updated: '29 Mar 2023', due: '30 Jun 2023', status: 'progress', officer: 'LV' },
	{ name: 'PCI DSS 4.0', controls: [20, 64], evidence: [51, 172], updated: '28 Mar 2023', due: '31 May 2023', status: 'progress', officer: 'PN' },
	{ name: 'Cyber Essentials Plus', controls: [5, 5], evidence: [22, 22], updated: '24 Mar 2023', due: '07 Apr 2023', status: 'ready', officer: 'LV' },
	{ name: 'ISO 22301 Business Continuity', controls: [9, 28], evidence: [16, 71], updated: '22 Mar 2023', due: '15 Sep 2023', status: 'progress', officer: 'SV' },
	{ name: 'TISAX Assessment', controls: [14, 41], evidence: [30, 104], updated: '20 Mar 2023', due: '31 Aug 2023', status: 'progress', officer: 'PN' },
	{ name: 'BSI C5 Attestation', controls: [3, 17], evidence: [8, 63], updated: '16 Mar 2023', due: '30 Nov 2023', status: 'progress', officer: 'LV' },
];

const FRAMEWORKS = [
	{ name: 'ISO 27001:2022', status: 'active', updated: '04 Apr 2023' },
	{ name: 'ISAE 3000', status: 'active', updated: '28 Mar 2023' },
	{ name: 'DORA readiness', status: 'draft', updated: '21 Mar 2023' },
];

const CONTROL = {
	id: 'RM03',
	audit: AUDITS[0].name,
	description: 'Risk treatment plans are implemented for risks that are outside acceptable boundaries which are defined in the risk assessment methodology.',
	team: 'Platform Security',
	evidence: [
		{
			id: 'E01', name: 'Risk assessment', status: 'ready', assignee: 'TH', deadline: '14 Apr 2023',
			files: [
				{ name: 'Risk-assessment-2022-Q4.pdf', meta: '1.2 MB · Tom Hendriks · 30 Mar 2023', ok: true },
				{ name: 'Risk-register-export.xlsx', meta: '348 KB · Tom Hendriks · 30 Mar 2023', ok: true },
			],
			thread: [
				{ by: 'SV', at: '31 Mar, 10:42', text: 'Both files cover the full audit period. Marking this one as ready.' },
			],
		},
		{
			id: 'E02', name: 'Includes risk treatment plans', status: 'attention', assignee: 'JB', deadline: '21 Apr 2023',
			alert: { title: 'Outside the audit period', text: 'Risk-treatment-plan-2021.pdf is dated 12 Mar 2021. This audit covers 1 Jan to 31 Dec 2022.' },
			files: [
				{ name: 'Risk-treatment-plan-2021.pdf', meta: '860 KB · Jeroen Bakker · 03 Apr 2023', ok: false },
			],
			thread: [
				{ by: 'SV', at: '4 Apr, 16:12', text: 'This plan covers 2021. For this audit we need the version approved for 2022. <span class="ao-mention">@Jeroen Bakker</span> can you upload the current one?' },
				{ by: 'JB', at: 'Today, 09:03', text: 'Good catch, that is the old export. The 2022 plan was signed off in November. Uploading it this morning.' },
				{ by: 'SV', at: 'Today, 09:10', text: 'Thanks. I will review it as soon as it is in.' },
			],
		},
		{ id: 'E03', name: 'Approved by management', status: 'awaiting', assignee: null, deadline: null, files: [], thread: [] },
	],
};

// Security Insights. Weekly hours to supply evidence per domain, oldest first, and maturity as [last year, this year].
const DOMAINS = [
	{ name: 'Support', maturity: [1.8, 2.1], hours: [3.1, 2.9, 3.0, 2.6, 2.7, 2.4, 2.5, 2.1, 2.2, 1.9, 1.9, 1.8] },
	{ name: 'R&D', maturity: [2.4, 2.9], hours: [3.4, 3.6, 3.2, 3.3, 2.9, 3.1, 2.8, 2.9, 2.6, 2.7, 2.5, 2.4] },
	{ name: 'Privacy', maturity: [3.0, 3.2], hours: [2.2, 2.4, 2.1, 2.3, 2.0, 1.9, 2.1, 1.8, 1.9, 1.7, 1.7, 1.6] },
	{ name: 'Security', maturity: [3.4, 3.8], hours: [1.6, 1.5, 1.7, 1.4, 1.3, 1.4, 1.2, 1.1, 1.2, 1.0, 1.1, 1.0] },
];

const INSIGHTS = {
	completed: 4,
	approved: 412,
	declined: 23,
	late: 8,
	lastYear: { rate: 92.6, late: 13 },
	targetHours: 2,
	targetMaturity: 4,
	trend: {
		audits: [4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9],
		rate: [91.8, 92.4, 92.1, 93.0, 92.8, 93.5, 93.9, 93.6, 94.2, 94.0, 94.5, 94.7],
		late: [2, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0],
	},
	// Evidence still open per audit as [in review, flagged]; approved and total come from AUDITS
	open: {
		'ISO 27001 Surveillance 2023': [31, 7],
		'PCI DSS 4.0': [22, 4],
		'SOC 2 Type II': [16, 1],
		'ISAE 3000 Type II': [0, 0],
	},
	reuse: [['2020', 6], ['2021', 14], ['2022', 29], ['2023', 47]],
	reuseShare: 34,
	attention: [
		{ control: CONTROL.id, name: CONTROL.evidence[1].name, note: CONTROL.evidence[1].alert.title, status: 'attention', who: CONTROL.evidence[1].assignee, href: '?screen=control&ev=E02&tab=chat' },
		{ control: 'AC07', name: 'Quarterly access review', note: '4 days overdue', status: 'awaiting', who: 'TH', href: '#' },
		{ control: 'BC02', name: 'Recovery test report', note: 'Declined twice', status: 'attention', who: 'JB', href: '#' },
		{ control: 'SD11', name: 'Secure coding training log', note: 'Due in 2 days', status: 'awaiting', who: 'TH', href: '#' },
	],
};

// The signed-in user. Their audits come from AUDITS, so the profile can't drift from the other screens.
const PROFILE = {
	id: 'SV',
	email: 'sanne.devries@example.com',
	team: CONTROL.team,
	domains: ['Security', 'Privacy'],
	can: ['Start and close audits', 'Approve or decline evidence', 'Assign evidence to app owners'],
	notify: [
		{ id: 'mention', label: 'Mentions', text: 'Someone tags you in an evidence thread.', email: true, app: true },
		{ id: 'flagged', label: 'Flagged evidence', text: 'A file fails validation in one of your audits.', email: true, app: true },
		{ id: 'deadline', label: 'Deadline reminders', text: 'Evidence is due within three days.', email: false, app: true },
		{ id: 'summary', label: 'Weekly summary', text: 'Progress across your audits, every Monday.', email: true, app: false },
	],
};

// ---------- Small components ----------
const pill = (status) => `<span class="ao-pill ${status}">${STATUS[status]}</span>`;
const avatar = (id) => `<span class="ao-avatar ${PEOPLE[id].tone}" title="${PEOPLE[id].name}">${id}</span>`;
const person = (id) => `<span class="ao-person">${avatar(id)}${PEOPLE[id].name}</span>`;
const pct = ([done, total]) => Math.round((done / total) * 100);
const select = (label, value) => `<div class="ao-field"><label>${label}</label><div class="ao-input">${value}${icon('down', 'sm')}</div></div>`;
const pager = (text) => `<div class="ao-pager">${icon('left', 'sm')}<span>${text}</span>${icon('right', 'sm')}</div>`;

function progress(label, pair) {
	const done = pair[0] === pair[1];
	return `<div class="ao-progress"><span>${label}</span><div class="ao-bar ${done ? 'done' : ''}"><i style="width:${pct(pair)}%"></i></div><b>${pair[0]}/${pair[1]}</b></div>`;
}

// ---------- Screens ----------
function screenAudits() {
	const count = (status) => AUDITS.filter((a) => a.status === status).length;
	const stat = (n, label, tone = '') => `<div class="ao-stat ${tone}"><b>${n}</b><span>${label}</span></div>`;
	const summary = `<div class="ao-summary ao-hide-mobile">
		${stat(AUDITS.length, 'Ongoing audits')}
		${stat(count('ready'), 'Ready for sign-off', 'ready')}
		${stat(count('review'), 'Under review', 'review')}
		${stat(AUDITS.filter((a) => a.priority).length, 'High priority', 'priority')}
	</div>`;
	const cards = AUDITS.map((a) => `
		<a class="ao-card ao-audit is-${a.status}" href="?screen=control">
			<h3>${a.name}${a.priority ? icon('priority', 'sm') : ''}</h3>
			${progress('Controls', a.controls)}
			${progress('Evidence', a.evidence)}
			<div class="ao-audit-foot"><span>Last update: ${a.updated}</span>${pill(a.status)}${avatar(a.officer)}</div>
		</a>`).join('');

	return `
		<section class="ao-head"><div class="ao-wrap">
			<div class="ao-head-row">
				<div>
					<h1>My Audits</h1>
					<p class="ao-head-sub">Open an audit to get started. You can also download evidence files per audit.</p>
				</div>
				<div class="ao-head-actions">
					<div class="ao-contact ao-hide-mobile">${icon('contact')}<div><strong>Mendix Security Team</strong><span>Questions about an audit?</span></div><a href="#">Get in touch</a></div>
					<button class="ao-btn primary" type="button">Start new audit</button>
				</div>
			</div>
			<div class="ao-tabs"><button class="ao-tab on" type="button">Ongoing Audits<span class="ao-count">${AUDITS.length}</span></button><button class="ao-tab" type="button">Past Audits</button></div>
		</div></section>
		<section class="ao-body"><div class="ao-wrap">
			${summary}
			<div class="ao-filters">
				<div class="ao-field"><label>Search</label><div class="ao-input placeholder">Status, app name, etc${icon('search', 'sm')}</div></div>
				<div class="ao-hide-mobile">${select('Filter apps', 'All audits')}</div>
				<div class="ao-hide-mobile">${select('Sort by', 'Priority')}</div>
				<div class="ao-filters-end ao-hide-mobile"><div class="ao-toggle"><span class="on">${icon('grid', 'sm')}</span><span>${icon('list', 'sm')}</span></div></div>
			</div>
			<div class="ao-grid">${cards}</div>
		</div></section>`;
}

function screenHome() {
	const rows = AUDITS.slice(0, 5).map((a) => `
		<a class="ao-row" href="?screen=control">
			<div>
				<h3>${a.name}</h3>
				<div class="ao-meta">${icon('calendar', 'sm')}Due: ${a.due}</div>
				<div class="ao-meta">${icon('user', 'sm')}Officer: ${PEOPLE[a.officer].name}</div>
			</div>
			<div>${pill(a.status)}<div class="ao-meta">Last updated: ${a.updated}</div></div>
			${icon('right', 'sm')}
		</a>`).join('');

	const tiles = [
		['clipboard', 'All Audits', '13'],
		['sliders', 'All Frameworks', '7'],
		['check', 'All Controls', '387'],
		['layers', 'All Domains', '4'],
	].map(([i, label, n]) => `<a class="ao-card ao-tile" href="#"><span class="ao-tile-icon">${icon(i)}</span>${label}<small>${n}</small>${icon('right', 'sm')}</a>`).join('');

	const frameworks = FRAMEWORKS.map((f) => `
		<a class="ao-fw" href="#"><div><strong>${f.name}</strong>${pill(f.status)}</div><span>Last updated: ${f.updated}</span>${icon('right', 'sm')}</a>`).join('');

	return `
		<section class="ao-head"><div class="ao-wrap">
			<div class="ao-head-row">
				<div><h1>AuditON</h1><p class="ao-head-sub">${AUDITS.length} ongoing audits, 2 ready for sign-off.</p></div>
				<div class="ao-head-actions"><a class="ao-btn" href="?screen=insights">${icon('chart', 'sm')}Dashboard</a><button class="ao-btn primary" type="button">Add${icon('down', 'sm')}</button></div>
			</div>
		</div></section>
		<section class="ao-body"><div class="ao-wrap ao-split">
			<div>
				<h2 class="ao-section-title">Ongoing audits</h2>
				<div class="ao-card ao-rows">${rows}${pager(`1 to 5 of ${AUDITS.length}`)}</div>
			</div>
			<div>
				<h2 class="ao-section-title">Manage audits</h2>
				<div class="ao-tiles">${tiles}</div>
				<h2 class="ao-section-title">Recently updated frameworks</h2>
				<div class="ao-card ao-rows">${frameworks}</div>
			</div>
		</div></section>`;
}

function screenControl(state) {
	const ev = CONTROL.evidence;
	const ready = ev.filter((e) => e.status === 'ready').length;
	const rows = ev.map((e) => `
		<tr data-ev="${e.id}" class="${state.ev === e.id ? 'on' : ''}">
			<td class="ao-ev-name"><span class="ao-ev-id">${e.id}</span>${e.name}</td>
			<td><span class="ao-files">${icon('file', 'sm')}${e.files.length}</span></td>
			<td class="ao-hide-mobile">${e.assignee ? person(e.assignee) : `<span class="ao-link">${icon('plus', 'sm')}Assign user</span>`}</td>
			<td class="ao-hide-mobile">${e.deadline || '–'}</td>
			<td>${pill(e.status)}</td>
		</tr>`).join('');

	return `
		<section class="ao-head"><div class="ao-wrap">
			<div class="ao-head-row"><div style="width:100%">
				<div class="ao-crumbs"><a href="?screen=audits">All Audits</a>/<a href="?screen=audits">${CONTROL.audit}</a>/<strong>${CONTROL.id}</strong></div>
				<div class="ao-title-row"><h1>Control ${CONTROL.id}</h1><span class="ao-pill">${ready} of ${ev.length} ready</span><button class="ao-link" type="button">Edit details</button></div>
				<div class="ao-facts">
					<div><span class="ao-label">Description</span><p>${CONTROL.description}</p></div>
					<div><span class="ao-label">Responsible team</span><p>${CONTROL.team}</p></div>
				</div>
			</div></div>
		</div></section>
		<section class="ao-body"><div class="ao-wrap">
			<div class="ao-card ao-panel-card">
				<div class="ao-card-head"><h2>Required evidence</h2><span>Due ${AUDITS[0].due}</span></div>
				<table class="ao-table">
					<thead><tr><th>Evidence</th><th>Files</th><th class="ao-hide-mobile">Assignee</th><th class="ao-hide-mobile">Deadline</th><th>Status</th></tr></thead>
					<tbody>${rows}</tbody>
				</table>
				${pager(`1 to ${ev.length} of ${ev.length}`)}
			</div>
		</div></section>
		${state.ev ? drawer(ev.find((e) => e.id === state.ev), state.tab) : ''}`;
}

function drawer(e, tab) {
	const files = e.files.length
		? e.files.map((f) => `<div class="ao-file ${f.ok ? '' : 'flagged'}">${icon('file')}<div><strong>${f.name}</strong>${f.meta}</div>${f.ok ? icon('check', 'ok') : icon('alert', 'bad')}</div>`).join('')
		: '<p class="ao-empty">No evidence submitted yet</p>';

	const thread = e.thread.length
		? e.thread.map((m) => `<div class="ao-msg">${avatar(m.by)}<div><div class="ao-msg-head"><strong>${PEOPLE[m.by].name}</strong><span>${PEOPLE[m.by].role} · ${m.at}</span></div><p>${m.text}</p></div></div>`).join('')
		: '<p class="ao-empty">No messages yet. Ask a question about this evidence.</p>';

	const pane = tab === 'chat'
		? `${thread}<div class="ao-compose"><div class="ao-input placeholder">Write a message, use @ to mention</div><button class="ao-btn primary" type="button" aria-label="Send">${icon('send', 'sm')}</button></div>`
		: `<div class="ao-drop">${icon('upload')}<span><strong>Click here</strong>, or drop files here to upload.</span><small>PDF, XLSX, DOCX or PNG, up to 25 MB</small></div>`;

	return `
		<div class="ao-scrim" data-close></div>
		<aside class="ao-drawer" aria-label="Submitted evidence">
			<div class="ao-drawer-head">
				<div><h2>Submitted evidence – Control ${CONTROL.id}</h2><p>${e.id} · ${e.name}</p></div>
				<button class="ao-icon-btn" type="button" aria-label="Close" data-close>${icon('close')}</button>
			</div>
			<div class="ao-drawer-body">
				<div class="ao-pair">
					<div><span class="ao-label">Status</span>${pill(e.status)}</div>
					${e.status === 'ready' ? '' : '<button class="ao-btn primary" type="button">Mark as ready</button>'}
				</div>
				<div class="ao-pair">
					<div><span class="ao-label">Assignee</span>${e.assignee ? person(e.assignee) : `<button class="ao-link" type="button">${icon('plus', 'sm')}Assign user</button>`}</div>
					<div class="ao-field"><label>Deadline</label><div class="ao-input ${e.deadline ? '' : 'placeholder'}">${e.deadline || 'dd/mm/yyyy'}${icon('calendar', 'sm')}</div></div>
				</div>
				${e.alert ? `<div class="ao-alert">${icon('alert')}<div><strong>${e.alert.title}</strong>${e.alert.text}</div></div>` : ''}
				<span class="ao-label">Evidence</span>
				${files}
				<div class="ao-tabs">
					<button class="ao-tab ${tab === 'chat' ? '' : 'on'}" type="button" data-tab="upload">Upload</button>
					<button class="ao-tab ${tab === 'chat' ? 'on' : ''}" type="button" data-tab="chat">Communication${e.thread.length ? `<span class="ao-count">${e.thread.length}</span>` : ''}</button>
				</div>
				${pane}
			</div>
			<div class="ao-drawer-foot"><button class="ao-btn primary" type="button">Save changes</button><button class="ao-btn" type="button" data-close>Cancel</button></div>
		</aside>`;
}

// ---------- Charts ----------
const mean = (values) => values.reduce((sum, v) => sum + v, 0) / values.length;
const path = (pts) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

function sparkline(values) {
	const w = 88, h = 30, lo = Math.min(...values), hi = Math.max(...values);
	const pts = values.map((v, i) => [4 + (i / (values.length - 1)) * (w - 9), 5 + (1 - (v - lo) / (hi - lo || 1)) * (h - 10)]);
	const [x, y] = pts[pts.length - 1];
	return `<svg class="ao-spark" viewBox="0 0 ${w} ${h}" aria-hidden="true"><polyline points="${path(pts)}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5"/></svg>`;
}

// One small multiple per domain, all on the same 0 to 4 hour scale
function trendChart(d) {
	const w = 140, h = 112, left = 16, right = 133, top = 8, bottom = 88, max = 4;
	const y = (v) => bottom - (v / max) * (bottom - top);
	const pts = d.hours.map((v, i) => [left + (i / (d.hours.length - 1)) * (right - left), y(v)]);
	const [ex, ey] = pts[pts.length - 1];
	const grid = [0, 2, 4].map((v) => `<line class="${v === INSIGHTS.targetHours ? 'target' : ''}" x1="${left}" x2="${w}" y1="${y(v)}" y2="${y(v)}"/><text x="0" y="${y(v) + 3.5}">${v}</text>`).join('');
	const hits = pts.map(([px, py], i) => `<circle class="hit" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="7"><title>${d.name}, week ${i + 1}: ${d.hours[i].toFixed(1)} h</title></circle>`).join('');
	return `<svg class="ao-trend" viewBox="0 0 ${w} ${h}" role="img" aria-label="${d.name}: ${d.hours[0].toFixed(1)} to ${d.hours[d.hours.length - 1].toFixed(1)} hours over 12 weeks">
		${grid}
		<polygon points="${left},${bottom} ${path(pts)} ${right},${bottom}"/>
		<polyline points="${path(pts)}"/>
		<circle class="end" cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="4"/>
		${hits}
		<text x="${left}" y="${h - 6}">12 wks ago</text><text x="${w}" y="${h - 6}" text-anchor="end">Now</text>
	</svg>`;
}

// Last year to this year per domain, on the 1 to 5 maturity scale
function maturityChart() {
	const w = 424, h = 146, x = (v) => 86 + ((v - 1) / 4) * 250;
	const ticks = [1, 2, 3, 4, 5].map((v) => `<line class="${v === INSIGHTS.targetMaturity ? 'target' : ''}" x1="${x(v)}" x2="${x(v)}" y1="18" y2="124"/><text x="${x(v)}" y="140" text-anchor="middle">${v}</text>`).join('');
	const rows = DOMAINS.map((d, i) => {
		const [was, now] = d.maturity, y = 32 + i * 28;
		return `<g><title>${d.name}: ${was.toFixed(1)} last year, ${now.toFixed(1)} now</title>
			<text class="name" x="0" y="${y + 4}">${d.name}</text>
			<line class="link" x1="${x(was)}" x2="${x(now)}" y1="${y}" y2="${y}"/>
			<circle class="was" cx="${x(was)}" cy="${y}" r="5.5"/><circle class="now" cx="${x(now)}" cy="${y}" r="5.5"/>
			<text class="value" x="356" y="${y + 4}">${now.toFixed(1)}</text><text x="424" y="${y + 4}" text-anchor="end">+${(now - was).toFixed(1)}</text></g>`;
	}).join('');
	return `<svg class="ao-dumbbell" viewBox="0 0 ${w} ${h}" role="img" aria-label="Maturity per domain, last year and now">
		${ticks}<text x="${x(INSIGHTS.targetMaturity)}" y="10" text-anchor="middle">Target</text>${rows}
	</svg>`;
}

function reuseChart() {
	const w = 228, h = 104, base = 82, max = Math.max(...INSIGHTS.reuse.map(([, n]) => n));
	const cols = INSIGHTS.reuse.map(([year, n], i) => {
		const cx = 28 + i * 57, top = base - (n / max) * 62, last = i === INSIGHTS.reuse.length - 1;
		return `<g><title>${year}: ${n} pieces reused</title>
			<path class="${last ? 'now' : ''}" d="M${cx - 11},${base}V${top + 4}a4,4 0 0 1 4,-4h14a4,4 0 0 1 4,4V${base}z"/>
			<text class="value" x="${cx}" y="${top - 6}" text-anchor="middle">${n}</text><text x="${cx}" y="${h - 4}" text-anchor="middle">${year}</text></g>`;
	}).join('');
	return `<svg class="ao-columns" viewBox="0 0 ${w} ${h}" role="img" aria-label="Evidence pieces reused per year"><line x1="0" x2="${w}" y1="${base}" y2="${base}"/>${cols}</svg>`;
}

function screenInsights() {
	const now = mean(DOMAINS.map((d) => d.hours[d.hours.length - 1]));
	const before = mean(DOMAINS.map((d) => d.hours[0]));
	const weekly = DOMAINS[0].hours.map((_, i) => mean(DOMAINS.map((d) => d.hours[i])));
	const rate = (INSIGHTS.approved / (INSIGHTS.approved + INSIGHTS.declined)) * 100;
	const good = (text) => `<span class="ao-delta">${icon('arrowdown', 'sm')}${text}</span>`;
	const kpi = (label, value, note, values) => `<div class="ao-card ao-kpi" style="--span:3"><div><span>${label}</span><b>${value}</b>${note}</div>${sparkline(values)}</div>`;

	const trends = DOMAINS.map((d) => {
		const last = d.hours[d.hours.length - 1];
		return `<div><div class="ao-trend-head"><strong>${d.name}</strong><b>${last.toFixed(1)} h</b></div>${trendChart(d)}</div>`;
	}).join('');

	const SEGMENTS = [['approved', 'Approved'], ['review', 'In review'], ['flagged', 'Flagged'], ['awaiting', 'Awaiting']];
	const stacks = AUDITS.filter((a) => INSIGHTS.open[a.name]).map((a) => {
		const [done, total] = a.evidence, [review, flagged] = INSIGHTS.open[a.name];
		const counts = { approved: done, review, flagged, awaiting: total - done - review - flagged };
		const bar = SEGMENTS.filter(([key]) => counts[key]).map(([key, label]) => `<i class="${key}" style="flex-grow:${counts[key]}" title="${label}: ${counts[key]}"></i>`).join('');
		return `<div class="ao-stack-row"><span>${a.name}</span><b>${done} of ${total}</b><div class="ao-stack-bar">${bar}</div></div>`;
	}).join('');

	const attention = INSIGHTS.attention.map((t) => `
		<a class="ao-att" href="${t.href}">${icon(t.status === 'attention' ? 'alert' : 'clock', t.status)}<div><strong><span class="ao-ev-id">${t.control}</span>${t.name}</strong>${t.note}</div>${avatar(t.who)}</a>`).join('');

	return `
		<section class="ao-head"><div class="ao-wrap">
			<div class="ao-head-row">
				<div>
					<div class="ao-crumbs"><a class="ao-link" href="?screen=home">${icon('back', 'sm')}Back to home</a></div>
					<h1>Security Insights</h1>
					<p class="ao-head-sub">Identify potential risks and improve the overall security posture through KPIs and general data.</p>
				</div>
				<div class="ao-head-actions ao-hide-mobile"><div class="ao-input ao-period">${icon('calendar', 'sm')}Last 12 weeks${icon('down', 'sm')}</div><button class="ao-btn" type="button">${icon('download', 'sm')}Export</button></div>
			</div>
		</div></section>
		<section class="ao-body"><div class="ao-wrap ao-dash">
			${kpi('Audits in progress', AUDITS.length, `<span>${INSIGHTS.completed} completed this year</span>`, INSIGHTS.trend.audits)}
			${kpi('Average response time', `${now.toFixed(1)} h`, good(`${(before - now).toFixed(1)} h in 12 weeks`), weekly)}
			${kpi('Approval rate', `${rate.toFixed(1)}%`, `<span class="ao-delta">${icon('up', 'sm')}${(rate - INSIGHTS.lastYear.rate).toFixed(1)} pts on last year</span>`, INSIGHTS.trend.rate)}
			${kpi('Provided after deadline', INSIGHTS.late, good(`${INSIGHTS.lastYear.late - INSIGHTS.late} fewer than last year`), INSIGHTS.trend.late)}

			<div class="ao-card ao-panel-card" style="--span:7">
				<div class="ao-card-head"><h2>Response time by domain</h2><span class="ao-key"><i class="line"></i>Target ${INSIGHTS.targetHours} h · hours to supply evidence</span></div>
				<div class="ao-trends">${trends}</div>
			</div>
			<div class="ao-card ao-panel-card" style="--span:5">
				<div class="ao-card-head"><h2>Domain maturity</h2><span class="ao-key"><i class="was"></i>Last year<i class="now"></i>Now · scale of 1 to 5</span></div>
				${maturityChart()}
			</div>

			<div class="ao-card ao-panel-card" style="--span:5">
				<div class="ao-card-head"><h2>Evidence by audit</h2><span>Approved of requested</span></div>
				<div class="ao-key">${SEGMENTS.map(([key, label]) => `<i class="${key}"></i>${label}`).join('')}</div>
				${stacks}
			</div>
			<div class="ao-card ao-panel-card" style="--span:3">
				<div class="ao-card-head"><h2>Evidence reuse</h2></div>
				<div class="ao-meter"><b>${INSIGHTS.reuseShare}%</b> of evidence reused this year<div class="ao-bar"><i style="width:${INSIGHTS.reuseShare}%"></i></div></div>
				${reuseChart()}
			</div>
			<div class="ao-card ao-panel-card" style="--span:4">
				<div class="ao-card-head"><h2>Needs attention</h2><span>${INSIGHTS.attention.length} open</span></div>
				<div class="ao-rows">${attention}</div>
			</div>
		</div></section>`;
}

function screenProfile() {
	const me = PEOPLE[PROFILE.id];
	const mine = AUDITS.filter((a) => a.officer === PROFILE.id);
	const toggle = (n, channel, name) => `<button class="ao-switch" type="button" role="switch" aria-checked="${n[channel]}" aria-label="${n.label}, ${name}" data-pref="${n.id}:${channel}"></button>`;

	const prefs = PROFILE.notify.map((n) => `
		<div class="ao-pref"><div><strong>${n.label}</strong>${n.text}</div>${toggle(n, 'email', 'email')}${toggle(n, 'app', 'in app')}</div>`).join('');

	const audits = mine.map((a) => `
		<a class="ao-fw" href="?screen=control"><div><strong>${a.name}</strong>${pill(a.status)}</div><span>Due: ${a.due}</span>${icon('right', 'sm')}</a>`).join('');

	return `
		<section class="ao-head ao-profile-head">
			<div class="ao-cover"><div class="ao-wrap"><a href="?screen=audits">${icon('back', 'sm')}Back to My Audits</a></div></div>
			<div class="ao-wrap">
				<div class="ao-head-row">
					<div class="ao-profile-id">
						<span class="ao-avatar xl ${me.tone}">${PROFILE.id}</span>
						<div><h1>${me.name}</h1><p class="ao-head-sub">${me.role} · ${PROFILE.team} · ${PROFILE.email}</p></div>
					</div>
					<div class="ao-head-actions"><button class="ao-btn" type="button">Edit profile</button><a class="ao-link" href="?screen=login">Sign out</a></div>
				</div>
			</div>
		</section>
		<section class="ao-body"><div class="ao-wrap ao-split">
			<div>
				<h2 class="ao-section-title">Notifications</h2>
				<div class="ao-card ao-prefs">
					<div class="ao-pref ao-pref-head"><span>Tell me when</span><span>Email</span><span>In app</span></div>
					${prefs}
				</div>
			</div>
			<div>
				<h2 class="ao-section-title">My audits</h2>
				<div class="ao-card ao-rows ao-block">${audits}</div>
				<h2 class="ao-section-title">Access</h2>
				<div class="ao-card ao-access">
					<div><span class="ao-label">Domains</span>${PROFILE.domains.join(', ')}</div>
					<div><span class="ao-label">Permissions</span><ul>${PROFILE.can.map((c) => `<li>${icon('check', 'sm')}${c}</li>`).join('')}</ul></div>
				</div>
			</div>
		</div></section>`;
}

function screenLogin() {
	return `
		<section class="ao-login"><div class="ao-login-box">
			<div class="ao-hero">${icon('shield')}</div>
			<h1>Welcome to AuditON</h1>
			<p>The secure platform for supplying and managing compliance evidence. Get started with your security audit process.</p>
			<a class="ao-btn primary" href="?screen=audits">Sign in with SSO</a>
			<a href="?screen=audits">Sign in with email</a>
			<a class="ao-login-help" href="#">Need help? Contact support</a>
		</div></section>`;
}

// ---------- Router ----------
const SCREENS = { audits: screenAudits, home: screenHome, control: screenControl, insights: screenInsights, profile: screenProfile, login: screenLogin };
const params = new URLSearchParams(location.search);
const state = {
	screen: SCREENS[params.get('screen')] ? params.get('screen') : 'audits',
	ev: params.get('ev'),
	tab: params.get('tab') === 'chat' ? 'chat' : 'upload',
};
const view = document.getElementById('view');

function render() {
	view.innerHTML = SCREENS[state.screen](state);
	document.querySelector('.ao-top').hidden = state.screen === 'login';
}

document.querySelectorAll('[data-icon]').forEach((el) => { el.innerHTML = icon(el.dataset.icon); });

view.addEventListener('click', (e) => {
	const row = e.target.closest('[data-ev]');
	const tab = e.target.closest('[data-tab]');
	const pref = e.target.closest('[data-pref]');
	if (e.target.closest('[data-close]')) state.ev = null;
	else if (pref) {
		const [id, channel] = pref.dataset.pref.split(':');
		const n = PROFILE.notify.find((x) => x.id === id);
		n[channel] = !n[channel];
	}
	else if (tab) state.tab = tab.dataset.tab;
	else if (row) { state.ev = row.dataset.ev; state.tab = 'upload'; }
	else return;
	render();
});

render();
