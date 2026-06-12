import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
export default function Hero({ onExplore }) {
  return <section className="hero"><div className="heroContent">
    <div className="eyebrow"><Sparkles size={16}/>Platform digital untuk produk dan layanan modern</div>
    <h1>Jual aplikasi, jasa, kelas, buku, dan PPOB dalam satu web.</h1>
    <p>Madhayana Markets dibuat untuk menjual produk digital secara rapi, cepat, dan siap dikembangkan ke payment gateway, dashboard admin, serta sistem member.</p>
    <div className="heroActions"><button onClick={onExplore} className="primaryButton">Jelajahi Produk <ArrowRight size={18}/></button><a className="secondaryButton" href="#ppob">Lihat PPOB</a></div>
  </div><div className="heroCard">
    <div className="heroMetric"><strong>5</strong><span>Kategori utama</span></div>
    <div className="heroMetric"><strong>12+</strong><span>Produk awal</span></div>
    <div className="heroMetric"><strong>Google</strong><span>Direct login ready</span></div>
    <div className="secureNote"><ShieldCheck size={18}/>Siap deploy ke Vercel dan upload ke GitHub.</div>
  </div></section>
}
