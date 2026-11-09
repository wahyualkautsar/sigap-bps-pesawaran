# PANDUAN INSTALASI — SIGAP v2 (GAS API + GitHub Pages)

Arsitektur baru: **Google Apps Script = backend JSON**, **GitHub Pages = tampilan**.
Link/QR yang dibagikan ke pegawai nanti adalah link GitHub Pages, bukan link script.google.com.

---

## BAGIAN 1 — BACKEND (Apps Script)

1. Buka project SIGAP yang lama di https://script.google.com (yang ada file `Kode.gs`).
2. Klik `Kode.gs` → **Ctrl+A** → hapus → paste isi **Kode.gs yang baru** → **Ctrl+S**.
3. File `Index`, `Stylesheet`, `JavaScript` sudah tidak dipakai. Boleh dihapus (opsional).
4. **Tidak perlu** menjalankan `setupAppEnvironment()` lagi. Spreadsheet & data lama otomatis terbaca.
   (Fungsi itu hanya untuk project baru yang kosong, dan otomatis berhenti kalau sudah pernah setup.)
5. **Deploy → Kelola deployment** → klik ikon **pensil**:
   - Versi: **Versi baru**
   - Jalankan sebagai: **Saya**
   - Yang memiliki akses: **Siapa saja**
   - Klik **Deploy** (tombol biru). URL `/exec` tetap sama.
6. **Tes backend** — buka di browser (PC atau HP):
   `URL-EXEC-ANDA?action=getInit`
   Harus muncul teks JSON diawali `{"success":true,"data":{"barang":[...`
   Kalau muncul itu → backend siap.

## BAGIAN 2 — FRONTEND (GitHub Pages)

Folder kerja = folder hasil ekstrak ZIP: **`sigap-bps-pesawaran`** (yang di dalamnya langsung ada `index.html`).

1. Ekstrak ZIP. Buka `js/config.js`, pastikan `GAS_URL` berisi URL `/exec` Anda.
2. Install Git (https://git-scm.com/download/win), lalu cek: `git --version`
3. Buat akun & repository di GitHub: nama `sigap-bps-pesawaran`, **Public**, jangan centang README/.gitignore/license.
4. Buka PowerShell di folder `sigap-bps-pesawaran` (File Explorer → klik address bar → ketik `powershell` → Enter).
5. Pastikan `dir` menampilkan `index.html`, `css`, `js`.
6. Jalankan satu per satu:
   ```
   git init
   git add .
   git commit -m "Upload pertama"
   git branch -M main
   git remote add origin https://github.com/USERNAME/sigap-bps-pesawaran.git
   git push -u origin main
   ```
   Saat diminta password, pakai **Personal Access Token** (https://github.com/settings/tokens → classic → centang `repo`).
   Layar kosong saat paste token itu normal.
7. Di GitHub: **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → Save. Centang **Enforce HTTPS**.
8. Tunggu 1–2 menit → situs live di `https://USERNAME.github.io/sigap-bps-pesawaran/`

## UPDATE KE DEPAN
```
git add .
git commit -m "Deskripsi perubahan"
git push
```
Kalau tampilan belum berubah: Ctrl+Shift+R.

## Kalau ada masalah
| Gejala | Penyebab / solusi |
|---|---|
| Layar merah "Gagal memuat data" | Akses deployment belum "Siapa saja", atau `GAS_URL` salah |
| Dropdown barang kosong | Sheet `Master Barang` kosong. Cek spreadsheet |
| Ubah Kode.gs tapi tidak berefek | Harus Deploy → Versi baru |
| Mau tambah/ubah Seksi | Edit `SEKSI` di Kode.gs → deploy versi baru |
| Mau tambah barang | Tambah baris di sheet `Master Barang` (tunggu ±10 menit atau deploy ulang) |
