// indices.js — Market Indices Panel

import ApiService from './api.js';
import UI from './ui.js';

const IndicesPanel = {
  containerId: 'indices-container',

  async render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    try {
      const data = await ApiService.getMarketIndices();
      
      if (!data || data.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No se pudieron cargar los índices.</p></div>';
        return;
      }

      // Map API symbols to clean names
      const nameMap = {
        '^GSPC': 'S&P 500',
        '^DJI': 'Dow Jones',
        '^IXIC': 'Nasdaq',
        '^RUT': 'Russell 2000'
      };

      const html = data.map(index => {
        const changeClass = UI.getChangeClass(index.change);
        const name = nameMap[index.symbol] || index.name;
        
        return `
          <div class="index-card">
            <div class="index-name">${name}</div>
            <div class="index-value">${index.price.toFixed(2)}</div>
            <div class="index-change ${changeClass}">
              ${UI.formatChangeText(index.change, index.changePercentage)}
            </div>
          </div>
        `;
      }).join('');

      container.innerHTML = html;

    } catch (error) {
      console.error('Error loading indices:', error);
      container.innerHTML = `<div class="empty-state"><p>Error cargando índices. Verifica tu API Key.</p></div>`;
    }
  }
};

export default IndicesPanel;
