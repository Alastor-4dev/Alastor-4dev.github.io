// portfolio.js — Portfolio View

import Storage from './storage.js';
import ApiService from './api.js';
import UI from './ui.js';

const Portfolio = {
  containerId: 'portfolio-view',
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

    const positions = Storage.getPortfolio();
    
    // Skeleton loading
    container.innerHTML = `
      <h2 class="section-title">Mi Portafolio</h2>
      <div id="portfolio-content">
        <div class="skeleton" style="width:100%;height:100px;margin-bottom:2rem;"></div>
        <div class="skeleton" style="width:100%;height:300px;"></div>
      </div>
    `;

    try {
      let quotes = [];
      if (positions.length > 0) {
        const symbols = [...new Set(positions.map(p => p.symbol))];
        quotes = await ApiService.getBatchQuotes(symbols);
      }

      const quoteMap = {};
      quotes.forEach(q => { quoteMap[q.symbol] = q; });

      // Calculate totals
      let totalValue = 0;
      let totalCost = 0;

      const enrichedPositions = positions.map(pos => {
        const quote = quoteMap[pos.symbol];
        const currentPrice = quote ? quote.price : pos.buyPrice;
        const currentValue = currentPrice * pos.shares;
        const costBasis = pos.buyPrice * pos.shares;
        const gainLoss = currentValue - costBasis;
        const gainLossPct = (gainLoss / costBasis) * 100;
        
        totalValue += currentValue;
        totalCost += costBasis;

        return {
          ...pos,
          name: quote ? quote.name : 'N/A',
          currentPrice,
          currentValue,
          gainLoss,
          gainLossPct
        };
      });

      const totalGainLoss = totalValue - totalCost;
      const totalGainLossPct = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
      
      this.renderContent(enrichedPositions, totalValue, totalGainLoss, totalGainLossPct);

    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      document.getElementById('portfolio-content').innerHTML = `<p class="text-muted">Error al cargar datos del portafolio.</p>`;
    }
  },

  renderContent(positions, totalValue, totalGainLoss, totalGainLossPct) {
    const contentEl = document.getElementById('portfolio-content');
    if (!contentEl) return;

    const totalChangeClass = UI.getChangeClass(totalGainLoss);

    let html = `
      <div class="portfolio-summary">
        <div class="summary-card">
          <div class="summary-label">Valor Total</div>
          <div class="summary-value">${UI.formatCurrency(totalValue)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Ganancia / Pérdida</div>
          <div class="summary-value ${totalChangeClass}">
            ${UI.formatChangeText(totalGainLoss, totalGainLossPct)}
          </div>
        </div>
      </div>

      <div class="add-position-form" id="add-pos-form">
        <div class="form-group">
          <label>Ticker</label>
          <input type="text" id="pos-symbol" placeholder="Ej. AAPL" style="text-transform:uppercase">
        </div>
        <div class="form-group">
          <label>Acciones</label>
          <input type="number" id="pos-shares" min="0.01" step="0.01" placeholder="0">
        </div>
        <div class="form-group">
          <label>Precio Compra</label>
          <input type="number" id="pos-price" min="0.01" step="0.01" placeholder="0.00">
        </div>
        <button class="btn btn-gold" id="btn-add-pos">Agregar Posición</button>
      </div>
    `;

    if (positions.length === 0) {
      html += `
        <div class="empty-state" style="padding:2rem">
          <p>Tu portafolio está vacío. Agrega posiciones arriba.</p>
        </div>
      `;
    } else {
      html += `
        <div class="portfolio-table-wrapper">
          <table class="portfolio-table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Acciones</th>
                <th>Precio Compra</th>
                <th>Precio Actual</th>
                <th>Valor Total</th>
                <th>G/P ($)</th>
                <th>G/P (%)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${positions.map(pos => {
                const changeClass = UI.getChangeClass(pos.gainLoss);
                return `
                  <tr>
                    <td class="ticker-cell" data-symbol="${pos.symbol}">${pos.symbol}</td>
                    <td>${pos.shares.toFixed(2)}</td>
                    <td>${UI.formatCurrency(pos.buyPrice)}</td>
                    <td>${UI.formatCurrency(pos.currentPrice)}</td>
                    <td>${UI.formatCurrency(pos.currentValue)}</td>
                    <td class="${changeClass}">${UI.formatCurrency(pos.gainLoss)}</td>
                    <td class="${changeClass}">${pos.gainLossPct.toFixed(2)}%</td>
                    <td>
                      <button class="btn-icon remove-pos" data-id="${pos.id}" title="Eliminar">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    contentEl.innerHTML = html;

    // Event Listeners
    document.getElementById('btn-add-pos').addEventListener('click', () => {
      const symbol = document.getElementById('pos-symbol').value.trim().toUpperCase();
      const shares = parseFloat(document.getElementById('pos-shares').value);
      const buyPrice = parseFloat(document.getElementById('pos-price').value);

      if (!symbol || isNaN(shares) || isNaN(buyPrice) || shares <= 0 || buyPrice <= 0) {
        UI.showToast('Por favor completa todos los campos correctamente', 'error');
        return;
      }

      Storage.addPosition({ symbol, shares, buyPrice });
      UI.showToast(`Posición añadida: ${symbol}`);
      this.render(); // Re-render
    });

    document.querySelectorAll('.remove-pos').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        Storage.removePosition(id);
        UI.showToast('Posición eliminada');
        this.render();
      });
    });

    document.querySelectorAll('.ticker-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const symbol = e.currentTarget.dataset.symbol;
        if (this.onSelectCallback) this.onSelectCallback(symbol);
      });
    });
  }
};

export default Portfolio;
