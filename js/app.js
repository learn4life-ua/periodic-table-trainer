import { clearSelection, searchElements } from './table.js';

const modeButtons = [...document.querySelectorAll('.mode-button')];
const viewPanels = [...document.querySelectorAll('[data-view-panel]')];
const searchInput = document.querySelector('#elementSearch');
const clearButton = document.querySelector('#clearSelection');

modeButtons.forEach(button => {
  button.addEventListener('click', () => {
    const view = button.dataset.view;
    modeButtons.forEach(item => item.classList.toggle('is-active', item === button));
    viewPanels.forEach(panel => panel.classList.toggle('is-hidden', panel.dataset.viewPanel !== view));
  });
});

searchInput?.addEventListener('input', event => searchElements(event.target.value));

clearButton?.addEventListener('click', () => {
  if (searchInput) searchInput.value = '';
  clearSelection();
  searchElements('');
});
