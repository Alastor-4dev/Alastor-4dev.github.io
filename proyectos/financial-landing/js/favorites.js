// favorites.js — Favorites View

import Storage from './storage.js';
import ApiService from './api.js';
import UI from './ui.js';

const Favorites = {
  containerId: 'favorites-view',
  onSelectCallback: null,

  init(onSelectCallback) {
    this.onSelectCallback = onSelectCallback;
  },

  async render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Show view
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    container.classList.add('active');

    const favs = Storage.getFavorites();
    
    if (favs.length === 0) {
      container.innerHTML = `
        <h2 class="section-title">Mis Favoritos</h2>
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          <h3>No tienes acciones favoritas</h3>
          <p>Busca una acción y haz clic en la estrella para guardarla aquí.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <h2 class="section-title">Mis Favoritos</h2>
      <div id="favs-grid" class="favorites-grid">
        ${favs.map(() => `<div class="favorite-card"><div class="skeleton" style="width:100%;height:60px;"></div></div>`).join('')}
      </div>
    `;

    try {
      const quotes = await ApiService.getBatchQuotes(favs);
      
      const grid = document.getElementById('favs-grid');
      let html = '';
      
      quotes.forEach(quote => {
        const changeClass = UI.getChangeClass(quote.change);
        html += `
          <div class="favorite-card" data-symbol="${quote.symbol}">
            <div class="fav-top">
              <span class="fav-ticker">${quote.symbol}</span>
              <button class="btn-icon remove-fav" data-symbol="${quote.symbol}" title="Eliminar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div class="fav-name">${quote.name}</div>
            <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:0.5rem">
              <span class="fav-price">${quote.price.toFixed(2)}</span>
              <span class="fav-change ${changeClass}">${UI.formatChangeText(quote.change, quote.changePercentage)}</span>
            </div>
          </div>
        `;
      });
      
      grid.innerHTML = html;

      // Event Listeners
      grid.querySelectorAll('.favorite-card').forEach(card => {
        card.addEventListener('click', (e) => {
          // Ignore if clicking remove button
          if (e.target.closest('.remove-fav')) return;
          const symbol = card.dataset.symbol;
          if (this.onSelectCallback) this.onSelectCallback(symbol);
        });
      });

      grid.querySelectorAll('.remove-fav').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const symbol = btn.dataset.symbol;
          Storage.removeFavorite(symbol);
          UI.showToast(`${symbol} eliminado`);
          this.render(); // Re-render
        });
      });

    } catch (error) {
      console.error('Error fetching favorites:', error);
      document.getElementById('favs-grid').innerHTML = `
        <div style="grid-column: 1/-1" class="text-muted">Error al cargar datos. Verifica tu conexión.</div>
      `;
    }
  }
};

export default Favorites;
