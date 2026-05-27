// stock.js — Stock detail and fundamental metrics

import ApiService from './api.js';
import UI from './ui.js';
import Storage from './storage.js';

const StockDetail = {
  containerId: 'stock-detail-view',
  currentSymbol: null,
  chartInstance: null,

  async render(symbol) {
    this.currentSymbol = symbol;
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Show view
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    container.classList.add('active');

    // Loading state
    container.innerHTML = `
      <div id="stock-hero" class="stock-hero">
        <div class="skeleton" style="width: 300px; height: 120px;"></div>
      </div>
      <div class="chart-container">
        <div class="skeleton" style="width: 100%; height: 100%;"></div>
      </div>
      <h3 class="section-title">Análisis Fundamental</h3>
      <div id="metrics-grid" class="metrics-grid">
        ${Array(8).fill('<div class="metric-card"><div class="skeleton" style="width: 100%; height: 80px;"></div></div>').join('')}
      </div>
    `;

    try {
      // Fetch data in parallel
      const [quote, profile, metrics, ratios, history] = await Promise.all([
        ApiService.getQuote(symbol),
        ApiService.getProfile(symbol),
        ApiService.getKeyMetrics(symbol),
        ApiService.getFinancialRatios(symbol),
        ApiService.getHistoricalPrice(symbol)
      ]);

      if (!quote) {
        throw new Error('Stock not found');
      }

      this.renderHero(quote, profile);
      this.renderChart(history);
      this.renderMetrics(quote, metrics, ratios);

    } catch (error) {
      console.error('Error loading stock details:', error);
      container.innerHTML = `
        <div class="empty-state">
          <p>No se pudo cargar la información para ${symbol}. Verifica tu conexión o el límite de la API.</p>
          <button class="btn btn-outline" onclick="window.location.reload()" style="margin-top:1rem">Intentar de nuevo</button>
        </div>
      `;
    }
  },

  renderHero(quote, profile) {
    const heroEl = document.getElementById('stock-hero');
    if (!heroEl) return;

    const changeClass = UI.getChangeClass(quote.change);
    const isFav = Storage.isFavorite(this.currentSymbol);

    heroEl.innerHTML = `
      <div class="stock-info">
        <div class="stock-ticker">${quote.symbol}</div>
        <h1 class="stock-name">${quote.name}</h1>
        <div>
          <span class="stock-price">${quote.price.toFixed(2)}</span>
          <span class="stock-change ${changeClass}">${UI.formatChangeText(quote.change, quote.changePercentage)}</span>
        </div>
        <div class="stock-meta">
          <span>Volumen: ${UI.formatLargeNumber(quote.volume)}</span>
          <span>Market Cap: ${UI.formatLargeNumber(quote.marketCap)}</span>
          ${profile ? `<span>Sector: ${profile.sector || 'N/A'}</span>` : ''}
          ${profile ? `<span>Industria: ${profile.industry || 'N/A'}</span>` : ''}
        </div>
      </div>
      <div class="stock-actions">
        <button id="btn-toggle-fav" class="btn-icon ${isFav ? 'active' : ''}" title="Guardar en Favoritos">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        </button>
      </div>
    `;

    document.getElementById('btn-toggle-fav').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      if (Storage.isFavorite(this.currentSymbol)) {
        Storage.removeFavorite(this.currentSymbol);
        btn.classList.remove('active');
        btn.querySelector('svg').setAttribute('fill', 'none');
        UI.showToast(`${this.currentSymbol} eliminado de favoritos`);
      } else {
        Storage.addFavorite(this.currentSymbol);
        btn.classList.add('active');
        btn.querySelector('svg').setAttribute('fill', 'currentColor');
        UI.showToast(`${this.currentSymbol} agregado a favoritos`, 'success');
      }
    });
  },

  renderChart(history) {
    if (!history || history.length === 0) return;
    
    // Sort chronological for Chart.js
    const sortedData = history.slice(0, 90).reverse();
    const labels = sortedData.map(d => d.date);
    const data = sortedData.map(d => d.close);
    
    // Determine color based on trend
    const firstPrice = data[0];
    const lastPrice = data[data.length - 1];
    const isPositive = lastPrice >= firstPrice;
    const color = isPositive ? '#00c853' : '#ff1744';

    const ctx = document.createElement('canvas');
    const container = document.querySelector('.chart-container');
    container.innerHTML = '';
    container.appendChild(ctx);

    // Destroy previous chart if exists
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    // Check if Chart is available globally
    if (window.Chart) {
      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Precio de Cierre',
            data: data,
            borderColor: color,
            backgroundColor: (context) => {
              const gradient = context.chart.ctx.createLinearGradient(0, 0, 0, container.offsetHeight);
              gradient.addColorStop(0, `${color}40`); // 25% opacity
              gradient.addColorStop(1, `${color}00`); // 0% opacity
              return gradient;
            },
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            fill: true,
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(18, 18, 28, 0.9)',
              titleColor: '#f0ece2',
              bodyColor: '#d4af37',
              borderColor: 'rgba(212, 175, 55, 0.35)',
              borderWidth: 1
            }
          },
          scales: {
            x: { display: false },
            y: {
              display: true,
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#9a9a9a' }
            }
          },
          interaction: { mode: 'nearest', axis: 'x', intersect: false }
        }
      });
    } else {
      container.innerHTML = '<p class="text-muted">Chart.js no está cargado.</p>';
    }
  },

  renderMetrics(quote, metricsObj, ratiosObj) {
    const gridEl = document.getElementById('metrics-grid');
    if (!gridEl) return;

    // Use empty objects as fallback
    const metrics = metricsObj || {};
    const ratios = ratiosObj || {};

    const configs = [
      {
        id: 'pe', label: 'P/E Ratio', value: quote.pe || ratios.priceToEarningsRatio || ratios.priceEarningsRatio,
        format: 'number', desc: 'Precio / Beneficio. Cuánto pagas por cada dólar de ganancia.',
        rules: { cheap: [null, 15], fair: [15, 25], expensive: [25, null] }
      },
      {
        id: 'pb', label: 'P/B Ratio', value: ratios.priceToBookRatio,
        format: 'number', desc: 'Precio / Valor en Libros. Menor a 1 puede indicar subvaluación.',
        rules: { cheap: [null, 1.5], fair: [1.5, 3], expensive: [3, null] }
      },
      {
        id: 'ps', label: 'P/S Ratio', value: ratios.priceToSalesRatio,
        format: 'number', desc: 'Precio / Ventas. Útil para empresas que aún no tienen ganancias.',
        rules: { cheap: [null, 2], fair: [2, 5], expensive: [5, null] }
      },
      {
        id: 'ev_ebitda', label: 'EV / EBITDA', value: metrics.evToEBITDA || metrics.enterpriseValueOverEBITDA,
        format: 'number', desc: 'Mide el valor de la empresa frente a su flujo operativo. Menor es mejor.',
        rules: { cheap: [null, 10], fair: [10, 15], expensive: [15, null] }
      },
      {
        id: 'peg', label: 'PEG Ratio', value: ratios.priceToEarningsGrowthRatio || ratios.priceEarningsToGrowthRatio,
        format: 'number', desc: 'P/E ajustado por crecimiento. <1 se considera barato.',
        rules: { cheap: [null, 1], fair: [1, 2], expensive: [2, null] }
      },
      {
        id: 'debt_equity', label: 'Debt / Equity', value: ratios.debtToEquityRatio || ratios.debtEquityRatio,
        format: 'number', desc: 'Deuda sobre Capital. Nivel de apalancamiento.',
        rules: { cheap: [null, 0.5], fair: [0.5, 1.5], expensive: [1.5, null] }
      },
      {
        id: 'current_ratio', label: 'Current Ratio', value: ratios.currentRatio,
        format: 'number', desc: 'Liquidez a corto plazo. Activos corrientes / Pasivos corrientes.',
        rules: { expensive: [null, 1], fair: [1, 2], cheap: [2, null] } // Reversed logic (higher is better)
      },
      {
        id: 'roe', label: 'ROE', value: ratios.returnOnEquity,
        format: 'percent', desc: 'Retorno sobre el Capital. Eficiencia en generar ganancias.',
        rules: { expensive: [null, 0.1], fair: [0.1, 0.2], cheap: [0.2, null] }
      },
      {
        id: 'roa', label: 'ROA', value: ratios.returnOnAssets,
        format: 'percent', desc: 'Retorno sobre Activos. Eficiencia de los activos.',
        rules: { expensive: [null, 0.05], fair: [0.05, 0.1], cheap: [0.1, null] }
      },
      {
        id: 'net_margin', label: 'Net Margin', value: ratios.netProfitMargin,
        format: 'percent', desc: 'Margen Neto. Porcentaje de ingresos que se convierte en ganancia.',
        rules: { expensive: [null, 0.1], fair: [0.1, 0.2], cheap: [0.2, null] }
      },
      {
        id: 'div_yield', label: 'Dividend Yield', value: ratios.dividendYield,
        format: 'percent', desc: 'Rendimiento por dividendos anual.',
        rules: { expensive: [null, 0.02], fair: [0.02, 0.04], cheap: [0.04, null] }
      }
    ];

    let html = '';
    configs.forEach(cfg => {
      let status = 'neutral';
      let valDisplay = 'N/A';
      let percentFill = 0;

      if (cfg.value !== null && cfg.value !== undefined) {
        valDisplay = cfg.format === 'percent' ? UI.formatPercent(cfg.value) : cfg.value.toFixed(2);
        
        const v = cfg.value;
        const r = cfg.rules;
        
        // Evaluate rules
        if (r.cheap[0] === null && v <= r.cheap[1] || v >= r.cheap[0] && r.cheap[1] === null || v >= r.cheap[0] && v <= r.cheap[1]) {
          status = 'cheap'; percentFill = 20; // Lower third
          if(cfg.id === 'roe' || cfg.id === 'roa' || cfg.id === 'net_margin' || cfg.id === 'current_ratio' || cfg.id === 'div_yield') percentFill = 80;
        } else if (r.fair[0] !== null && v >= r.fair[0] && v <= r.fair[1]) {
          status = 'fair'; percentFill = 50;
        } else {
          status = 'expensive'; percentFill = 80;
          if(cfg.id === 'roe' || cfg.id === 'roa' || cfg.id === 'net_margin' || cfg.id === 'current_ratio' || cfg.id === 'div_yield') percentFill = 20;
        }
        
        // Ensure some bar shows
        if (percentFill < 5) percentFill = 5;
      }

      html += `
        <div class="metric-card ${status}">
          <div class="metric-label">
            ${cfg.label}
            <div class="tooltip-wrapper">
              <svg class="tooltip-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
              <div class="tooltip-text">${cfg.desc}</div>
            </div>
          </div>
          <div class="metric-value">${valDisplay}</div>
          ${status !== 'neutral' ? `
            <div class="metric-bar">
              <div class="metric-bar-fill ${status}" style="width: ${percentFill}%"></div>
            </div>
            <div class="metric-ref">
              <span class="metric-badge badge-${status}">
                ${status === 'cheap' ? '🟢 Barato/Bueno' : status === 'fair' ? '🟡 Justo' : '🔴 Caro/Malo'}
              </span>
            </div>
          ` : ''}
        </div>
      `;
    });

    gridEl.innerHTML = html;
  }
};

export default StockDetail;
