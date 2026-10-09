import { elements, categoryLabels } from '../data/elements.js?v=8';
import { elementDetails } from '../data/details.js?v=8';

const detailsByNumber = new Map(elementDetails.map(item => [item.n, item]));

const table = document.querySelector('#periodicTable');
const panel = document.querySelector('#elementPanel');
const legend = document.querySelector('#legend');

const categoryOrder = [
  'alkali','alkaline','transition','post-transition','metalloid','nonmetal',
  'halogen','noble','lanthanide','actinide','unknown'
];

const metalCategories = new Set(['alkali','alkaline','transition','post-transition','lanthanide','actinide']);
const nonmetalCategories = new Set(['nonmetal','halogen','noble']);
let stopAtomAnimation = null;

function makeLabel(text, className, column, row, span = 1) {
  const node = document.createElement('div');
  node.className = className;
  node.textContent = text;
  node.style.gridColumn = `${column} / span ${span}`;
  node.style.gridRow = String(row);
  table.append(node);
}

function mainPosition(element) {
  if (element.category === 'lanthanide' || element.category === 'actinide') return null;
  return { column: element.group + 1, row: element.period + 1 };
}

function fBlockPosition(element) {
  if (element.category === 'lanthanide') return { column: 4 + (element.number - 57), row: 10 };
  if (element.category === 'actinide') return { column: 4 + (element.number - 89), row: 11 };
  return null;
}

function createElementButton(element, position) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `element cat-${element.category}`;
  button.dataset.number = String(element.number);
  button.dataset.name = element.name.toLocaleLowerCase('uk');
  const detail = detailsByNumber.get(element.number);
  button.dataset.alt = (detail?.alt || '').toLocaleLowerCase('uk');
  button.dataset.symbol = element.symbol.toLocaleLowerCase('uk');
  button.dataset.category = element.category;
  button.dataset.period = String(element.period);
  button.dataset.group = String(element.group);
  button.dataset.block = element.block;
  button.style.gridColumn = String(position.column);
  button.style.gridRow = String(position.row);
  button.setAttribute('aria-label', `${element.name}, ${element.symbol}, порядковий номер ${element.number}`);
  button.innerHTML = `
    <span class="element-number">${element.number}</span>
    <span class="element-symbol">${element.symbol}</span>
    <span class="element-name">${element.name}</span>
    <span class="element-mass">${element.mass}</span>
  `;
  button.addEventListener('click', () => selectElement(element, button));
  table.append(button);
}

function createSeriesPlaceholder(text, period, category) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `element series-jump cat-${category}`;
  button.style.gridColumn = '4';
  button.style.gridRow = String(period + 1);
  button.innerHTML = `<span class="element-number">${text}</span><span class="element-symbol">↘</span><span class="element-name">див. нижче</span>`;
  button.setAttribute('aria-label', `${text}, ряд елементів винесено нижче`);
  button.addEventListener('click', () => {
    const target = table.querySelector(`.element[data-number="${period === 6 ? 57 : 89}"]`);
    target?.focus();
    target?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });
  table.append(button);
}

function renderLegend() {
  legend.innerHTML = '';
  categoryOrder.forEach(category => {
    const item = document.createElement('span');
    item.className = 'legend-item';
    item.innerHTML = `<span class="legend-dot cat-${category}"></span>${categoryLabels[category]}`;
    legend.append(item);
  });
}

function renderTable() {
  table.innerHTML = '';
  for (let group = 1; group <= 18; group += 1) makeLabel(String(group), 'group-label', group + 1, 1);
  for (let period = 1; period <= 7; period += 1) makeLabel(String(period), 'period-label', 1, period + 1);
  makeLabel('Лантаноїди', 'series-label', 1, 10, 3);
  makeLabel('Актиноїди', 'series-label', 1, 11, 3);
  createSeriesPlaceholder('57–71', 6, 'lanthanide');
  createSeriesPlaceholder('89–103', 7, 'actinide');
  elements.forEach(element => {
    const position = mainPosition(element) || fBlockPosition(element);
    if (position) createElementButton(element, position);
  });
}

function renderShells(shells = []) {
  if (!shells.length) return '<span class="detail-muted">Немає даних</span>';
  const chips = shells.map(value => `<span class="shell-chip">${value}</span>`).join('');
  const outer = shells[shells.length - 1];
  return `<span class="shell-chips">${chips}</span><span class="outer-electrons">(на зовн.: ${outer})</span>`;
}

