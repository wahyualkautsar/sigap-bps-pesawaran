// ============================================
// API HELPER — komunikasi ke Google Apps Script
// ============================================
const API_TIMEOUT_MS = 30000;

async function apiRequest(url, options) {
  if (!GAS_URL || GAS_URL.indexOf('XXXX') !== -1) {
    throw new Error('GAS_URL belum diisi. Edit file js/config.js.');
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), API_TIMEOUT_MS);

  try {
    const res = await fetch(url, Object.assign({}, options, { signal: ctrl.signal }));
    const text = await res.text();

    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      throw new Error('Server tidak mengembalikan data yang valid. Pastikan deployment Apps Script diset akses "Siapa saja" dan URL di js/config.js benar.');
    }
    if (!json.success) throw new Error(json.message || 'Permintaan gagal.');
    return json;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Koneksi terlalu lama (timeout). Coba lagi.');
    if (err instanceof TypeError) throw new Error('Tidak bisa terhubung ke server. Cek koneksi internet atau URL Apps Script.');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// GET → kembalikan field "data"
async function apiGet(action) {
  const json = await apiRequest(GAS_URL + '?action=' + encodeURIComponent(action));
  return json.data;
}

// POST → kembalikan seluruh respons (butuh "message")
async function apiPost(action, data) {
  return apiRequest(GAS_URL, {
    method: 'POST',
    // WAJIB text/plain agar tidak memicu CORS preflight yang diblok GAS
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: action, data: data })
  });
}
