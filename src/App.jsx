import { useEffect, useMemo, useState } from 'react';
import { products, categories } from './data/products';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query as fsQuery, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Search, ShoppingBag, ShieldCheck, UserCircle, LogOut, CreditCard, Trash2, CheckCircle2, Clock3, PackageCheck, WalletCards, Store, LockKeyhole, Copy, RefreshCcw, QrCode, BadgeCheck, Smartphone, Landmark, Banknote, ReceiptText, Check, X } from 'lucide-react';

const rupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0);
const userKey = 'madhayana_markets_user_v3';
const localOrderKey = 'madhayana_markets_orders_fallback_v3';

const paymentMethods = [
  { id: 'DANA_QRIS', title: 'DANA / QRIS', subtitle: 'Scan QRIS atau lanjut ke DANA', icon: QrCode, badge: 'Rekomendasi' },
  { id: 'EWALLET', title: 'E-Wallet', subtitle: 'DANA, OVO, GoPay, ShopeePay', icon: Smartphone, badge: 'Cepat' },
  { id: 'VA_BANK', title: 'Virtual Account', subtitle: 'BCA, BRI, BNI, Mandiri', icon: Landmark, badge: 'Bank' },
  { id: 'PAY_AT_COUNTER', title: 'Bayar di Kasir', subtitle: 'Nomor order tampil seperti restoran', icon: Banknote, badge: 'Outlet' }
];

function makeOrderId(){ return `MM-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`; }
function safeDate(value){
  if(!value) return '-';
  if(value?.toDate) return value.toDate().toLocaleString('id-ID');
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString('id-ID');
}
function readLocalOrders(){ try { return JSON.parse(localStorage.getItem(localOrderKey) || '[]'); } catch { return []; } }
function writeLocalOrders(data){ localStorage.setItem(localOrderKey, JSON.stringify(data)); }

