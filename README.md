# Aplikasi Kasir Online & Manajemen Toko (POS)

Sistem Kasir Online dan Manajemen Toko terintegrasi dengan Google Sheets (Google Apps Script Web App), manajemen stok, riwayat transaksi, dan cetak struk nota.

## Akun Login Bawaan:
- **Admin**: `admin` / `admin123`
- **Kasir**: `kasir` / `kasir123`

## Fitur Aplikasi yang Dikembangkan:
1. **Login & Manajemen Pengguna**:
   - Akun admin dan kasir dengan pembatasan hak akses menu.
   - Foto profil admin yang dapat diunggah dan diganti.
2. **Dashboard Finansial & Operasional**:
   - Penjualan Hari Ini, **Estimasi Laba Bersih**, Jumlah Transaksi / Produk Terjual, serta Peringatan Stok Menipis.
   - Riwayat Penjualan Terakhir & tabel stok menipis.
3. **Kasir / POS Cepat**:
   - Pencarian produk dan filter berdasarkan kategori.
   - **Dukungan Barcode Scanner** (scan atau tekan Enter untuk langsung menambahkan ke keranjang).
   - Input Nama Pelanggan / Nomor Meja (opsional).
   - **Metode Pembayaran**: Tunai, **QRIS (popup scan QR code)**, dan **Transfer Bank**.
   - **Tombol Uang Cepat (Quick Tender)**: Uang Pas, +10rb, +20rb, +50rb, +100rb.
   - **Efek Suara Audio Kasir**: Bunyi *beep* saat tambah/scan barang dan *chime* saat transaksi sukses.
   - **Shortcut Keyboard**: `F2` (Fokus scan/cari), `F4` (Bayar & cetak), `F8` (Kosongkan keranjang).
   - Simpan transaksi, cetak struk nota thermal, **kirim struk via WhatsApp**, dan **salin teks struk**.
4. **Produk & Stok**:
   - Tambah, edit, dan hapus produk lengkap dengan harga beli, harga jual, stok, upload foto produk, serta **kode Barcode / SKU**.
   - Filter status stok (Semua / Stok Menipis / Stok Habis) dan opsi pengurutan (Nama, Harga, Stok).
   - Penyesuaian stok Masuk / Keluar dengan catatan/keterangan, serta log riwayat perubahan stok.
5. **Kategori**:
   - Pengelolaan kategori produk.
6. **Riwayat & Arsip Transaksi (Reset Otomatis Harian)**:
   - **Reset Otomatis Harian**: Setiap kali hari berganti, sistem otomatis mereset riwayat transaksi kasir aktif dan memindahkannya ke **Arsip Rekap Per Hari** secara aman tanpa ada data yang hilang.
   - **Tutup Sesi / Arsip Manual**: Tombol "Arsipkan & Tutup Sesi Sekarang" untuk kasir yang ingin menutup sesi sebelum pergantian hari.
   - **Arsip Rekap Per Hari**:
     - Pengelompokan riwayat per tanggal lengkap dengan ringkasan Total Omzet, Estimasi Laba, Jumlah Transaksi, dan Total Item Terjual.
     - **Lihat Rincian Arsip**: Menampilkan modal lengkap transaksi pada tanggal yang dipilih.
     - **Download CSV Per Hari**: Unduh file `.csv` laporan penjualan khusus tanggal tersebut untuk pembukuan Excel.
     - **Hapus Arsip Per Hari**: Opsi menghapus arsip tanggal tertentu secara aman dengan dialog konfirmasi.
   - Pencarian nota transaksi berdasarkan nomor struk atau nama pelanggan, lihat detail barang belanjaan, cetak ulang struk, kirim ke WhatsApp, dan salin teks struk.
7. **Laporan & Analisis Laba**:
   - Filter periode fleksibel: Semua Waktu, Hari Ini, 7 Hari Terakhir, 30 Hari Terakhir.
   - Analisis lengkap: Total Omzet, **Estimasi Laba Bersih**, Rata-rata Nilai Belanja, dan Margin Keuntungan.
   - Daftar produk terlaris dan ekspor rekap CSV untuk Excel.
