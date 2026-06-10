import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logout } from './firebase';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import CartPanel from './components/CartPanel';
import PPOBSection from './components/PPOBSection';
import { categories, products } from './data/products';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const filteredProducts = useMemo(() => products.filter(product => {
    const matchCategory = activeCategory === 'all' || product.category === activeCategory;
    const q = query.toLowerCase();
    const matchQuery = !q || `${product.title} ${product.description} ${product.type}`.toLowerCase().includes(q);
    return matchCategory && matchQuery;
  }), [activeCategory, query]);

  async function handleLogin() {
    try { await loginWithGoogle(); }
    catch (error) { alert('Login Google gagal. Isi konfigurasi Firebase di Environment Variables Vercel.'); console.error(error); }
  }

  return <>
    <Header user={user} onLogin={handleLogin} onLogout={logout} cartCount={cart.length} query={query} setQuery={setQuery} />
    <main>
      <Hero onExplore={() => document.getElementById('products')?.scrollIntoView({behavior:'smooth'})} />
      <section className="categoryWrap"><div className="sectionHead"><h2>Kategori Produk</h2><p>Pilih kategori sesuai kebutuhan pelanggan.</p></div><div className="tabs"><button className={activeCategory==='all'?'active':''} onClick={()=>setActiveCategory('all')}>Semua</button>{categories.map(c=><button key={c.id} className={activeCategory===c.id?'active':''} onClick={()=>setActiveCategory(c.id)}>{c.name}</button>)}</div></section>
      <section id="products" className="contentLayout"><div><div className="sectionHead"><h2>Produk & Layanan</h2><p>{filteredProducts.length} item tersedia.</p></div><div className="productGrid">{filteredProducts.map(product => <ProductCard key={product.id} product={product} onAdd={(p)=>setCart(c=>[...c,p])} />)}</div></div><CartPanel cart={cart} setCart={setCart}/></section>
      <PPOBSection />
    </main>
    <footer className="footer"><div><strong>Madhayana Markets</strong><p>Toko digital untuk aplikasi, jasa, kelas, buku, dan PPOB.</p></div><span>© {new Date().getFullYear()} Madhayana Markets.</span></footer>
  </>
}