export default function App(){
  const [role, setRole] = useState('user');
  const [queryText, setQueryText] = useState('');
  const [category, setCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [operatorPin, setOperatorPin] = useState('');
  const [checkoutState, setCheckoutState] = useState('idle');
  const [selectedPayment, setSelectedPayment] = useState('DANA_QRIS');
  const [invoice, setInvoice] = useState(null);
  const [syncMode, setSyncMode] = useState('firebase');
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', email: '' });

  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem(userKey) || 'null')); } catch {}

    const q = fsQuery(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((item) => ({ firestoreId: item.id, ...item.data() }));
      setOrders(data);
      setSyncMode('firebase');
    }, (error) => {
      console.warn('Firestore fallback aktif:', error?.message);
      setOrders(readLocalOrders());
      setSyncMode('local');
    });

    return () => unsubscribe();
  }, []);

  function saveUser(){
    const next = { displayName: customerForm.name || 'Madhayana User', phone: customerForm.phone || '', email: customerForm.email || '' };
    setUser(next); localStorage.setItem(userKey, JSON.stringify(next));
  }
  function logoutUser(){ setUser(null); localStorage.removeItem(userKey); }

  const filtered = useMemo(() => products.filter((p) => {
    const matchCategory = category === 'all' || p.category === category;
    const q = queryText.toLowerCase();
    const text = `${p.title} ${p.description} ${p.type} ${p.features.join(' ')}`.toLowerCase();
    return matchCategory && (!q || text.includes(q));
  }), [queryText, category]);

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const adminFee = selectedPayment === 'PAY_AT_COUNTER' ? 0 : 1000;
  const grandTotal = total + (cart.length ? adminFee : 0);

  const orderStats = useMemo(() => ({
    paid: orders.filter(o => o.status === 'PAID').length,
    pending: orders.filter(o => ['CREATED','PENDING','PAYING','WAITING_PAYMENT'].includes(o.status)).length,
    failed: orders.filter(o => ['FAILED','CANCELLED','EXPIRED'].includes(o.status)).length,
    omzet: orders.filter(o => o.status === 'PAID').reduce((s,o)=>s+(o.grandTotal || o.total || 0),0)
  }), [orders]);

  async function persistOrder(order){
    if(syncMode === 'local') {
      const next = [order, ...readLocalOrders()];
      writeLocalOrders(next); setOrders(next); return { id: order.id, local: true };
    }
    return await addDoc(collection(db, 'orders'), order);
  }

  async function checkout(){
    if(!cart.length) return alert('Keranjang masih kosong.');
    if(!customerForm.name || !customerForm.phone) return alert('Isi nama dan nomor HP terlebih dahulu.');

    setCheckoutState('loading');
    const orderId = makeOrderId();
    const method = paymentMethods.find(m => m.id === selectedPayment);
    const newOrder = {
      id: orderId,
      partnerReferenceNo: makeOrderId(),
      customer: customerForm,
      customerName: customerForm.name,
      customerPhone: customerForm.phone,
      customerEmail: customerForm.email,
      items: cart,
      total,
      adminFee,
      grandTotal,
      status: selectedPayment === 'PAY_AT_COUNTER' ? 'WAITING_PAYMENT' : 'PENDING',
      payMethod: selectedPayment,
      payMethodLabel: method?.title || selectedPayment,
      source: 'Madhayana Markets - Gacoan Style Checkout',
      createdAt: serverTimestamp(),
      createdAtText: new Date().toISOString(),
      updatedAt: serverTimestamp(),
      updatedAtText: new Date().toISOString()
    };

    try {
      let danaData = null;
      if(selectedPayment !== 'PAY_AT_COUNTER') {
        try {
          const res = await fetch('/api/dana/create-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newOrder)
          });
          danaData = await res.json();
        } catch {
          danaData = { mode: 'mock', status: 'PENDING', responseMessage: 'Mock payment aktif. API DANA belum aktif.' };
        }
      }

      const saved = {
        ...newOrder,
        status: danaData?.status || newOrder.status,
        referenceNo: danaData?.referenceNo || orderId,
        paymentUrl: danaData?.redirectUrl || '',
        qrPayload: danaData?.qrPayload || `QRIS-MOCK-${orderId}-${grandTotal}`,
        responseCode: danaData?.responseCode || '',
        responseMessage: danaData?.responseMessage || 'Order dibuat.'
      };

      const ref = await persistOrder(saved);
      setCart([]);
      saveUser();
      setInvoice({ ...saved, firestoreId: ref.id });

      if(danaData?.redirectUrl && danaData.mode !== 'mock') {
        window.location.href = danaData.redirectUrl;
        return;
      }

      setCheckoutState('success');
      if(selectedPayment !== 'PAY_AT_COUNTER' && !ref.local) {
        setTimeout(async () => {
          await updateDoc(doc(db, 'orders', ref.id), {
            status: 'PAID', paidAt: serverTimestamp(), updatedAt: serverTimestamp(), updatedAtText: new Date().toISOString(), transactionStatusDesc: 'Mock auto paid seperti notifikasi payment gateway.'
          });
        }, 2600);
      }
    } catch (error) {
      console.error(error);
      alert('Checkout gagal. Cek koneksi Firebase, Rules Firestore, atau API DANA.');
    } finally { setCheckoutState('idle'); }
  }

  function openOperator(){
    if(operatorPin === '0123456') setRole('operator');
    else alert('Kredensial operator salah.');
  }

  async function updateOrderStatus(order, status){
    if(order.firestoreId) {
      await updateDoc(doc(db, 'orders', order.firestoreId), { status, updatedAt: serverTimestamp(), updatedAtText: new Date().toISOString() });
      return;
    }
    const next = orders.map(o => o.id === order.id ? { ...o, status, updatedAtText: new Date().toISOString() } : o);
    setOrders(next); writeLocalOrders(next);
  }

  return <div className="appShell">
    <header className="topbar">
      <button className="brand" onClick={() => setRole('user')}><img src="/logo.svg"/><span><strong>Madhayana Markets</strong><small>Restaurant-style Payment Flow</small></span></button>
      <div className="searchBox"><Search size={18}/><input value={queryText} onChange={e=>setQueryText(e.target.value)} placeholder="Cari produk digital, jasa, kelas, PPOB..." /></div>
      <nav className="roleSwitch"><button className={role==='user'?'active':''} onClick={()=>setRole('user')}>User</button><button className={role==='operator'?'active':''} onClick={()=>setRole('operatorLogin')}>Operator</button></nav>
    </header>

    {role === 'operatorLogin' ? <section className="operatorLogin card">
      <LockKeyhole size={42}/><h1>Login Operator</h1><p>Masuk untuk melihat order, metode pembayaran, status otomatis, dan omzet.</p>
      <input type="password" value={operatorPin} onChange={e=>setOperatorPin(e.target.value)} placeholder="Masukkan kredensial operator" onKeyDown={e=>{ if(e.key==='Enter') openOperator(); }} />
      <button className="primary" onClick={openOperator}>Masuk Operator</button><small>Kredensial default: 0123456</small>
    </section> : role === 'operator' ? <OperatorDashboard orders={orders} stats={orderStats} onStatus={updateOrderStatus} onBack={()=>setRole('user')} syncMode={syncMode} /> : <UserStore
      user={user} logoutUser={logoutUser} products={filtered} category={category} setCategory={setCategory} cart={cart} setCart={setCart} total={total} adminFee={adminFee} grandTotal={grandTotal}
      form={customerForm} setForm={setCustomerForm} checkout={checkout} checkoutState={checkoutState} orders={orders} paymentMethods={paymentMethods} selectedPayment={selectedPayment} setSelectedPayment={setSelectedPayment} invoice={invoice} setInvoice={setInvoice} syncMode={syncMode} />}
  </div>
}