function startAtomModel(element) {
  stopAtomAnimation?.();

  const canvas = panel.querySelector('#atomCanvas');
  const toggleButton = panel.querySelector('#atomToggle');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const shells = element.shells || [];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let running = !reduceMotion;
  let rotation = 0;
  let frameId = null;

  function draw() {
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    ctx.clearRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(cx, cy, 2, cx, cy, 30);
    glow.addColorStop(0, 'rgba(56,189,248,.94)');
    glow.addColorStop(.48, 'rgba(99,102,241,.40)');
    glow.addColorStop(1, 'rgba(99,102,241,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fill();

    const core = ctx.createRadialGradient(cx - 4, cy - 5, 1, cx, cy, 15);
    core.addColorStop(0, '#9ba8ff');
    core.addColorStop(1, '#4338ca');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = '700 11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(element.symbol, cx, cy);

    const maxRadius = 92;
    const step = shells.length ? (maxRadius - 26) / shells.length : 0;

    shells.forEach((count, idx) => {
      const radiusX = 26 + (idx + 1) * step;
      const radiusY = Math.max(12, radiusX * .36);
      const tilt = .24 + idx * .41;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tilt);
      ctx.beginPath();
      ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(79,70,229,.27)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      const visibleElectrons = Math.min(count, 18);
      for (let j = 0; j < visibleElectrons; j += 1) {
        const angle = rotation * (1 + idx * .13) + (j * Math.PI * 2) / visibleElectrons;
        const ex = Math.cos(angle) * radiusX;
        const ey = Math.sin(angle) * radiusY;
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(ex, ey, visibleElectrons > 12 ? 1.55 : 2.05, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    if (running) {
      rotation += .013;
      frameId = requestAnimationFrame(draw);
    }
  }

  function updateToggle() {
    if (!toggleButton) return;
    toggleButton.textContent = running ? 'Пауза' : 'Відтворити';
    toggleButton.setAttribute('aria-pressed', String(running));
  }

  toggleButton?.addEventListener('click', () => {
    running = !running;
    updateToggle();
    if (running) draw();
    else if (frameId) cancelAnimationFrame(frameId);
  });

  updateToggle();
  draw();

  stopAtomAnimation = () => {
    running = false;
    if (frameId) cancelAnimationFrame(frameId);
  };
}

function selectElement(element, button) {
  const detail = detailsByNumber.get(element.number) || {};
  const enriched = {
    ...element,
    alt: detail.alt || element.name,
    config: detail.cfg || null,
    shells: detail.shells || [],
    oxidation: detail.ox || null,
    fact: detail.desc || null
  };
  table.querySelectorAll('.element.is-selected').forEach(node => node.classList.remove('is-selected'));
  button.classList.add('is-selected');

  const altLine = enriched.alt && enriched.alt !== enriched.name
    ? `<span class="detail-alt">${enriched.alt}</span>`
    : '';
  const config = enriched.config || 'Дані уточнюються';
  const oxidation = enriched.oxidation || 'Дані уточнюються';
  const fact = enriched.fact || 'Додаткові відомості про цей елемент уточнюються.';

  panel.innerHTML = `
    <div class="detail-head detail-head-rich">
      <div class="detail-symbol cat-${element.category}">${element.symbol}</div>
      <div class="detail-title-wrap">
        <p class="eyebrow">№ ${element.number}</p>
        <h3>${element.name}</h3>
        ${altLine}
        <span class="category-badge">${categoryLabels[element.category]}</span>
        <span class="atomic-mass">Ar ${element.mass}</span>
      </div>
    </div>

    <div class="detail-compact-list">
      <div class="detail-row">
        <span class="detail-row-label"><b class="detail-icon">ϟ</b>Порядковий номер</span>
        <strong>${element.number}</strong>
      </div>
      <div class="detail-row">
        <span class="detail-row-label"><b class="detail-icon">▦</b>Група / Період</span>
        <strong>${element.group} / ${element.period}</strong>
      </div>
      <div class="detail-row">
        <span class="detail-row-label"><b class="detail-icon">◇</b>Електронний блок</span>
        <strong>${element.block}</strong>
      </div>

      <div class="detail-stack">
        <span class="detail-stack-label">Електронна конфігурація:</span>
        <code class="electron-config">${config}</code>
      </div>

      <div class="detail-stack">
        <span class="detail-stack-label">Розподіл за рівнями (e⁻):</span>
        <div class="shell-line">${renderShells(enriched.shells)}</div>
      </div>

      <div class="detail-stack oxidation-stack">
        <span class="detail-stack-label">Типові ступені окиснення:</span>
        <strong class="oxidation-value">${oxidation}</strong>
      </div>
    </div>

    <div class="fact-box">
      <div class="fact-title"><span>✣</span> Цікавий факт</div>
      <p>${fact}</p>
    </div>

    <div class="atom-model-wrap atom-model-compact">
      <canvas id="atomCanvas" width="270" height="142" aria-label="Динамічна модель електронних оболонок елемента ${element.name}"></canvas>
      <div class="atom-model-meta">
        <span>Динамічна модель електронних оболонок</span>
        <button id="atomToggle" class="atom-toggle" type="button">Пауза</button>
      </div>
    </div>
  `;

  startAtomModel(enriched);
}

export function clearSelection() {
  stopAtomAnimation?.();
  table.querySelectorAll('.element').forEach(node => node.classList.remove('is-selected', 'is-match', 'is-dimmed'));
  panel.innerHTML = `
    <div class="empty-state">
      <div class="empty-symbol">?</div>
      <h3>Оберіть елемент</h3>
      <p>Натисніть на клітинку таблиці, щоб побачити основні відомості та модель будови атома.</p>
    </div>
  `;
}

export function applyFilters({ query = '', type = 'all', group = '', period = '', block = '' } = {}) {
  const q = query.trim().toLocaleLowerCase('uk');
  const buttons = [...table.querySelectorAll('.element[data-number]')];

  buttons.forEach(button => {
    const category = button.dataset.category;
    const queryMatch = !q
      || button.dataset.name.includes(q)
      || button.dataset.alt.includes(q)
      || button.dataset.symbol === q
      || button.dataset.number === q;

    const typeMatch = type === 'all'
      || (type === 'metals' && metalCategories.has(category))
      || (type === 'nonmetals' && nonmetalCategories.has(category));

    const groupMatch = !group || button.dataset.group === group;
    const periodMatch = !period || button.dataset.period === period;
    const blockMatch = !block || button.dataset.block === block;
    const match = queryMatch && typeMatch && groupMatch && periodMatch && blockMatch;

    button.classList.toggle('is-match', match && (q || type !== 'all' || group || period || block));
    button.classList.toggle('is-dimmed', !match);
  });
}

renderLegend();
renderTable();
