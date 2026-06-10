import { X, Trash2, CreditCard } from 'lucide-react';
export default function CartPanel({ cart, setCart }) {
  const total = cart.reduce((sum,item)=>sum+item.price,0);
  const formattedTotal = new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(total);
  const orderText = encodeURIComponent(`Halo, saya mau checkout di Madhayana Markets:\n\n${cart.map((item,i)=>`${i+1}. ${item.title} - Rp${item.price.toLocaleString('id-ID')}`).join('\n')}\n\nTotal: ${formattedTotal}`);
  if(!cart.length) return <aside className="cartPanel"><h2>Keranjang</h2><p className="emptyCart">Keranjang masih kosong.</p></aside>;
  return <aside className="cartPanel"><div className="cartHead"><h2>Keranjang</h2><button onClick={()=>setCart([])}><X size={16}/></button></div>
    <div className="cartList">{cart.map((item,i)=><div className="cartItem" key={`${item.id}-${i}`}><div><strong>{item.title}</strong><span>Rp{item.price.toLocaleString('id-ID')}</span></div><button onClick={()=>setCart(cart.filter((_,idx)=>idx!==i))}><Trash2 size={15}/></button></div>)}</div>
    <div className="cartTotal"><span>Total</span><strong>{formattedTotal}</strong></div>
    <a className="checkoutButton" href={`https://wa.me/6281234567890?text=${orderText}`} target="_blank"><CreditCard size={17}/>Checkout via WhatsApp</a>
  </aside>
}