function UserStore({ user, logoutUser, products, category, setCategory, cart, setCart, total, adminFee, grandTotal, form, setForm, checkout, checkoutState, orders, paymentMethods, selectedPayment, setSelectedPayment, invoice, setInvoice, syncMode }){
  const latestOrder = orders[0];
  return <>
    <section className="hero">
      <div>
        <span className="eyebrow"><ShieldCheck size={16}/> Alur bayar cepat seperti restoran modern</span>
        <h1>Pilih produk, pilih metode pembayaran, lalu sistem membuat nomor order dan invoice otomatis.</h1>
        <p>Checkout dibuat seperti konsep pembayaran Mie Gacoan: customer pilih metode, dapat nomor order, QRIS/VA tampil, status masuk ke operator tanpa cek manual.</p>
        <div className="heroButtons"><a href="#products" className="primary">Belanja Sekarang</a><a href="#payment" className="secondary">Lihat Pembayaran</a></div>
      </div>
      <div className="heroPanel card">
        <div><QrCode/><strong>QRIS & DANA</strong><span>Scan/redirect ready</span></div>
        <div><ReceiptText/><strong>Nomor Order</strong><span>Invoice otomatis</span></div>
        <div><Store/><strong>Operator</strong><span>Monitoring transaksi</span></div>
      </div>
    </section>

    <section className="categories"><button className={category==='all'?'active':''} onClick={()=>setCategory('all')}>Semua</button>{categories.map(c=><button key={c.id} className={category===c.id?'active':''} onClick={()=>setCategory(c.id)}>{c.name}</button>)}</section>

    <main id="products" className="marketLayout">
      <div>
        <div className="sectionTitle"><h2>Produk & Layanan</h2><p>{products.length} item tersedia. Data order: {syncMode === 'firebase' ? 'Firestore' : 'Local fallback'}.</p></div>
        <div className="productGrid">{products.map(product => <ProductCard key={product.id} product={product} onAdd={()=>setCart([...cart, product])}/>)}</div>
      </div>
      <aside id="payment" className="cart card">
        <div className="cartTitle"><ShoppingBag/><h2>Checkout</h2></div>
        {!user ? <div className="miniLogin"><UserCircle/><p>Isi data customer. Order akan dibuat langsung tanpa operator.</p></div> : <div className="userMini"><strong>{user.displayName}</strong><span>{user.phone}</span><button onClick={logoutUser}><LogOut size={14}/> Logout</button></div>}
        <label>Nama Customer<input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Nama lengkap" /></label>
        <label>Nomor HP<input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="628xxxxxxxxxx" /></label>
        <label>Email<input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="email@domain.com" /></label>

        <div className="paymentTitle"><h3>Metode Pembayaran</h3><span>Pilih salah satu</span></div>
        <div className="paymentGrid">{paymentMethods.map((m) => { const Icon = m.icon; return <button key={m.id} className={selectedPayment===m.id?'payMethod active':'payMethod'} onClick={()=>setSelectedPayment(m.id)}><Icon size={20}/><span><b>{m.title}</b><small>{m.subtitle}</small></span><em>{m.badge}</em>{selectedPayment===m.id && <Check size={17}/>}</button> })}</div>

        <div className="cartList">{cart.length ? cart.map((item, i) => <div className="cartItem" key={`${item.id}-${i}`}><span>{item.title}</span><b>{rupiah(item.price)}</b><button onClick={()=>setCart(cart.filter((_,idx)=>idx!==i))}><Trash2 size={14}/></button></div>) : <p className="muted">Keranjang masih kosong.</p>}</div>
        <div className="billBox"><div><span>Subtotal</span><b>{rupiah(total)}</b></div><div><span>Biaya layanan</span><b>{rupiah(cart.length ? adminFee : 0)}</b></div><div className="grand"><span>Total Bayar</span><strong>{rupiah(grandTotal)}</strong></div></div>
        <button className="checkout" disabled={checkoutState==='loading'} onClick={checkout}><CreditCard size={18}/>{checkoutState === 'loading' ? 'Membuat Invoice...' : 'Buat Order & Bayar'}</button>
        <p className="smallNote">Mode mock otomatis mengubah DANA/QRIS menjadi PAID. Bayar di Kasir tetap WAITING_PAYMENT.</p>
        {latestOrder && <div className="latestOrder"><strong>Order terbaru</strong><span>{latestOrder.id}</span><StatusBadge status={latestOrder.status}/></div>}
      </aside>
    </main>
    {invoice && <InvoiceModal invoice={invoice} onClose={()=>setInvoice(null)} />}
  </>
}

