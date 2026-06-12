import { Star, Plus, MessageCircle } from 'lucide-react';
export default function ProductCard({ product, onAdd }) {
  const price = new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(product.price);
  const waText = encodeURIComponent(`Halo, saya mau tanya/order ${product.title} di Madhayana Markets.`);
  const waLink = `https://wa.me/6281234567890?text=${waText}`;
  return <article className="productCard">
    <div className="productTop"><span className="badge">{product.badge}</span><span className="rating"><Star size={14} fill="currentColor"/> {product.rating}</span></div>
    <h3>{product.title}</h3><p>{product.description}</p>
    <ul>{product.features.map(f=><li key={f}>{f}</li>)}</ul>
    <div className="productMeta"><span>{product.type}</span><strong>{price}</strong></div>
    <div className="productActions"><button onClick={()=>onAdd(product)} className="addButton"><Plus size={16}/>Keranjang</button><a className="waButton" href={waLink} target="_blank"><MessageCircle size={16}/>WhatsApp</a></div>
  </article>
}
