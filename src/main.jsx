import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import QRCode from 'qrcode';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, listenAuth, loginWithGoogle, logoutGoogle } from './firebase';
import { initialProducts, initialBanners, initialComments, categories } from './seed';
import {
  Search, ShoppingBag, Trash2, CreditCard, QrCode, CheckCircle2, Clock3, XCircle,
  RefreshCcw, Copy, ShieldCheck, UserCircle, LogOut, ReceiptText, Store, Banknote,
  Smartphone, Landmark, LockKeyhole, Download, Plus, Pencil, CopyPlus, LayoutDashboard,
  MessageCircle, Pin, PinOff, Ban, Flag, EyeOff, Star, SlidersHorizontal, ImagePlus
} from 'lucide-react';
import './styles.css';

const rupiah = (n) => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n||0));
const makeId = () => `MM-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
const dateText = (v) => v?.toDate ? v.toDate().toLocaleString('id-ID') : (v ? new Date(v).toLocaleString('id-ID') : '-');
const LS_PRODUCTS = 'madhayana_products_v7';
const LS_BANNERS = 'madhayana_banners_v7';
const LS_COMMENTS = 'madhayana_comments_v7';
const LS_LAYOUT = 'madhayana_layout_v7';
const load = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) || fallback } catch { return fallback } };
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const methods = [
  { id:'QRIS_STATIC_REAL', title:'QRIS Madhayana Market', subtitle:'QRIS asli NMID ID1025461902120. Bisa dipakai sekarang.', icon:QrCode },
  { id:'DANA_QRIS_MPM', title:'DANA QRIS MPM Dinamis', subtitle:'Generate QRIS API + Finish Notify otomatis setelah DANA approve.', icon:ShieldCheck },
  { id:'EWALLET', title:'E-Wallet', subtitle:'DANA, OVO, GoPay, ShopeePay lewat QRIS.', icon:Smartphone },
  { id:'VA_BANK', title:'Virtual Account', subtitle:'Disiapkan untuk gateway bank.', icon:Landmark },
  { id:'PAY_COUNTER', title:'Bayar di Kasir', subtitle:'Nomor order muncul, operator proses manual.', icon:Banknote }
];

const blankProduct = {id:'', name:'', type:'Digital', category:'voucher', price:0, rating:4.5, image:'', description:'', tags:[], stock:10};

function App(){
  const [role,setRole]=useState('user');
  const [search,setSearch]=useState('');
  const [cat,setCat]=useState('all');
  const [price,setPrice]=useState('all');
  const [type,setType]=useState('all');
  const [sort,setSort]=useState('popular');
  const [cart,setCart]=useState([]);
  const [orders,setOrders]=useState([]);
  const [user,setUser]=useState(null);
  const [pin,setPin]=useState('');
  const [form,setForm]=useState({name:'',phone:'',email:''});
  const [method,setMethod]=useState('QRIS_STATIC_REAL');
  const [invoice,setInvoice]=useState(null);
  const [loading,setLoading]=useState(false);
  const [sync,setSync]=useState('Firestore');
  const [products,setProducts]=useState(()=>load(LS_PRODUCTS, initialProducts));
  const [banners,setBanners]=useState(()=>load(LS_BANNERS, initialBanners));
  const [comments,setComments]=useState(()=>load(LS_COMMENTS, initialComments));
  const [layout,setLayout]=useState(()=>load(LS_LAYOUT, {theme:'bright', columns:3, hero:'split', productStyle:'card', rounded:24}));
  const [activeBanner,setActiveBanner]=useState(0);
  const [editProduct,setEditProduct]=useState(null);
  const [commentProduct,setCommentProduct]=useState(null);

  useEffect(()=>listenAuth(setUser),[]);
  useEffect(()=>save(LS_PRODUCTS, products),[products]);
  useEffect(()=>save(LS_BANNERS, banners),[banners]);
  useEffect(()=>save(LS_COMMENTS, comments),[comments]);
  useEffect(()=>save(LS_LAYOUT, layout),[layout]);
  useEffect(()=>{
    const timer=setInterval(()=>setActiveBanner(v=>(v+1)%banners.length),3500);
    return ()=>clearInterval(timer);
  },[banners.length]);
  useEffect(()=>{
    const q=query(collection(db,'orders'),orderBy('createdAt','desc'));
    return onSnapshot(q,s=>{setOrders(s.docs.map(d=>({firestoreId:d.id,...d.data()})));setSync('Firestore');},err=>{console.warn(err);setSync('Firestore error');});
  },[]);

  const types = useMemo(()=>['all', ...new Set(products.map(p=>p.type).filter(Boolean))], [products]);
  const filtered=useMemo(()=>{
    let data=products.filter(p=>cat==='all'||p.category===cat)
      .filter(p=>type==='all'||p.type===type)
      .filter(p=>{
        if(price==='under50') return p.price < 50000;
        if(price==='50to150') return p.price >= 50000 && p.price <= 150000;
        if(price==='above150') return p.price > 150000;
        return true;
      })
      .filter(p=>`${p.name} ${p.description} ${p.type} ${(p.tags||[]).join(' ')}`.toLowerCase().includes(search.toLowerCase()));
    if(sort==='low') data=[...data].sort((a,b)=>a.price-b.price);
    if(sort==='high') data=[...data].sort((a,b)=>b.price-a.price);
    if(sort==='rating') data=[...data].sort((a,b)=>b.rating-a.rating);
    return data;
  },[cat,search,price,type,sort,products]);
  const total=cart.reduce((s,i)=>s+i.price,0);
  const fee=cart.length && method!=='PAY_COUNTER' ? 1000 : 0;
  const grandTotal=total+fee;
  const stats=useMemo(()=>({paid:orders.filter(o=>o.status==='PAID').length,pending:orders.filter(o=>['PENDING','WAITING_PAYMENT','CREATED'].includes(o.status)).length,failed:orders.filter(o=>['FAILED','EXPIRED','CANCELLED'].includes(o.status)).length,omzet:orders.filter(o=>o.status==='PAID').reduce((s,o)=>s+Number(o.grandTotal||o.total||0),0)}),[orders]);

  async function checkout(){
    if(!cart.length) return alert('Keranjang masih kosong.');
    const name=form.name || user?.displayName || '';
    const email=form.email || user?.email || '';
    if(!name || !form.phone) return alert('Isi nama dan nomor HP dulu.');
    setLoading(true);
    const id=makeId();
    const base={id,partnerReferenceNo:id,customer:{name,phone:form.phone,email},customerName:name,customerPhone:form.phone,customerEmail:email,items:cart,total,adminFee:fee,grandTotal,payMethod:method,payMethodLabel:methods.find(m=>m.id===method)?.title,status:method==='PAY_COUNTER'?'WAITING_PAYMENT':'PENDING',createdAt:serverTimestamp(),createdAtText:new Date().toISOString(),updatedAt:serverTimestamp(),updatedAtText:new Date().toISOString(),merchantName:'MADHAYANA MARKET, DIGITAL & KREATIF',nmid:'ID1025461902120'};
    let payment={};
    try{
      if(method==='DANA_QRIS_MPM'){
        const res=await fetch('/api/dana/generate-qris',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(base)});
        payment=await res.json();
      }
    }catch(e){ payment={mode:'static-fallback',responseMessage:'DANA API belum aktif. Sistem memakai QRIS asli statis.'}; }
    const saved={...base,referenceNo:payment.referenceNo||id,qrContent:payment.qrContent||'',qrImage:method==='QRIS_STATIC_REAL'||!payment.qrContent?'/qris-madhayana-market.svg':'',paymentMode:payment.mode||method,responseCode:payment.responseCode||'',responseMessage:payment.responseMessage||'Invoice dibuat.',expiresAt:payment.expiresAt||''};
    try{
      const ref=await addDoc(collection(db,'orders'),saved);
      setInvoice({...saved,firestoreId:ref.id});
      setCart([]);
      setLoading(false);
    }catch(e){
      console.error(e); setLoading(false); alert('Gagal simpan Firestore. Cek Rules Firebase.');
    }
  }

  async function updateStatus(o,status){
    await updateDoc(doc(db,'orders',o.firestoreId),{status,updatedAt:serverTimestamp(),updatedAtText:new Date().toISOString()});
  }
  async function queryPayment(o){
    try{
      const res=await fetch('/api/dana/query-payment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(o)});
      const data=await res.json();
      if(data.status) await updateStatus(o,data.status);
      alert(`Status: ${data.status||data.latestTransactionStatus||'tidak terbaca'}\n${data.responseMessage||''}`);
    } catch { alert('Query payment belum aktif atau backend belum tersedia.'); }
  }

  function upsertProduct(product){
    const next={...product, id:product.id||`prd-${Date.now()}`, price:Number(product.price||0), rating:Number(product.rating||0), tags: typeof product.tags==='string' ? product.tags.split(',').map(x=>x.trim()).filter(Boolean) : product.tags};
    setProducts(prev => prev.some(p=>p.id===next.id) ? prev.map(p=>p.id===next.id?next:p) : [next,...prev]);
    setEditProduct(null);
  }
  const duplicateProduct = (p) => setProducts([{...p,id:`prd-${Date.now()}`,name:`${p.name} Copy`},...products]);
  const deleteProduct = (id) => confirm('Hapus produk ini?') && setProducts(products.filter(p=>p.id!==id));
  const updateComment = (id, patch) => setComments(comments.map(c=>c.id===id?{...c,...patch}:c));
  const deleteComment = (id) => setComments(comments.filter(c=>c.id!==id));

  return <div className={`app theme-${layout.theme}`} style={{'--round':`${layout.rounded}px`}}>
    <header className="topbar">
      <button className="brand" onClick={()=>setRole('user')}><img src="/logo.svg"/><span><b>Madhayana Market</b><small>Market Digital & Kreatif</small></span></button>
      <div className="search"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari produk, jenis, nama, harga..."/></div>
      <div className="nav" id="operator"><button className={role==='user'?'active':''} onClick={()=>setRole('user')}>User</button><button className={role==='operator'?'active':''} onClick={()=>setRole('operatorLogin')}>Operator</button>{user?<button onClick={logoutGoogle}><LogOut size={16}/>Logout</button>:<button onClick={loginWithGoogle}><UserCircle size={16}/>Google</button>}</div>
    </header>
    {role==='operatorLogin'?<OperatorLogin pin={pin} setPin={setPin} onEnter={()=>pin==='0123456'?setRole('operator'):alert('PIN salah')}/>:
    role==='operator'?<Operator orders={orders} stats={stats} updateStatus={updateStatus} queryPayment={queryPayment} sync={sync} back={()=>setRole('user')} products={products} setEditProduct={setEditProduct} duplicateProduct={duplicateProduct} deleteProduct={deleteProduct} comments={comments} updateComment={updateComment} deleteComment={deleteComment} layout={layout} setLayout={setLayout} banners={banners} setBanners={setBanners}/>:
    <User filtered={filtered} cat={cat} setCat={setCat} cart={cart} setCart={setCart} total={total} fee={fee} grandTotal={grandTotal} form={form} setForm={setForm} method={method} setMethod={setMethod} checkout={checkout} loading={loading} invoice={invoice} setInvoice={setInvoice} banners={banners} activeBanner={activeBanner} setActiveBanner={setActiveBanner} price={price} setPrice={setPrice} type={type} setType={setType} types={types} sort={sort} setSort={setSort} layout={layout} comments={comments} setCommentProduct={setCommentProduct}/>}
    {editProduct && <ProductModal product={editProduct} save={upsertProduct} close={()=>setEditProduct(null)}/>}
    {commentProduct && <CommentModal product={commentProduct} comments={comments.filter(c=>c.productId===commentProduct.id && c.status!=='hidden')} add={(c)=>setComments([{id:`c-${Date.now()}`, productId:commentProduct.id, pinned:false, status:'visible', replies:[], reports:[], ...c}, ...comments])} close={()=>setCommentProduct(null)}/>}
  </div>
}

function OperatorLogin({pin,setPin,onEnter}){return <section className="login card"><LockKeyhole size={44}/><h1>Login Operator</h1><p>Masuk untuk mengatur produk, komentar, banner, layout, dan order.</p><input type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="PIN operator" onKeyDown={e=>e.key==='Enter'&&onEnter()}/><button onClick={onEnter}>Masuk</button><small>Default: 0123456</small></section>}

function User(p){return <>
  <Hero banners={p.banners} active={p.activeBanner} setActive={p.setActiveBanner}/>
  <section className="categories">{categories.map(c=><button key={c.id} className={p.cat===c.id?'active':''} onClick={()=>p.setCat(c.id)}>{c.name}</button>)}</section>
  <section className="filters card">
    <SlidersHorizontal size={18}/><select value={p.price} onChange={e=>p.setPrice(e.target.value)}><option value="all">Semua Harga</option><option value="under50">Di bawah Rp50rb</option><option value="50to150">Rp50rb - Rp150rb</option><option value="above150">Di atas Rp150rb</option></select>
    <select value={p.type} onChange={e=>p.setType(e.target.value)}>{p.types.map(t=><option key={t} value={t}>{t==='all'?'Semua Jenis':t}</option>)}</select>
    <select value={p.sort} onChange={e=>p.setSort(e.target.value)}><option value="popular">Urutan Produk</option><option value="low">Harga Termurah</option><option value="high">Harga Tertinggi</option><option value="rating">Rating Tertinggi</option></select>
  </section>
  <main className="layout"><section id="products"><h2>Produk & Layanan</h2><div className={`grid col-${p.layout.columns}`}>{p.filtered.map(x=><ProductCard key={x.id} product={x} add={()=>p.setCart([...p.cart,x])} comments={p.comments.filter(c=>c.productId===x.id && c.status!=='hidden')} openComments={()=>p.setCommentProduct(x)}/>)}</div></section><Checkout {...p}/></main>
  {p.invoice&&<Invoice invoice={p.invoice} close={()=>p.setInvoice(null)}/>}
</>}

function Hero({banners, active, setActive}){
  const b=banners[active] || banners[0];
  return <section className="hero" style={{background:`linear-gradient(125deg, ${b.color}, #ffffff)`}}>
    <div><span><ShieldCheck size={16}/> Highlight otomatis dan bisa diklik</span><h1>{b.title}</h1><p>{b.subtitle}</p><div className="heroActions"><a href={b.target}>{b.cta}</a><a href="#products">Lihat Produk</a></div><div className="dots">{banners.map((_,i)=><button key={i} className={active===i?'active':''} onClick={()=>setActive(i)}/>)}</div></div>
    <div className="heroCard"><img src="/qris-madhayana-market.svg"/><b>MADHAYANA MARKET</b><small>NMID: ID1025461902120</small></div>
  </section>
}

