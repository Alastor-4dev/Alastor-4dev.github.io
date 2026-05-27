// ui.js — Shared UI components and helpers

const UI = {
  // Format currency
  formatCurrency(value) {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  },

  // Format large numbers (M, B, T)
  formatLargeNumber(num) {
    if (num === null || num === undefined) return 'N/A';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    return num.toLocaleString();
  },

  // Format percentage
  formatPercent(value) {
    if (value === null || value === undefined) return 'N/A';
    // If value is already in percentage format (e.g., from ratio endpoint)
    // Sometimes APIs return 0.05 for 5%, sometimes 5 for 5%. We'll assume the raw data needs * 100 if it's < 1 and not meant to be a raw ratio.
    // For standard percentages we'll just format it
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  },

  // Create a toast notification
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `
      <span>${icon}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // Update change color class (positive/negative)
  getChangeClass(value) {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return '';
  },

  // Format change text with sign
  formatChangeText(change, changePercent) {
    const sign = change >= 0 ? '+' : '';
    const formattedChange = this.formatCurrency(Math.abs(change));
    const formattedPercent = Math.abs(changePercent).toFixed(2);
    return `${sign}${formattedChange} (${sign}${formattedPercent}%)`;
  },

  // Show/hide loading skeleton
  setLoading(elementId, isLoading) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    if (isLoading) {
      el.innerHTML = '<div class="spinner"></div>';
    } else {
      el.innerHTML = '';
    }
  }
};

export default UI;
