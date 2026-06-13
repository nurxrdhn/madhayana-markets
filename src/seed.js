export const initialProducts = [
  {id:'prd-001', name:'Voucher Game Premium', type:'Digital', category:'voucher', price:25000, rating:4.9, image:'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=900&auto=format&fit=crop', description:'Voucher game instan untuk berbagai kebutuhan top up dan hiburan digital.', tags:['game','voucher','instan'], stock:99},
  {id:'prd-002', name:'Paket Desain Logo UMKM', type:'Jasa Kreatif', category:'jasa', price:150000, rating:4.8, image:'https://images.unsplash.com/photo-1558655146-364adaf25c48?q=80&w=900&auto=format&fit=crop', description:'Paket desain logo modern untuk brand, toko online, dan usaha kecil.', tags:['logo','desain','umkm'], stock:25},
  {id:'prd-003', name:'Kelas Digital Marketing Dasar', type:'Kelas', category:'kelas', price:99000, rating:4.7, image:'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=900&auto=format&fit=crop', description:'Materi dasar iklan, konten, marketplace, dan strategi penjualan online.', tags:['kelas','marketing'], stock:50},
  {id:'prd-004', name:'PPOB Pulsa & Data', type:'PPOB', category:'ppob', price:12000, rating:4.6, image:'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=900&auto=format&fit=crop', description:'Layanan pulsa, data, token listrik, dan pembayaran digital.', tags:['pulsa','data','ppob'], stock:500},
  {id:'prd-005', name:'Template Website Toko Online', type:'Software', category:'software', price:275000, rating:4.9, image:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=900&auto=format&fit=crop', description:'Template web market responsif, siap dikembangkan untuk usaha digital.', tags:['website','template','market'], stock:20},
  {id:'prd-006', name:'Jasa Setup QRIS & Landing Page', type:'Jasa Digital', category:'jasa', price:350000, rating:4.8, image:'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=900&auto=format&fit=crop', description:'Setup halaman pembayaran, invoice, QRIS, dan dasar integrasi bisnis.', tags:['qris','landing page'], stock:10}
];

export const initialBanners = [
  {id:'bn-1', title:'Promo QRIS Madhayana', subtitle:'Checkout cepat dengan invoice dan QRIS.', cta:'Bayar Sekarang', target:'#payment', color:'#0ea5e9'},
  {id:'bn-2', title:'Produk Digital & Kreatif', subtitle:'Voucher, jasa, kelas, PPOB, dan software.', cta:'Lihat Produk', target:'#products', color:'#22c55e'},
  {id:'bn-3', title:'Seller & Operator Ready', subtitle:'Tambah, edit, duplikat, hapus produk dari dashboard.', cta:'Masuk Operator', target:'#operator', color:'#f97316'}
];

export const initialComments = [
  {id:'c-1', productId:'prd-001', name:'Rama', text:'Proses cepat dan tampilan invoice jelas.', rating:5, pinned:true, status:'visible', replies:['Terima kasih. Kami akan terus tingkatkan layanan.'], reports:[]},
  {id:'c-2', productId:'prd-002', name:'Ayu', text:'Desainnya cocok untuk UMKM.', rating:5, pinned:false, status:'visible', replies:[], reports:[]},
  {id:'c-3', productId:'prd-005', name:'Dimas', text:'Template cukup lengkap untuk awal usaha.', rating:4, pinned:false, status:'visible', replies:[], reports:[]}
];

export const categories = [
  {id:'all', name:'All'},
  {id:'voucher', name:'Voucher'},
  {id:'jasa', name:'Jasa'},
  {id:'kelas', name:'Kelas'},
  {id:'ppob', name:'PPOB'},
  {id:'software', name:'Software'}
];
