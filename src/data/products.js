export const categories = [
  { id: 'software', name: 'Software' },
  { id: 'services', name: 'Jasa Digital' },
  { id: 'classes', name: 'Kelas' },
  { id: 'books', name: 'Buku' },
  { id: 'ppob', name: 'PPOB' }
];

export const products = [
  ['app-pos-basic','software','Aplikasi Kasir POS Basic',149000,'Best Seller','Aplikasi kasir sederhana untuk toko kecil dan UMKM.',['Manajemen produk','Transaksi cepat','Laporan harian','Export data'],'Digital Download'],
  ['app-inventory-pro','software','Inventory Management Pro',249000,'UMKM','Kelola stok, supplier, pembelian, dan laporan persediaan.',['Stok masuk/keluar','Supplier','Notifikasi stok minimum','Dashboard'],'Digital Download'],
  ['app-tradevision','software','TradeVisionAI Dashboard',399000,'Premium','Dashboard analisis trading berbasis indikator teknikal dan jurnal sinyal.',['Signal dashboard','Trade journal','Statistik','Mode demo'],'License'],
  ['service-web-company','services','Jasa Website Company Profile',750000,'Recommended','Pembuatan website profesional untuk bisnis dan personal brand.',['Responsive','Landing page','SEO basic','Deploy Vercel'],'Service'],
  ['service-webstore','services','Jasa Toko Online',1200000,'Popular','Toko online modern untuk jual produk digital atau fisik.',['Katalog produk','Keranjang','Checkout WhatsApp','Dashboard admin'],'Service'],
  ['class-web-basic','classes','Kelas Membuat Website dari Nol',99000,'Pemula','Belajar HTML, CSS, React, dan deploy project ke Vercel.',['Video materi','Project praktik','Template code','Sertifikat'],'Online Class'],
  ['class-ai-business','classes','Kelas AI untuk Bisnis',129000,'New','Cara memakai AI untuk konten, analisis, customer service, dan otomasi.',['Prompting','Template kerja','Studi kasus','Workflow AI'],'Online Class'],
  ['book-react-practical','books','E-Book React Praktis',59000,'E-Book','Panduan membangun web modern dengan React dan Vite.',['PDF','Source code','Studi kasus','Checklist deploy'],'PDF'],
  ['book-digital-business','books','Modul Bisnis Digital UMKM',49000,'UMKM','Panduan membuat produk digital, promosi, dan sistem order online.',['PDF','Template bisnis','Strategi harga','Contoh funnel'],'PDF'],
  ['ppob-pulsa-data','ppob','Pulsa & Paket Data',10000,'PPOB','Pembelian pulsa dan paket data berbagai operator.',['Telkomsel','Indosat','XL','Tri'],'PPOB'],
  ['ppob-token-listrik','ppob','Token Listrik PLN',20000,'PPOB','Pembelian token listrik PLN prabayar.',['20 ribu','50 ribu','100 ribu','200 ribu'],'PPOB'],
  ['ppob-ewallet','ppob','Top Up E-Wallet',10000,'PPOB','Top up saldo e-wallet untuk kebutuhan harian.',['DANA','OVO','GoPay','ShopeePay'],'PPOB']
].map(([id, category, title, price, badge, description, features, type], i) => ({
  id, category, title, price, badge, description, features, type, rating: (4.7 + (i % 3) * 0.1).toFixed(1)
}));
