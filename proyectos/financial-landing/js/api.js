// api.js — Financial Modeling Prep API service

import Storage from './storage.js';

const API_BASE = 'https://financialmodelingprep.com';

class ApiService {
  static get key() {
    return Storage.getApiKey();
  }

  static async fetchAPI(endpoint) {
    if (!this.key) throw new Error('API key no configurada');
    
    // Check if endpoint already has query params
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${API_BASE}${endpoint}${separator}apikey=${this.key}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('API Key inválida o límite excedido');
        }
        throw new Error(`Error de red: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  static async searchStock(query) {
    if (!query) return [];
    // Use stable search endpoint
    const data = await this.fetchAPI(`/stable/search-symbol?query=${query}&limit=10`);
    return data;
  }

  static async getQuote(symbol) {
    const data = await this.fetchAPI(`/stable/quote?symbol=${symbol}`);
    return data[0] || null;
  }

  static async getProfile(symbol) {
    const data = await this.fetchAPI(`/stable/profile?symbol=${symbol}`);
    return data[0] || null;
  }

  static async getKeyMetrics(symbol) {
    const data = await this.fetchAPI(`/stable/key-metrics?symbol=${symbol}&limit=1`);
    return data[0] || null;
  }

  static async getFinancialRatios(symbol) {
    const data = await this.fetchAPI(`/stable/ratios?symbol=${symbol}&limit=1`);
    return data[0] || null;
  }
  
  static async getHistoricalPrice(symbol) {
    try {
      const data = await this.fetchAPI(`/stable/historical-price-full?symbol=${symbol}`);
      return data.historical || [];
    } catch (error) {
      console.warn("Historical price unavailable:", error);
      return [];
    }
  }

  static async getMarketIndices() {
    const symbols = '^GSPC,^DJI,^IXIC,^RUT';
    const data = await this.fetchAPI(`/stable/batch-quote?symbols=${symbols}`);
    return data;
  }
  
  static async getBatchQuotes(symbolsArray) {
    if (!symbolsArray || symbolsArray.length === 0) return [];
    const symbols = symbolsArray.join(',');
    const data = await this.fetchAPI(`/stable/batch-quote?symbols=${symbols}`);
    return data;
  }
}

export default ApiService;
