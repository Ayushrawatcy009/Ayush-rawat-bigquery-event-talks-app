/* ── DOM refs ─────────────────────────────────────────────────── */
const refreshBtn   = document.getElementById('refreshBtn');
const refreshIcon  = document.getElementById('refreshIcon');
const spinnerIcon  = document.getElementById('spinnerIcon');
const refreshLabel = document.getElementById('refreshLabel');
const statusText   = document.getElementById('statusText');
const countBadge   = document.getElementById('countBadge');
const errorBanner  = document.getElementById('errorBanner');
const errorMsg     = document.getElementById('errorMsg');
const feed         = document.getElementById('feed');

const tweetModal   = document.getElementById('tweetModal');
const tweetText    = document.getElementById('tweetText');
const charCount    = document.getElementById('charCount');
const tweetLink    = document.getElementById('tweetLink');
const modalClose   = document.getElementById('modalClose');
const modalCancel  = document.getElementById('modalCancel');

/* ── Helpers ──────────────────────────────────────────────────── */
function formatDate(isoStr) {
  if (!isoStr) return '';
  try {
    return new Date(isoStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch { return isoStr; }
}

function truncate(str, max) {
  if (!str) return '';
  return str.length <= max ? str : str.slice(0, max - 1) + '…';
}

function setLoading(on) {
  refreshBtn.disabled = on;
  refreshIcon.classList.toggle('hidden', on);
  spinnerIcon.classList.toggle('hidden', !on);
  refreshLabel.textContent = on ? 'Refreshing…' : 'Refresh';
}

function showError(msg) {
  errorBanner.classList.remove('hidden');
  errorMsg.textContent = msg;
}

function hideError() {
  errorBanner.classList.add('hidden');
  errorMsg.textContent = '';
}

/* ── Skeleton loaders ─────────────────────────────────────────── */
function renderSkeletons(count = 5) {
  feed.innerHTML = Array.from({ length: count }, () => `
    <div class="skeleton-card">
      <div class="sk-line sk-date"></div>
      <div class="sk-line sk-title"></div>
      <div class="sk-line sk-body1"></div>
      <div class="sk-line sk-body2"></div>
    </div>
  `).join('');
}

/* ── Card rendering ───────────────────────────────────────────── */
function renderCards(entries) {
  if (!entries.length) {
    feed.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:40px 0;">No release notes found.</p>`;
    return;
  }

  feed.innerHTML = entries.map((e, i) => {
    const date = formatDate(e.updated);
    const title = e.title || 'Untitled Update';
    const summary = e.summary || '';

    return `
    <article class="card" data-index="${i}" aria-label="${title}">
      <div class="card-meta">
        <span class="card-date">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          ${date}
        </span>
        <div class="card-actions">
          <button class="btn-tweet-card" data-index="${i}" aria-label="Tweet about this update">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Share
          </button>
        </div>
      </div>
      <h2 class="card-title">
        ${e.link && e.link !== '#'
          ? `<a href="${e.link}" target="_blank" rel="noopener noreferrer">${title}</a>`
          : title}
      </h2>
      ${summary ? `<p class="card-summary">${summary}</p>` : ''}
    </article>
  `;
  }).join('');

  // Attach tweet buttons
  document.querySelectorAll('.btn-tweet-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index, 10);
      openTweetModal(entries[idx]);
    });
  });
}

/* ── Fetch release notes ──────────────────────────────────────── */
async function loadReleaseNotes() {
  hideError();
  setLoading(true);
  renderSkeletons(6);
  statusText.textContent = 'Fetching latest release notes…';
  countBadge.classList.add('hidden');

  try {
    const res = await fetch('/api/release-notes');
    const data = await res.json();

    if (!data.ok) throw new Error(data.error || 'Unknown error');

    renderCards(data.entries);
    statusText.textContent = `Last refreshed at ${new Date().toLocaleTimeString()}`;
    countBadge.textContent = `${data.entries.length} entries`;
    countBadge.classList.remove('hidden');
  } catch (err) {
    feed.innerHTML = '';
    showError(`Failed to load release notes: ${err.message}`);
    statusText.textContent = 'Could not load entries.';
  } finally {
    setLoading(false);
  }
}

/* ── Tweet modal ──────────────────────────────────────────────── */
function buildDefaultTweet(entry) {
  const title = entry.title || 'BigQuery Update';
  const link  = entry.link || 'https://cloud.google.com/bigquery/docs/release-notes';
  const base  = `📢 ${title}\n\n${link}\n\n#BigQuery #GoogleCloud`;
  return truncate(base, 280);
}

function openTweetModal(entry) {
  const draft = buildDefaultTweet(entry);
  tweetText.value = draft;
  updateCharCount();
  updateTweetLink();
  tweetModal.classList.remove('hidden');
  tweetText.focus();
}

function closeTweetModal() {
  tweetModal.classList.add('hidden');
}

function updateCharCount() {
  const len = tweetText.value.length;
  charCount.textContent = `${len} / 280`;
  charCount.classList.toggle('warn', len > 240 && len <= 280);
  charCount.classList.toggle('over', len > 280);
}

function updateTweetLink() {
  const text = encodeURIComponent(tweetText.value);
  tweetLink.href = `https://twitter.com/intent/tweet?text=${text}`;
}

tweetText.addEventListener('input', () => {
  updateCharCount();
  updateTweetLink();
});

modalClose.addEventListener('click', closeTweetModal);
modalCancel.addEventListener('click', closeTweetModal);

tweetModal.addEventListener('click', e => {
  if (e.target === tweetModal) closeTweetModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeTweetModal();
});

/* ── Refresh button ───────────────────────────────────────────── */
refreshBtn.addEventListener('click', loadReleaseNotes);

/* ── Initial load ─────────────────────────────────────────────── */
loadReleaseNotes();
