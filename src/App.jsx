import { useEffect, useMemo, useState } from 'react';
import { products, categories } from './data/products';
import { Search, ShoppingBag, ShieldCheck, UserCircle, LogOut, CreditCard, Trash2, CheckCircle2, Clock3, PackageCheck, WalletCards, Store, LockKeyhole, Copy, RefreshCcw, Smartphone, QrCode, BadgeCheck } from 'lucide-react';

const rupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0);
const orderKey = 'madhayana_markets_orders_v2';
const userKey = 'madhayana_markets_user_v2';

function loadOrders(){
  try { return JSON.parse(localStorage.getItem(orderKey) || '[]'); } catch { return []; }
}
function saveOrders(orders){ localStorage.setItem(orderKey, JSON.stringify(orders)); }
function makeOrderId(){ return `MM-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`; }

export default function App(){
  const [role, setRole] = useState('user');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [operatorPin, setOperatorPin] = useState('');
  const [checkoutState, setCheckoutState] = useState('idle');
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', email: '' });

  useEffect(() => {
    setOrders(loadOrders());
    try { setUser(JSON.parse(localStorage.getItem(userKey) || 'null')); } catch {}
  }, []);

  function commitOrders(next){ setOrders(next); saveOrders(next); }
  function fakeUserLogin(){
    const next = { displayName: customerForm.name || 'Madhayana User', phone: customerForm.phone || '', email: customerForm.email || '' };
    setUser(next); localStorage.setItem(userKey, JSON.stringify(next));
  }
  function logoutUser(){ setUser(null); localStorage.removeItem(userKey); }

  const filtered = useMemo(() => products.filter((p) => {
    const c = category === 'all' || p.category === category;
    const q = query.toLowerCase();
    const s = `${p.title} ${p.description} ${p.type} ${p.features.join(' ')}`.toLowerCase();
    return c && (!q || s.includes(q));
  }), [query, category]);

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const orderStats = useMemo(() => ({
    paid: orders.filter(o => o.status === 'PAID').length,
    pending: orders.filter(o => ['CREATED','PENDING','PAYING'].includes(o.status)).length,
    failed: orders.filter(o => ['FAILED','CANCELLED','EXPIRED'].includes(o.status)).length,
    omzet: orders.filter(o => o.status === 'PAID').reduce((s,o)=>s+o.total,0)
  }), [orders]);

  async function checkout(){
    if(!cart.length) return alert('Keranjang masih kosong.');
    if(!customerForm.name || !customerForm.phone) return alert('Isi nama dan nomor HP terlebih dahulu.');
    setCheckoutState('loading');
    const newOrder = {
      id: makeOrderId(),
      partnerReferenceNo: makeOrderId(),
      customer: customerForm,
      items: cart,
      total,
      status: 'CREATED',
      payMethod: 'DANA_DIRECT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/dana/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      const data = await res.json();
      const saved = { ...newOrder, status: data.status || 'PENDING', referenceNo: data.referenceNo, paymentUrl: data.redirectUrl, responseCode: data.responseCode, responseMessage: data.responseMessage };
      commitOrders([saved, ...orders]);
      setCart([]);
      fakeUserLogin();

      if(data.redirectUrl && data.mode !== 'mock') {
        window.location.href = data.redirectUrl;
        return;
      }

      setCheckoutState('success');
      // Mock Finish Notify: demo otomatis sukses tanpa cek manual.
      setTimeout(() => {
        const current = loadOrders();
        const updated = current.map(o => o.id === saved.id ? { ...o, status: 'PAID', paidAt: new Date().toISOString(), updatedAt: new Date().toISOString(), transactionStatusDesc: 'Mock DANA Finish Notify success' } : o);
        commitOrders(updated);
      }, 2400);
    } catch (error) {
      console.error(error);
      alert('Checkout gagal. Cek koneksi atau konfigurasi API DANA.');
    } finally { setCheckoutState('idle'); }
  }

  function openOperator(){
    if(operatorPin === '0123456') setRole('operator');
    else alert('Kredensial operator salah.');
  }

  function updateOrderStatus(id, status){
    commitOrders(orders.map(o => o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o));
  }

  return <div className="appShell">
    <header className="topbar">
      <button className="brand" onClick={() => setRole('user')}><img src="/logo.svg"/><span><strong>Madhayana Markets</strong><small>DANA Integrated Web Market</small></span></button>
      <div className="searchBox"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari produk digital, jasa, kelas, PPOB..." /></div>
      <nav className="roleSwitch">
        <button className={role==='user'?'active':''} onClick={()=>setRole('user')}>User</button>
        <button className={role==='operator'?'active':''} onClick={()=>setRole('operatorLogin')}>Operator</button>
      </nav>
    </header>

    {role === 'operatorLogin' ? <section className="operatorLogin card">
      <LockKeyhole size={42}/><h1>Login Operator</h1><p>Masuk untuk melihat order, status pembayaran otomatis, dan data transaksi.</p>
      <input type="password" value={operatorPin} onChange={e=>setOperatorPin(e.target.value)} placeholder="Masukkan kredensial operator" onKeyDown={e=>{ if(e.key==='Enter') openOperator(); }} />
      <button className="primary" onClick={openOperator}>Masuk Operator</button>
      <small>Kredensial default: 0123456</small>
    </section> : role === 'operator' ? <OperatorDashboard orders={orders} stats={orderStats} onStatus={updateOrderStatus} onBack={()=>setRole('user')} /> : <UserStore
      user={user} logoutUser={logoutUser} products={filtered} category={category} setCategory={setCategory} cart={cart} setCart={setCart} total={total}
      form={customerForm} setForm={setCustomerForm} checkout={checkout} checkoutState={checkoutState} orders={orders} />}
  </div>
}