function ProductCard({product, add, comments, openComments}){
  const pinned=comments.find(c=>c.pinned);
  return <article className="product card"><img src={product.image||'/logo.svg'} /><div className="productBody"><span>{product.type}</span><h3>{product.name}</h3><p>{product.description}</p><div className="rating"><Star size={16}/><b>{product.rating}</b><small>{comments.length} komentar</small></div>{pinned&&<p className="pinned">📌 {pinned.text}</p>}<div className="price"><strong>{rupiah(product.price)}</strong><small>Stok {product.stock}</small></div><div className="actions"><button onClick={add}>+ Keranjang</button><button className="ghost" onClick={openComments}><MessageCircle size={15}/>Komentar</button></div></div></article>
}

function Checkout(p){return <aside id="payment" className="checkout card"><h2><ShoppingBag/> Checkout</h2><label>Nama<input value={p.form.name} onChange={e=>p.setForm({...p.form,name:e.target.value})} placeholder="Nama customer"/></label><label>Nomor HP<input value={p.form.phone} onChange={e=>p.setForm({...p.form,phone:e.target.value})} placeholder="628xxxxxxxxxx"/></label><label>Email<input value={p.form.email} onChange={e=>p.setForm({...p.form,email:e.target.value})} placeholder="email@domain.com"/></label><h3>Metode Pembayaran</h3><div className="methods">{methods.map(m=>{const Icon=m.icon;return <button key={m.id} className={p.method===m.id?'active':''} onClick={()=>p.setMethod(m.id)}><Icon size={18}/><b>{m.title}</b><small>{m.subtitle}</small></button>})}</div><div className="cartList">{p.cart.length?p.cart.map((i,n)=><div key={n}><span>{i.name}</span><b>{rupiah(i.price)}</b><button onClick={()=>p.setCart(p.cart.filter((_,idx)=>idx!==n))}><Trash2 size={14}/></button></div>):<p>Keranjang masih kosong.</p>}</div><div className="total"><span>Subtotal</span><b>{rupiah(p.total)}</b><span>Biaya admin</span><b>{rupiah(p.fee)}</b><strong>Total</strong><strong>{rupiah(p.grandTotal)}</strong></div><button className="pay" disabled={p.loading} onClick={p.checkout}><CreditCard size={18}/>{p.loading?'Memproses...':'Buat Invoice & QRIS'}</button></aside>}

