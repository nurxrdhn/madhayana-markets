export const categories = ['Semua','Voucher','Jasa','Kelas','PPOB','Software'];

export const company = {
  name: 'Madhayana Market',
  email: 'madhayanagroup@gmail.com',
  website: 'https://madhayana.com',
  address: 'Indonesia',
  hours: 'Senin - Minggu, 09.00 - 21.00 WIB',
  customerService: '+62 812-0000-0000',
  sales: '+62 813-0000-0000'
};

export const faqSeed = [
  {id:'faq1', q:'Bagaimana cara checkout?', a:'Pilih produk, masukkan ke keranjang, buka checkout, lalu buat invoice pembayaran.'},
  {id:'faq2', q:'Apakah bisa bayar QRIS?', a:'Bisa. Sistem menyediakan QRIS Madhayana Market dan template DANA QRIS MPM.'},
  {id:'faq3', q:'Bagaimana cara deposit?', a:'Buka halaman Deposit, pilih nominal, lalu bayar melalui invoice QRIS.'},
  {id:'faq4', q:'Bagaimana cek status pesanan?', a:'Buka chatbot, pilih Cek Pesanan, lalu masukkan nomor invoice.'}
];

export const productsSeed = [
 {id:'p1', name:'Voucher Game Premium', category:'Voucher', type:'Digital', price:25000, stock:99, rating:4.9, image:'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=900&auto=format&fit=crop', desc:'Voucher game instan untuk top up dan kebutuhan hiburan digital.', media:['https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=900&auto=format&fit=crop'], comments:[{id:'c1',name:'Rama', text:'Proses cepat, invoice jelas.', rating:5, media:'', pinned:true, hidden:false, blocked:false, replies:['Terima kasih sudah belanja di Madhayana Market.'], reports:[]}]},
 {id:'p2', name:'Paket Desain Logo UMKM', category:'Jasa', type:'Jasa Kreatif', price:150000, stock:25, rating:4.8, image:'https://images.unsplash.com/photo-1558655146-364adaf25c48?q=80&w=900&auto=format&fit=crop', desc:'Desain logo modern untuk brand, toko online, dan usaha kecil.', media:['https://images.unsplash.com/photo-1626785774625-0b1c2c4eab67?q=80&w=900&auto=format&fit=crop'], comments:[{id:'c2',name:'Ayu', text:'Cocok untuk UMKM.', rating:5, media:'', pinned:false, hidden:false, blocked:false, replies:[], reports:[]}]},
 {id:'p3', name:'Kelas Digital Marketing Dasar', category:'Kelas', type:'Kelas Online', price:99000, stock:50, rating:4.7, image:'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=900&auto=format&fit=crop', desc:'Materi dasar iklan, konten, marketplace, dan strategi penjualan online.', media:[], comments:[]},
 {id:'p4', name:'PPOB Pulsa & Data', category:'PPOB', type:'PPOB', price:12000, stock:500, rating:4.6, image:'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=900&auto=format&fit=crop', desc:'Layanan pulsa, data, token listrik, dan pembayaran digital.', media:[], comments:[]},
 {id:'p5', name:'Template Website Toko Online', category:'Software', type:'Software', price:275000, stock:20, rating:4.9, image:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=900&auto=format&fit=crop', desc:'Template web market responsif, siap dikembangkan untuk usaha digital.', media:[], comments:[]}
];

export const promosSeed = [
 {id:'bn1',title:'Flash Promo Digital', sub:'Voucher, jasa, kelas, PPOB, software.', cta:'Belanja Sekarang', target:'home', badge:'PROMO'},
 {id:'bn2',title:'Deposit Saldo Mudah', sub:'Top up saldo ada di halaman khusus.', cta:'Deposit', target:'deposit', badge:'DEPOSIT'},
 {id:'bn3',title:'QRIS Cepat', sub:'Invoice dan pembayaran ada di halaman khusus.', cta:'Checkout', target:'checkout', badge:'QRIS'}
];