function UserStore({ user, logoutUser, products, category, setCategory, cart, setCart, total, form, setForm, checkout, checkoutState, orders }){
  const latestOrder = orders[0];
  return <>
    <section className="hero">
      <div>
        <span className="eyebrow"><ShieldCheck size={16}/> Payment otomatis via DANA Notify</span>
        <h1>Web market lengkap untuk produk digital, jasa, kelas, PPOB, dan pembayaran DANA.</h1>
        <p>User bisa checkout langsung. Sistem siap memakai DANA Direct Debit / Payment Gateway dan webhook Finish Notify agar operator tidak perlu cek manual.</p>
        <div className="heroButtons"><a href="#products" className="primary">Belanja Sekarang</a><a href="#payment" className="secondary">Lihat Pembayaran</a></div>
      </div>
      <div className="heroPanel card">
        <div><QrCode/><strong>DANA Direct</strong><span>Redirect / deeplink ready</span></div>
        <div><BadgeCheck/><strong>Auto Notify</strong><span>Status update otomatis</span></div>
        <div><Store/><strong>2 Sisi</strong><span>User dan operator</span></div>
      </div>
    </section>

    <section className="categories">
      <button className={category==='all'?'active':''} onClick={()=>setCategory('all')}>Semua</button>
      {categories.map(c=><button key={c.id} className={category===c.id?'active':''} onClick={()=>setCategory(c.id)}>{c.name}</button>)}
    </section>

    <main id="products" className="marketLayout">
      <div>
        <div className="sectionTitle"><h2>Produk & Layanan</h2><p>{products.length} item tersedia.</p></div>
        <div className="productGrid">{products.map(product => <ProductCard key={product.id} product={product} onAdd={()=>setCart([...cart, product])}/>)}</div>
      </div>
      <aside id="payment" className="cart card">
        <div className="cartTitle"><ShoppingBag/><h2>Checkout</h2></div>
        {!user ? <div className="miniLogin"><UserCircle/><p>Isi data customer. Sistem mendukung direct user tanpa operator.</p></div> : <div className="userMini"><strong>{user.displayName}</strong><span>{user.phone}</span><button onClick={logoutUser}><LogOut size={14}/> Logout</button></div>}
        <label>Nama Customer<input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Nama lengkap" /></label>
        <label>Nomor HP DANA<input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="628xxxxxxxxxx" /></label>
        <label>Email<input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="email@domain.com" /></label>
        <div className="cartList">{cart.length ? cart.map((item, i) => <div className="cartItem" key={`${item.id}-${i}`}><span>{item.title}</span><b>{rupiah(item.price)}</b><button onClick={()=>setCart(cart.filter((_,idx)=>idx!==i))}><Trash2 size={14}/></button></div>) : <p className="muted">Keranjang masih kosong.</p>}</div>
        <div className="cartTotal"><span>Total</span><strong>{rupiah(total)}</strong></div>
        <button className="checkout" disabled={checkoutState==='loading'} onClick={checkout}><CreditCard size={18}/>{checkoutState === 'loading' ? 'Memproses...' : 'Bayar Otomatis via DANA'}</button>
        <p className="smallNote">Mode sandbox/mock akan otomatis mengubah status menjadi PAID untuk simulasi Finish Notify.</p>
        {latestOrder && <div className="latestOrder"><strong>Order terbaru</strong><span>{latestOrder.id}</span><StatusBadge status={latestOrder.status}/></div>}
      </aside>
    </main>
  </>
}

