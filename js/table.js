import { elements, categoryLabels } from '../data/elements.js?v=7';

const table = document.querySelector('#periodicTable');
const panel = document.querySelector('#elementPanel');
const legend = document.querySelector('#legend');

const categoryOrder = [
  'alkali','alkaline','transition','post-transition','metalloid','nonmetal',
  'halogen','noble','lanthanide','actinide','unknown'
];

const metalCategories = new Set(['alkali','alkaline','transition','post-transition','lanthanide','actinide']);
const nonmetalCategories = new Set(['nonmetal','halogen','noble']);

// Розподіл електронів за енергетичними рівнями взято з наданого інтерактивного прототипу.
const shellsByAtomicNumber = {
  1:[1],2:[2],3:[2,1],4:[2,2],5:[2,3],6:[2,4],7:[2,5],8:[2,6],9:[2,7],10:[2,8],
  11:[2,8,1],12:[2,8,2],13:[2,8,3],14:[2,8,4],15:[2,8,5],16:[2,8,6],17:[2,8,7],18:[2,8,8],
  19:[2,8,8,1],20:[2,8,8,2],21:[2,8,9,2],22:[2,8,10,2],23:[2,8,11,2],24:[2,8,13,1],25:[2,8,13,2],26:[2,8,14,2],27:[2,8,15,2],28:[2,8,16,2],29:[2,8,18,1],30:[2,8,18,2],31:[2,8,18,3],32:[2,8,18,4],33:[2,8,18,5],34:[2,8,18,6],35:[2,8,18,7],36:[2,8,18,8],
  37:[2,8,18,8,1],38:[2,8,18,8,2],39:[2,8,18,9,2],40:[2,8,18,10,2],41:[2,8,18,12,1],42:[2,8,18,13,1],43:[2,8,18,13,2],44:[2,8,18,15,1],45:[2,8,18,16,1],46:[2,8,18,18],47:[2,8,18,18,1],48:[2,8,18,18,2],49:[2,8,18,18,3],50:[2,8,18,18,4],51:[2,8,18,18,5],52:[2,8,18,18,6],53:[2,8,18,18,7],54:[2,8,18,18,8],
  55:[2,8,18,18,8,1],56:[2,8,18,18,8,2],57:[2,8,18,18,9,2],58:[2,8,18,19,9,2],59:[2,8,18,21,8,2],60:[2,8,18,22,8,2],61:[2,8,18,23,8,2],62:[2,8,18,24,8,2],63:[2,8,18,25,8,2],64:[2,8,18,25,9,2],65:[2,8,18,27,8,2],66:[2,8,18,28,8,2],67:[2,8,18,29,8,2],68:[2,8,18,30,8,2],69:[2,8,18,31,8,2],70:[2,8,18,32,8,2],71:[2,8,18,32,9,2],72:[2,8,18,32,10,2],73:[2,8,18,32,11,2],74:[2,8,18,32,12,2],75:[2,8,18,32,13,2],76:[2,8,18,32,14,2],77:[2,8,18,32,15,2],78:[2,8,18,32,17,1],79:[2,8,18,32,18,1],80:[2,8,18,32,18,2],81:[2,8,18,32,18,3],82:[2,8,18,32,18,4],83:[2,8,18,32,18,5],84:[2,8,18,32,18,6],85:[2,8,18,32,18,7],86:[2,8,18,32,18,8],
  87:[2,8,18,32,18,8,1],88:[2,8,18,32,18,8,2],89:[2,8,18,32,18,9,2],90:[2,8,18,32,18,10,2],91:[2,8,18,32,20,9,2],92:[2,8,18,32,21,9,2],93:[2,8,18,32,22,9,2],94:[2,8,18,32,24,8,2],95:[2,8,18,32,25,8,2],96:[2,8,18,32,25,9,2],97:[2,8,18,32,27,8,2],98:[2,8,18,32,28,8,2],99:[2,8,18,32,29,8,2],100:[2,8,18,32,30,8,2],101:[2,8,18,32,31,8,2],102:[2,8,18,32,32,8,2],103:[2,8,18,32,32,8,3],104:[2,8,18,32,32,10,2],105:[2,8,18,32,32,11,2],106:[2,8,18,32,32,12,2],107:[2,8,18,32,32,13,2],108:[2,8,18,32,32,14,2],109:[2,8,18,32,32,15,2],110:[2,8,18,32,32,16,2],111:[2,8,18,32,32,17,2],112:[2,8,18,32,32,18,2],113:[2,8,18,32,32,18,3],114:[2,8,18,32,32,18,4],115:[2,8,18,32,32,18,5],116:[2,8,18,32,32,18,6],117:[2,8,18,32,32,18,7],118:[2,8,18,32,32,18,8]
};

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

