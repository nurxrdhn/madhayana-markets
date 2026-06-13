import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {collection, addDoc, serverTimestamp} from 'firebase/firestore';
import {db, listenAuth, loginWithGoogle, logoutGoogle} from './firebase';
import {categories, productsSeed, promos, faq, company} from './data';
import {Search, ShoppingCart, Star, CreditCard, UserCircle, LogOut, Wallet, ArrowLeft, Plus, Minus, MessageCircle, PlayCircle, Moon, Sun, Phone, Bot, HelpCircle, Building2} from 'lucide-react';
import './styles.css';

const rp=n=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n||0));
const mk=()=>`MM-${Date.now().toString().slice(-8)}`;

function App(){
 const [page,setPage]=useState('home'),[user,setUser]=useState(null),[q,setQ]=useState(''),[cat,setCat]=useState('Semua'),[cart,setCart]=useState([]),[detail,setDetail]=useState(null),[promo,setPromo]=useState(0),[invoice,setInvoice]=useState(null),[deposit,setDeposit]=useState(100000),[dark,setDark]=useState(false),[bot,setBot]=useState(false);
 const [products,setProducts]=useState(()=>JSON.parse(localStorage.getItem('mm_v9_products')||'null')||productsSeed);
 useEffect(()=>listenAuth(setUser),[]);
 useEffect(()=>{const t=setInterval(()=>setPromo(v=>(v+1)%promos.length),3600);return()=>clearInterval(t)},[]);
 useEffect(()=>localStorage.setItem('mm_v9_products',JSON.stringify(products)),[products]);
 const filtered=useMemo(()=>products.filter(p=>(cat==='Semua'||p.category===cat)&&(`${p.name} ${p.type} ${p.desc}`.toLowerCase().includes(q.toLowerCase()))),[products,cat,q]);
 const total=cart.reduce((s,p)=>s+p.price*p.qty,0);
 const add=p=>setCart(c=>{let f=c.find(x=>x.id===p.id);return f?c.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x):[...c,{...p,qty:1}]});
 const checkout=async()=>{
   const id=mk(); const order={id,items:cart,total,fee:1000,grandTotal:total+1000,status:'PENDING',createdAt:serverTimestamp()};
   try{await addDoc(collection(db,'orders'),order)}catch(e){}
   setInvoice({...order,qrImage:'/qris-madhayana-market.svg'}); setCart([]); setPage('invoice');
 };
 const doDeposit=()=>{const id=`DEP-${Date.now().toString().slice(-8)}`;setInvoice({id,items:[{name:'Deposit Saldo',qty:1,price:deposit}],total:deposit,fee:0,grandTotal:deposit,status:'PENDING',qrImage:'/qris-madhayana-market.svg'});setPage('invoice')};
 return <div className={dark?'app dark':'app'}>
  <Header user={user} login={loginWithGoogle} logout={logoutGoogle} q={q} setQ={setQ} setPage={setPage} cart={cart} dark={dark} setDark={setDark}/>
  {page==='home'&&<Home promo={promos[promo]} setPage={setPage} categories={categories} cat={cat} setCat={setCat} products={filtered} add={add} open={p=>setDetail(p)} />}
  {page==='checkout'&&<Checkout cart={cart} setCart={setCart} total={total} checkout={checkout} back={()=>setPage('home')}/>}
  {page==='deposit'&&<Deposit deposit={deposit} setDeposit={setDeposit} doDeposit={doDeposit} back={()=>setPage('home')}/>}
  {page==='invoice'&&<Invoice invoice={invoice} back={()=>setPage('home')}/>}
  {page==='faq'&&<FAQ back={()=>setPage('home')}/>}
  {page==='contact'&&<Contact back={()=>setPage('home')}/>}
  {detail&&<ProductDetail p={detail} add={add} close={()=>setDetail(null)} update={np=>{setProducts(products.map(x=>x.id===np.id?np:x));setDetail(np)}}/>}
  <button className='botBtn' onClick={()=>setBot(!bot)}><Bot size={20}/> AI</button>
  {bot&&<ChatBot setPage={setPage}/>}
 </div>
}
function Header({user,login,logout,q,setQ,setPage,cart,dark,setDark}){return <header><button className='brand' onClick={()=>setPage('home')}><img src='/logo.svg'/><span><b>Madhayana Market</b><small>Market Digital & Kreatif</small></span></button><div className='search'><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder='Cari produk...'/></div><nav><button onClick={()=>setPage('home')}>Produk</button><button onClick={()=>setPage('deposit')}>Deposit</button><button onClick={()=>setPage('faq')}><HelpCircle size={16}/>FAQ</button><button onClick={()=>setPage('contact')}><Phone size={16}/>Kontak</button><button onClick={()=>setPage('checkout')}><ShoppingCart size={16}/> {cart.length}</button><button onClick={()=>setDark(!dark)}>{dark?<Sun size={16}/>:<Moon size={16}/>}</button>{user?<button onClick={logout}><img className='avatar' src={user.photoURL}/>{user.displayName?.split(' ')[0]}</button>:<button onClick={login}><UserCircle size={16}/>Google</button>}</nav></header>}
function Home({promo,setPage,categories,cat,setCat,products,add,open}){return <><section className='promo'><div><span><PlayCircle size={18}/> Video promo bergerak</span><h1>{promo.title}</h1><p>{promo.sub}</p><button onClick={()=>setPage(promo.target)}>{promo.cta}</button></div><div className='videoAd'><div className='person'><div/><span/><b/></div><div className='screen'>PROMO<br/>MADHAYANA</div><div className='coin c1'>Rp</div><div className='coin c2'>%</div></div></section><section className='cats'>{categories.map(c=><button className={c===cat?'active':''} onClick={()=>setCat(c)} key={c}>{c}</button>)}</section><main id='products'><h2>Produk</h2><div className='grid'>{products.map(p=><article className='card product' key={p.id} onClick={()=>open(p)}><img src={p.image}/><div><h3>{p.name}</h3><strong>{rp(p.price)}</strong><p><Star size={15}/> {p.rating} · Stok {p.stock}</p><button onClick={(e)=>{e.stopPropagation();add(p)}}><ShoppingCart size={15}/> Keranjang</button></div></article>)}</div></main></>}
function ProductDetail({p,add,close,update}){const [txt,setTxt]=useState(''),[media,setMedia]=useState(''),[rate,setRate]=useState(5);function send(){const np={...p,comments:[{name:'User',text:txt,rating:rate,media},...(p.comments||[])]};update(np);setTxt('');setMedia('')}return <div className='modal'><div className='detail'><button className='back' onClick={close}>×</button><div className='detailGrid'><div><img className='big' src={p.image}/>{(p.media||[]).length>0&&<div className='media'>{p.media.map(m=><img src={m} key={m}/>)}</div>}</div><div><h1>{p.name}</h1><h2>{rp(p.price)}</h2><p><Star size={16}/> {p.rating} · Stok {p.stock}</p><p>{p.desc}</p><button onClick={()=>add(p)}><ShoppingCart size={16}/> Masukkan Keranjang</button></div></div><h2>Komentar</h2><div className='commentForm'><input value={txt} onChange={e=>setTxt(e.target.value)} placeholder='Tulis komentar'/><input value={media} onChange={e=>setMedia(e.target.value)} placeholder='URL foto/video opsional'/><input type='number' min='1' max='5' value={rate} onChange={e=>setRate(e.target.value)}/><button onClick={send}>Kirim</button></div>{(p.comments||[]).map((c,i)=><div className='comment' key={i}><b>{c.name} · {c.rating}★</b><p>{c.text}</p>{c.media&&(c.media.includes('.mp4')?<video src={c.media} controls/>:<img src={c.media}/>)}</div>)}</div></div>}
function Checkout({cart,setCart,total,checkout,back}){return <main className='page'><button className='ghost' onClick={back}><ArrowLeft size={16}/> Kembali</button><h1>Checkout</h1>{cart.map(p=><div className='line' key={p.id}><img src={p.image}/><b>{p.name}</b><span>{rp(p.price)}</span><button onClick={()=>setCart(cart.map(x=>x.id===p.id?{...x,qty:Math.max(1,x.qty-1)}:x))}><Minus size={14}/></button><b>{p.qty}</b><button onClick={()=>setCart(cart.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x))}><Plus size={14}/></button></div>)}<div className='paybox'><h2>Total {rp(total+1000)}</h2><p>Pembayaran dibuat di halaman khusus agar homepage tetap bersih.</p><button onClick={checkout}><CreditCard size={16}/> Buat Invoice QRIS</button></div></main>}
function Deposit({deposit,setDeposit,doDeposit,back}){return <main className='page'><button className='ghost' onClick={back}><ArrowLeft size={16}/> Kembali</button><h1>Deposit Saldo</h1><div className='deposit'>{[50000,100000,250000,500000].map(n=><button className={deposit===n?'active':''} onClick={()=>setDeposit(n)} key={n}>{rp(n)}</button>)}</div><button onClick={doDeposit}><Wallet size={16}/> Deposit Sekarang</button></main>}
function Invoice({invoice,back}){if(!invoice)return null;return <main className='page invoice'><button className='ghost' onClick={back}><ArrowLeft size={16}/> Kembali</button><h1>Invoice {invoice.id}</h1><h2>{rp(invoice.grandTotal)}</h2><img src={invoice.qrImage}/><p>Status: {invoice.status}</p></main>}
function FAQ({back}){return <main className='page'><button className='ghost' onClick={back}><ArrowLeft size={16}/> Kembali</button><h1>Katalog Pertanyaan</h1>{faq.map(x=><div className='faq' key={x.q}><b>{x.q}</b><p>{x.a}</p></div>)}</main>}
function Contact({back}){return <main className='page'><button className='ghost' onClick={back}><ArrowLeft size={16}/> Kembali</button><h1>Contact Perusahaan</h1><div className='contact'><Building2/><p><b>{company.name}</b><br/>{company.website}<br/>{company.email}<br/>{company.address}<br/>{company.hours}</p></div><div className='contact'><Phone/><p><b>Customer Service</b><br/>{company.customerService}</p></div><div className='contact'><Phone/><p><b>Sales</b><br/>{company.sales}</p></div></main>}
function ChatBot({setPage}){return <div className='botPanel'><h3>AI Assistant</h3><p>Mau cek apa?</p><button onClick={()=>alert('Masukkan nomor invoice untuk cek pesanan.')}>Cek Pesanan</button><button onClick={()=>setPage('deposit')}>Cek Deposit</button><button onClick={()=>setPage('checkout')}>Cek Pembayaran</button><button onClick={()=>setPage('faq')}>Lihat FAQ</button><button onClick={()=>setPage('contact')}>Hubungi CS / Sales</button></div>}
createRoot(document.getElementById('root')).render(<App/>);
