# Madhayana Market v5 - QRIS Asli + DANA QRIS MPM

Versi ini dibuat untuk **Madhayana Market** dengan alur pembayaran seperti restoran modern:

1. User pilih produk.
2. User isi data customer.
3. User pilih metode pembayaran.
4. Sistem membuat invoice dan nomor order.
5. QRIS asli Madhayana Market tampil.
6. Operator melihat order di dashboard.
7. Jika DANA QRIS MPM sudah approve dan ENV sudah diisi, sistem dapat memakai Generate QRIS API dan Finish Notify otomatis.

## QRIS yang sudah dimasukkan

File QRIS asli diletakkan di:

```text
public/qris-madhayana-market.jpg
```

Identitas QRIS:

```text
MADHAYANA MARKET, DIGITAL & KREATIF
NMID: ID1025461902120
Terminal: A01
```

Mode ini bisa dipakai langsung karena QRIS yang tampil adalah QRIS asli. Namun status pembayaran masih perlu diverifikasi dari mutasi/riwayat merchant jika DANA API production belum aktif.

## Jalankan di laptop

```bash
npm install
npm run dev
```

Atau klik:

```text
run-dev.bat
```

## Build

```bash
npm run build
```

Atau klik:

```text
build-web.bat
```

## Login Operator

```text
PIN: 0123456
```

## Endpoint DANA yang disiapkan

DANA Dashboard dapat diarahkan ke:

```text
Finish Payment URL:
https://madhayana.com/api/dana-finish

Disburse to Bank Notify URL:
https://madhayana.com/api/dana-bank-notify

Finish Redirect URL:
https://madhayana.com/payment/success
```

## API internal

```text
POST /api/dana/generate-qris
POST /api/dana/query-payment
POST /api/dana-finish
POST /api/dana-bank-notify
GET  /api/payment-success
```

## ENV untuk DANA QRIS MPM otomatis

Isi di Vercel/Railway/Render setelah DANA memberikan credential:

```env
DANA_ENV=sandbox
DANA_BASE_URL=https://api.sandbox.dana.id
DANA_PARTNER_ID=
DANA_CLIENT_ID=
DANA_MERCHANT_ID=
DANA_SUB_MERCHANT_ID=
DANA_STORE_ID=
DANA_CHANNEL_ID=95221
DANA_PRIVATE_KEY=
APP_ORIGIN=https://madhayana.com
```

## ENV untuk Finish Notify update Firestore

Ambil dari Firebase service account:

```env
FIREBASE_PROJECT_ID=madhayana-80f71
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

## Catatan penting

- QRIS statis asli sudah bisa menerima pembayaran.
- QRIS dinamis otomatis butuh DANA Enterprise approve + credential production/sandbox.
- Finish Notify tidak akan bekerja di localhost. Harus deploy ke domain HTTPS.
- Untuk produksi, ganti PIN operator dengan Firebase Auth role admin.
