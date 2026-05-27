// storage.js — localStorage persistence for InvestorVault

const Storage = {
  KEYS: {
    API_KEY: 'iv_api_key',
    FAVORITES: 'iv_favorites',
    PORTFOLIO: 'iv_portfolio',
  },

  // API Key
  getApiKey() {
    return localStorage.getItem(this.KEYS.API_KEY) || 'CloFd6qy9EslCg2wb4wsKr2tRNjueyvJ';
  },
  setApiKey(key) {
    localStorage.setItem(this.KEYS.API_KEY, key);
  },

  // Favorites
  getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.FAVORITES)) || [];
    } catch { return []; }
  },
  addFavorite(symbol) {
    const favs = this.getFavorites();
    if (!favs.includes(symbol.toUpperCase())) {
      favs.push(symbol.toUpperCase());
      localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(favs));
    }
  },
  removeFavorite(symbol) {
    const favs = this.getFavorites().filter(f => f !== symbol.toUpperCase());
    localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(favs));
  },
  isFavorite(symbol) {
    return this.getFavorites().includes(symbol.toUpperCase());
  },

  // Portfolio
  getPortfolio() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.PORTFOLIO)) || [];
    } catch { return []; }
  },
  addPosition(position) {
    const portfolio = this.getPortfolio();
    position.id = Date.now().toString(36);
    portfolio.push(position);
    localStorage.setItem(this.KEYS.PORTFOLIO, JSON.stringify(portfolio));
    return position;
  },
  removePosition(id) {
    const portfolio = this.getPortfolio().filter(p => p.id !== id);
    localStorage.setItem(this.KEYS.PORTFOLIO, JSON.stringify(portfolio));
  },
  updatePosition(id, updates) {
    const portfolio = this.getPortfolio().map(p =>
      p.id === id ? { ...p, ...updates } : p
    );
    localStorage.setItem(this.KEYS.PORTFOLIO, JSON.stringify(portfolio));
  },
};

export default Storage;
