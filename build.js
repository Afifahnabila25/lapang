// Lapang — build script
// Teks Arab + terjemahan Kemenag diambil langsung dari dataset quran-json
// (sumber: quranenc.com), dipotong per kata. Tidak ada teks Arab yang diketik manual.
// Jalankan: npm install && npm run build  → hasilnya di folder dist/
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// ==== ATUR DI SINI ====
// Alamat website setelah online (wajib diakhiri "/"). Dipakai buat gambar preview link.
// Kalau nama repo GitHub-nya beda, ganti bagian terakhirnya.
const SITE_URL = process.env.SITE_URL || "https://afifahnabila25.github.io/lapang/";
const DESC = "Lagi capek, bokek, atau deg-degan mau sidang? Pilih mood kamu, doanya nyusul. Lengkap dengan teks Arab, latin, dan arti.";
// ======================
const q = require("quran-json/dist/quran_id.json");

// nama surah ejaan Indonesia
const NAMA = { 2: "Al-Baqarah", 3: "Ali 'Imran", 9: "At-Taubah", 18: "Al-Kahfi", 20: "Taha", 21: "Al-Anbiya", 28: "Al-Qasas", 65: "At-Talaq", 94: "Al-Insyirah" };
const nama = (s) => NAMA[s] || q[s - 1].transliteration;
// Latin Indonesia (pedoman Kemenag RI, via equran.id) — satu baris per ayat: "<surah>:<ayat> <teks>"
// Sumber: github.com/hifebriansyah/quran/blob/main/data/latin-id.md
const LATIN = Object.fromEntries(fs.readFileSync("data/latin-id.md", "utf8").split("\n")
  .map((l) => l.match(/^(\d+:\d+) (.+)$/)).filter(Boolean).map((m) => [m[1], m[2].trim()]));
const lat = (s, a) => { const t = LATIN[`${s}:${a}`]; if (!t) throw new Error("latin tidak ada: " + s + ":" + a); return t; };
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const v = (s, a) => q[s - 1].verses[a - 1];
const cleanId = (t) => t.replace(/\d+\)\s?/g, "").replace(/\s+/g, " ").trim().replace(/,$/, "");
const num = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);

// arFrom = indeks kata tempat doa dimulai di ayat pertama (null = ayat utuh)
// idFrom = potongan awal terjemahan; default ambil kalimat setelah tanda kutip terakhir
function doa(o) {
  const { surah, ayat, arFrom = null, idFrom, idFull = false, latFrom } = o;
  const verses = ayat.map((a) => v(surah, a));
  const fullAr = verses.map((x) => x.text);
  const ar = [...fullAr];
  if (arFrom != null) ar[0] = ar[0].split(" ").slice(arFrom).join(" ");

  const fullIds = verses.map((x) => cleanId(x.translation));
  const ids = [...fullIds];
  if (idFrom) {
    const i = ids[0].indexOf(idFrom);
    if (i < 0) throw new Error("idFrom tidak ketemu: " + o.key);
    ids[0] = ids[0].slice(i);
  } else if (!idFull) {
    ids[0] = ids[0].slice(ids[0].lastIndexOf('"') + 1);
  }
  const fullLat = ayat.map((a) => lat(surah, a));
  const lats = [...fullLat];
  if (latFrom) {
    const i = lats[0].indexOf(latFrom);
    if (i < 0) throw new Error("latFrom tidak ketemu: " + o.key);
    lats[0] = cap(lats[0].slice(i));
  }
  const arJoin = (arr) => arr.map((t, i) => `${t} ﴿${num(ayat[i])}﴾`).join(" ");
  const idJoin = (arr) => arr.map((t, i) => `${t} (${ayat[i]})`).join(" ");
  const range = ayat.length > 1 ? `${ayat[0]}–${ayat.at(-1)}` : `${ayat[0]}`;
  const showFull = arFrom != null && o.showFull !== false;
  return {
    key: o.key, mood: o.mood, title: o.title, intro: o.intro, lore: o.lore,
    tags: o.tags,
    ref: `QS ${nama(surah)} ${range}`,
    ar: arJoin(ar), latin: idJoin(lats), id: idJoin(ids),
    fullAr: showFull ? arJoin(fullAr) : null,
    fullId: showFull ? idJoin(fullIds) : null,
    fullLatin: showFull ? idJoin(fullLat) : null,
  };
}