function startAtomModel(element) {
  stopAtomAnimation?.();

  const canvas = panel.querySelector('#atomCanvas');
  const toggleButton = panel.querySelector('#atomToggle');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const shells = shellsByAtomicNumber[element.number] || [];
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

    const glow = ctx.createRadialGradient(cx, cy, 2, cx, cy, 34);
    glow.addColorStop(0, 'rgba(56,189,248,.95)');
    glow.addColorStop(.5, 'rgba(99,102,241,.42)');
    glow.addColorStop(1, 'rgba(99,102,241,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 34, 0, Math.PI * 2);
    ctx.fill();

    const core = ctx.createRadialGradient(cx - 4, cy - 5, 2, cx, cy, 17);
    core.addColorStop(0, '#9ba8ff');
    core.addColorStop(1, '#4338ca');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, 17, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = '700 12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(element.symbol, cx, cy);

    const maxRadius = 107;
    const step = shells.length > 1 ? (maxRadius - 34) / shells.length : 42;

    shells.forEach((count, idx) => {
      const radiusX = 34 + (idx + 1) * step;
      const radiusY = Math.max(15, radiusX * .36);
      const tilt = .28 + idx * .42;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tilt);
      ctx.beginPath();
      ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(79,70,229,.26)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let j = 0; j < count; j += 1) {
        const angle = rotation * (1 + idx * .13) + (j * Math.PI * 2) / count;
        const ex = Math.cos(angle) * radiusX;
        const ey = Math.sin(angle) * radiusY;
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(ex, ey, count > 18 ? 1.6 : 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    if (running) {
      rotation += .012;
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
  table.querySelectorAll('.element.is-selected').forEach(node => node.classList.remove('is-selected'));
  button.classList.add('is-selected');
  const shells = shellsByAtomicNumber[element.number] || [];

  panel.innerHTML = `
    <div class="detail-head">
      <div class="detail-symbol cat-${element.category}">${element.symbol}</div>
      <div>
        <p class="eyebrow">№ ${element.number}</p>
        <h3>${element.name}</h3>
        <p class="detail-sub">${categoryLabels[element.category]}</p>
      </div>
    </div>

    <div class="atom-model-wrap">
      <canvas id="atomCanvas" width="280" height="190" aria-label="Динамічна модель електронних оболонок елемента ${element.name}"></canvas>
      <div class="atom-model-meta">
        <span>Динамічна модель електронних оболонок</span>
        <button id="atomToggle" class="atom-toggle" type="button" aria-pressed="true">Пауза</button>
      </div>
    </div>

    <dl class="detail-list">
      <div><dt>Порядковий номер</dt><dd>${element.number}</dd></div>
      <div><dt>Відносна атомна маса</dt><dd>${element.mass}</dd></div>
      <div><dt>Період</dt><dd>${element.period}</dd></div>
      <div><dt>Група</dt><dd>${element.group}</dd></div>
      <div><dt>Електронний блок</dt><dd>${element.block}</dd></div>
      <div><dt>Символ</dt><dd>${element.symbol}</dd></div>
      <div class="wide"><dt>Електрони за рівнями</dt><dd>${shells.join(' • ')}</dd></div>
      <div class="wide"><dt>Категорія</dt><dd>${categoryLabels[element.category]}</dd></div>
    </dl>
  `;

  startAtomModel(element);
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
