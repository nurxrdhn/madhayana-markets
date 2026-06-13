import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import QRCode from 'qrcode';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, listenAuth, loginWithGoogle, logoutGoogle } from './firebase';
import { products, categories } from './products';
import { Search, ShoppingBag, Trash2, CreditCard, QrCode, CheckCircle2, Clock3, XCircle, RefreshCcw, Copy, ShieldCheck, UserCircle, LogOut, ReceiptText, Store, Banknote, Smartphone, Landmark, LockKeyhole, Download } from 'lucide-react';
import './styles.css';

const rupiah = (n) => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n||0));
const makeId = () => `MM-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
const dateText = (v) => v?.toDate ? v.toDate().toLocaleString('id-ID') : (v ? new Date(v).toLocaleString('id-ID') : '-');

const methods = [
  { id:'QRIS_STATIC_REAL', title:'QRIS Madhayana Market', subtitle:'QRIS asli NMID ID1025461902120. Bisa dipakai sekarang.', icon:QrCode },
  { id:'DANA_QRIS_MPM', title:'DANA QRIS MPM Dinamis', subtitle:'Generate QRIS API + Finish Notify otomatis setelah DANA approve.', icon:ShieldCheck },
  { id:'EWALLET', title:'E-Wallet', subtitle:'DANA, OVO, GoPay, ShopeePay lewat QRIS.', icon:Smartphone },
  { id:'VA_BANK', title:'Virtual Account', subtitle:'Disiapkan untuk gateway bank.', icon:Landmark },
  { id:'PAY_COUNTER', title:'Bayar di Kasir', subtitle:'Nomor order muncul, operator proses manual.', icon:Banknote }
];

function App(){
  const [role,setRole]=useState('user');
  const [search,setSearch]=useState('');
  const [cat,setCat]=useState('all');
  const [cart,setCart]=useState([]);
  const [orders,setOrders]=useState([]);
  const [user,setUser]=useState(null);
  const [pin,setPin]=useState('');
  const [form,setForm]=useState({name:'',phone:'',email:''});
  const [method,setMethod]=useState('QRIS_STATIC_REAL');
  const [invoice,setInvoice]=useState(null);
  const [loading,setLoading]=useState(false);
  const [sync,setSync]=useState('Firestore');

  useEffect(()=>listenAuth(setUser),[]);
  useEffect(()=>{
    const q=query(collection(db,'orders'),orderBy('createdAt','desc'));
    return onSnapshot(q,s=>{setOrders(s.docs.map(d=>({firestoreId:d.id,...d.data()})));setSync('Firestore');},err=>{console.warn(err);setSync('Firestore error');});
  },[]);

  const filtered=useMemo(()=>products.filter(p=>cat==='all'||p.category===cat).filter(p=>`${p.title} ${p.description} ${p.features.join(' ')}`.toLowerCase().includes(search.toLowerCase())),[cat,search]);
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
    const saved={...base,referenceNo:payment.referenceNo||id,qrContent:payment.qrContent||'',qrImage:method==='QRIS_STATIC_REAL'||!payment.qrContent?'/qris-madhayana-market.jpg':'',paymentMode:payment.mode||method,responseCode:payment.responseCode||'',responseMessage:payment.responseMessage||'Invoice dibuat.',expiresAt:payment.expiresAt||''};
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
    const res=await fetch('/api/dana/query-payment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(o)});
    const data=await res.json();
    if(data.status) await updateStatus(o,data.status);
    alert(`Status: ${data.status||data.latestTransactionStatus||'tidak terbaca'}\n${data.responseMessage||''}`);
  }

  return <div><header className="topbar"><button className="brand" onClick={()=>setRole('user')}><img src="/logo.svg"/><span><b>Madhayana Market</b><small>QRIS asli + DANA QRIS MPM</small></span></button><div className="search"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari produk digital, jasa, kelas, PPOB..."/></div><div className="nav"><button className={role==='user'?'active':''} onClick={()=>setRole('user')}>User</button><button className={role==='operator'?'active':''} onClick={()=>setRole('operatorLogin')}>Operator</button>{user?<button onClick={logoutGoogle}><LogOut size={16}/>Logout</button>:<button onClick={loginWithGoogle}><UserCircle size={16}/>Google</button>}</div></header>
  {role==='operatorLogin'?<OperatorLogin pin={pin} setPin={setPin} onEnter={()=>pin==='0123456'?setRole('operator'):alert('PIN salah')}/>:role==='operator'?<Operator orders={orders} stats={stats} updateStatus={updateStatus} queryPayment={queryPayment} sync={sync} back={()=>setRole('user')}/>:<User filtered={filtered} cat={cat} setCat={setCat} cart={cart} setCart={setCart} total={total} fee={fee} grandTotal={grandTotal} form={form} setForm={setForm} method={method} setMethod={setMethod} checkout={checkout} loading={loading} invoice={invoice} setInvoice={setInvoice}/>} </div>
}

function OperatorLogin({pin,setPin,onEnter}){return <section className="login card"><LockKeyhole size={44}/><h1>Login Operator</h1><p>Masuk untuk memantau order, QRIS, dan status pembayaran.</p><input type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="PIN operator" onKeyDown={e=>e.key==='Enter'&&onEnter()}/><button onClick={onEnter}>Masuk</button><small>Default: 0123456</small></section>}

function User(p){return <><section className="hero"><div><span><ShieldCheck size={16}/> QRIS asli Madhayana Market aktif</span><h1>Checkout seperti restoran modern. User pilih produk, invoice muncul, lalu bayar QRIS.</h1><p>Versi ini memakai QRIS asli milik Madhayana Market sebagai pembayaran langsung. DANA QRIS MPM dinamis juga sudah disiapkan untuk production setelah credential DANA aktif.</p><div className="heroActions"><a href="#products">Belanja Sekarang</a><a href="#pay">Lihat QRIS</a></div></div><div className="heroCard"><img src="/qris-madhayana-market.jpg"/><b>MADHAYANA MARKET, DIGITAL & KREATIF</b><small>NMID: ID1025461902120</small></div></section><section className="categories">{categories.map(c=><button key={c.id} className={p.cat===c.id?'active':''} onClick={()=>p.setCat(c.id)}>{c.name}</button>)}</section><main className="layout"><section id="products"><h2>Produk & Layanan</h2><div className="grid">{p.filtered.map(x=><article className="product card" key={x.id}><span>{x.badge}</span><h3>{x.title}</h3><p>{x.description}</p><ul>{x.features.map(f=><li key={f}>{f}</li>)}</ul><div><small>{x.type}</small><b>{rupiah(x.price)}</b></div><button onClick={()=>p.setCart([...p.cart,x])}>+ Keranjang</button></article>)}</div></section><aside id="pay" className="checkout card"><h2><ShoppingBag/> Checkout</h2><label>Nama<input value={p.form.name} onChange={e=>p.setForm({...p.form,name:e.target.value})} placeholder="Nama customer"/></label><label>Nomor HP<input value={p.form.phone} onChange={e=>p.setForm({...p.form,phone:e.target.value})} placeholder="628xxxxxxxxxx"/></label><label>Email<input value={p.form.email} onChange={e=>p.setForm({...p.form,email:e.target.value})} placeholder="email@domain.com"/></label><h3>Metode Pembayaran</h3><div className="methods">{methods.map(m=>{const Icon=m.icon;return <button key={m.id} className={p.method===m.id?'active':''} onClick={()=>p.setMethod(m.id)}><Icon size={18}/><b>{m.title}</b><small>{m.subtitle}</small></button>})}</div><div className="cartList">{p.cart.length?p.cart.map((i,n)=><div key={n}><span>{i.title}</span><b>{rupiah(i.price)}</b><button onClick={()=>p.setCart(p.cart.filter((_,idx)=>idx!==n))}><Trash2 size={14}/></button></div>):<p>Keranjang masih kosong.</p>}</div><div className="total"><span>Subtotal</span><b>{rupiah(p.total)}</b><span>Biaya admin</span><b>{rupiah(p.fee)}</b><strong>Total</strong><strong>{rupiah(p.grandTotal)}</strong></div><button className="pay" disabled={p.loading} onClick={p.checkout}><CreditCard size={18}/>{p.loading?'Memproses...':'Buat Invoice & QRIS'}</button></aside></main>{p.invoice&&<Invoice invoice={p.invoice} close={()=>p.setInvoice(null)}/>}</>}

function Invoice({invoice,close}){const [qr,setQr]=useState('');useEffect(()=>{if(invoice.qrContent)QRCode.toDataURL(invoice.qrContent,{margin:1,width:360}).then(setQr);},[invoice.qrContent]);const img=invoice.qrImage||qr;return <div className="modal"><div className="invoice card"><button className="x" onClick={close}>×</button><h2><ReceiptText/> Invoice Pembayaran</h2><p className="order">{invoice.id}</p><div className="rows"><span>Nama</span><b>{invoice.customerName}</b><span>Total</span><b>{rupiah(invoice.grandTotal)}</b><span>Metode</span><b>{invoice.payMethodLabel}</b><span>Status</span><b>{invoice.status}</b></div>{img?<img className="qris" src={img}/>:<div className="emptyQr">QR belum tersedia</div>}<p className="note">Scan QRIS dengan DANA, GoPay, OVO, ShopeePay, mobile banking, atau aplikasi lain yang mendukung QRIS. Setelah bayar, operator bisa mengubah status atau DANA Finish Notify akan update otomatis jika credential aktif.</p><button onClick={()=>window.print()}><Download size={16}/> Cetak Invoice</button></div></div>}

function Operator({orders,stats,updateStatus,queryPayment,sync,back}){return <main className="operator"><div className="opHead"><div><h1>Dashboard Operator</h1><p>Sinkron: {sync}</p></div><button onClick={back}>Kembali</button></div><section className="stats"><div><CheckCircle2/><span>Paid</span><b>{stats.paid}</b></div><div><Clock3/><span>Pending</span><b>{stats.pending}</b></div><div><XCircle/><span>Gagal</span><b>{stats.failed}</b></div><div><Store/><span>Omzet</span><b>{rupiah(stats.omzet)}</b></div></section><section className="table card"><h2>Order Masuk</h2><table><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Metode</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{orders.map(o=><tr key={o.firestoreId}><td><b>{o.id}</b><small>{dateText(o.createdAt||o.createdAtText)}</small></td><td>{o.customerName}<small>{o.customerPhone}</small></td><td>{rupiah(o.grandTotal||o.total)}</td><td>{o.payMethodLabel}</td><td><span className={`status ${String(o.status).toLowerCase()}`}>{o.status}</span></td><td><button onClick={()=>navigator.clipboard.writeText(o.id)}><Copy size={13}/></button><button onClick={()=>queryPayment(o)}><RefreshCcw size={13}/>Query</button><button onClick={()=>updateStatus(o,'PAID')}>Paid</button><button onClick={()=>updateStatus(o,'FAILED')}>Failed</button></td></tr>)}</tbody></table></section></main>}

createRoot(document.getElementById('root')).render(<App/>);