const data = [
  doa({ key: "yunus", latFrom: "lā ilāha illā anta", mood: "r u tired?", title: "Doa Nabi Yunus", tags: ["capek"],
    intro: "Wajar kok. Nabi Yunus juga pernah ada di titik paling gelap, dan ini yang beliau baca.",
    lore: "Dibaca Nabi Yunus waktu ada di dalam perut ikan, gelap berlapis-lapis. Isinya pengakuan, bukan keluhan.",  surah: 21, ayat: [87], arFrom: 14 }),
  doa({ key: "bokek", latFrom: "wa may yattaqillāha", mood: "lagi bokek, help", title: "Ayat jalan keluar", tags: ["rezeki"],
    intro: "Dompet tipis bukan akhir cerita. Ayat ini yang sering viral sebagai \"doa 1000 dinar\".",
    lore: "Ayatnya jelas dari Al-Qur'an. Tapi kisah keutamaan \"1000 dinar\" yang beredar sumbernya dipertanyakan, jadi di sini cukup ayatnya aja.",  surah: 65, ayat: [2, 3], arFrom: 24, idFrom: "Barangsiapa bertakwa" }),
  doa({ key: "sidang", latFrom: "rabbisyraḥ", mood: "besok sidang, deg-degan", title: "Lapangkan dadaku", tags: ["skripsi"],
    intro: "Tarik napas dulu. Nabi Musa juga gugup waktu mau ngadep Fir'aun, dan ini yang beliau minta.",
    lore: "Doa Nabi Musa sebelum menghadap Fir'aun. Minta dada dilapangkan, urusan dimudahkan, dan lidah dilancarkan. Cocok sebelum sidang, presentasi, atau bimbingan.",  surah: 20, ayat: [25, 26, 27, 28], arFrom: 1, showFull: false }),
  doa({ key: "overthinking", mood: "overthinking jam 2 pagi", title: "Bersama kesulitan", tags: ["capek", "skripsi"],
    intro: "Pikiran muter terus? Ada satu kalimat yang Allah ulang dua kali biar kita yakin.",
    lore: "Bukan doa, tapi pengingat dari Surah Al-Insyirah. Diulang dua kali dalam dua ayat berturut-turut.",  surah: 94, ayat: [5, 6], idFull: true }),
  doa({ key: "dosbing", latFrom: "ḥasbunallāhu", mood: "dosbing ngilang lagi", title: "Hasbunallah", tags: ["skripsi"],
    intro: "Udah chat, udah nunggu, belum dibalas juga. Serahin sisanya sama yang Maha Mengatur.",
    lore: "Ucapan para sahabat waktu ditakut-takuti dengan pasukan musuh. Bukannya panik, iman mereka malah bertambah.",  surah: 3, ayat: [173], arFrom: 13 }),
  doa({ key: "butuh-bantuan", latFrom: "rabbi innī", mood: "butuh bantuan, apa aja", title: "Doa Nabi Musa di Madyan", tags: ["rezeki"],
    intro: "Nggak tahu harus minta apa? Nabi Musa juga pernah cuma bilang: aku butuh kebaikan apa pun.",
    lore: "Dibaca Nabi Musa setelah menolong dua perempuan di Madyan, waktu beliau sendiri lagi nggak punya apa-apa.",  surah: 28, ayat: [24], arFrom: 7 }),
  doa({ key: "ditolak", latFrom: "ḥasbiyallāhu", mood: "ditolak lagi :(", title: "Cukuplah Allah bagiku", tags: ["rezeki", "capek"],
    intro: "Lamaran ditolak, rencana gagal. Yang pasti nggak bakal ninggalin kamu cuma satu.",
    lore: "Kalimat tawakal di penutup Surah At-Taubah, waktu ajakan Nabi ditolak banyak orang.",  surah: 9, ayat: [129], arFrom: 3 }),
  doa({ key: "abis-lulus", latFrom: "rabbanā ātinā", mood: "abis lulus mau ke mana?", title: "Doa Ashabul Kahfi", tags: ["skripsi"],
    intro: "Bingung arah itu normal. Para pemuda di gua juga nggak tahu ke depannya gimana.",
    lore: "Doa para pemuda Ashabul Kahfi waktu berlindung di gua. Mereka minta rahmat dan petunjuk yang lurus dalam urusan mereka.",  surah: 18, ayat: [10], arFrom: 6 }),
  doa({ key: "berat", latFrom: "rabbanā lā tu", mood: "beban kerasa berat banget", title: "Sesuai kemampuan", tags: ["capek"],
    intro: "Allah nggak ngasih beban di luar kemampuan. Tapi boleh kok minta diringankan.",
    lore: "Bagian doa dari ayat terakhir Surah Al-Baqarah.",  surah: 2, ayat: [286], arFrom: 12 }),
  doa({ key: "minta-semua", latFrom: "rabbanā ātinā", mood: "mau minta yang besar-besar", title: "Doa sapu jagat", tags: ["rezeki"],
    intro: "Jangan minta yang kecil-kecil. Minta kebaikan dunia sekaligus akhirat.",
    lore: "Doa pendek yang isinya paling luas: kebaikan dunia, kebaikan akhirat, dan perlindungan dari neraka.",  surah: 2, ayat: [201], arFrom: 3 }),
];

