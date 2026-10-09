import { applyFilters, clearSelection } from './table.js';

const modeButtons = [...document.querySelectorAll('.mode-button')];
const viewPanels = [...document.querySelectorAll('[data-view-panel]')];
const searchInput = document.querySelector('#elementSearch');
const clearButton = document.querySelector('#clearSelection');
const typeButtons = [...document.querySelectorAll('.filter-button[data-kind="type"]')];
const groupFilter = document.querySelector('#groupFilter');
const periodFilter = document.querySelector('#periodFilter');
const blockFilter = document.querySelector('#blockFilter');

for (let group = 1; group <= 18; group += 1) {
  const option = document.createElement('option');
  option.value = String(group);
  option.textContent = `${group} група`;
  groupFilter?.append(option);
}

const state = {
  query: '',
  type: 'all',
  group: '',
  period: '',
  block: ''
};

function refreshFilters() {
  applyFilters(state);
}

function openView(view) {
  modeButtons.forEach(item => item.classList.toggle('is-active', item.dataset.view === view));
  viewPanels.forEach(panel => panel.classList.toggle('is-hidden', panel.dataset.viewPanel !== view));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

modeButtons.forEach(button => {
  button.addEventListener('click', () => openView(button.dataset.view));
});

document.querySelectorAll('[data-open-view]').forEach(button => {
  button.addEventListener('click', () => openView(button.dataset.openView));
});

searchInput?.addEventListener('input', event => {
  state.query = event.target.value;
  refreshFilters();
});

typeButtons.forEach(button => {
  button.addEventListener('click', () => {
    state.type = button.dataset.value;
    typeButtons.forEach(item => item.classList.toggle('is-active', item === button));
    refreshFilters();
  });
});

groupFilter?.addEventListener('change', event => {
  state.group = event.target.value;
  refreshFilters();
});

periodFilter?.addEventListener('change', event => {
  state.period = event.target.value;
  refreshFilters();
});

blockFilter?.addEventListener('change', event => {
  state.block = event.target.value;
  refreshFilters();
});

clearButton?.addEventListener('click', () => {
  state.query = '';
  state.type = 'all';
  state.group = '';
  state.period = '';
  state.block = '';

  if (searchInput) searchInput.value = '';
  if (groupFilter) groupFilter.value = '';
  if (periodFilter) periodFilter.value = '';
  if (blockFilter) blockFilter.value = '';
  typeButtons.forEach(button => button.classList.toggle('is-active', button.dataset.value === 'all'));

  clearSelection();
  refreshFilters();
});

document.querySelector('[data-focus-search]')?.addEventListener('click', () => searchInput?.focus());

document.querySelector('[data-jump-filter="group"]')?.addEventListener('click', () => groupFilter?.focus());
document.querySelector('[data-jump-filter="period"]')?.addEventListener('click', () => periodFilter?.focus());
document.querySelector('[data-jump-filter="block"]')?.addEventListener('click', () => blockFilter?.focus());
