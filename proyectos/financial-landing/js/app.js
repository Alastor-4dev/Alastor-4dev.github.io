// app.js — Main application orchestrator

import Storage from './storage.js';
import Search from './search.js';
import IndicesPanel from './indices.js';
import StockDetail from './stock.js';
import Favorites from './favorites.js';
import Portfolio from './portfolio.js';
import UI from './ui.js';

const App = {
  async init() {
    // Setup routing / navigation
    this.setupNav();
    
    // Check API Key
    if (!Storage.getApiKey()) {
      this.showConfigModal(false);
    }

    // Initialize modules
    Search.init(this.navigateToStock.bind(this));
    Favorites.init(this.navigateToStock.bind(this));
    Portfolio.init(this.navigateToStock.bind(this));

    // Config modal listeners
    document.getElementById('btn-config').addEventListener('click', () => this.showConfigModal(true));
    document.getElementById('btn-save-key').addEventListener('click', () => this.saveApiKey());
    
    // Load home data
    if (Storage.getApiKey()) {
      await IndicesPanel.render();
      // Load AAPL as default on start if no route
      if(window.location.hash === '' || window.location.hash === '#home') {
        this.navigateToStock('AAPL');
      } else {
        this.handleHashChange();
      }
    }
    
    window.addEventListener('hashchange', () => this.handleHashChange());
  },

  setupNav() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        window.location.hash = view;
      });
    });
    
    document.querySelector('.logo').addEventListener('click', () => {
      window.location.hash = 'home';
      // Load default or last viewed if available, else AAPL
      const last = StockDetail.currentSymbol || 'AAPL';
      this.navigateToStock(last);
    });
  },

  handleHashChange() {
    const hash = window.location.hash.substring(1);
    
    // Update active nav
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.view === hash) link.classList.add('active');
      else link.classList.remove('active');
    });

    if (hash === 'favorites') {
      Favorites.render();
    } else if (hash === 'portfolio') {
      Portfolio.render();
    } else if (hash.startsWith('stock/')) {
      const symbol = hash.split('/')[1];
      StockDetail.render(symbol);
    } else {
      // Home / Stock
      const last = StockDetail.currentSymbol || 'AAPL';
      StockDetail.render(last);
    }
  },

  navigateToStock(symbol) {
    if(!symbol) return;
    window.location.hash = `stock/${symbol}`;
  },

  showConfigModal(canClose = true) {
    const modal = document.getElementById('config-modal');
    const input = document.getElementById('api-key-input');
    input.value = Storage.getApiKey();
    modal.classList.add('active');
    
    const cancelBtn = document.getElementById('btn-cancel-key');
    if (!canClose) {
      cancelBtn.style.display = 'none';
    } else {
      cancelBtn.style.display = 'inline-flex';
      cancelBtn.onclick = () => modal.classList.remove('active');
    }
  },

  async saveApiKey() {
    const input = document.getElementById('api-key-input');
    const key = input.value.trim();
    
    if (!key) {
      UI.showToast('Por favor ingresa una API Key válida', 'error');
      return;
    }

    Storage.setApiKey(key);
    document.getElementById('config-modal').classList.remove('active');
    UI.showToast('API Key guardada correctamente', 'success');
    
    // Re-render
    await IndicesPanel.render();
    const last = StockDetail.currentSymbol || 'AAPL';
    this.navigateToStock(last);
  }
};

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

export default App;