// ---- font ditanam langsung, biar tampilannya sama di HP mana pun ----
const font = (fam, pkg, sub, w, range) =>
  `@font-face{font-family:"${fam}";font-weight:${w};font-display:swap;src:url(data:font/woff2;base64,${fs
    .readFileSync(`node_modules/@fontsource/${pkg}/files/${pkg}-${sub}-${w}-normal.woff2`)
    .toString("base64")}) format("woff2")${range ? ";unicode-range:" + range : ""}}`;
const AR_RANGE = "U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0898-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC";
const fonts = [
  font("Amiri Quran", "amiri-quran", "arabic", 400, AR_RANGE),
  font("Amiri Quran", "amiri-quran", "latin", 400, "U+0000-00FF"),
  font("Bricolage", "bricolage-grotesque", "latin", 600),
  font("Bricolage", "bricolage-grotesque", "latin", 800),
  font("DM Sans", "dm-sans", "latin", 400),
  font("DM Sans", "dm-sans", "latin", 700),
  font("DM Sans", "dm-sans", "latin-ext", 500, "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF"),
  font("DM Sans", "dm-sans", "latin", 500),
  font("Pixel", "press-start-2p", "latin", 400),
].join("\n");

const html = fs.readFileSync("template.html", "utf8")
  .replace("/*__FONTS__*/", fonts)
  .replace("/*__DATA__*/[]", JSON.stringify(data))
  .replaceAll("__SITE_URL__", SITE_URL)
  .replaceAll("__DESC__", DESC);

// ---- tulis ke dist/ ----
const OUT = "dist";
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "icons"), { recursive: true });
fs.writeFileSync(path.join(OUT, "index.html"), html);
fs.cpSync("assets", OUT, { recursive: true });

// manifest: biar bisa "Add to Home Screen" dan kebuka kayak aplikasi
fs.writeFileSync(path.join(OUT, "manifest.webmanifest"), JSON.stringify({
  name: "Lapang — Doa sesuai mood",
  short_name: "Lapang",
  description: DESC,
  lang: "id",
  start_url: "./",
  scope: "./",
  display: "standalone",
  background_color: "#F4F2FB",
  theme_color: "#F4F2FB",
  icons: [
    { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
}, null, 2));

// service worker: simpan semua file biar bisa dibuka tanpa internet.
// Versi cache ikut berubah tiap isi berubah, jadi pengguna otomatis dapat versi terbaru.
const files = ["./", "index.html", "manifest.webmanifest", "og-image.png",
  ...fs.readdirSync(path.join(OUT, "icons")).map((f) => "icons/" + f)];
const version = crypto.createHash("sha1").update(html).digest("hex").slice(0, 10);
fs.writeFileSync(path.join(OUT, "sw.js"), `// dibuat otomatis oleh build.js
const CACHE = "lapang-${version}";
const FILES = ${JSON.stringify(files)};
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request)));
});
`);
console.log(`ok: ${data.length} doa → dist/ (index.html ${(html.length / 1024).toFixed(0)} KB, cache ${version})`);