function Invoice({invoice,close}){const [qr,setQr]=useState('');useEffect(()=>{if(invoice.qrContent)QRCode.toDataURL(invoice.qrContent,{margin:1,width:360}).then(setQr);},[invoice.qrContent]);const img=invoice.qrImage||qr;return <div className="modal"><div className="invoice card"><button className="x" onClick={close}>×</button><h2><ReceiptText/> Invoice Pembayaran</h2><p className="order">{invoice.id}</p><div className="rows"><span>Nama</span><b>{invoice.customerName}</b><span>Total</span><b>{rupiah(invoice.grandTotal)}</b><span>Metode</span><b>{invoice.payMethodLabel}</b><span>Status</span><b>{invoice.status}</b></div>{img?<img className="qris" src={img}/>:<div className="emptyQr">QR belum tersedia</div>}<p className="note">Scan QRIS dengan DANA, GoPay, OVO, ShopeePay, mobile banking, atau aplikasi lain yang mendukung QRIS.</p><button onClick={()=>window.print()}><Download size={16}/> Cetak Invoice</button></div></div>}

function Operator({orders,stats,updateStatus,queryPayment,sync,back,products,setEditProduct,duplicateProduct,deleteProduct,comments,updateComment,deleteComment,layout,setLayout,banners,setBanners}){
  return <main className="operator"><div className="opHead"><div><h1>Dashboard Operator</h1><p>Sinkron: {sync}</p></div><button onClick={back}>Kembali</button></div>
  <section className="stats"><div><CheckCircle2/><span>Paid</span><b>{stats.paid}</b></div><div><Clock3/><span>Pending</span><b>{stats.pending}</b></div><div><XCircle/><span>Gagal</span><b>{stats.failed}</b></div><div><Store/><span>Omzet</span><b>{rupiah(stats.omzet)}</b></div></section>
  <section className="adminGrid">
    <div className="table card"><div className="sectionHead"><h2>Kelola Produk</h2><button onClick={()=>setEditProduct({...blankProduct})}><Plus size={16}/>Tambah</button></div><table><thead><tr><th>Produk</th><th>Harga</th><th>Rating</th><th>Aksi</th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td><b>{p.name}</b><small>{p.type}</small></td><td>{rupiah(p.price)}</td><td>{p.rating}</td><td><button onClick={()=>setEditProduct(p)}><Pencil size={13}/></button><button onClick={()=>duplicateProduct(p)}><CopyPlus size={13}/></button><button onClick={()=>deleteProduct(p.id)}><Trash2 size={13}/></button></td></tr>)}</tbody></table></div>
    <LayoutPanel layout={layout} setLayout={setLayout} banners={banners} setBanners={setBanners}/>
  </section>
  <section className="table card"><h2>Moderasi Komentar</h2><table><thead><tr><th>Komentar</th><th>Rating</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{comments.map(c=><tr key={c.id}><td><b>{c.name}</b><small>{c.text}</small>{c.reports?.length>0&&<small>Report: {c.reports.join(', ')}</small>}</td><td>{c.rating}</td><td>{c.pinned?'Pinned':c.status}</td><td><button onClick={()=>updateComment(c.id,{pinned:!c.pinned})}>{c.pinned?<PinOff size={13}/>:<Pin size={13}/>}</button><button onClick={()=>updateComment(c.id,{status:'hidden'})}><EyeOff size={13}/></button><button onClick={()=>updateComment(c.id,{status:'blocked'})}><Ban size={13}/></button><button onClick={()=>deleteComment(c.id)}><Trash2 size={13}/></button></td></tr>)}</tbody></table></section>
  <section className="table card"><h2>Order Masuk</h2><table><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Metode</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{orders.map(o=><tr key={o.firestoreId}><td><b>{o.id}</b><small>{dateText(o.createdAt||o.createdAtText)}</small></td><td>{o.customerName}<small>{o.customerPhone}</small></td><td>{rupiah(o.grandTotal||o.total)}</td><td>{o.payMethodLabel}</td><td><span className={`status ${String(o.status).toLowerCase()}`}>{o.status}</span></td><td><button onClick={()=>navigator.clipboard.writeText(o.id)}><Copy size={13}/></button><button onClick={()=>queryPayment(o)}><RefreshCcw size={13}/>Query</button><button onClick={()=>updateStatus(o,'PAID')}>Paid</button><button onClick={()=>updateStatus(o,'FAILED')}>Failed</button></td></tr>)}</tbody></table></section>
  </main>
}

