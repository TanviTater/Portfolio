'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---- Resume download ---- */
const resumeLink = document.querySelector('.resume-download');
if (resumeLink) {
  resumeLink.addEventListener('click', async e => {
    const url = resumeLink.getAttribute('href');
    try {
      const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
      if (!res.ok) throw new Error('Resume unavailable');
    } catch (err) {
      // Keep the normal browser navigation behavior if HEAD is blocked; the
      // actual PDF is bundled beside the site, so same-origin hosting works.
    }
  });
}

/* ---- Project data (all taken from the resume) ---- */
const PROJECTS = [
  { name: 'AlgoTrack', short: 'Interactive DSA visualization platform', stack: ['React.js', 'JavaScript', 'CSS', 'React Router'],
    desc: 'An interactive platform that shows algorithms running step by step, built to help beginners understand DSA fundamentals.',
    features: ['Real-time, step-by-step execution across 5+ concept categories', 'Visualizers for sorting, graph, stack, queue and tree operations', 'Responsive UI built with React.js and React Router', 'Deployed on GitHub Pages and publicly accessible'],
    github: 'https://github.com/TanviTater/AlgoTrack', live: 'https://tanvitater.github.io/AlgoTrack/' },
  { name: 'Flight Operation System', short: 'Role-based flight management system', stack: ['Java Servlets', 'JDBC', 'MySQL', 'HTML', 'CSS'],
    desc: 'A flight management system with secure authentication and separate permissions for each operational role.',
    features: ['CRUD operations for flight routes', 'Distinct permissions for Controller, Manager and Dispatcher roles', 'Responsive, aviation-themed interface', 'MySQL via JDBC; deployed on GlassFish Server using Git'],
    github: 'https://github.com/TanviTater/FlightOperationSystem' },
  { name: 'LeetMetric', short: 'LeetCode progress tracker', stack: ['HTML', 'CSS', 'JavaScript'],
    desc: 'A responsive web app that tracks LeetCode progress through real-time user statistics.',
    features: ['Username validation and dynamic data retrieval', '3 circular progress indicators for Easy, Medium and Hard problems', 'Dashboard with 6+ metrics: solved problems, acceptance rate, ranking and difficulty-wise stats'],
    github: 'https://github.com/TanviTater/LeetMetric', live: 'https://tanvitater.github.io/LeetMetric/' }
];

/* ---- Render project index ---- */
const list = $('#projects');
PROJECTS.forEach((p, i) => {
  const li = document.createElement('li');
  li.className = 'reveal';
  li.innerHTML = `<button class="proj" aria-haspopup="dialog" data-i="${i}">
    <span class="n">0${i + 1}</span>
    <span><h3>${p.name}</h3><p>${p.short}</p><span class="stack">${p.stack.join(' · ')}</span></span>
    <span class="arr" aria-hidden="true">↗</span></button>`;
  list.appendChild(li);
});

/* ---- Project modal (ESC, outside click, focus return) ---- */
const modal = $('#modal');
let lastFocus = null;
function openModal(i) {
  const p = PROJECTS[i];
  lastFocus = document.activeElement;
  $('#mTitle').textContent = p.name;
  $('#mStack').textContent = p.stack.join(' · ');
  $('#mDesc').textContent = p.desc;
  $('#mFeat').innerHTML = p.features.map(f => `<li>${f}</li>`).join('');
  const attrs = 'target="_blank" rel="noopener noreferrer"';
  $('#mLinks').innerHTML = (p.live ? `<a class="btn primary" href="${p.live}" ${attrs}>View project ↗</a>` : '') +
    `<a class="btn" href="${p.github}" ${attrs}>GitHub ↗</a>`;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  $('#mClose').focus();
}
function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
}
list.addEventListener('click', e => { const b = e.target.closest('.proj'); if (b) openModal(+b.dataset.i); });
$('#mClose').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (!modal.hidden) closeModal(); closeRail(); }
  if (e.key === 'Tab' && !modal.hidden) { // keep focus inside the dialog
    const f = $$('button, a', modal);
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

/* ---- System panel ---- */
$('#sysBtn').addEventListener('click', e => {
  const panel = $('#sysPanel');
  const open = panel.hidden;
  panel.hidden = !open;
  e.currentTarget.setAttribute('aria-expanded', open);
});

/* ---- Rail: smooth scroll, mobile menu ---- */
const rail = $('#rail'), toggle = $('#railToggle');
function closeRail() { rail.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
toggle.addEventListener('click', () => {
  const o = rail.classList.toggle('open');
  toggle.setAttribute('aria-expanded', o);
});
$$('.rail a').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  $(a.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
  closeRail();
}));
$('#toTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ---- Scroll progress + active section ---- */
const secs = $$('main section'), links = $$('.rail a');
function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  $('#progress').style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
  let cur = secs[0];
  secs.forEach(s => { if (s.offsetTop <= scrollY + innerHeight * 0.4) cur = s; });
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur.id));
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---- Reveal on scroll ---- */
const io = new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
}), { threshold: 0.1 });
$$('.reveal').forEach(el => io.observe(el));

/* ---- Cursor ring + magnetic buttons (fine pointers only) ---- */
if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
  const ring = $('#ring');
  addEventListener('mousemove', e => {
    ring.classList.add('on');
    ring.style.left = e.clientX + 'px'; ring.style.top = e.clientY + 'px';
    ring.classList.toggle('big', !!e.target.closest('a, button'));
  });
  $$('.magnetic').forEach(m => {
    m.addEventListener('mousemove', e => {
      const r = m.getBoundingClientRect();
      m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.15}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
    });
    m.addEventListener('mouseleave', () => { m.style.transform = ''; });
  });
}
/* ---- Collapsible sidebar (desktop); state kept for this session ---- */
const railCollapse = $('#railCollapse'), railTab = $('#railTab');
const wide = matchMedia('(min-width:1001px)');
function setCollapsed(c, focus) {
  const on = c && wide.matches;
  rail.classList.toggle('collapsed', on);
  document.body.classList.toggle('rail-hidden', on);
  railCollapse.setAttribute('aria-expanded', String(!on));
  railTab.setAttribute('aria-expanded', String(!on));
  try { sessionStorage.setItem('railCollapsed', c ? '1' : '0'); } catch (e) {}
  if (focus) (on ? railTab : railCollapse).focus();
}
railCollapse.addEventListener('click', () => setCollapsed(true, true));
railTab.addEventListener('click', () => setCollapsed(false, true));
wide.addEventListener('change', () => { let v = false; try { v = sessionStorage.getItem('railCollapsed') === '1'; } catch (e) {} setCollapsed(v, false); });
try { setCollapsed(sessionStorage.getItem('railCollapsed') === '1', false); } catch (e) {}

$('#year').textContent = new Date().getFullYear();
