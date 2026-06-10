# Madhayana Markets Webstore

Web toko digital untuk menjual aplikasi/software, jasa digital, kelas online, buku digital, dan PPOB.

## Fitur
- React + Vite
- UI modern responsive
- Login Google direct dengan Firebase Auth
- Katalog multi-kategori
- Search produk
- Keranjang sederhana
- Checkout via WhatsApp
- Siap GitHub dan Vercel

## Jalankan lokal
```bash
npm install
npm run dev
```

## Deploy Vercel
- Import repository dari GitHub.
- Framework: Vite.
- Build command: `npm run build`.
- Output directory: `dist`.
- Tambahkan Environment Variables dari `.env.example`.

## Firebase
Aktifkan Authentication > Google Provider di Firebase Console. Isi `.env.local` saat lokal, dan Environment Variables di Vercel.

## Ganti nomor WhatsApp
Edit:
- `src/components/ProductCard.jsx`
- `src/components/CartPanel.jsx`

Nomor default masih contoh: `6281234567890`.
