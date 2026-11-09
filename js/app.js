// ============================================
// SIGAP — Logika Aplikasi (frontend)
// ============================================
let masterBarang = [];
let riwayatData = [];

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  document.getElementById('tanggalAmbil').value = todayLocal();
  document.getElementById('riwayatSearch').addEventListener('input', renderRiwayat);
  loadInit();
});

// Tanggal hari ini sesuai jam HP/PC (bukan UTC, supaya tidak mundur sehari)
function todayLocal() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function escapeHtml(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ---------- OVERLAY LOADING / ERROR ----------
function showOverlay(mode, msg) {
  const ov = document.getElementById('loadingOverlay');
  ov.classList.remove('hide');
  document.getElementById('overlayLoading').style.display = mode === 'loading' ? 'block' : 'none';
  document.getElementById('overlayError').style.display = mode === 'error' ? 'block' : 'none';
  if (msg) document.getElementById('overlayErrMsg').textContent = msg;
}
function hideOverlay() {
  document.getElementById('loadingOverlay').classList.add('hide');
}

async function loadInit() {
  showOverlay('loading');
  try {
    const data = await apiGet('getInit');
    masterBarang = data.barang || [];
    fillSeksi(data.seksi || []);
    document.getElementById('itemRows').innerHTML = '';
    tambahBarisBarang();
    hideOverlay();
  } catch (err) {
    showOverlay('error', err.message);
  }
}

function fillSeksi(list) {
  const sel = document.getElementById('namaPengambil');
  sel.innerHTML = '<option value="">-- Pilih Seksi --</option>' +
    list.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
}

// ---------- NAVIGASI ----------
function navigateTo(section) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('section-' + section).classList.add('active');
  document.querySelector(`.tab-btn[data-tab="${section}"]`).classList.add('active');
  if (section === 'riwayat') loadRiwayat();
}

// ---------- DARK MODE ----------
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('themeIcon').className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
}
function initDarkMode() {
  let saved = 'light';
  try { saved = localStorage.getItem('sigap-theme') || 'light'; } catch (e) {}
  applyTheme(saved);
}
function toggleDarkMode() {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem('sigap-theme', next); } catch (e) {}
}

// ---------- BARIS BARANG DINAMIS ----------
function tambahBarisBarang() {
  const clone = document.getElementById('itemRowTemplate').content.cloneNode(true);
  clone.querySelector('.item-select').innerHTML =
    '<option value="">-- Pilih Barang --</option>' +
    masterBarang.map(b => `<option value="${escapeHtml(b.kode)}">${escapeHtml(b.nama)}</option>`).join('');
  document.getElementById('itemRows').appendChild(clone);
  updateRemoveButtons();
}

function hapusBarisBarang(btn) {
  btn.closest('.item-row').remove();
  updateRemoveButtons();
}

function updateRemoveButtons() {
  const rows = document.querySelectorAll('#itemRows .item-row');
  rows.forEach(row => {
    row.querySelector('.btn-remove').style.display = rows.length > 1 ? 'block' : 'none';
  });
}

// ---------- SUBMIT ----------
async function submitForm() {
  const seksi = document.getElementById('namaPengambil').value.trim();
  const tanggal = document.getElementById('tanggalAmbil').value;

  if (!seksi) return showToast('Peringatan', 'Seksi yang mengambil wajib dipilih.', 'warning');
  if (!tanggal) return showToast('Peringatan', 'Tanggal pengambilan wajib diisi.', 'warning');

  const items = [];
  const seen = new Set();
  let valid = true;
  let duplikat = '';

  document.querySelectorAll('#itemRows .item-row').forEach(row => {
    const sel = row.querySelector('.item-select');
    const kode = sel.value;
    const jumlah = parseInt(row.querySelector('.item-jumlah').value, 10);

    if (!kode || !jumlah || jumlah <= 0) { valid = false; return; }
    if (seen.has(kode)) duplikat = sel.selectedOptions[0].textContent;
    seen.add(kode);
    items.push({ kode, jumlah });
  });

  if (!valid || items.length === 0) {
    return showToast('Peringatan', 'Pastikan setiap baris barang sudah dipilih dan jumlahnya diisi (lebih dari 0).', 'warning');
  }
  if (duplikat) {
    return showToast('Peringatan', `Barang "${duplikat}" dipilih lebih dari satu kali. Gabungkan jumlahnya dalam satu baris.`, 'warning');
  }

  const btn = document.getElementById('btnSubmit');
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Menyimpan...';

  try {
    const res = await apiPost('submitPengambilan', { seksi, tanggal, items });
    showToast('Berhasil', res.message, 'success');
    resetForm();
  } catch (err) {
    showToast('Gagal', err.message, 'danger');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

function resetForm() {
  document.getElementById('namaPengambil').value = '';
  document.getElementById('tanggalAmbil').value = todayLocal();
  document.getElementById('itemRows').innerHTML = '';
  tambahBarisBarang();
}

// ---------- RIWAYAT ----------
async function loadRiwayat() {
  const tbody = document.getElementById('riwayatBody');
  tbody.innerHTML = '<tr><td colspan="5" class="text-center empty-hint py-4"><span class="spinner-border spinner-border-sm"></span> Memuat data...</td></tr>';
  try {
    riwayatData = await apiGet('getRiwayat');
    renderRiwayat();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">${escapeHtml(err.message)}</td></tr>`;
  }
}

function renderRiwayat() {
  const tbody = document.getElementById('riwayatBody');
  const q = document.getElementById('riwayatSearch').value.trim().toLowerCase();

  const list = q
    ? riwayatData.filter(r => [r.tanggal, r.seksi, r.barang].join(' ').toLowerCase().includes(q))
    : riwayatData;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center empty-hint py-4">${q ? 'Tidak ada data yang cocok.' : 'Belum ada riwayat pengambilan.'}</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(r => `
    <tr>
      <td>${escapeHtml(r.tanggal)}</td>
      <td>${escapeHtml(r.seksi)}</td>
      <td>${escapeHtml(r.barang)}</td>
      <td class="text-center"><span class="badge-jumlah">${escapeHtml(r.jumlah)} pcs</span></td>
      <td class="text-secondary">${escapeHtml(r.waktu)}</td>
    </tr>`).join('');
}

// ---------- TOAST ----------
function showToast(title, message, type) {
  const el = document.getElementById('appToast');
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastBody').textContent = message;
  el.className = 'toast';
  const colorMap = { success: 'text-bg-success', danger: 'text-bg-danger', warning: 'text-bg-warning' };
  if (colorMap[type]) el.classList.add(colorMap[type]);
  bootstrap.Toast.getOrCreateInstance(el, { delay: 3500 }).show();
}
