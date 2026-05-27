// search.js — Stock Search functionality

import ApiService from './api.js';

const Search = {
  inputEl: null,
  resultsEl: null,
  timeoutId: null,

  init(onSelectCallback) {
    this.inputEl = document.getElementById('search-input');
    this.resultsEl = document.getElementById('search-results');
    this.onSelectCallback = onSelectCallback;

    if (!this.inputEl || !this.resultsEl) return;

    this.inputEl.addEventListener('input', (e) => {
      clearTimeout(this.timeoutId);
      const query = e.target.value.trim();
      
      if (query.length < 2) {
        this.clearResults();
        return;
      }

      // Debounce search
      this.timeoutId = setTimeout(() => this.performSearch(query), 300);
    });

    // Close results on click outside
    document.addEventListener('click', (e) => {
      if (!this.inputEl.contains(e.target) && !this.resultsEl.contains(e.target)) {
        this.resultsEl.classList.remove('active');
      }
    });

    // Re-open on focus if there are results
    this.inputEl.addEventListener('focus', () => {
      if (this.resultsEl.children.length > 0) {
        this.resultsEl.classList.add('active');
      }
    });
  },

  async performSearch(query) {
    try {
      const results = await ApiService.searchStock(query);
      this.renderResults(results);
    } catch (error) {
      console.error('Search error:', error);
      this.resultsEl.innerHTML = '<div class="search-result-item" style="color:var(--red); cursor:default;">Error al buscar.</div>';
      this.resultsEl.classList.add('active');
    }
  },

  renderResults(results) {
    this.resultsEl.innerHTML = '';
    
    if (!results || results.length === 0) {
      this.resultsEl.innerHTML = '<div class="search-result-item" style="color:var(--text-muted); cursor:default;">No se encontraron resultados</div>';
      this.resultsEl.classList.add('active');
      return;
    }

    results.forEach(stock => {
      const el = document.createElement('div');
      el.className = 'search-result-item';
      el.innerHTML = `
        <span class="ticker">${stock.symbol}</span>
        <span class="name">${stock.name}</span>
        <span class="exchange">${stock.exchangeShortName || stock.exchange}</span>
      `;
      
      el.addEventListener('click', () => {
        this.inputEl.value = '';
        this.clearResults();
        if (this.onSelectCallback) {
          this.onSelectCallback(stock.symbol);
        }
      });
      
      this.resultsEl.appendChild(el);
    });

    this.resultsEl.classList.add('active');
  },

  clearResults() {
    this.resultsEl.innerHTML = '';
    this.resultsEl.classList.remove('active');
  }
};

export default Search;