function LayoutPanel({layout,setLayout,banners,setBanners}){
  return <div className="layoutPanel card"><h2><LayoutDashboard/> Tata Letak Web</h2><label>Theme<select value={layout.theme} onChange={e=>setLayout({...layout,theme:e.target.value})}><option value="bright">Cerah Market</option><option value="fresh">Fresh Green</option><option value="sunny">Sunny Orange</option></select></label><label>Kolom Produk<select value={layout.columns} onChange={e=>setLayout({...layout,columns:Number(e.target.value)})}><option value="2">2 Kolom</option><option value="3">3 Kolom</option><option value="4">4 Kolom</option></select></label><label>Rounded<input type="range" min="8" max="36" value={layout.rounded} onChange={e=>setLayout({...layout,rounded:Number(e.target.value)})}/></label><h3>Banner Iklan</h3>{banners.map((b,i)=><div className="bannerEdit" key={b.id}><input value={b.title} onChange={e=>setBanners(banners.map((x,idx)=>idx===i?{...x,title:e.target.value}:x))}/><input value={b.target} onChange={e=>setBanners(banners.map((x,idx)=>idx===i?{...x,target:e.target.value}:x))}/></div>)}</div>
}

function ProductModal({product,save,close}){const [p,setP]=useState(product);return <div className="modal"><div className="form card"><button className="x" onClick={close}>×</button><h2>Form Produk</h2><label>Nama Produk<input value={p.name} onChange={e=>setP({...p,name:e.target.value})}/></label><label>Gambar URL<input value={p.image} onChange={e=>setP({...p,image:e.target.value})} placeholder="https://..."/></label><label>Deskripsi<textarea value={p.description} onChange={e=>setP({...p,description:e.target.value})}/></label><label>Harga<input type="number" value={p.price} onChange={e=>setP({...p,price:e.target.value})}/></label><label>Rating<input type="number" step="0.1" min="0" max="5" value={p.rating} onChange={e=>setP({...p,rating:e.target.value})}/></label><label>Jenis<input value={p.type} onChange={e=>setP({...p,type:e.target.value})}/></label><label>Kategori<select value={p.category} onChange={e=>setP({...p,category:e.target.value})}>{categories.filter(c=>c.id!=='all').map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label><label>Tags<input value={Array.isArray(p.tags)?p.tags.join(', '):p.tags} onChange={e=>setP({...p,tags:e.target.value})}/></label><button onClick={()=>save(p)}>Simpan Produk</button></div></div>}

function CommentModal({product,comments,add,close}){const [c,setC]=useState({name:'',text:'',rating:5});return <div className="modal"><div className="form card"><button className="x" onClick={close}>×</button><h2>Komentar {product.name}</h2>{comments.map(x=><div className="comment" key={x.id}><b>{x.name} · {x.rating}★</b><p>{x.text}</p>{x.replies?.map(r=><small key={r}>Balasan: {r}</small>)}</div>)}<label>Nama<input value={c.name} onChange={e=>setC({...c,name:e.target.value})}/></label><label>Komentar<textarea value={c.text} onChange={e=>setC({...c,text:e.target.value})}/></label><label>Rating<input type="number" min="1" max="5" value={c.rating} onChange={e=>setC({...c,rating:Number(e.target.value)})}/></label><button onClick={()=>{add(c);close();}}>Kirim Komentar</button><button className="ghost" onClick={()=>alert('Pilihan laporan: spam, penipuan, ujaran kasar, konten tidak relevan, data pribadi.') }><Flag size={15}/>Laporkan</button></div></div>}

createRoot(document.getElementById('root')).render(<App/>);
