export const categories = [
  { id: 'all', name: 'Semua' },
  { id: 'software', name: 'Software' },
  { id: 'service', name: 'Jasa Digital' },
  { id: 'class', name: 'Kelas' },
  { id: 'book', name: 'Buku' },
  { id: 'ppob', name: 'PPOB' }
];

export const products = [
  { id:'pos-basic', category:'software', title:'Aplikasi Kasir POS Basic', price:149000, badge:'Best Seller', type:'Digital', description:'Aplikasi kasir untuk UMKM, warung, dan toko kecil.', features:['Produk & stok','Transaksi cepat','Laporan harian'] },
  { id:'inventory-pro', category:'software', title:'Inventory Management Pro', price:249000, badge:'UMKM', type:'License', description:'Kelola stok, supplier, pembelian, dan laporan persediaan.', features:['Stok masuk/keluar','Supplier','Dashboard'] },
  { id:'webstore', category:'service', title:'Jasa Website Toko Online', price:1200000, badge:'Popular', type:'Service', description:'Website toko online siap deploy untuk produk digital dan fisik.', features:['Katalog','Checkout','Deploy'] },
  { id:'landing', category:'service', title:'Jasa Landing Page Bisnis', price:450000, badge:'SEO', type:'Service', description:'Landing page cepat untuk promosi produk, jasa, dan UMKM.', features:['Responsive','SEO basic','Form kontak'] },
  { id:'kelas-web', category:'class', title:'Kelas Membuat Website dari Nol', price:99000, badge:'Pemula', type:'Online Class', description:'Belajar HTML, CSS, React, Firebase, dan deploy.', features:['Video','Source code','Checklist'] },
  { id:'kelas-ai', category:'class', title:'Kelas AI untuk Bisnis', price:129000, badge:'New', type:'Online Class', description:'Pakai AI untuk konten, CS, analisis, dan otomasi kerja.', features:['Prompt','Template','Studi kasus'] },
  { id:'ebook-react', category:'book', title:'E-Book React Praktis', price:59000, badge:'PDF', type:'E-Book', description:'Panduan membangun website modern dengan React dan Vite.', features:['PDF','Source code','Deploy'] },
  { id:'ebook-bisnis', category:'book', title:'Modul Bisnis Digital UMKM', price:49000, badge:'UMKM', type:'E-Book', description:'Strategi membuat produk digital, pricing, dan promosi.', features:['Template','Funnel','Studi kasus'] },
  { id:'pulsa', category:'ppob', title:'Pulsa & Paket Data', price:10000, badge:'PPOB', type:'PPOB', description:'Pembelian pulsa dan paket data berbagai operator.', features:['Telkomsel','Indosat','XL'] },
  { id:'token-pln', category:'ppob', title:'Token Listrik PLN', price:20000, badge:'PPOB', type:'PPOB', description:'Pembelian token PLN prabayar.', features:['20 ribu','50 ribu','100 ribu'] },
  { id:'ewallet', category:'ppob', title:'Top Up E-Wallet', price:10000, badge:'PPOB', type:'PPOB', description:'Top up DANA, OVO, GoPay, dan ShopeePay.', features:['DANA','OVO','GoPay'] }
];
