import { ShoppingBag, Search, LogOut, UserCircle } from 'lucide-react';
export default function Header({ user, onLogin, onLogout, cartCount, query, setQuery }) {
  return <header className="header">
    <div className="brand"><img src="/logo.svg" /><div><strong>Madhayana Markets</strong><span>Digital app store</span></div></div>
    <div className="searchBox"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari aplikasi, jasa, kelas, buku, PPOB..." /></div>
    <div className="headerActions">
      <button className="cartButton"><ShoppingBag size={18}/><span>{cartCount}</span></button>
      {user ? <div className="userBox"><img src={user.photoURL || '/logo.svg'} /><span>{user.displayName || 'User'}</span><button onClick={onLogout} className="ghostButton"><LogOut size={16}/></button></div> : <button onClick={onLogin} className="loginButton"><UserCircle size={18}/>Login Google</button>}
    </div>
  </header>
}
