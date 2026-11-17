# Lapang

Kumpulan doa dari Al-Qur'an yang dipilih lewat mood, bukan lewat daftar surah.

Lagi capek, bokek, atau deg-degan mau sidang? Pilih kartu yang paling relate, lalu doanya muncul lengkap dengan teks Arab, latin, dan arti.

**Live:** https://afifahnabila25.github.io/lapang/

![Pratinjau Lapang](assets/og-image.png)

## Fitur

- **10 kartu mood**, mulai dari "r u tired?" sampai "abis lulus mau ke mana?", dengan filter capek, skripsi, dan rezeki
- **Halaman doa**: teks Arab (Rasm Utsmani), latin Indonesia, terjemahan Kemenag, dan cerita singkat di balik doanya
- **Lihat ayat lengkap** untuk doa yang diambil dari potongan ayat
- **Simpan doa** favorit (tersimpan di browser masing-masing pengguna)
- **Salin** teks doa dalam satu ketukan
- **Bisa di-install ke HP (PWA)** dan tetap bisa dibuka tanpa internet
- **Pratinjau link** yang rapi waktu dibagikan di WhatsApp atau media sosial

## Akurasi teks

Teks Arab tidak diketik manual. Saat build, ayat diambil langsung dari dataset lalu dipotong per kata di bagian doanya. Jadi teks yang tampil sama persis dengan sumbernya.

| Bagian | Sumber |
| --- | --- |
| Teks Arab (Rasm Utsmani) | The Noble Qur'an Encyclopedia (quranenc.com), via paket [quran-json](https://www.npmjs.com/package/quran-json) |
| Terjemahan | Kementerian Agama RI, via sumber yang sama |
| Latin | Pedoman transliterasi Kemenag RI, via equran.id ([hifebriansyah/quran](https://github.com/hifebriansyah/quran)) |

## Menjalankan di komputer

Butuh [Node.js](https://nodejs.org) versi 18 ke atas.

```bash
npm install
npm run build      # hasil build ada di folder dist/
npm run preview    # buka http://localhost:3000
```

Fitur PWA (install ke HP dan mode offline) hanya aktif kalau dibuka lewat `npm run preview` atau setelah website online, bukan dengan membuka file `dist/index.html` langsung.

## Struktur project

```
├── build.js                 # data doa, pengaturan, dan proses build
├── template.html            # tampilan dan logika halaman
├── data/latin-id.md         # teks latin Indonesia, satu baris per ayat
├── assets/                  # ikon aplikasi dan gambar pratinjau link
└── .github/workflows/       # deploy otomatis ke GitHub Pages
```

## Menambah doa

Tambahkan satu entri `doa({ ... })` di `build.js`:

| Field | Keterangan |
| --- | --- |
| `surah`, `ayat` | Nomor surah dan ayat, contoh `surah: 21, ayat: [87]` |
| `arFrom` | Indeks kata tempat doa dimulai di ayat pertama. Kosongkan kalau ayatnya utuh |
| `latFrom` | Potongan awal teks latin tempat doa dimulai. Wajib kalau `arFrom` diisi |
| `mood` | Teks besar di kartu, contoh `"r u tired?"` |
| `title`, `intro`, `lore` | Judul doa, kalimat pembuka, dan cerita singkat di baliknya |
| `tags` | Kategori filter: `capek`, `skripsi`, `rezeki` |

Lalu jalankan `npm run build` lagi.

## Deploy

Setiap push ke branch `main` otomatis di-build dan dipublikasikan ke GitHub Pages lewat GitHub Actions. Pengaturan yang perlu dicek sekali:

1. **Settings → Pages → Source: GitHub Actions**
2. `SITE_URL` di bagian atas `build.js` harus sama dengan alamat website (diakhiri `/`), supaya gambar pratinjau link muncul

## Kredit

- Kutipan di halaman utama: Raim Laode
- Dzikir pagi dan petang diarahkan ke [almatsurat.net](https://almatsurat.net)
- Font: Amiri Quran, Bricolage Grotesque, DM Sans, Press Start 2P (Google Fonts, via Fontsource)

Dibuat oleh [Afifah Nabila Devi](https://github.com/Afifahnabila25).
