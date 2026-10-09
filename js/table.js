import { elements, categoryLabels } from '../data/elements.js';

const table = document.querySelector('#periodicTable');
const panel = document.querySelector('#elementPanel');
const legend = document.querySelector('#legend');

const categoryOrder = [
  'alkali','alkaline','transition','post-transition','metalloid','nonmetal',
  'halogen','noble','lanthanide','actinide','unknown'
];

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
  if (element.category === 'lanthanide') {
    return { column: 4 + (element.number - 57), row: 10 };
  }
  if (element.category === 'actinide') {
    return { column: 4 + (element.number - 89), row: 11 };
  }
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

  for (let group = 1; group <= 18; group += 1) {
    makeLabel(String(group), 'group-label', group + 1, 1);
  }
  for (let period = 1; period <= 7; period += 1) {
    makeLabel(String(period), 'period-label', 1, period + 1);
  }

  makeLabel('Лантаноїди', 'series-label', 1, 10, 3);
  makeLabel('Актиноїди', 'series-label', 1, 11, 3);
  createSeriesPlaceholder('57–71', 6, 'lanthanide');
  createSeriesPlaceholder('89–103', 7, 'actinide');

  elements.forEach(element => {
    const position = mainPosition(element) || fBlockPosition(element);
    if (position) createElementButton(element, position);
  });
}

function selectElement(element, button) {
  table.querySelectorAll('.element.is-selected').forEach(node => node.classList.remove('is-selected'));
  button.classList.add('is-selected');

  panel.innerHTML = `
    <div class="detail-head">
      <div class="detail-symbol cat-${element.category}">${element.symbol}</div>
      <div>
        <p class="eyebrow">№ ${element.number}</p>
        <h3>${element.name}</h3>
        <p class="detail-sub">${categoryLabels[element.category]}</p>
      </div>
    </div>
    <dl class="detail-list">
      <div><dt>Порядковий номер</dt><dd>${element.number}</dd></div>
      <div><dt>Відносна атомна маса</dt><dd>${element.mass}</dd></div>
      <div><dt>Період</dt><dd>${element.period}</dd></div>
      <div><dt>Група</dt><dd>${element.group}</dd></div>
      <div><dt>Блок</dt><dd>${element.block}</dd></div>
      <div><dt>Символ</dt><dd>${element.symbol}</dd></div>
      <div class="wide"><dt>Категорія</dt><dd>${categoryLabels[element.category]}</dd></div>
    </dl>
  `;
}

export function clearSelection() {
  table.querySelectorAll('.element').forEach(node => node.classList.remove('is-selected', 'is-match', 'is-dimmed'));
  panel.innerHTML = `
    <div class="empty-state">
      <div class="empty-symbol">?</div>
      <h3>Оберіть елемент</h3>
      <p>Натисніть на клітинку таблиці, щоб побачити основні відомості.</p>
    </div>
  `;
}

export function searchElements(query) {
  const q = query.trim().toLocaleLowerCase('uk');
  const buttons = [...table.querySelectorAll('.element[data-number]')];

  if (!q) {
    buttons.forEach(button => button.classList.remove('is-match', 'is-dimmed'));
    return;
  }

  buttons.forEach(button => {
    const matches = button.dataset.name.includes(q)
      || button.dataset.symbol === q
      || button.dataset.number === q;
    button.classList.toggle('is-match', matches);
    button.classList.toggle('is-dimmed', !matches);
  });
}

renderLegend();
renderTable();
