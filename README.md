# Madhayana Markets - Gacoan Style Payment

Versi ini dibuat agar alur pembayaran mirip sistem restoran modern: user pilih produk, pilih metode pembayaran, dapat nomor order/invoice, lalu operator bisa melihat status transaksi.

## Fitur utama
- User store + keranjang.
- Pilihan metode pembayaran: DANA/QRIS, E-Wallet, Virtual Account, Bayar di Kasir.
- Invoice popup dengan nomor order.
- Dashboard operator, PIN default `0123456`.
- Order tersimpan ke Firebase Firestore `orders`.
- Fallback local otomatis jika Firestore rules belum terbuka.
- Mock auto paid untuk DANA/QRIS saat API DANA belum aktif.

## Cara menjalankan

Buka CMD di folder ini, lalu jalankan:

```bash
npm install
npm run dev
```

Buka alamat yang muncul, biasanya:

```text
http://localhost:5173
```

## Penting
Jika ZIP diekstrak, pastikan CMD berada di folder yang ada file `package.json`. Di versi ini `package.json` sudah diletakkan langsung di root project.

## Firebase
Config Firebase sudah diisi untuk project `madhayana-80f71`. Collection yang dipakai:

```text
orders
```

Untuk testing awal, Firestore Rules bisa memakai test mode. Setelah siap online, ubah rules menjadi production.
