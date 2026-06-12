# Madhayana Markets - DANA Integrated Web Market

Web market React + Vite dengan 2 sisi:

1. **Sisi User**
   - Katalog produk digital, jasa, kelas, buku, dan PPOB.
   - Keranjang belanja.
   - Checkout direct menggunakan pola DANA Direct Debit / Payment Gateway.
   - Mode mock otomatis jika credential DANA belum diisi.

2. **Sisi Operator**
   - Login operator dengan kredensial: `0123456`.
   - Dashboard order.
   - Monitoring status pembayaran.
   - Rekap paid, pending, order, dan omzet.

## Integrasi DANA

Project ini sudah menyiapkan serverless API Vercel:

- `POST /api/dana/create-payment`
  - Membuat transaksi pembayaran.
  - Mengirim data order, amount, buyer, goods, URL return, dan URL notification.

- `POST /api/dana/notify`
  - Endpoint webhook/Finish Notify dari DANA ke merchant.
  - Dipakai supaya pembayaran otomatis, tidak perlu cek manual.

- `POST /api/dana/query-status`
  - Optional API untuk cek status jika notify belum diterima.

## Mode Mock

Jika environment DANA belum diisi, sistem berjalan dalam **mode mock**.
Saat user checkout, order akan dibuat sebagai `PENDING`, lalu otomatis berubah menjadi `PAID` beberapa detik kemudian untuk mensimulasikan Finish Notify DANA.

## Environment Variables

Lihat `.env.example`.
Isi variable ini di Vercel:

```bash
DANA_ENV=sandbox
DANA_BASE_URL=https://api.sandbox.dana.id
DANA_CLIENT_ID=...
DANA_CHANNEL_ID=95221
DANA_MERCHANT_ID=...
DANA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
APP_ORIGIN=https://domain-kamu.vercel.app
```

Endpoint `DANA_DIRECT_DEBIT_PATH` dapat disesuaikan dengan API DANA yang benar-benar aktif di akun onboarding kamu, misalnya Widget API Binding/Non Binding atau Payment Gateway API.

## Jalankan Lokal

```bash
npm install
npm run dev
```

## Deploy Vercel

1. Upload project ke GitHub.
2. Import repository ke Vercel.
3. Framework: Vite.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Isi Environment Variables.
7. Pastikan URL notify di DANA mengarah ke:

```text
https://domain-kamu.vercel.app/api/dana/notify
```

## Catatan Produksi

Untuk production, tambahkan database seperti Firestore, Supabase, Postgres, atau Upstash Redis agar status dari `/api/dana/notify` tersimpan permanen dan dashboard operator bisa real-time lintas perangkat.
Saat ini order disimpan di localStorage untuk demo web cepat.
