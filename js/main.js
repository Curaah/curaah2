// ═══════════════════════════════════════════════════════════════
// CURAAH 2.0 — SHARED UTILITIES
// Toast notifications, validators, formatters, consent helpers
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────
// TOAST NOTIFICATIONS
// ─────────────────────────────────────────────

(function initToastContainer() {
  if (document.getElementById('toastContainer')) return;
  const container = document.createElement('div');
  container.id = 'toastContainer';
  document.body.appendChild(container);
})();

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 * @param {number} duration ms
 */
window.showToast = function (message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: '✅', error: '⚠️', info: 'ℹ️' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || icons.info}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 280);
  }, duration);
};

// ─────────────────────────────────────────────
// VALIDATORS
// ─────────────────────────────────────────────

window.isValidPhone = function (phone) {
  return /^[6-9]\d{9}$/.test((phone || '').trim());
};

window.isValidEmail = function (email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
};

window.isValidPassword = function (password) {
  return (password || '').length >= 6;
};

// ─────────────────────────────────────────────
// DATE / TIME HELPERS
// ─────────────────────────────────────────────

/**
 * Today's date in local timezone as YYYY-MM-DD.
 * (Uses local time, not UTC — avoids the date-shift bug class.)
 */
window.getTodayLocal = function () {
  return new Date().toLocaleDateString('en-CA');
};

window.formatDateReadable = function (dateStr) {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

window.formatTimeAgo = function (timestamp) {
  if (!timestamp) return '—';
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

window.greetingForHour = function () {
  const hour = new Date().getHours();
  if (hour < 12) return { en: 'Good morning', hi: 'सुप्रभात', pa: 'ਸ਼ੁਭ ਸਵੇਰ' };
  if (hour < 17) return { en: 'Good afternoon', hi: 'नमस्कार', pa: 'ਸ਼ੁਭ ਦੁਪਹਿਰ' };
  return { en: 'Good evening', hi: 'शुभ संध्या', pa: 'ਸ਼ੁਭ ਸ਼ਾਮ' };
};

// ─────────────────────────────────────────────
// LANGUAGE HELPERS
// ─────────────────────────────────────────────

/**
 * Get the user's preferred language from localStorage cache
 * (set during onboarding, synced from users.preferred_language).
 * Falls back to 'hindi'.
 */
window.getPreferredLanguage = function () {
  return localStorage.getItem('curaah_lang') || 'hindi';
};

window.setPreferredLanguage = function (lang) {
  localStorage.setItem('curaah_lang', lang);
};

// ─────────────────────────────────────────────
// AI DISCLAIMER (DPDP / compliance helper)
// ─────────────────────────────────────────────

const AI_DISCLAIMERS = {
  english: 'This is not medical advice. Always consult your doctor for medical decisions.',
  hindi:   'यह चिकित्सा सलाह नहीं है। सभी स्वास्थ्य निर्णयों के लिए अपने डॉक्टर से परामर्श करें।',
  punjabi: 'ਇਹ ਡਾਕਟਰੀ ਸਲਾਹ ਨਹੀਂ ਹੈ। ਸਾਰੇ ਸਿਹਤ ਫੈਸਲਿਆਂ ਲਈ ਆਪਣੇ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।',
};

/**
 * Returns an HTML snippet for the AI disclaimer in the given language.
 * Use this under every AI-generated response anywhere in the app.
 */
window.renderAiDisclaimer = function (lang) {
  const text = AI_DISCLAIMERS[lang] || AI_DISCLAIMERS.hindi;
  return `<div class="ai-disclaimer"><span class="ai-disclaimer-icon">⚕️</span><span>${text}</span></div>`;
};

// ─────────────────────────────────────────────
// SCORE COLOR HELPER (Recovery Score visuals)
// ─────────────────────────────────────────────

window.scoreColor = function (score) {
  if (score >= 75) return '#00c48c'; // success
  if (score >= 50) return '#3d9eff'; // electric
  if (score >= 30) return '#ff9f00'; // warning
  return '#ff4757'; // danger
};

window.scoreLabel = function (score) {
  if (score >= 75) return 'Excellent';
  if (score >= 50) return 'Good';
  if (score >= 30) return 'Needs Attention';
  return 'At Risk';
};

// ─────────────────────────────────────────────
// SIDEBAR / MOBILE NAV TOGGLE (used across dashboard pages)
// ─────────────────────────────────────────────

window.toggleSidebar = function () {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('open');
};

// ─────────────────────────────────────────────
// SMALL HELPER — initials from a name
// ─────────────────────────────────────────────

window.getInitials = function (name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(p => p[0]).join('').toUpperCase().slice(0, 2);
};

// ─────────────────────────────────────────────
// SMALL HELPER — debounce (for search inputs etc.)
// ─────────────────────────────────────────────

window.debounce = function (fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};