8. **Pengaturan & Cadangan Data**:
   - Nama toko, alamat, telepon, rekening transfer, pesan footer struk, toggle suara audio kasir.
   - Pilihan tema warna tampilan (Hijau, Biru, Ungu, Oranye, Merah Muda, Abu-abu).
   - **Backup & Restore Lengkap**: Cadangkan seluruh data ke file `.json` dan pulihkan kapan saja.
   - Sinkronisasi cloud Google Sheets (Google Apps Script Web App) otomatis dan manual.
9. **Antarmuka Modern (Bottom Dock & Animasi Halus)**:
   - **Floating Bottom Navigation Dock**: Menu navigasi modern di bagian bawah dengan efek glassmorphism (backdrop blur), shadow halus, serta micro-interaction (*bounce & active scaling*).
   - **Badge Notifikasi Realtime**: Indikator jumlah barang dalam keranjang pada tab Kasir dan indikator peringatan stok menipis pada tab Stok.
   - **Transisi Antar Modul (Mobile-Grade Fade-Slide)**: Efek perpindahan halaman ultra-halus dengan kurva fisika `cubic-bezier(0.16, 1, 0.3, 1)`, akselerasi GPU 3D transform (`translate3d`), pencegahan reflow, serta auto scroll-to-top untuk pengalaman bernavigasi seperti aplikasi mobile iOS / Android kelas premium.
   - **Dock Spring Haptic Interaction**: Animasi micro-interaction pegas dinamis (*spring feedback*) pada item tab dock navigasi yang aktif.
   - **Header Ringkas & Elegan**: Menampilkan status sinkronisasi Google Sheets, jam waktu nyata, profil kasir/admin, dan tombol logout yang rapi.
10. **Otomatisasi Kompresi Foto**:
    - **Kompresi Cerdas Bertingkat**: Otomatis mengompresi foto produk dan foto profil yang diunggah pengguna ke format ultra-ringan (<50 KB untuk produk, <35 KB untuk avatar).
    - **Penghematan Ruang & Bandwidth**: Menjaga ketajaman visual dengan algoritma penyesuaian dimensi dan kualitas adaptif, menghemat kapasitas hingga 90-98%.
    - **Indikator & Visual Feedback**: Menampilkan animasi pemrosesan saat kompresi berlangsung serta kartu informasi persentase penghematan ukuran file (`Ukuran Awal → Ukuran Terkompresi`).
    - **Dukungan Drag & Drop**: Pengguna dapat langsung menyeret file gambar atau memilih dari galeri perangkat dengan mudah.
11. **Laporan CSV / Excel Profesional & Rapi**:
    - **Struktur Standar Akuntansi & Pelaporan**: Dilengkapi kartu identitas laporan (Nama Toko, Alamat, Kontak, Periode, Waktu Cetak, Operator Kasir) dan Ringkasan Eksekutif Keuangan (Total Transaksi, Qty Item, Omzet, Diskon, Estimasi Modal HPP, Laba Bersih, Margin Keuntungan, dan Rata-rata Nilai Transaksi / AOV).
    - **Dua Pilihan Format Laporan**:
      - **Rekap Transaksi Lengkap (Per Nota)**: Menampilkan data per nota lengkap dengan jam, rincian barang, diskon, modal HPP, laba, uang diterima, kembalian, dan baris **Grand Total Keseluruhan** di bagian bawah.
      - **Rincian Penjualan Per Item Produk (Itemized)**: Menampilkan rincian per produk terjual (Kategori, Nama Produk, Qty, Harga Beli/HPP, Harga Jual, Omzet, Total HPP, dan Laba Bersih), ideal untuk analisis produk terlaris, audit stok, dan pivot table di Excel.
    - **Kompatibilitas Penuh Microsoft Excel & Google Sheets**: Menggunakan header UTF-8 BOM (`\uFEFF`) dan angka numerik murni tanpa simbol teks sehingga rumus perhitungan (`=SUM`, `=AVERAGE`, dll.) dapat langsung dieksekusi tanpa error.
    - **Pilihan Pemisah Kolom (Delimiter)**: Tersedia pilihan pemisah **Koma (,)** untuk standar universal & Google Sheets, serta **Titik Koma (;)** khusus Microsoft Excel Windows dengan pengaturan regional Indonesia.