function InvoiceModal({ invoice, onClose }){
  return <div className="modalBackdrop"><div className="invoiceModal card"><button className="closeBtn" onClick={onClose}><X size={18}/></button><div className="invoiceHeader"><ReceiptText size={34}/><div><h2>Invoice Pembayaran</h2><p>Simpan nomor order ini untuk operator.</p></div></div><div className="orderNumber">{invoice.id}</div><div className="fakeQr"><QrCode size={86}/><span>{invoice.payMethodLabel}</span></div><div className="invoiceRows"><div><span>Customer</span><b>{invoice.customer?.name}</b></div><div><span>Metode</span><b>{invoice.payMethodLabel}</b></div><div><span>Total</span><b>{rupiah(invoice.grandTotal || invoice.total)}</b></div><div><span>Status</span><StatusBadge status={invoice.status}/></div></div>{invoice.paymentUrl ? <a className="primary wide" href={invoice.paymentUrl}>Lanjut ke Pembayaran</a> : <button className="primary wide" onClick={onClose}>Selesai</button>}</div></div>
}

function ProductCard({ product, onAdd }){
  return <article className="product card"><div className="productHead"><span>{product.badge}</span><b>{product.rating} ★</b></div><h3>{product.title}</h3><p>{product.description}</p><ul>{product.features.map(f => <li key={f}>{f}</li>)}</ul><div className="price"><small>{product.type}</small><strong>{rupiah(product.price)}</strong></div><button onClick={onAdd} className="add">+ Tambah ke Keranjang</button></article>
}

function OperatorDashboard({ orders, stats, onStatus, onBack, syncMode }){
  return <main className="operatorPage"><div className="operatorHead"><div><h1>Dashboard Operator</h1><p>Monitoring order, metode pembayaran, dan status transaksi. Sumber data: {syncMode === 'firebase' ? 'Firestore' : 'Local fallback'}.</p></div><button onClick={onBack} className="secondary">Kembali ke User</button></div><section className="statsGrid"><div className="stat card"><CheckCircle2/><span>Paid</span><strong>{stats.paid}</strong></div><div className="stat card"><Clock3/><span>Pending</span><strong>{stats.pending}</strong></div><div className="stat card"><PackageCheck/><span>Order</span><strong>{orders.length}</strong></div><div className="stat card"><WalletCards/><span>Omzet Paid</span><strong>{rupiah(stats.omzet)}</strong></div></section><section className="orders card"><div className="ordersHead"><h2>Daftar Order</h2><button onClick={()=>location.reload()}><RefreshCcw size={16}/> Refresh</button></div>{!orders.length ? <p className="muted">Belum ada order.</p> : <div className="tableWrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Metode</th><th>Status</th><th>Reference</th><th>Aksi</th></tr></thead><tbody>{orders.map(o => <tr key={o.firestoreId || o.id}><td><b>{o.id}</b><small>{safeDate(o.createdAt) !== '-' ? safeDate(o.createdAt) : safeDate(o.createdAtText)}</small></td><td>{o.customer?.name || o.customerName || '-'}<small>{o.customer?.phone || o.customerPhone || '-'}</small></td><td>{rupiah(o.grandTotal || o.total)}</td><td><b>{o.payMethodLabel || o.payMethod}</b><small>{(o.items || []).length} item</small></td><td><StatusBadge status={o.status}/></td><td><code>{o.referenceNo || o.partnerReferenceNo || '-'}</code><button className="copy" onClick={()=>navigator.clipboard?.writeText(o.referenceNo || o.partnerReferenceNo || '')}><Copy size={13}/></button></td><td className="rowActions"><button onClick={()=>onStatus(o,'PAID')}>Paid</button><button onClick={()=>onStatus(o,'PENDING')}>Pending</button><button onClick={()=>onStatus(o,'FAILED')}>Failed</button></td></tr>)}</tbody></table></div>}</section></main>
}

function StatusBadge({ status }){
  const safe = status || 'CREATED';
  return <span className={`status ${safe.toLowerCase()}`}>{safe}</span>
}