function ProductCard({ product, onAdd }){
  return <article className="product card">
    <div className="productHead"><span>{product.badge}</span><b>{product.rating} ★</b></div>
    <h3>{product.title}</h3><p>{product.description}</p>
    <ul>{product.features.map(f => <li key={f}>{f}</li>)}</ul>
    <div className="price"><small>{product.type}</small><strong>{rupiah(product.price)}</strong></div>
    <button onClick={onAdd} className="add">+ Tambah ke Keranjang</button>
  </article>
}

function OperatorDashboard({ orders, stats, onStatus, onBack }){
  return <main className="operatorPage">
    <div className="operatorHead"><div><h1>Dashboard Operator</h1><p>Monitoring pembayaran DANA otomatis, order user, dan status transaksi.</p></div><button onClick={onBack} className="secondary">Kembali ke User</button></div>
    <section className="statsGrid">
      <div className="stat card"><CheckCircle2/><span>Paid</span><strong>{stats.paid}</strong></div>
      <div className="stat card"><Clock3/><span>Pending</span><strong>{stats.pending}</strong></div>
      <div className="stat card"><PackageCheck/><span>Order</span><strong>{orders.length}</strong></div>
      <div className="stat card"><WalletCards/><span>Omzet Paid</span><strong>{rupiah(stats.omzet)}</strong></div>
    </section>
    <section className="orders card">
      <div className="ordersHead"><h2>Daftar Order</h2><button onClick={()=>location.reload()}><RefreshCcw size={16}/> Refresh</button></div>
      {!orders.length ? <p className="muted">Belum ada order.</p> : <div className="tableWrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Reference</th><th>Aksi</th></tr></thead><tbody>{orders.map(o => <tr key={o.id}>
        <td><b>{o.id}</b><small>{new Date(o.createdAt).toLocaleString('id-ID')}</small></td>
        <td>{o.customer?.name}<small>{o.customer?.phone}</small></td>
        <td>{rupiah(o.total)}</td><td><StatusBadge status={o.status}/></td>
        <td><code>{o.referenceNo || o.partnerReferenceNo}</code><button className="copy" onClick={()=>navigator.clipboard?.writeText(o.referenceNo || o.partnerReferenceNo)}><Copy size={13}/></button></td>
        <td className="rowActions"><button onClick={()=>onStatus(o.id,'PAID')}>Paid</button><button onClick={()=>onStatus(o.id,'PENDING')}>Pending</button><button onClick={()=>onStatus(o.id,'FAILED')}>Failed</button></td>
      </tr>)}</tbody></table></div>}
    </section>
  </main>
}

function StatusBadge({ status }){
  const safe = status || 'CREATED';
  return <span className={`status ${safe.toLowerCase()}`}>{safe}</span>
}
